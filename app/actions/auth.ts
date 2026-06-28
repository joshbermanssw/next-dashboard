"use server"

import { redirect } from "next/navigation"
import { LoginFormSchema, type LoginFormState } from "@/lib/definitions"
import { upstreamLogin, upstreamLogout } from "@/server/bff/clients/auth"
import { getCustomerAccount } from "@/server/bff/clients/customer"
import type { AccountType } from "@/lib/definitions"
import { UpstreamError } from "@/server/bff/http"
import {
  clearSessionCookie,
  getSession,
  setSessionCookie,
} from "@/server/auth/session"

// Absolute session cap. The proxy keeps the access token fresh via /auth/refresh
// up to this deadline; after it, getSession() rejects and the user must re-login.
const SESSION_MAX_DURATION_MS = 30 * 24 * 60 * 60 * 1000 // 30 days

export async function loginAction(
  _prev: LoginFormState,
  formData: FormData,
): Promise<LoginFormState> {
  const parsed = LoginFormSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    rememberMe:
      formData.get("rememberMe") === "on" ||
      formData.get("rememberMe") === "true",
  })

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors }
  }

  try {
    const { customer, accessToken, refreshToken, expiresInSeconds } =
      await upstreamLogin({
        email: parsed.data.email,
        password: parsed.data.password,
      })

    const rememberMe = parsed.data.rememberMe ?? false
    const now = Date.now()

    // Non-blocking: fetch the plan accountId + accountType. If it fails or is
    // missing, login still succeeds and the plan page handles the absence.
    let accountId: string | undefined
    let accountType: AccountType | undefined
    try {
      ;({ accountId, accountType } = await getCustomerAccount(
        accessToken,
        customer.id,
      ))
    } catch {
      accountId = undefined
      accountType = undefined
    }

    await setSessionCookie({
      customer,
      upstreamJwt: accessToken,
      refreshToken,
      accessTokenExpiresAt: now + expiresInSeconds * 1000,
      // Absolute deadline is the same either way; "Keep me signed in" only decides
      // whether the cookie persists across browser restarts (see sessionCookieOptions).
      expiresAt: now + SESSION_MAX_DURATION_MS,
      rememberMe,
      accountId,
      accountType,
    })
  } catch (err) {
    // An UpstreamError means we reached the backend and got an HTTP response,
    // so this is never a connectivity problem. The auth service returns 400
    // (not 401) for bad credentials, alongside 401.
    if (err instanceof UpstreamError) {
      if (err.status === 400 || err.status === 401) {
        return { message: "Invalid email or password." }
      }
      return { message: "Authentication service error. Please try again." }
    }
    // Network failure, DNS, TLS, or timeout (AbortError) — never reached backend.
    return { message: "Unable to connect to authentication service." }
  }

  redirect("/")
}

export async function logoutAction(): Promise<void> {
  const session = await getSession()
  if (session) await upstreamLogout(session.upstreamJwt)
  await clearSessionCookie()
  redirect("/login")
}
