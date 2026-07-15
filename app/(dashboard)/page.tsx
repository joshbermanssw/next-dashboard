import { verifySession } from "@/server/auth/dal"
import { AccountTabs } from "@/components/dashboard/account-tabs"
import { Overview } from "@/components/dashboard/overview"

export default async function OverviewPage() {
  // Auth gate per project rules. Data below is stubbed for the design phase.
  // The body switches per selected account (see Overview) — SplitPay pools get
  // their funding view, everything else the standard widget grid.
  await verifySession()

  return (
    <div className="flex flex-1 flex-col gap-6 px-4 py-6 lg:px-6">
      <AccountTabs />
      <Overview />
    </div>
  )
}
