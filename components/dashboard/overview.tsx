"use client"

import { useAccounts } from "@/contexts/accounts-context"
import { TotalBalance } from "@/components/dashboard/total-balance"
import { AccountCards } from "@/components/dashboard/account-cards"
import { QuickActions } from "@/components/dashboard/quick-actions"
import { MoneyFlow } from "@/components/dashboard/money-flow"
import { RecentActivity } from "@/components/dashboard/recent-activity"
import { SpendingOverview } from "@/components/dashboard/spending-overview"
import { SplitPayOverview } from "@/components/dashboard/splitpay-overview"

/**
 * Switches the dashboard body on the selected account: SplitPay pools show
 * their funding view, every other account shows the standard widget grid.
 */
export function Overview() {
  const { selected } = useAccounts()

  if (selected.kind === "splitpay" && selected.splitpay) {
    return <SplitPayOverview account={selected} />
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)]">
      <div className="flex flex-col gap-6">
        <TotalBalance />
        <AccountCards />
        <QuickActions />
        <RecentActivity />
      </div>

      <div className="flex flex-col gap-6">
        <MoneyFlow />
        <SpendingOverview />
      </div>
    </div>
  )
}
