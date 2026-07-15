"use client"

import Link from "next/link"
import { ArrowRightIcon, ClockIcon } from "lucide-react"

import { TotalBalance } from "@/components/dashboard/total-balance"
import { QuickActions } from "@/components/dashboard/quick-actions"
import { useCountdown } from "@/hooks/use-countdown"
import type { Account, SplitPayDetails } from "@/lib/dashboard-data"
import { formatCurrency, cn } from "@/lib/utils"

/** Dashboard view for a SplitPay account: balance, quick actions, and the
 * funding card that links through to the SplitPay Hub. */
export function SplitPayOverview({ account }: { account: Account }) {
  const splitpay = account.splitpay
  if (!splitpay) return null

  return (
    <div className="flex w-full max-w-2xl flex-col gap-6">
      <TotalBalance />
      <QuickActions />

      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium uppercase tracking-[0.18em] text-label">
            Cards
          </span>
        </div>
        <div className="flex gap-2">
          <span className="inline-flex items-center gap-2 rounded-full border border-accentBlue/40 bg-accentBlue/15 px-3.5 py-1.5 text-sm font-medium text-accentBlue">
            <span className="size-2 rounded-full bg-accentBlue" />
            Funding
          </span>
          <span className="inline-flex items-center gap-2 rounded-full border border-panel-border bg-white/5 px-3.5 py-1.5 text-sm font-medium text-muted-foreground">
            Card
          </span>
        </div>

        <FundingCard account={account} splitpay={splitpay} />
      </div>
    </div>
  )
}

function FundingCard({
  account,
  splitpay,
}: {
  account: Account
  splitpay: SplitPayDetails
}) {
  const countdown = useCountdown(splitpay.deadline)
  const pct =
    splitpay.targetAmount > 0
      ? Math.min(100, (splitpay.collected / splitpay.targetAmount) * 100)
      : 0
  const people = splitpay.contributors.length

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-panel-border bg-white/[0.03] p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-lg font-semibold text-foreground">
            {account.label}
          </h3>
          <p className="text-xs text-muted-foreground">
            Account #{splitpay.accountNumber}
          </p>
        </div>
        <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-panel-border bg-white/5 px-3 py-1 text-xs text-blueLight">
          <ClockIcon className="size-3.5" />
          {countdown}
        </span>
      </div>

      <div className="flex items-end justify-between gap-3">
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-semibold tabular-nums text-foreground">
            {formatCurrency(splitpay.collected, { cents: true })}
          </span>
          <span className="text-sm text-muted-foreground">
            of {formatCurrency(splitpay.targetAmount, { cents: true })}
          </span>
        </div>
        <div className="text-right">
          <span className="text-lg font-semibold text-accentBlue">
            {Math.round(pct)}%
          </span>
          <span className="block text-xs text-muted-foreground">funded</span>
        </div>
      </div>

      <ProgressBar pct={pct} />

      <div className="flex items-center gap-2">
        <Avatars contributors={splitpay.contributors} />
        <span className="text-sm text-muted-foreground">
          {people} {people === 1 ? "person" : "people"}
        </span>
      </div>

      <Link
        href={`/account/${account.id}/splitpay`}
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-accentBlue px-4 py-3 text-sm font-bold text-blue transition-colors hover:bg-accentBlueHover"
      >
        View Splitpay Hub
        <ArrowRightIcon className="size-4" />
      </Link>
    </div>
  )
}

export function ProgressBar({ pct }: { pct: number }) {
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
      <div
        className="h-full rounded-full bg-accentBlue transition-[width]"
        style={{ width: `${Math.max(0, Math.min(100, pct))}%` }}
      />
    </div>
  )
}

export function Avatars({
  contributors,
}: {
  contributors: SplitPayDetails["contributors"]
}) {
  return (
    <div className="flex -space-x-2">
      {contributors.slice(0, 4).map((c) => (
        <span
          key={c.id}
          className={cn(
            "grid size-7 place-items-center rounded-full border-2 border-background bg-accentBlue/80 text-xs font-semibold text-white"
          )}
        >
          {c.initial}
        </span>
      ))}
    </div>
  )
}
