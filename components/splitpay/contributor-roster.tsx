"use client"

import * as React from "react"
import { CheckIcon, CrownIcon, UsersIcon } from "lucide-react"

import {
  authoriseByTokenAction,
  authoriseContributorAction,
} from "@/app/actions/splitpay"
import type { PublicContributor } from "@/lib/splitpay"
import type { ContributorStatus } from "@/lib/dashboard-data"
import { formatCurrency, cn } from "@/lib/utils"

/**
 * How the roster proves the viewer may authorise others. The creator reaches it
 * two ways — from the signed-in hub, and from their own emailed manage link —
 * so the component carries both credentials rather than assuming a session.
 */
export type RosterAuthority =
  | { kind: "hub"; accountId: string }
  | { kind: "token"; sessionId: string; token: string }
  | { kind: "none" }

/** Bar and amount colour per pledge state — green met, amber part-way, red nothing. */
const STATUS_STYLES: Record<ContributorStatus, { bar: string; text: string }> = {
  paid: { bar: "bg-positive", text: "text-positive" },
  partial: { bar: "bg-warning", text: "text-warning" },
  pending: { bar: "bg-negative/70", text: "text-negative" },
}

export function ContributorRoster({
  contributors,
  targetAmount,
  collected,
  viewerId,
  authority,
}: {
  contributors: PublicContributor[]
  targetAmount: number
  collected: number
  /** Marks the "YOU" row. */
  viewerId?: string
  authority: RosterAuthority
}) {
  const [pending, startTransition] = React.useTransition()
  const [busyId, setBusyId] = React.useState<string | null>(null)
  const [error, setError] = React.useState<string | null>(null)

  const canAuthorise = authority.kind !== "none"
  const paid = contributors.filter((c) => c.status === "paid").length

  function authorise(contributorId: string, next: boolean) {
    setError(null)
    setBusyId(contributorId)
    startTransition(async () => {
      const result =
        authority.kind === "hub"
          ? await authoriseContributorAction({
              accountId: authority.accountId,
              contributorId,
              authorised: next,
            })
          : authority.kind === "token"
            ? await authoriseByTokenAction({
                sessionId: authority.sessionId,
                token: authority.token,
                contributorId,
                authorised: next,
              })
            : null
      if (result && !result.ok) setError(result.message)
      setBusyId(null)
    })
  }

  return (
    <div className="flex flex-col gap-1 rounded-2xl border border-panel-border bg-white/[0.03] p-4">
      <div className="flex items-center gap-2 px-1 pb-2">
        <UsersIcon className="size-3.5 text-label" />
        <span className="text-xs font-medium uppercase tracking-[0.14em] text-label">
          {contributors.length} contributors
        </span>
      </div>

      {error ? (
        <p role="alert" className="px-1 pb-2 text-xs text-negative">
          {error}
        </p>
      ) : null}

      <ul className="flex flex-col">
        {contributors.map((c) => (
          <RosterRow
            key={c.id}
            contributor={c}
            isViewer={c.id === viewerId}
            canAuthorise={canAuthorise}
            busy={pending && busyId === c.id}
            onAuthorise={() => authorise(c.id, !c.authorised)}
          />
        ))}
      </ul>

      <div className="mt-2 flex items-center justify-between border-t border-panel-border px-1 pt-3 text-xs text-muted-foreground">
        <span>
          {paid} of {contributors.length} paid
        </span>
        <span className="tabular-nums">
          {formatCurrency(collected)} / {formatCurrency(targetAmount)}
        </span>
      </div>
    </div>
  )
}

function RosterRow({
  contributor: c,
  isViewer,
  canAuthorise,
  busy,
  onAuthorise,
}: {
  contributor: PublicContributor
  isViewer: boolean
  canAuthorise: boolean
  busy: boolean
  onAuthorise: () => void
}) {
  const style = STATUS_STYLES[c.status]
  // Each bar measures the person against their own pledge, not the pool target —
  // "have you done your bit" is the question the roster answers.
  const pct = c.pledged > 0 ? Math.min(100, (c.amount / c.pledged) * 100) : 0

  return (
    <li
      className={cn(
        "flex flex-col gap-2 rounded-xl px-1 py-3",
        isViewer && "bg-accentBlue/[0.07]"
      )}
    >
      <div className="flex items-center gap-3">
        <span className="grid size-8 shrink-0 place-items-center rounded-full bg-accentBlue/20 text-[11px] font-semibold text-accentBlue">
          {c.initial}
        </span>

        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <div className="flex items-center gap-1.5">
            <span className="truncate text-sm font-medium text-foreground">
              {c.name}
            </span>
            {c.isCreator ? (
              <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-accentBlue/15 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-accentBlue">
                <CrownIcon className="size-2.5" />
                Creator
              </span>
            ) : null}
            {isViewer ? (
              <span className="shrink-0 text-[10px] font-semibold uppercase tracking-wide text-label">
                You
              </span>
            ) : null}
          </div>
          <div className="h-1 w-full overflow-hidden rounded-full bg-white/10">
            <div
              className={cn("h-full rounded-full transition-[width]", style.bar)}
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        <span className={cn("shrink-0 text-sm font-semibold tabular-nums", style.text)}>
          {formatCurrency(c.amount)}
        </span>
      </div>

      <div className="flex items-center justify-between gap-3 pl-11">
        <span className="text-[11px] text-muted-foreground">
          {c.authorised ? "Authorised to spend" : "Pending authorisation"}
          {c.pledged > 0 ? ` · pledged ${formatCurrency(c.pledged)}` : null}
        </span>

        {c.isCreator ? (
          <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-positive/40 bg-positive/10 px-2.5 py-1 text-[11px] font-semibold text-positive">
            <CheckIcon className="size-3" />
            Owner
          </span>
        ) : canAuthorise ? (
          <button
            type="button"
            onClick={onAuthorise}
            disabled={busy}
            className={cn(
              "shrink-0 rounded-full px-3 py-1 text-[11px] font-semibold transition-colors disabled:opacity-50",
              c.authorised
                ? "border border-positive/40 bg-positive/10 text-positive hover:bg-positive/20"
                : "bg-accentBlue text-blue hover:bg-accentBlueHover"
            )}
          >
            {busy ? "…" : c.authorised ? "Authorised" : "Authorise"}
          </button>
        ) : (
          <span
            className={cn(
              "shrink-0 text-[11px] font-semibold",
              c.authorised ? "text-positive" : "text-muted-foreground"
            )}
          >
            {c.authorised ? "Authorised" : "Pending"}
          </span>
        )}
      </div>
    </li>
  )
}
