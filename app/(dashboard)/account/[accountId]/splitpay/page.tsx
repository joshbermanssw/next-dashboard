import { verifySession } from "@/server/auth/dal"
import { SplitPayHub } from "@/components/dashboard/splitpay-hub"
import { getSessionByAccount } from "@/lib/data/splitpay"
import { formatCountdown } from "@/lib/dashboard-data"
import { toCreatorSession } from "@/lib/splitpay"

export default async function SplitPayHubPage({
  params,
}: {
  params: Promise<{ accountId: string }>
}) {
  // Auth gate per project rules.
  await verifySession()
  const { accountId } = await params

  // Read the pool from the server store — the same record the public `/sp`
  // pages write to, so a contribution paid in from an invite email is visible
  // here. Pools that exist only in client state (created this session) fall
  // back to the accounts context inside the hub.
  const stored = getSessionByAccount(accountId)
  const session = stored
    ? toCreatorSession(stored.details, stored.label)
    : null

  return (
    <div className="flex flex-1 flex-col px-4 py-6 lg:px-6">
      <SplitPayHub
        accountId={accountId}
        session={session}
        initialCountdown={
          session ? formatCountdown(session.deadline - Date.now()) : undefined
        }
      />
    </div>
  )
}
