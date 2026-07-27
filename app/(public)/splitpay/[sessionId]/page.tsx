import { notFound } from "next/navigation"

import { ClaimGate } from "@/components/splitpay/claim-gate"
import { ManageView } from "@/components/splitpay/manage-view"
import {
  DosshPayCta,
  SessionHeader,
  SessionStats,
} from "@/components/splitpay/public-chrome"
import { getContributorByToken, getSession } from "@/lib/data/splitpay"
import { formatCountdown } from "@/lib/dashboard-data"
import { toPublicSession, toViewerContribution } from "@/lib/splitpay"

/**
 * Step 5 — "View & Update My Contribution" from the follow-up email.
 *
 * `?c=` carries the contributor's manage token; it is the only thing that
 * identifies the visitor, since they may have no DosshPay account. Without a
 * resolving token the page falls back to the code + name gate rather than
 * showing anyone's contribution.
 */
export default async function ManageContributionPage({
  params,
  searchParams,
}: {
  params: Promise<{ sessionId: string }>
  searchParams: Promise<{ c?: string }>
}) {
  const { sessionId } = await params
  const { c: token } = await searchParams

  const session = getSession(sessionId)
  if (!session) notFound()

  const { details, label } = session
  const contributor = token ? getContributorByToken(sessionId, token) : null

  return (
    <div className="flex flex-col gap-5">
      <SessionHeader sessionId={details.sessionId} label={label} />
      <SessionStats
        targetAmount={details.targetAmount}
        collected={details.collected}
        deadline={details.deadline}
        initialCountdown={formatCountdown(details.deadline - Date.now())}
      />

      {contributor ? (
        <ManageView
          session={toPublicSession(details, label)}
          viewer={toViewerContribution(contributor, details)}
          token={contributor.token}
        />
      ) : (
        <ClaimGate sessionId={details.sessionId} />
      )}

      <DosshPayCta />
    </div>
  )
}
