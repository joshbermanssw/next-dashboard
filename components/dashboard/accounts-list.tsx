"use client"

import Link from "next/link"
import { ArrowRightIcon } from "lucide-react"

import { Panel } from "@/components/ui/panel"
import { useAccounts } from "@/contexts/accounts-context"
import { accountKindMeta } from "@/lib/dashboard-data"
import { cn, formatCurrency } from "@/lib/utils"

/**
 * The customer's accounts, one row each — a picker, not a destination. Choosing
 * a row selects that account and returns to the dashboard, which is where an
 * account's body actually lives; its settings hub is a step further on, behind
 * Manage in the quick actions.
 *
 * Reads the accounts context rather than the seed directly, so a pool funded
 * from an invite email or an account opened from the switcher shows up here
 * with everyone else. The provider is mounted in the dashboard layout, so the
 * selection set here survives the navigation to `/`.
 *
 * Balances go through `formatCurrency` (AUD) to match TotalBalance, with the
 * account's own currency shown beside the label rather than applied to the
 * figure — same treatment as the Manage screen.
 */
export function AccountsList() {
  const { accounts, selected, selectAccount } = useAccounts()

  return (
    <>
      <div>
        <h1 className="text-2xl font-semibold text-blueLightest">Accounts</h1>
        <p className="text-sm text-muted-foreground">
          {accounts.length} {accounts.length === 1 ? "account" : "accounts"} on
          your profile. Pick one to open it on your dashboard.
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
          const isSelected = account.id === selected?.id

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
              href="/"
              onClick={() => selectAccount(account.id)}
              aria-current={isSelected ? "true" : undefined}
              className={cn(
                "flex items-center gap-4 rounded-xl border px-4 py-3.5 transition-colors",
                isSelected
                  ? "border-accentBlue/40 bg-accentBlue/[0.08] hover:bg-accentBlue/[0.12]"
                  : "border-panel-border bg-white/[0.03] hover:bg-white/[0.06]"
              )}
            >
              <span
                className={cn(
                  "flex size-10 shrink-0 items-center justify-center rounded-full",
                  isSelected ? "bg-accentBlue/15" : "bg-white/[0.06]"
                )}
              >
                <Icon className="size-5 text-accentBlue" />
              </span>

              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-2 truncate text-sm font-medium text-blueLightest">
                  {account.label}
                  {isSelected ? (
                    <span className="shrink-0 rounded-full bg-accentBlue/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-accentBlue">
                      Current
                    </span>
                  ) : null}
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
    </>
  )
}
