"use client"

import { ReceiptTextIcon } from "lucide-react"
import { useAccounts } from "@/contexts/accounts-context"
import { Panel, PanelHeader, PanelTitle } from "@/components/ui/panel"
import { cn, formatCurrency } from "@/lib/utils"

export function RecentActivity() {
  const { selected } = useAccounts()
  const transactions = selected.data.recentActivity

  return (
    <Panel className="flex flex-col">
      <PanelHeader>
        <PanelTitle>Recent Activity</PanelTitle>
      </PanelHeader>

      {transactions.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-12 text-center">
          <span className="flex size-12 items-center justify-center rounded-2xl bg-white/5">
            <ReceiptTextIcon className="size-5 text-label" aria-hidden />
          </span>
          <span className="text-sm text-label">No transactions yet</span>
        </div>
      ) : (
        <>
          <ul className="mt-2 divide-y divide-panel-border">
            {transactions.map((tx) => (
              <li key={tx.id} className="flex items-center gap-4 py-4">
                <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-white/5 text-blueLight">
                  <tx.icon className="size-5" aria-hidden />
                </span>
                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className="truncate font-semibold text-blueLightest">
                    {tx.name}
                  </span>
                  <span className="truncate text-sm text-label">{tx.detail}</span>
                </div>
                <span
                  className={cn(
                    "shrink-0 font-semibold tabular-nums",
                    tx.amount > 0 ? "text-positive" : "text-blueLightest"
                  )}
                >
                  {tx.amount > 0 ? "+" : "-"}
                  {formatCurrency(Math.abs(tx.amount), { cents: true })}
                </span>
              </li>
            ))}
          </ul>

          <div className="border-t border-panel-border pt-2">
            <button
              type="button"
              className="mx-auto flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-blueLight transition-colors hover:text-blueLightest focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <ReceiptTextIcon className="size-4 text-label" aria-hidden />
              View all transactions
            </button>
          </div>
        </>
      )}
    </Panel>
  )
}
