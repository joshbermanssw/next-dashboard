"use client"

import * as React from "react"
import Link from "next/link"
import {
  ChevronLeftIcon,
  ClockIcon,
  CircleCheckIcon,
  WalletIcon,
  AtSignIcon,
  UsersIcon,
  CreditCardIcon,
} from "lucide-react"

import { useAccounts } from "@/contexts/accounts-context"
import { useUser } from "@/contexts/user-context"
import { useCountdown } from "@/hooks/use-countdown"
import { Panel } from "@/components/ui/panel"
import { Avatars, ProgressBar } from "@/components/dashboard/splitpay-overview"
import type { SplitPayStatus } from "@/lib/dashboard-data"
import { formatCurrency, cn } from "@/lib/utils"

const STATUSES: SplitPayStatus[] = ["funding", "spending", "closed"]
const STATUS_LABEL: Record<SplitPayStatus, string> = {
  funding: "Funding",
  spending: "Spending",
  closed: "Closed",
}

export function SplitPayHub({ accountId }: { accountId: string }) {
  const { accounts, topUpSplitPay, startSpending } = useAccounts()
  const { customer } = useUser()
  const [topUpOpen, setTopUpOpen] = React.useState(false)
  const [topUpValue, setTopUpValue] = React.useState("")

  const account = accounts.find((a) => a.id === accountId)
  const splitpay = account?.splitpay

  const countdown = useCountdown(splitpay?.deadline ?? 0)

  if (!account || !splitpay) {
    return (
      <Panel className="flex flex-col items-start gap-3 p-6">
        <p className="text-base font-medium text-blueLightest">
          SplitPay pool not found
        </p>
        <p className="text-sm text-blueLight">
          We couldn&apos;t find that pool. It may have been removed.
        </p>
        <Link
          href="/"
          className="text-sm font-medium text-accentBlue hover:text-accentBlueHover"
        >
          Back to dashboard
        </Link>
      </Panel>
    )
  }

  const { collected, targetAmount, status, contributors } = splitpay
  const pct = targetAmount > 0 ? Math.min(100, (collected / targetAmount) * 100) : 0
  const remaining = Math.max(0, targetAmount - collected)
  const mine =
    contributors.find((c) => c.id === customer.id)?.amount ??
    contributors[0]?.amount ??
    0
  const [dollars, cents] = formatCurrency(collected, { cents: true }).split(".")

  function confirmTopUp() {
    const amount = Number(topUpValue)
    if (amount > 0) topUpSplitPay(account!.id, amount)
    setTopUpValue("")
    setTopUpOpen(false)
  }

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-6">
      <div className="flex items-center justify-center">
        <Link
          href="/"
          aria-label="Back to dashboard"
          className="absolute left-4 grid size-9 place-items-center rounded-full border border-panel-border bg-white/5 text-blueLight transition-colors hover:bg-white/10 lg:left-6"
        >
          <ChevronLeftIcon className="size-5" />
        </Link>
        <h1 className="font-heading text-xl font-semibold text-foreground">
          Splitpay
        </h1>
      </div>

      <div className="flex gap-2">
        {STATUSES.map((s) => (
          <span
            key={s}
            className={cn(
              "flex flex-1 items-center justify-center gap-2 rounded-full border px-3 py-2 text-sm font-medium",
              s === status
                ? "border-accentBlue/40 bg-accentBlue/15 text-accentBlue"
                : "border-panel-border bg-white/5 text-muted-foreground"
            )}
          >
            <span
              className={cn(
                "grid size-4 place-items-center rounded-full border",
                s === status ? "border-accentBlue" : "border-muted-foreground/50"
              )}
            >
              {s === status ? (
                <span className="size-2 rounded-full bg-accentBlue" />
              ) : null}
            </span>
            {STATUS_LABEL[s]}
          </span>
        ))}
      </div>

      <Panel className="flex flex-col items-center gap-4 p-6">
        <span className="text-sm text-muted-foreground">Collected</span>
        <div className="flex items-baseline">
          <span className="text-5xl font-bold tabular-nums text-foreground">
            {dollars}
          </span>
          <span className="text-2xl font-bold tabular-nums text-muted-foreground">
            .{cents}
          </span>
        </div>
        <span className="text-sm text-muted-foreground">
          of {formatCurrency(targetAmount)} target
        </span>

        <ProgressBar pct={pct} />

        <div className="flex w-full items-center justify-between text-sm">
          <span className="text-muted-foreground">{Math.round(pct)}% funded</span>
          <span className="text-muted-foreground">
            {formatCurrency(remaining)} remaining
          </span>
        </div>

        <div className="grid w-full grid-cols-2 border-t border-panel-border pt-4">
          <div className="flex flex-col items-center gap-1 border-r border-panel-border">
            <span className="text-xs text-muted-foreground">My contribution</span>
            <span className="text-lg font-semibold text-foreground">
              {formatCurrency(mine)}
            </span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <span className="text-xs text-muted-foreground">
              Remaining to target
            </span>
            <span className="text-lg font-semibold text-accentBlue">
              {formatCurrency(remaining)}
            </span>
          </div>
        </div>
      </Panel>

      <div className="flex justify-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-panel-border bg-white/5 px-4 py-2 text-sm text-blueLight">
          <ClockIcon className="size-4" />
          Session ends in {countdown}
        </span>
      </div>

      <div className="grid grid-cols-4 gap-2">
        <HubAction icon={CircleCheckIcon} label="Target" />
        <HubAction
          icon={WalletIcon}
          label="Top up"
          active={topUpOpen}
          onClick={() => setTopUpOpen((v) => !v)}
        />
        <HubAction icon={AtSignIcon} label="Invite" />
        <HubAction icon={UsersIcon} label="Contributors" />
      </div>

      {topUpOpen ? (
        <div className="flex items-center gap-2">
          <input
            autoFocus
            inputMode="decimal"
            value={topUpValue}
            onChange={(e) => setTopUpValue(e.target.value.replace(/[^0-9.]/g, ""))}
            placeholder="Amount to add"
            className="min-w-0 flex-1 rounded-xl border border-panel-border bg-white/5 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:border-accentBlue focus-visible:outline-none"
            onKeyDown={(e) => {
              if (e.key === "Enter") confirmTopUp()
            }}
          />
          <button
            type="button"
            onClick={confirmTopUp}
            className="rounded-xl bg-accentBlue px-5 py-3 text-sm font-bold text-blue transition-colors hover:bg-accentBlueHover"
          >
            Add
          </button>
        </div>
      ) : null}

      {status === "funding" ? (
        <button
          type="button"
          onClick={() => startSpending(account.id)}
          className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-positive px-4 py-4 text-base font-bold text-blue shadow-[0_0_40px_-12px] shadow-positive transition-opacity hover:opacity-90"
        >
          <CreditCardIcon className="size-5" />
          Start Spending
        </button>
      ) : (
        <div className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-positive/40 bg-positive/10 px-4 py-4 text-base font-bold text-positive">
          <CreditCardIcon className="size-5" />
          {status === "spending" ? "Spending active" : "Pool closed"}
        </div>
      )}

      <div className="flex flex-col gap-3 rounded-2xl border border-panel-border bg-white/[0.03] p-5">
        <div className="flex items-start justify-between">
          <span className="inline-flex items-center gap-2 rounded-full border border-accentBlue/40 bg-accentBlue/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-accentBlue">
            <span className="size-1.5 rounded-full bg-accentBlue" />
            {STATUS_LABEL[status]}
          </span>
          <div className="text-right">
            <p className="text-sm font-semibold text-foreground">
              {account.label}
            </p>
            <p className="text-xs text-muted-foreground">
              #{splitpay.accountNumber}
            </p>
          </div>
        </div>
        <div className="flex items-end justify-between">
          <span className="text-2xl font-semibold tabular-nums text-foreground">
            {formatCurrency(collected, { cents: true })}
            <span className="ml-1 text-sm font-normal text-muted-foreground">
              of {formatCurrency(targetAmount)}
            </span>
          </span>
          <span className="text-lg font-semibold text-accentBlue">
            {Math.round(pct)}%
          </span>
        </div>
        <ProgressBar pct={pct} />
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Avatars contributors={contributors} />
            <span className="text-sm text-muted-foreground">
              {contributors.length}{" "}
              {contributors.length === 1 ? "person" : "people"}
            </span>
          </div>
          <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            <ClockIcon className="size-3.5" />
            {countdown}
          </span>
        </div>
      </div>
    </div>
  )
}

function HubAction({
  icon: Icon,
  label,
  active,
  onClick,
}: {
  icon: typeof ClockIcon
  label: string
  active?: boolean
  onClick?: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex flex-col items-center gap-2 focus-visible:outline-none"
    >
      <span
        className={cn(
          "grid size-14 place-items-center rounded-full border transition-colors",
          active
            ? "border-accentBlue bg-accentBlue/15 text-accentBlue"
            : "border-panel-border bg-white/5 text-blueLight group-hover:bg-white/10"
        )}
      >
        <Icon className="size-5" />
      </span>
      <span className="text-xs text-muted-foreground">{label}</span>
    </button>
  )
}
