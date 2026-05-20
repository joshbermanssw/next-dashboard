import { SignJWT, jwtVerify } from "jose"
import type { Context } from "hono"
import { getCookie, setCookie, deleteCookie } from "hono/cookie"
import { env } from "./env"

export type Customer = {
  id: string
  email: string
  firstName: string
  lastName: string
  phone: string
  isActive: boolean
}

export type SessionPayload = {
  userId: string
  accessToken: string
  refreshToken: string
  customer: Customer
  expiresAt: Date
}

const SESSION_COOKIE = "session"
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000

function key() {
  return new TextEncoder().encode(env.SESSION_SECRET)
}

export async function encrypt(payload: SessionPayload): Promise<string> {
  return new SignJWT({ ...payload, expiresAt: payload.expiresAt.toISOString() })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(key())
}

export async function decrypt(token: string | undefined): Promise<SessionPayload | null> {
  if (!token) return null
  try {
    const { payload } = await jwtVerify(token, key(), { algorithms: ["HS256"] })
    if (
      typeof payload.userId !== "string" ||
      typeof payload.accessToken !== "string" ||
      typeof payload.refreshToken !== "string" ||
      typeof payload.expiresAt !== "string" ||
      !payload.customer
    ) {
      return null
    }
    return {
      userId: payload.userId,
      accessToken: payload.accessToken,
      refreshToken: payload.refreshToken,
      customer: payload.customer as Customer,
      expiresAt: new Date(payload.expiresAt),
    }
  } catch {
    return null
  }
}

function cookieOptions(expires: Date) {
  return {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "Lax" as const,
    path: "/",
    expires,
  }
}

export async function createSession(
  c: Context,
  customer: Customer,
  accessToken: string,
  refreshToken: string
): Promise<void> {
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS)
  const token = await encrypt({ userId: customer.id, accessToken, refreshToken, customer, expiresAt })
  setCookie(c, SESSION_COOKIE, token, cookieOptions(expiresAt))
}

export async function refreshSessionCookie(c: Context): Promise<SessionPayload | null> {
  const existing = await decrypt(getCookie(c, SESSION_COOKIE))
  if (!existing) return null
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS)
  const token = await encrypt({ ...existing, expiresAt })
  setCookie(c, SESSION_COOKIE, token, cookieOptions(expiresAt))
  return existing
}

export function deleteSession(c: Context): void {
  deleteCookie(c, SESSION_COOKIE, { path: "/" })
}

export async function readSession(c: Context): Promise<SessionPayload | null> {
  return decrypt(getCookie(c, SESSION_COOKIE))
}
