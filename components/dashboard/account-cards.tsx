"use client"

import { useAccounts } from "@/contexts/accounts-context"
import { AddCard, BankCard } from "@/components/dashboard/bank-card"
import type { CardDesign } from "@/lib/plan"

export function AccountCards({ cardDesign }: { cardDesign: CardDesign }) {
  const { selected } = useAccounts()

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
      {selected.data.cards.map((card) => (
        <BankCard key={card.id} card={card} design={cardDesign} />
      ))}
      <AddCard />
    </div>
  )
}
