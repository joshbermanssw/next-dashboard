import { NextResponse, type NextRequest } from "next/server"
import {
  COOKIE_NAME,
  decryptSession,
  encryptSession,
  sessionCookieOptions,
  type Session,
} from "@/server/auth/session-token"

const publicRoutes = ["/login", "/forgot-password", "/reset-password", "/signup"]

// Refresh the access token once it's within this window of expiry, so it's renewed
// slightly ahead of time rather than only after a request has already failed.
const ACCESS_TOKEN_REFRESH_SKEW_MS = 60_000
const REFRESH_TIMEOUT_MS = 4000

export async function proxy(req: NextRequest) {
  const path = req.nextUrl.pathname
  const isPublic = publicRoutes.includes(path)

  // Decrypt (not just existence-check) so we can read token expiry and refresh.
  // The canonical secure gate is still dal.verifySession() inside pages/actions —
  // this stays an optimistic UX layer, just a better-informed one.
  const session = await decryptSession(req.cookies.get(COOKIE_NAME)?.value)
  const hasSession = Boolean(session)

  if (!isPublic && !hasSession) {
    return NextResponse.redirect(new URL("/login", req.nextUrl))
  }

  if (isPublic && hasSession) {
    return NextResponse.redirect(new URL("/", req.nextUrl))
  }

  // Authenticated request to a protected route: refresh the access token if it's
  // expiring, exchanging (and rotating) the single-use refresh token.
  if (session && !isPublic && needsRefresh(session, Date.now())) {
    const refreshed = await tryRefresh(session)
    if (refreshed) {
      // Update the request cookie so this render sees the fresh token, and the
      // response cookie so the browser stores it for subsequent requests.
      req.cookies.set(COOKIE_NAME, refreshed.token)
      const res = NextResponse.next({ request: { headers: req.headers } })
      res.cookies.set(
        COOKIE_NAME,
        refreshed.token,
        sessionCookieOptions(refreshed.session),
      )
      return res
    }
    // Refresh failed — fall through non-destructively. A concurrent request may
    // have already rotated the token (rotation makes the loser's call 403), so we
    // must NOT clear the session here or that race would log the user out. A truly
    // dead session is caught by the JWT exp / getSession() expiresAt gate.
  }

  return NextResponse.next()
}

function needsRefresh(session: Session, now: number): boolean {
  return (
    Boolean(session.refreshToken) &&
    session.accessTokenExpiresAt - now <= ACCESS_TOKEN_REFRESH_SKEW_MS
  )
}

// Inline refresh call. The proxy can't import the server-only BFF client
// (server/bff/clients/auth.ts → upstreamRefresh), so it speaks to the same
// `POST /auth/refresh` endpoint directly. Contract: body { refreshToken }, returns
// { success, data: { accessToken, refreshToken (rotated), expiresIn } }.
async function tryRefresh(
  session: Session,
): Promise<{ token: string; session: Session } | null> {
  const base = process.env.MS_AUTH_BASE_URL
  if (!base || !session.refreshToken) return null

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), REFRESH_TIMEOUT_MS)
  try {
    const res = await fetch(`${base}/auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ refreshToken: session.refreshToken }),
      cache: "no-store",
      signal: controller.signal,
    })
    if (!res.ok) return null

    const body = await res.json().catch(() => null)
    const data = body?.success ? body.data : null
    if (
      !data ||
      typeof data.accessToken !== "string" ||
      typeof data.refreshToken !== "string" ||
      typeof data.expiresIn !== "number"
    ) {
      return null
    }

    const next: Session = {
      ...session,
      upstreamJwt: data.accessToken,
      refreshToken: data.refreshToken, // rotate the single-use token
      accessTokenExpiresAt: Date.now() + data.expiresIn * 1000,
      // expiresAt (absolute session deadline) is intentionally left unchanged.
    }
    return { token: await encryptSession(next), session: next }
  } catch {
    return null
  } finally {
    clearTimeout(timer)
  }
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:png|webm|mp4|mov|svg|webp|jpg|jpeg|gif)$).*)",
  ],
}
