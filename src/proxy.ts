import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const publicRoutes = ["/login"]

export function proxy(req: NextRequest) {
  const path = req.nextUrl.pathname
  const isPublicRoute = publicRoutes.includes(path)
  const sessionCookie = req.cookies.get("session")?.value

  // Unauthenticated user trying to access protected route -> redirect to login
  if (!isPublicRoute && !sessionCookie) {
    return NextResponse.redirect(new URL("/login", req.nextUrl))
  }

  // Authenticated user trying to access login -> redirect to dashboard
  if (isPublicRoute && sessionCookie) {
    return NextResponse.redirect(new URL("/", req.nextUrl))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$).*)"],
}
