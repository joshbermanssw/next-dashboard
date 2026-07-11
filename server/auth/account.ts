import "server-only"
import type { AccountType } from "@/lib/definitions"
import type { Session } from "@/server/auth/session"
import { getCustomerAccount } from "@/server/bff/clients/customer"

export type ResolvedAccount = { accountId?: string; accountType: AccountType }

// accountId/accountType are captured at login, but sessions predating that
// feature lack them. Resolve on demand so callers work without a re-login.
export async function resolveAccount(session: Session): Promise<ResolvedAccount> {
  if (session.accountId) {
    return { accountId: session.accountId, accountType: session.accountType ?? "everyday" }
  }
  try {
    const acct = await getCustomerAccount(session.upstreamJwt, session.customer.id)
    return { accountId: acct.accountId, accountType: acct.accountType ?? "everyday" }
  } catch {
    return { accountId: undefined, accountType: "everyday" }
  }
}
