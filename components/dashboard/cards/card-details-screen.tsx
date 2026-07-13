"use client"

import { useCard } from "@/contexts/accounts-context"
import { CardPageHeader } from "@/components/dashboard/cards/card-page-header"
import { CardDetailsList } from "@/components/dashboard/cards/card-details-list"
import { CardNotFound } from "@/components/dashboard/cards/card-not-found"

export function CardDetailsScreen({
  accountId,
  cardId,
}: {
  accountId: string
  cardId: string
}) {
  const found = useCard(accountId, cardId)
  if (!found) return <CardNotFound />

  return (
    <>
      <CardPageHeader
        backHref={`/account/${accountId}/cards/${cardId}`}
        title="Card Details"
        subtitle="Don't share your card details with anyone. DosshPay will never ask for them."
      />
      <CardDetailsList card={found.card} />
    </>
  )
}
