import "server-only"
import { bffFetch } from "@/server/bff/http"
import { services } from "@/server/config/services"

export type Account = {
  id: string
  nickname: string
  currency: string
  balance: number
  type: "checking" | "savings" | "investment" | "credit"
}

export async function listAccounts(bearer: string): Promise<Account[]> {
  const res = await bffFetch<{ accounts: Account[] }>(
    `${services.accounts.baseUrl}/accounts`,
    { bearer, method: "GET" },
  )
  return res.accounts
}
