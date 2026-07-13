"use client"

import { useAccounts } from "@/contexts/accounts-context"
import { AddCard, BankCard } from "@/components/dashboard/bank-card"
import { accountCardDesign } from "@/lib/dashboard-data"

export function AccountCards() {
  const { selected } = useAccounts()
  // The card face is owned by the account (its plan segment + tier), so every
  // card in the selected account shares it.
  const design = accountCardDesign(selected)

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
      {selected.data.cards.map((card) => (
        <BankCard key={card.id} card={card} design={design} />
      ))}
      <AddCard />
    </div>
  )
}
