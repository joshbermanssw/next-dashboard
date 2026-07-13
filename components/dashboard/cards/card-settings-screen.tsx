"use client"

import { useCard } from "@/contexts/accounts-context"
import { accountCardDesign } from "@/lib/dashboard-data"
import { CardPageHeader } from "@/components/dashboard/cards/card-page-header"
import { CardFace } from "@/components/dashboard/cards/card-face"
import { CardSettingsActions } from "@/components/dashboard/cards/card-settings-actions"
import { CardMenu } from "@/components/dashboard/cards/card-menu"
import { CardNotFound } from "@/components/dashboard/cards/card-not-found"

export function CardSettingsScreen({
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
      <CardPageHeader backHref="/" title="Card Settings" variant="compact" />
      <CardFace
        design={accountCardDesign(found.account)}
        last4={found.card.last4}
        className="w-full"
      />
      <CardSettingsActions />
      <CardMenu accountId={accountId} cardId={cardId} />
    </>
  )
}
