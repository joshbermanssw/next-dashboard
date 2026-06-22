// Pure session-token primitives — crypto + cookie shape, with NO dependency on
// `next/headers` or `server-only`. This lets both the request-scoped helpers in
// `session.ts` AND the proxy (which runs as middleware and can't use
// `next/headers`) share one implementation.
import { SignJWT, jwtVerify } from "jose"
import type { Customer } from "@/lib/definitions"

export const COOKIE_NAME = "dosshpay_session"
const ALG = "HS256"

export type Session = {
  customer: Customer
  // Upstream access token ("identity" token) sent as the bearer to the backend.
  upstreamJwt: string
  // Single-use refresh token. Rotated on every refresh (see server/auth/refresh).
  refreshToken?: string
  // When `upstreamJwt` expires. Drives proactive refresh in the proxy.
  accessTokenExpiresAt: number
  // Absolute session deadline: the cookie expiry (when persistent), the JWT `exp`,
  // and the getSession() validity gate. Refreshing does NOT extend this.
  expiresAt: number
  // Cookie persistence: true → survives browser restart ("Keep me signed in");
  // false/absent → session cookie the browser drops on close.
  rememberMe?: boolean
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

export async function decryptSession(
  token: string | undefined,
): Promise<Session | null> {
  if (!token) return null
  try {
    const { payload } = await jwtVerify(token, key(), { algorithms: [ALG] })
    return payload as unknown as Session
  } catch {
    return null
  }
}

// Cookie attributes shared by every writer (session.ts via next/headers, and the
// proxy via NextResponse). Keeping this in one place means the persistent-vs-session
// cookie decision can never drift between the two code paths.
export function sessionCookieOptions(session: Session) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    // "Keep me signed in" → persistent cookie until expiresAt. Otherwise omit
    // expires so the browser treats it as a session cookie and clears it on close.
    ...(session.rememberMe ? { expires: new Date(session.expiresAt) } : {}),
  }
}
