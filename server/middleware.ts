import type { Context, MiddlewareHandler } from "hono"
import { readSession, type SessionPayload } from "./session"

export type AuthVariables = { session: SessionPayload }

export const requireSession: MiddlewareHandler<{ Variables: AuthVariables }> = async (c, next) => {
  const session = await readSession(c)
  if (!session) {
    return c.json({ success: false, payload: { message: "Not authenticated" } }, 401)
  }
  c.set("session", session)
  await next()
}

export function unauthorized(c: Context, message = "Not authenticated") {
  return c.json({ success: false, payload: { message } }, 401)
}
