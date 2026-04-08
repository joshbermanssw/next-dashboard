import "server-only"
import { cache } from "react"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { decrypt } from "@/lib/session"

export const verifySession = cache(async () => {
  const cookieStore = await cookies()
  const cookie = cookieStore.get("session")?.value
  const session = await decrypt(cookie)

  if (!session?.userId) {
    redirect("/login")
  }

  return {
    isAuth: true as const,
    userId: session.userId,
    customer: session.customer,
    accessToken: session.accessToken,
  }
})

export const getSession = cache(async () => {
  const cookieStore = await cookies()
  const cookie = cookieStore.get("session")?.value
  const session = await decrypt(cookie)

  if (!session?.userId) {
    return null
  }

  return {
    userId: session.userId,
    customer: session.customer,
    accessToken: session.accessToken,
  }
})
