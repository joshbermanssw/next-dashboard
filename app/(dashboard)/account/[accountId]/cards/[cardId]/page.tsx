import { verifySession } from "@/server/auth/dal"
import { CardSettingsScreen } from "@/components/dashboard/cards/card-settings-screen"

export default async function CardSettingsPage({
  params,
}: {
  params: Promise<{ accountId: string; cardId: string }>
}) {
  // Auth gate per project rules. The card is resolved client-side from the
  // accounts context (see CardSettingsScreen), so only the ids come from the URL.
  await verifySession()
  const { accountId, cardId } = await params

  return (
    <div className="mx-auto flex w-full max-w-lg flex-1 flex-col gap-7 px-4 py-6 lg:px-6">
      <CardSettingsScreen accountId={accountId} cardId={cardId} />
    </div>
  )
}
