import { NextResponse, type NextRequest } from "next/server"

const COOKIE_NAME = "dosshpay_session"
const publicRoutes = ["/login", "/forgot-password", "/reset-password", "/signup"]

export function proxy(req: NextRequest) {
  // Ephemeral dev escape hatch — see DISABLE_AUTH in .env. Remove the env var to re-enable auth.
  if (process.env.DISABLE_AUTH === "true") return NextResponse.next()

  const path = req.nextUrl.pathname
  const isPublic = publicRoutes.includes(path)
  const hasSession = Boolean(req.cookies.get(COOKIE_NAME)?.value)

  if (!isPublic && !hasSession) {
    return NextResponse.redirect(new URL("/login", req.nextUrl))
  }

  if (isPublic && hasSession) {
    return NextResponse.redirect(new URL("/", req.nextUrl))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:png|webm|mp4|mov|svg|webp|jpg|jpeg|gif)$).*)",
  ],
}
