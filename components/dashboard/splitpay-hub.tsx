"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  ChevronLeftIcon,
  ClockIcon,
  CircleCheckIcon,
  WalletIcon,
  AtSignIcon,
  UsersIcon,
  CreditCardIcon,
} from "lucide-react"

import { creatorTopUpAction, startSpendingAction } from "@/app/actions/splitpay"
import { useAccounts } from "@/contexts/accounts-context"
import { useCountdown } from "@/hooks/use-countdown"
import { Panel } from "@/components/ui/panel"
import { ProgressBar } from "@/components/dashboard/splitpay-overview"
import { ContributorRoster } from "@/components/splitpay/contributor-roster"
import { InvitePanel, TargetPanel } from "@/components/splitpay/hub-panels"
import { toCreatorSession, type CreatorSession } from "@/lib/splitpay"
import type { SplitPayStatus } from "@/lib/dashboard-data"
import { formatCurrency, cn } from "@/lib/utils"

const STATUSES: SplitPayStatus[] = ["funding", "spending", "closed"]
const STATUS_LABEL: Record<SplitPayStatus, string> = {
  funding: "Funding",
  spending: "Spending",
  closed: "Closed",
}

type HubPanel = "target" | "topup" | "invite" | "contributors"

export function SplitPayHub({
  accountId,
  session: serverSession,
  initialCountdown,
}: {
  accountId: string
  /**
   * The pool as the server store knows it — the same record the public `/sp`
   * pages read and write, so a stranger's contribution shows up here. `null`
   * for a pool that only exists in client state (created this session, or the
   * store restarted), in which case we fall back to the context copy and the
   * creator-side actions have nothing to talk to.
   */
  session: CreatorSession | null
  initialCountdown?: string
}) {
  const router = useRouter()
  const { accounts } = useAccounts()
  const [panel, setPanel] = React.useState<HubPanel | null>(null)

  const account = accounts.find((a) => a.id === accountId)
  const fallback = React.useMemo(
    () =>
      account?.splitpay ? toCreatorSession(account.splitpay, account.label) : null,
    [account]
  )
  const session = serverSession ?? fallback

  const countdown = useCountdown(session?.deadline ?? 0, initialCountdown)

  if (!session) {
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

  const { collected, targetAmount, status, remaining, pct } = session
  const mine = session.contributors.find((c) => c.isCreator)?.amount ?? 0
  const [dollars, cents] = formatCurrency(collected, { cents: true }).split(".")
  // Creator-side controls need a server record to act on; the context fallback
  // has no counterpart in the store.
  const live = serverSession !== null

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

        <div className="grid w-full grid-cols-3 border-t border-panel-border pt-4">
          <HubStat label="My contribution" value={formatCurrency(mine)} />
          <HubStat
            label="Remaining"
            value={formatCurrency(remaining)}
            valueClass="text-accentBlue"
            bordered
          />
          <HubStat
            label="Paid"
            value={`${session.paidCount} of ${session.contributorCount}`}
          />
        </div>
      </Panel>

      <div className="flex justify-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-panel-border bg-white/5 px-4 py-2 text-sm text-blueLight">
          <ClockIcon className="size-4" />
          Session ends in {countdown}
        </span>
      </div>

      <div className="grid grid-cols-4 gap-2">
        <HubAction
          icon={CircleCheckIcon}
          label="Target"
          active={panel === "target"}
          onClick={() => togglePanel("target")}
        />
        <HubAction
          icon={WalletIcon}
          label="Top up"
          active={panel === "topup"}
          onClick={() => togglePanel("topup")}
        />
        <HubAction
          icon={AtSignIcon}
          label="Invite"
          active={panel === "invite"}
          onClick={() => togglePanel("invite")}
        />
        <HubAction
          icon={UsersIcon}
          label="Contributors"
          active={panel === "contributors"}
          onClick={() => togglePanel("contributors")}
        />
      </div>

      {!live && panel !== null ? (
        <p className="rounded-xl border border-warning/30 bg-warning/[0.08] px-4 py-3 text-xs text-warning">
          This pool isn&apos;t registered with the server yet, so invites and
          authorisation are unavailable. Reload the dashboard to re-register it.
        </p>
      ) : null}

      {panel === "target" ? <TargetPanel session={session} /> : null}
      {panel === "topup" ? (
        <TopUpPanel accountId={accountId} disabled={!live} />
      ) : null}
      {panel === "invite" && live ? (
        <InvitePanel accountId={accountId} session={session} />
      ) : null}
      {panel === "contributors" ? (
        <ContributorRoster
          contributors={session.contributors}
          targetAmount={targetAmount}
          collected={collected}
          viewerId={session.contributors.find((c) => c.isCreator)?.id}
          authority={live ? { kind: "hub", accountId } : { kind: "none" }}
        />
      ) : null}

      {status === "funding" ? (
        <button
          type="button"
          disabled={!live}
          onClick={() => {
            startSpendingAction({ accountId }).then(() => router.refresh())
          }}
          className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-positive px-4 py-4 text-base font-bold text-blue shadow-[0_0_40px_-12px] shadow-positive transition-opacity hover:opacity-90 disabled:opacity-50"
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
            <p className="text-sm font-semibold text-foreground">{session.label}</p>
            <p className="text-xs text-muted-foreground">
              #{session.accountNumber} · Session {session.sessionId}
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
            <div className="flex -space-x-2">
              {session.contributors.slice(0, 4).map((c) => (
                <span
                  key={c.id}
                  className="grid size-7 place-items-center rounded-full border-2 border-background bg-accentBlue/80 text-xs font-semibold text-white"
                >
                  {c.initial}
                </span>
              ))}
            </div>
            <span className="text-sm text-muted-foreground">
              {session.contributorCount}{" "}
              {session.contributorCount === 1 ? "person" : "people"}
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

  function togglePanel(next: HubPanel) {
    setPanel((current) => (current === next ? null : next))
  }
}

/** The creator adding their own money, drawn from their DosshPay balance —
 * no card, unlike the public contributor flow. */
function TopUpPanel({
  accountId,
  disabled,
}: {
  accountId: string
  disabled: boolean
}) {
  const router = useRouter()
  const [pending, startTransition] = React.useTransition()
  const [value, setValue] = React.useState("")
  const [error, setError] = React.useState<string | null>(null)

  function confirm() {
    setError(null)
    startTransition(async () => {
      const result = await creatorTopUpAction({
        accountId,
        amount: Number(value),
      })
      if (!result.ok) {
        setError(result.message)
        return
      }
      setValue("")
      router.refresh()
    })
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <input
          autoFocus
          inputMode="decimal"
          value={value}
          disabled={disabled || pending}
          onChange={(e) => setValue(e.target.value.replace(/[^0-9.]/g, ""))}
          placeholder="Amount to add"
          className="min-w-0 flex-1 rounded-xl border border-panel-border bg-white/5 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:border-accentBlue focus-visible:outline-none disabled:opacity-50"
          onKeyDown={(e) => {
            if (e.key === "Enter") confirm()
          }}
        />
        <button
          type="button"
          onClick={confirm}
          disabled={disabled || pending}
          className="rounded-xl bg-accentBlue px-5 py-3 text-sm font-bold text-blue transition-colors hover:bg-accentBlueHover disabled:opacity-50"
        >
          {pending ? "…" : "Add"}
        </button>
      </div>
      {error ? (
        <p role="alert" className="text-xs text-negative">
          {error}
        </p>
      ) : null}
    </div>
  )
}

function HubStat({
  label,
  value,
  valueClass,
  bordered,
}: {
  label: string
  value: string
  valueClass?: string
  bordered?: boolean
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-1",
        bordered && "border-x border-panel-border"
      )}
    >
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className={cn("text-lg font-semibold text-foreground", valueClass)}>
        {value}
      </span>
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
