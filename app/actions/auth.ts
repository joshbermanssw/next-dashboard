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
    if (err instanceof UpstreamError && err.status === 401) {
      return { message: "Invalid email or password." }
    }
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
