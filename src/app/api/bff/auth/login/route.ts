import { NextResponse } from "next/server"
import { LoginFormSchema } from "@/lib/definitions"
import { createSession } from "@/lib/session"

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Validate input
    const validatedFields = LoginFormSchema.safeParse(body)
    if (!validatedFields.success) {
      return NextResponse.json(
        { success: false, payload: { errors: validatedFields.error.flatten().fieldErrors } },
        { status: 400 }
      )
    }

    // Proxy to backend
    const response = await fetch(
      `${process.env.MS_AUTH_BASE_URL}/auth/login`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validatedFields.data),
      }
    )

    if (!response.ok) {
      return NextResponse.json(
        { success: false, payload: { message: "Invalid credentials" } },
        { status: 401 }
      )
    }

    const data = await response.json()
    await createSession(data.userId, data.role)

    return NextResponse.json({ success: true, payload: null })
  } catch {
    return NextResponse.json(
      { success: false, payload: { message: "An error occurred" } },
      { status: 500 }
    )
  }
}
