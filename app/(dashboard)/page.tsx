import { headers } from "next/headers"

import { verifySession } from "@/server/auth/dal"
import { isMobileRequest } from "@/server/device"
import { AccountTabs } from "@/components/dashboard/account-tabs"
import { Overview } from "@/components/dashboard/overview"
import { JoinedSessions } from "@/components/splitpay/joined-sessions"

export default async function OverviewPage() {
  // Auth gate per project rules. Data below is stubbed for the design phase.
  // The body switches per selected account (see Overview) — SplitPay pools get
  // their funding view, everything else the standard widget grid.
  const { customer } = await verifySession()

  // Device class is read here rather than in the client so the More sheet never
  // offers the mobile-only QR flow to a desktop visitor, even for a frame.
  const isMobile = isMobileRequest(await headers())

  return (
    <div className="flex flex-1 flex-col gap-6 px-4 py-6 lg:px-6">
      <AccountTabs />
      {/* Passed as a slot rather than imported by Overview: it reads the
          server-only session store, and Overview is a client component. */}
      <Overview
        isMobile={isMobile}
        joinedSessions={<JoinedSessions customerId={customer.id} />}
      />
    </div>
  )
}
