"use server"

import { redirect } from "next/navigation"
import { LoginFormSchema, type LoginFormState } from "@/lib/definitions"
import { upstreamLogin, upstreamLogout } from "@/server/bff/clients/auth"
import { UpstreamError } from "@/server/bff/http"
import {
  clearSessionCookie,
  getSession,
  setSessionCookie,
} from "@/server/auth/session"

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

    await setSessionCookie({
      customer,
      upstreamJwt: accessToken,
      refreshToken,
      expiresAt: Date.now() + expiresInSeconds * 1000,
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
