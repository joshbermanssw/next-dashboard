import "server-only"
import { listAccounts, type Account } from "@/server/bff/clients/accounts"
import { verifySession } from "@/server/auth/dal"

export type Overview = {
  accounts: Account[]
  errors: { source: string; message: string }[]
}

export async function getOverview(): Promise<Overview> {
  const session = await verifySession()

  const results = await Promise.allSettled([
    listAccounts(session.upstreamJwt),
  ])

  const errors: Overview["errors"] = []
  const accounts =
    results[0].status === "fulfilled"
      ? results[0].value
      : (errors.push({ source: "accounts", message: errString(results[0].reason) }), [])

  return { accounts, errors }
}

function errString(e: unknown): string {
  if (e instanceof Error) return e.message
  return String(e)
}
