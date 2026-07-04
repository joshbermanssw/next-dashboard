"use client"

import { useAccounts } from "@/contexts/accounts-context"
import { AddCard, BankCard } from "@/components/dashboard/bank-card"

export function AccountCards() {
  const { selected } = useAccounts()

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
      {selected.data.cards.map((card) => (
        <BankCard key={card.id} card={card} />
      ))}
      <AddCard />
    </div>
  )
}
