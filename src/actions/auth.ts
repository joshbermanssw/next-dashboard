"use server"

import { redirect } from "next/navigation"
import { LoginFormSchema, type LoginFormState } from "@/lib/definitions"
import { createSession, deleteSession } from "@/lib/session"

export async function login(
  _prevState: LoginFormState,
  formData: FormData
): Promise<LoginFormState> {
  // 1. Validate input
  const validatedFields = LoginFormSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    rememberMe: formData.get("rememberMe"),
  })

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    }
  }

  // 2. Proxy to backend auth microservice
  const { email, password, rememberMe } = validatedFields.data

  try {
    const response = await fetch(
      `${process.env.MS_AUTH_BASE_URL}/auth/login`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      }
    )

    if (!response.ok) {
      return { message: "Invalid email or password." }
    }

    const data = await response.json()

    // 3. Create session cookie
    await createSession(data.userId, data.role)
  } catch {
    // Stubbed: if backend is unavailable, create a dev session
    // TODO: Remove this block when backend is available
    console.warn("[auth] Backend unavailable — creating dev session")
    await createSession("dev-user-id", "user")
  }

  // 4. Redirect to dashboard
  redirect("/")
}

export async function logout() {
  await deleteSession()
  redirect("/login")
}
