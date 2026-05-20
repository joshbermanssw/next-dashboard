import { Hono } from "hono"
import * as z from "zod"
import { env } from "../env"
import { createSession, deleteSession, refreshSessionCookie } from "../session"
import { requireSession, type AuthVariables } from "../middleware"

const LoginSchema = z.object({
  email: z.email({ error: "Please enter a valid email." }).trim(),
  password: z.string().min(1, { error: "Password is required." }).trim(),
  rememberMe: z.boolean().optional(),
})

export const authRoutes = new Hono<{ Variables: AuthVariables }>()

authRoutes.post("/login", async (c) => {
  let body: unknown
  try {
    body = await c.req.json()
  } catch {
    return c.json({ success: false, payload: { message: "Invalid request body" } }, 400)
  }

  const parsed = LoginSchema.safeParse(body)
  if (!parsed.success) {
    return c.json(
      { success: false, payload: { errors: parsed.error.flatten().fieldErrors } },
      400
    )
  }

  try {
    const upstream = await fetch(`${env.MS_AUTH_BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier: parsed.data.email, password: parsed.data.password }),
    })

    if (!upstream.ok) {
      return c.json({ success: false, payload: { message: "Invalid credentials" } }, 401)
    }

    const json = await upstream.json()
    const { customer, accessToken, refreshToken } = json.data
    await createSession(c, customer, accessToken, refreshToken)

    return c.json({ success: true, payload: { customer } })
  } catch {
    return c.json({ success: false, payload: { message: "Unable to connect to authentication service." } }, 502)
  }
})

authRoutes.post("/logout", requireSession, async (c) => {
  const session = c.get("session")
  try {
    await fetch(`${env.MS_AUTH_BASE_URL}/auth/logout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: session.userId }),
    })
  } catch {
    /* best-effort */
  }
  deleteSession(c)
  return c.json({ success: true, payload: null })
})

authRoutes.post("/refresh", requireSession, async (c) => {
  await refreshSessionCookie(c)
  return c.json({ success: true, payload: null })
})

authRoutes.get("/me", requireSession, (c) => {
  const session = c.get("session")
  return c.json({ success: true, payload: { customer: session.customer } })
})
