import "server-only"
import { cookies } from "next/headers"
import { cache } from "react"
import {
  COOKIE_NAME,
  decryptSession,
  encryptSession,
  sessionCookieOptions,
  type Session,
} from "./session-token"

export type { Session }
export { encryptSession, decryptSession }

export async function setSessionCookie(session: Session): Promise<void> {
  const token = await encryptSession(session)
  const store = await cookies()
  store.set(COOKIE_NAME, token, sessionCookieOptions(session))
}

export async function clearSessionCookie(): Promise<void> {
  const store = await cookies()
  store.delete(COOKIE_NAME)
}

export const getSession = cache(async (): Promise<Session | null> => {
  const store = await cookies()
  const token = store.get(COOKIE_NAME)?.value
  const session = await decryptSession(token)
  if (!session) return null
  if (session.expiresAt < Date.now()) return null
  return session
})
