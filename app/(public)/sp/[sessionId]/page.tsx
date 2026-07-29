import { notFound } from "next/navigation"

import { ContributeForm } from "@/components/splitpay/contribute-form"
import { UserContributeForm } from "@/components/splitpay/user-contribute-form"
import { getAccount, getAccountsForCustomer } from "@/lib/data/accounts"
import { balanceOf } from "@/lib/data/balances"
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
 * One link, two audiences. The deck counts a session's contributors as existing
 * DosshPay users and non-users, and Yang's invite email can't know which one it
 * is reaching, so the branch happens here:
 *
 * - **No session** — the card form. A stranger names themselves, enters the
 *   code, and pays by card.
 * - **Signed in** — identity comes from the session and the money from one of
 *   their accounts. No name to type, no PAN to key in.
 *
 * Public by design either way: no `verifySession()`, because being signed out
 * is the expected case and must never redirect. The emailed access code gates
 * both paths, server-side in the actions rather than here.
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

  // `getSession` rather than `verifySession`: no session is the *expected* case
  // here, and must never redirect to /login. When there is one, it decides
  // which of the deck's two populations this visitor belongs to.
  const auth = await getAuthSession()

  // A pool collects in its owning account's currency. Funding it from an
  // account in another currency would need an FX rate nobody has quoted, so
  // those accounts aren't offered.
  const poolAccount = getAccount(session.accountId)
  const poolCurrency = poolAccount?.currency ?? "AUD"
  const fundingAccounts = auth
    ? getAccountsForCustomer(auth.customer.id)
        .filter((a) => a.id !== session.accountId && a.currency === poolCurrency)
        .map((a) => ({
          id: a.id,
          label: a.label,
          balance: balanceOf(a.id) ?? a.data.balance,
          currency: a.currency,
          currencyFlag: a.currencyFlag,
        }))
    : []

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
      ) : auth ? (
        <UserContributeForm
          sessionId={details.sessionId}
          remaining={remaining}
          displayName={
            `${auth.customer.firstName ?? ""} ${auth.customer.lastName ?? ""}`.trim() ||
            "Your account"
          }
          accounts={fundingAccounts}
          poolCurrency={poolCurrency}
        />
      ) : (
        <ContributeForm sessionId={details.sessionId} remaining={remaining} />
      )}

      <DosshPayCta />
    </div>
  )
}
