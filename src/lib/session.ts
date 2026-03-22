import "server-only"
import { SignJWT, jwtVerify } from "jose"
import { cookies } from "next/headers"
import type { SessionPayload } from "@/lib/definitions"

const secretKey = process.env.SESSION_SECRET
if (!secretKey) {
  throw new Error("SESSION_SECRET environment variable is required")
}
const encodedKey = new TextEncoder().encode(secretKey)

export async function encrypt(payload: SessionPayload): Promise<string> {
  return new SignJWT({ ...payload, expiresAt: payload.expiresAt.toISOString() })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(encodedKey)
}

export async function decrypt(
  session: string | undefined = ""
): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(session, encodedKey, {
      algorithms: ["HS256"],
    })
    return {
      userId: payload.userId as string,
      role: payload.role as string,
      expiresAt: new Date(payload.expiresAt as string),
    }
  } catch {
    return null
  }
}

export async function createSession(
  userId: string,
  role: string
): Promise<void> {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  const session = await encrypt({ userId, role, expiresAt })
  const cookieStore = await cookies()

  cookieStore.set("session", session, {
    httpOnly: true,
    secure: true,
    expires: expiresAt,
    sameSite: "lax",
    path: "/",
  })
}

export async function updateSession(): Promise<void> {
  const cookieStore = await cookies()
  const session = cookieStore.get("session")?.value
  const payload = await decrypt(session)

  if (!session || !payload) {
    return
  }

  const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

  cookieStore.set("session", session, {
    httpOnly: true,
    secure: true,
    expires,
    sameSite: "lax",
    path: "/",
  })
}

export async function deleteSession(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete("session")
}
