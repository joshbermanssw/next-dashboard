import Link from "next/link"
import { ArrowRightIcon, SplitIcon } from "lucide-react"

import { FundingBar } from "@/components/splitpay/public-chrome"
import { Panel } from "@/components/ui/panel"
import { contributorStatus, stillOwed } from "@/lib/dashboard-data"
import { fundedPct } from "@/lib/splitpay"
import { listSessionsForCustomer } from "@/lib/data/splitpay"
import { formatCurrency } from "@/lib/utils"

/**
 * "SplitPay sessions you're in" — pools the customer contributes to but doesn't
 * own.
 *
 * The payoff for having a DosshPay account. A non-user's only way back to a
 * session is the link in their email; a customer's sessions are simply here,
 * and the manage link carries their token so they land straight in their own
 * view rather than the claim gate.
 *
 * Pools they *created* are deliberately absent — those already appear as
 * accounts in the switcher, with the hub behind them.
 */
export function JoinedSessions({ customerId }: { customerId: string }) {
  const joined = listSessionsForCustomer(customerId)
  if (joined.length === 0) return null

  return (
    <Panel className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <SplitIcon className="size-4 text-accentBlue" />
        <h2 className="text-sm font-semibold text-blueLightest">
          SplitPay sessions you&apos;re in
        </h2>
      </div>

      <div className="flex flex-col gap-3">
        {joined.map(({ session, contributor }) => {
          const owed = stillOwed(contributor)
          const status = contributorStatus(contributor)

          return (
            <Link
              key={session.details.sessionId}
              href={`/sp/${session.details.sessionId}/manage?c=${contributor.token}`}
              className="flex flex-col gap-3 rounded-xl border border-panel-border bg-white/[0.03] px-4 py-3.5 transition-colors hover:bg-white/[0.06]"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-blueLightest">
                    {session.label}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    You: {formatCurrency(contributor.amount)} of{" "}
                    {formatCurrency(contributor.pledged)}
                    {status === "paid" ? (
                      <span className="text-positive"> · paid</span>
                    ) : (
                      <span className="text-warning">
                        {" "}
                        · {formatCurrency(owed)} still owed
                      </span>
                    )}
                  </p>
                </div>
                <ArrowRightIcon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
              </div>

              <FundingBar
                collected={session.details.collected}
                targetAmount={session.details.targetAmount}
                pct={fundedPct(session.details)}
              />
            </Link>
          )
        })}
      </div>
    </Panel>
  )
}
