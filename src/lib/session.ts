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
  session: string | undefined
): Promise<SessionPayload | null> {
  if (!session) return null
  try {
    const { payload } = await jwtVerify(session, encodedKey, {
      algorithms: ["HS256"],
    })
    if (
      typeof payload.userId !== "string" ||
      typeof payload.role !== "string" ||
      typeof payload.expiresAt !== "string"
    ) {
      return null
    }
    return {
      userId: payload.userId,
      role: payload.role,
      expiresAt: new Date(payload.expiresAt),
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

  if (!payload) {
    return
  }

  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  const newSession = await encrypt({ ...payload, expiresAt })

  cookieStore.set("session", newSession, {
    httpOnly: true,
    secure: true,
    expires: expiresAt,
    sameSite: "lax",
    path: "/",
  })
}

export async function deleteSession(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete("session")
}
