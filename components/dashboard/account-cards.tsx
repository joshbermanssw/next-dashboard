import { bankCards } from "@/lib/dashboard-data"
import { AddCard, BankCard } from "@/components/dashboard/bank-card"

export function AccountCards() {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
      {bankCards.map((card) => (
        <BankCard key={card.id} card={card} />
      ))}
      <AddCard />
    </div>
  )
}
