"use client"

import { useAccounts } from "@/contexts/accounts-context"
import { formatCurrency } from "@/lib/utils"

export function TotalBalance() {
  const { selected } = useAccounts()

  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs font-medium uppercase tracking-[0.18em] text-label">
        Total Balance
      </span>
      <span className="text-4xl font-semibold tracking-tight text-blueLightest tabular-nums sm:text-5xl">
        {formatCurrency(selected.data.balance)}
      </span>
    </div>
  )
}
