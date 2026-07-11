import { verifySession } from "@/server/auth/dal"
import { resolveAccount } from "@/server/auth/account"
import { getCurrentPlan } from "@/server/bff/clients/plan"
import { planTierToCardDesign } from "@/lib/plan"
import { AccountsProvider } from "@/contexts/accounts-context"
import { AccountTabs } from "@/components/dashboard/account-tabs"
import { TotalBalance } from "@/components/dashboard/total-balance"
import { AccountCards } from "@/components/dashboard/account-cards"
import { QuickActions } from "@/components/dashboard/quick-actions"
import { MoneyFlow } from "@/components/dashboard/money-flow"
import { RecentActivity } from "@/components/dashboard/recent-activity"
import { SpendingOverview } from "@/components/dashboard/spending-overview"

export default async function OverviewPage() {
  // Auth gate per project rules. Data below is stubbed for the design phase.
  const session = await verifySession()
  const { accountId, accountType } = await resolveAccount(session)

  // The bank-card face follows the customer's membership. Corporate accounts
  // always get the business card, so only everyday accounts pay for the plan
  // fetch — which is guarded so a plan-service hiccup can't break the overview
  // (it just falls back to the basic card).
  const plan =
    accountType === "corporate" || !accountId
      ? null
      : await getCurrentPlan(session.upstreamJwt, accountId).catch(() => null)
  const cardDesign = planTierToCardDesign(plan?.tier ?? null, accountType)

  return (
    <AccountsProvider>
      <div className="flex flex-1 flex-col gap-6 px-4 py-6 lg:px-6">
        <AccountTabs />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)]">
          <div className="flex flex-col gap-6">
            <TotalBalance />
            <AccountCards cardDesign={cardDesign} />
            <QuickActions />
            <RecentActivity />
          </div>

          <div className="flex flex-col gap-6">
            <MoneyFlow />
            <SpendingOverview />
          </div>
        </div>
      </div>
    </AccountsProvider>
  )
}
