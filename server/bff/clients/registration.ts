import "server-only"
import { bffFetch } from "@/server/bff/http"
import { services } from "@/server/config/services"

// Every registration endpoint uses the `{ success, data }` envelope.
type Wire<T> = { success: boolean; data: T }

// ── Device ──────────────────────────────────────────────────────────────────

/**
 * Registration is device-scoped: `init`, `verify` and `resend` all key the OTP
 * to a `deviceId`, so a device must exist before the account does. `customerId`
 * is intentionally omitted — there is no customer yet at this point.
 */
export async function createDevice(input: {
  ip: string
  userAgent: string
}): Promise<string> {
  const res = await bffFetch<Wire<{ deviceId: string; createdAt: string }>>(
    `${services.auth.baseUrl}/device/create`,
    {
      method: "POST",
      body: JSON.stringify({
        deviceName: "Web browser",
        deviceType: "web",
        os: input.userAgent,
        deviceFingerprint: input.userAgent,
        ip: input.ip,
        isActive: true,
      }),
    },
  )
  return res.data.deviceId
}

// ── Registration ────────────────────────────────────────────────────────────

/**
 * Creates the unverified customer and triggers the emailed OTP. The returned
 * `customerId` is required by both `verifyRegistration` and `resendOtp`.
 */
export async function initRegistration(input: {
  firstName: string
  lastName: string
  email: string
  phone: string
  password: string
  ip: string
  deviceId: string
}): Promise<string> {
  const res = await bffFetch<Wire<{ customerId: string }>>(
    `${services.auth.baseUrl}/registration/init`,
    { method: "POST", body: JSON.stringify(input) },
  )
  return res.data.customerId
}

export type VerifyRegistrationResult = {
  customerId: string
  accessToken: string
  expiresInSeconds: number
}

/**
 * Exchanges the OTP for an access token. Note this returns no refresh token and
 * no customer record — unlike `/auth/login`. See `signupAction` for how the
 * session is established from here.
 */
export async function verifyRegistration(input: {
  customerId: string
  otp: string
  email: string
  phone: string
  deviceId: string
}): Promise<VerifyRegistrationResult> {
  const res = await bffFetch<
    Wire<{ customerId: string; accessToken: string; expiresIn: number }>
  >(`${services.auth.baseUrl}/registration/verify`, {
    method: "POST",
    body: JSON.stringify(input),
  })
  const { customerId, accessToken, expiresIn } = res.data
  return { customerId, accessToken, expiresInSeconds: expiresIn }
}

/** Re-sends the OTP. Rate limited upstream — a 429 carries `retryAfter`. */
export async function resendOtp(input: {
  customerId: string
  email: string
  phone: string
  deviceId: string
}): Promise<{ isNew: boolean; expiresAt: string }> {
  const res = await bffFetch<Wire<{ isNew: boolean; expiresAt: string }>>(
    `${services.auth.baseUrl}/otp/resend`,
    { method: "POST", body: JSON.stringify(input) },
  )
  return res.data
}

// ── Availability probes ─────────────────────────────────────────────────────

type AvailabilityWire = Wire<{ inUse: boolean; message: string }>

async function checkAvailability(
  path: "check-email" | "check-phone",
  param: "email" | "phone",
  value: string,
): Promise<{ inUse: boolean; message: string }> {
  const url = new URL(`${services.auth.baseUrl}/registration/${path}`)
  url.searchParams.set(param, value)
  const res = await bffFetch<AvailabilityWire>(url.toString(), { method: "GET" })
  return res.data
}

export function checkEmailAvailability(email: string) {
  return checkAvailability("check-email", "email", email)
}

export function checkPhoneAvailability(phone: string) {
  return checkAvailability("check-phone", "phone", phone)
}
