import Link from "next/link"
import { ArrowRightIcon } from "lucide-react"

import { verifySession } from "@/server/auth/dal"
import { Panel } from "@/components/ui/panel"
import { getAccountsForCustomer } from "@/lib/data/accounts"
import { accountKindMeta } from "@/lib/dashboard-data"
import { formatCurrency } from "@/lib/utils"

/**
 * Every account the customer holds, one row each, linking into the account hub
 * at `/account/{accountId}`.
 *
 * The header switcher (AccountTabs) only ever shows the *selected* account's
 * body; this is the flat inventory view — what you hold, what's in it, and the
 * way through to each one's settings and cards.
 *
 * Balances go through `formatCurrency` (AUD) to match TotalBalance, with the
 * account's own currency shown beside the label rather than applied to the
 * figure — same treatment as the Manage screen.
 */
export default async function AccountsPage() {
  const { customer } = await verifySession()
  const accounts = getAccountsForCustomer(customer.id)

  return (
    <div className="flex flex-1 flex-col gap-6 px-4 py-6 lg:px-6">
      <div>
        <h1 className="text-2xl font-semibold text-blueLightest">Accounts</h1>
        <p className="text-sm text-muted-foreground">
          {accounts.length} {accounts.length === 1 ? "account" : "accounts"} on
          your profile.
        </p>
      </div>

      <Panel className="flex flex-col gap-3">
        {accounts.length === 0 && (
          <p className="py-2 text-sm text-muted-foreground">
            You don&apos;t hold any accounts yet. Open one from the switcher on
            the dashboard.
          </p>
        )}

        {accounts.map((account) => {
          const meta = accountKindMeta[account.kind]
          const Icon = meta.icon
          const cardCount = account.data.cards.length

          // Most accounts are labelled after their kind ("Crypto", "Everyday"),
          // so repeating it in the sub-line just echoes the title. Only pools
          // and other renamed accounts carry a label worth qualifying.
          const detail = [
            account.label === meta.label ? null : meta.label,
            `${account.currencyFlag} ${account.currency}`,
            account.tier,
            `${cardCount} ${cardCount === 1 ? "card" : "cards"}`,
          ].filter(Boolean)

          return (
            <Link
              key={account.id}
              href={`/account/${account.id}`}
              className="flex items-center gap-4 rounded-xl border border-panel-border bg-white/[0.03] px-4 py-3.5 transition-colors hover:bg-white/[0.06]"
            >
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-white/[0.06]">
                <Icon className="size-5 text-accentBlue" />
              </span>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-blueLightest">
                  {account.label}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {detail.join(" · ")}
                </p>
              </div>

              <span className="shrink-0 text-sm font-semibold text-blueLightest tabular-nums">
                {formatCurrency(account.data.balance)}
              </span>
              <ArrowRightIcon className="size-4 shrink-0 text-muted-foreground" />
            </Link>
          )
        })}
      </Panel>
    </div>
  )
}
