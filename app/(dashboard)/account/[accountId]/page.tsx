import { verifySession } from "@/server/auth/dal"
import { AccountSettings } from "@/components/dashboard/account-settings"

export default async function AccountManagePage({
  params,
}: {
  params: Promise<{ accountId: string }>
}) {
  // Auth gate per project rules. The account itself is resolved client-side from
  // the accounts context (see AccountSettings), so only the id comes from the URL.
  await verifySession()
  const { accountId } = await params

  return (
    <div className="flex flex-1 flex-col gap-6 px-4 py-6 lg:px-6">
      <AccountSettings accountId={accountId} />
    </div>
  )
}
