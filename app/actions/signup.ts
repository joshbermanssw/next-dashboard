"use server"

import { headers } from "next/headers"
import {
  RegistrationInitSchema,
  OtpSchema,
  SignupDetailsSchema,
  normalizePhone,
  isDisplayableUpstreamMessage,
  type AvailabilityResult,
  type ResendResult,
} from "@/lib/signup"
import {
  checkEmailAvailability,
  checkPhoneAvailability,
  createDevice,
  initRegistration,
  resendOtp,
  verifyRegistration,
} from "@/server/bff/clients/registration"
import { upstreamLogin } from "@/server/bff/clients/auth"
import { getCustomerAccount } from "@/server/bff/clients/customer"
import { UpstreamError } from "@/server/bff/http"
import { setSessionCookie } from "@/server/auth/session"
import { signupStubEnabled } from "@/server/config/dev-stub"
import type { AccountType, Customer } from "@/lib/definitions"

// Matches loginAction — the proxy keeps the access token fresh up to this cap.
const SESSION_MAX_DURATION_MS = 30 * 24 * 60 * 60 * 1000

/**
 * Upstream validation messages are user-facing prose ("Email already in use"),
 * which is more useful than anything generic we could write. Pass them through
 * only for client errors, and only when they read like a message rather than a
 * stack trace, an ORM/DB error, or an internal identifier
 * (see `isDisplayableUpstreamMessage`).
 */
function upstreamMessage(err: UpstreamError, fallback: string): string {
  if (err.status < 400 || err.status >= 500) return fallback
  const body = err.body
  const message =
    body && typeof body === "object"
      ? (body as { message?: unknown }).message
      : undefined
  return isDisplayableUpstreamMessage(message) ? message : fallback
}

function failureMessage(err: unknown, fallback: string): string {
  if (err instanceof UpstreamError) return upstreamMessage(err, fallback)
  // Network failure, DNS, TLS or timeout — never reached the backend.
  return "Unable to reach DosshPay. Check your connection and try again."
}

async function requestContext(): Promise<{ ip: string; userAgent: string }> {
  const h = await headers()
  // x-forwarded-for is a comma-separated chain; the client is the first entry.
  const ip =
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    h.get("x-real-ip")?.trim() ||
    "0.0.0.0"
  return { ip, userAgent: h.get("user-agent") ?? "unknown" }
}

// ── Availability probes ─────────────────────────────────────────────────────
// These run as the user types. They are a courtesy, not a gate: `init` is the
// authority on whether an identifier is free, so a failed probe returns
// "unknown" and lets the user continue rather than blocking on a flaky call.

export async function checkEmailAction(
  email: string,
): Promise<AvailabilityResult> {
  const parsed = SignupDetailsSchema.shape.email.safeParse(email)
  if (!parsed.success) return { status: "unknown" }
  try {
    const { inUse, message } = await checkEmailAvailability(parsed.data)
    return inUse
      ? { status: "taken", message: message || "That email is already registered." }
      : { status: "available" }
  } catch {
    return { status: "unknown" }
  }
}

export async function checkPhoneAction(
  phone: string,
): Promise<AvailabilityResult> {
  const parsed = SignupDetailsSchema.shape.phone.safeParse(phone)
  if (!parsed.success) return { status: "unknown" }
  try {
    const { inUse, message } = await checkPhoneAvailability(
      normalizePhone(parsed.data),
    )
    return inUse
      ? {
          status: "taken",
          message: message || "That mobile number is already registered.",
        }
      : { status: "available" }
  } catch {
    return { status: "unknown" }
  }
}

// ── Step 2 → create the account and send the OTP ────────────────────────────

export type StartSignupResult =
  | { ok: true; customerId: string; deviceId: string }
  | { ok: false; message: string }

export async function startSignupAction(input: {
  firstName: string
  lastName: string
  email: string
  phone: string
  password: string
}): Promise<StartSignupResult> {
  const parsed = RegistrationInitSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, message: "Check your details and try again." }
  }

  // Dev stub: don't touch the backend; jump straight to the code screen.
  if (signupStubEnabled()) {
    return { ok: true, customerId: "stub-customer", deviceId: "stub-device" }
  }

  const { ip, userAgent } = await requestContext()

  try {
    // Registration is device-scoped, so the device has to exist first.
    const deviceId = await createDevice({ ip, userAgent })
    const customerId = await initRegistration({
      firstName: parsed.data.firstName,
      lastName: parsed.data.lastName,
      email: parsed.data.email,
      phone: normalizePhone(parsed.data.phone),
      password: parsed.data.password,
      ip,
      deviceId,
    })
    return { ok: true, customerId, deviceId }
  } catch (err) {
    return {
      ok: false,
      message: failureMessage(err, "Could not create your account. Please try again."),
    }
  }
}

// ── Step 3 → verify the OTP and sign the customer in ────────────────────────

export type VerifySignupResult =
  | {
      ok: true
      /**
       * True when the account is verified but no session could be established
       * (the follow-up login failed, or the wizard lost the password to a page
       * refresh). The customer must sign in manually — their account is fine.
       */
      requiresLogin: boolean
    }
  | { ok: false; message: string }

export async function verifySignupAction(input: {
  customerId: string
  deviceId: string
  firstName: string
  lastName: string
  email: string
  phone: string
  otp: string
  password: string
}): Promise<VerifySignupResult> {
  const parsedOtp = OtpSchema.safeParse({ otp: input.otp })
  if (!parsedOtp.success) {
    return { ok: false, message: "Enter the 6-digit code." }
  }

  // Dev stub: accept any valid 6-digit code and forge a session from the
  // details entered, so the flow continues into onboarding without a backend.
  if (signupStubEnabled()) {
    await establishStubSession({
      id: input.customerId || "stub-customer",
      email: input.email,
      firstName: input.firstName,
      lastName: input.lastName,
      phone: normalizePhone(input.phone),
      isActive: true,
    })
    return { ok: true, requiresLogin: false }
  }

  try {
    await verifyRegistration({
      customerId: input.customerId,
      deviceId: input.deviceId,
      email: input.email,
      phone: normalizePhone(input.phone),
      otp: parsedOtp.data.otp,
    })
  } catch (err) {
    if (err instanceof UpstreamError && err.status === 400) {
      return {
        ok: false,
        message: "That code isn't right, or it has expired. Try again or resend.",
      }
    }
    return { ok: false, message: failureMessage(err, "Could not verify that code.") }
  }

  // `/registration/verify` returns an access token but no refresh token and no
  // customer record, so a session built from it could never be refreshed and
  // would silently die when the token expired. Logging in with the credentials
  // we just registered yields exactly the same session shape as a normal login.
  if (!input.password) return { ok: true, requiresLogin: true }

  try {
    await establishSession(input.email, input.password)
    return { ok: true, requiresLogin: false }
  } catch {
    return { ok: true, requiresLogin: true }
  }
}

async function establishSession(email: string, password: string): Promise<void> {
  const { customer, accessToken, refreshToken, expiresInSeconds } =
    await upstreamLogin({ email, password })

  const now = Date.now()

  // Non-blocking, exactly as in loginAction: a brand-new customer may not have
  // an account provisioned yet, which is the normal case here.
  let accountId: string | undefined
  let accountType: AccountType | undefined
  try {
    ;({ accountId, accountType } = await getCustomerAccount(accessToken, customer.id))
  } catch {
    accountId = undefined
    accountType = undefined
  }

  await setSessionCookie({
    customer,
    upstreamJwt: accessToken,
    refreshToken,
    accessTokenExpiresAt: now + expiresInSeconds * 1000,
    expiresAt: now + SESSION_MAX_DURATION_MS,
    rememberMe: false,
    accountId,
    accountType,
  })
}

/**
 * Dev stub only. Forges a local session from the entered details, mirroring the
 * shape of a real login but with a placeholder access token and no refresh
 * token — so the proxy never calls the real /auth/refresh for it. Dashboard
 * pages render; backend-data widgets fall back gracefully.
 */
async function establishStubSession(customer: Customer): Promise<void> {
  const now = Date.now()
  await setSessionCookie({
    customer,
    upstreamJwt: "stub-access-token",
    accessTokenExpiresAt: now + SESSION_MAX_DURATION_MS,
    expiresAt: now + SESSION_MAX_DURATION_MS,
    rememberMe: false,
    accountType: "everyday",
  })
}

// ── Resend ──────────────────────────────────────────────────────────────────

export async function resendOtpAction(input: {
  customerId: string
  email: string
  phone: string
  deviceId: string
}): Promise<ResendResult> {
  // Dev stub: nothing to re-send; pretend a fresh code went out.
  if (signupStubEnabled()) {
    return { ok: true, expiresAt: new Date(Date.now() + 10 * 60_000).toISOString() }
  }

  try {
    const { expiresAt } = await resendOtp({
      customerId: input.customerId,
      email: input.email,
      phone: normalizePhone(input.phone),
      deviceId: input.deviceId,
    })
    return { ok: true, expiresAt }
  } catch (err) {
    if (err instanceof UpstreamError && err.status === 429) {
      const retryAfter =
        err.body && typeof err.body === "object"
          ? (err.body as { retryAfter?: string }).retryAfter
          : undefined
      return {
        ok: false,
        message: "Too many requests. Wait a moment before resending.",
        retryAfter,
      }
    }
    return { ok: false, message: failureMessage(err, "Could not resend the code.") }
  }
}
