import { verifySession } from "@/server/auth/dal"
import { CardDetailsScreen } from "@/components/dashboard/cards/card-details-screen"

export default async function CardDetailsPage({
  params,
}: {
  params: Promise<{ accountId: string; cardId: string }>
}) {
  await verifySession()
  const { accountId, cardId } = await params

  return (
    <div className="mx-auto flex w-full max-w-lg flex-1 flex-col gap-6 px-4 py-6 lg:px-6">
      <CardDetailsScreen accountId={accountId} cardId={cardId} />
    </div>
  )
}
