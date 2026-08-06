import { verifySession } from "@/server/auth/dal"
import { AccountsList } from "@/components/dashboard/accounts-list"

/**
 * The flat inventory of what the customer holds. Picking a row selects that
 * account and lands back on the dashboard — the accounts themselves are
 * resolved client-side from the accounts context (see AccountsList), so this
 * page is only the auth gate.
 */
export default async function AccountsPage() {
  await verifySession()

  return (
    <div className="flex flex-1 flex-col gap-6 px-4 py-6 lg:px-6">
      <AccountsList />
    </div>
  )
}
