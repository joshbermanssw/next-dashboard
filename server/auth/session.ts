import "server-only"
import { cookies } from "next/headers"
import { SignJWT, jwtVerify } from "jose"
import { cache } from "react"
import type { Customer } from "@/lib/definitions"

const COOKIE_NAME = "dosshpay_session"
const ALG = "HS256"

export type Session = {
  customer: Customer
  upstreamJwt: string
  refreshToken?: string
  expiresAt: number
}

function key(): Uint8Array {
  const secret = process.env.SESSION_SECRET
  if (!secret) throw new Error("Missing SESSION_SECRET")
  return new TextEncoder().encode(secret)
}

export async function encryptSession(payload: Session): Promise<string> {
  return await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: ALG })
    .setIssuedAt()
    .setExpirationTime(new Date(payload.expiresAt))
    .sign(key())
}

export async function decryptSession(token: string | undefined): Promise<Session | null> {
  if (!token) return null
  try {
    const { payload } = await jwtVerify(token, key(), { algorithms: [ALG] })
    return payload as unknown as Session
  } catch {
    return null
  }
}

export async function setSessionCookie(session: Session): Promise<void> {
  const token = await encryptSession(session)
  const store = await cookies()
  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: new Date(session.expiresAt),
  })
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
