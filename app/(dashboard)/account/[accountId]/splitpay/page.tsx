import { verifySession } from "@/server/auth/dal"
import { SplitPayHub } from "@/components/dashboard/splitpay-hub"

export default async function SplitPayHubPage({
  params,
}: {
  params: Promise<{ accountId: string }>
}) {
  // Auth gate per project rules. The pool is resolved client-side from the
  // accounts context (see SplitPayHub), so only the id comes from the URL.
  await verifySession()
  const { accountId } = await params

  return (
    <div className="flex flex-1 flex-col px-4 py-6 lg:px-6">
      <SplitPayHub accountId={accountId} />
    </div>
  )
}
