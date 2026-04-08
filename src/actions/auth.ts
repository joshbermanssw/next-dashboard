"use server"

import { redirect } from "next/navigation"
import { LoginFormSchema, type LoginFormState } from "@/lib/definitions"
import { createSession, deleteSession } from "@/lib/session"

export async function login(
  _prevState: LoginFormState,
  formData: FormData
): Promise<LoginFormState> {
  const validatedFields = LoginFormSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    rememberMe: formData.get("rememberMe") === "on" || formData.get("rememberMe") === "true",
  })

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    }
  }

  const { email, password } = validatedFields.data

  try {
    const response = await fetch(
      `${process.env.MS_AUTH_BASE_URL}/auth/login`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: email, password }),
      }
    )

    if (!response.ok) {
      return { message: "Invalid email or password." }
    }

    const data = await response.json()
    const { customer, accessToken, refreshToken } = data.data

    await createSession(customer, accessToken, refreshToken)
  } catch {
    return { message: "Unable to connect to authentication service." }
  }

  redirect("/")
}

export async function logout() {
  await deleteSession()
  redirect("/login")
}
