"use client"

import { useCard } from "@/contexts/accounts-context"
import { CardPageHeader } from "@/components/dashboard/cards/card-page-header"
import { ManageCardSections } from "@/components/dashboard/cards/manage-card-sections"
import { CardNotFound } from "@/components/dashboard/cards/card-not-found"

export function ManageCardScreen({
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
        title="Manage card"
        subtitle="Configure how your card can be used, secured and linked"
      />
      <ManageCardSections card={found.card} />
    </>
  )
}
