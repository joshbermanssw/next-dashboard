"use client"

import Link from "next/link"
import { SplitIcon, ArrowRightIcon } from "lucide-react"

import { useCountdown } from "@/hooks/use-countdown"
import { formatCurrency, cn } from "@/lib/utils"

/** The "SplitPay Session 123-455 / Barcelona Trip Fund" bar at the top of every
 * public page. */
export function SessionHeader({
  sessionId,
  label,
}: {
  sessionId: string
  label: string
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-panel-border bg-white/[0.03] px-4 py-3">
      <span className="grid size-9 shrink-0 place-items-center rounded-full bg-accentBlue/20 text-accentBlue">
        <SplitIcon className="size-4" />
      </span>
      <div className="min-w-0">
        <p className="text-[11px] uppercase tracking-[0.14em] text-label">
          SplitPay Session {sessionId}
        </p>
        <p className="truncate text-base font-semibold text-foreground">{label}</p>
      </div>
    </div>
  )
}

/** Target / Collected / Time Left, the three numbers a contributor decides on. */
export function SessionStats({
  targetAmount,
  collected,
  deadline,
  initialCountdown,
}: {
  targetAmount: number
  collected: number
  deadline: number
  /** Server-rendered countdown, so hydration doesn't flicker. */
  initialCountdown: string
}) {
  const countdown = useCountdown(deadline, initialCountdown)
  // Read "expired" off the countdown string rather than the clock: another
  // `Date.now()` during render is another chance to disagree with the server.
  // `formatCountdown` clamps to "0min", so that string is the end state.
  const ended = countdown === "0min"

  return (
    <div className="grid grid-cols-3 rounded-2xl border border-panel-border bg-white/[0.03] py-4">
      <Stat label="Target" value={formatCurrency(targetAmount)} />
      <Stat
        label="Collected"
        value={formatCurrency(collected)}
        className="border-x border-panel-border text-positive"
      />
      <Stat
        label="Time Left"
        value={ended ? "Ended" : countdown}
        className={ended ? "text-negative" : "text-warning"}
      />
    </div>
  )
}

function Stat({
  label,
  value,
  className,
}: {
  label: string
  value: string
  className?: string
}) {
  return (
    <div className={cn("flex flex-col items-center gap-1 px-2", className)}>
      <span className="text-[11px] uppercase tracking-wide text-label">
        {label}
      </span>
      <span className="text-center text-sm font-semibold tabular-nums">
        {value}
      </span>
    </div>
  )
}

/** Progress toward the pool target. */
export function FundingBar({
  collected,
  targetAmount,
  pct,
}: {
  collected: number
  targetAmount: number
  pct: number
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between text-sm">
        <span className="tabular-nums text-foreground">
          {formatCurrency(collected)}{" "}
          <span className="text-muted-foreground">
            / {formatCurrency(targetAmount)}
          </span>
        </span>
        <span className="text-xs text-muted-foreground">
          {Math.round(pct)}% funded
        </span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-accentBlue transition-[width]"
          style={{ width: `${Math.max(0, Math.min(100, pct))}%` }}
        />
      </div>
    </div>
  )
}

/**
 * The sign-up prompt that closes the non-user journey. Someone who has just
 * paid a stranger's dinner fund is the warmest lead DosshPay gets, which is why
 * the deck puts this on the receipt and the manage page.
 */
export function DosshPayCta() {
  return (
    <div className="flex flex-col items-center gap-2 rounded-2xl border border-panel-border bg-blueDarker px-5 py-6 text-center">
      <span className="grid size-9 place-items-center rounded-full bg-accentBlue/20 text-accentBlue">
        <SplitIcon className="size-4" />
      </span>
      <p className="text-sm font-semibold text-blueLightest">
        Interested in DosshPay?
      </p>
      <p className="text-xs leading-relaxed text-blueLight/70">
        Join millions of users managing their money smarter with SplitPay, Global
        Accounts, Crypto, and more.
      </p>
      <Link
        href="/signup"
        className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-accentBlue hover:text-accentBlueHover"
      >
        Learn more
        <ArrowRightIcon className="size-3" />
      </Link>
    </div>
  )
}
