import "server-only"
import { redirect } from "next/navigation"
import { getSession, type Session } from "./session"

export async function verifySession(): Promise<Session> {
  const session = await getSession()
  if (!session) redirect("/login")
  return session
}
