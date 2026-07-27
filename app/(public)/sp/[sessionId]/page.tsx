import { notFound } from "next/navigation"

import { ContributeForm } from "@/components/splitpay/contribute-form"
import {
  DosshPayCta,
  SessionHeader,
  SessionStats,
} from "@/components/splitpay/public-chrome"
import { getSession as getSplitPaySession } from "@/lib/data/splitpay"
import { formatCountdown } from "@/lib/dashboard-data"
import { getSession as getAuthSession } from "@/server/auth/session"

/**
 * Step 2 — the page an invite email lands on.
 *
 * Public by design: no `verifySession()`, because the whole point is that the
 * visitor may have no DosshPay account. The emailed access code is the gate,
 * and it is checked server-side in `contributeAction`, not here.
 */
export default async function JoinSplitPayPage({
  params,
}: {
  params: Promise<{ sessionId: string }>
}) {
  const { sessionId } = await params
  const session = getSplitPaySession(sessionId)
  if (!session) notFound()

  const { details, label } = session
  const remaining = Math.max(0, details.targetAmount - details.collected)

  // Signed-in visitors get a head start — `getSession` rather than
  // `verifySession` so the absence of a session is a prefill we skip, not a
  // redirect to /login.
  const auth = await getAuthSession()
  const prefillName = auth
    ? `${auth.customer.firstName} ${auth.customer.lastName}`.trim()
    : ""

  return (
    <div className="flex flex-col gap-5">
      <SessionHeader sessionId={details.sessionId} label={label} />
      <SessionStats
        targetAmount={details.targetAmount}
        collected={details.collected}
        deadline={details.deadline}
        initialCountdown={formatCountdown(details.deadline - Date.now())}
      />

      {remaining === 0 ? (
        <div className="rounded-2xl border border-positive/40 bg-positive/10 px-4 py-6 text-center">
          <p className="text-sm font-semibold text-positive">
            This session is fully funded
          </p>
          <p className="mt-1 text-xs text-blueLight/70">
            No further contributions are needed. Thanks for checking.
          </p>
        </div>
      ) : (
        <ContributeForm
          sessionId={details.sessionId}
          remaining={remaining}
          prefillName={prefillName}
        />
      )}

      <DosshPayCta />
    </div>
  )
}
