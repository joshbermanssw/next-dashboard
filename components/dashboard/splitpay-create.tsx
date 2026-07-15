"use client"

import * as React from "react"
import {
  ChevronLeftIcon,
  UsersIcon,
  TargetIcon,
  CreditCardIcon,
  ClockIcon,
  type LucideIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { useAccounts } from "@/contexts/accounts-context"
import {
  GLOBAL_CURRENCIES,
  SPLITPAY_DURATION_PRESETS,
  SPLITPAY_TARGET_PRESETS,
} from "@/lib/dashboard-data"
import { cn } from "@/lib/utils"

type Phase = "intro" | "name" | "amount" | "time"

const HOUR_MS = 60 * 60 * 1000

const FEATURES: {
  icon: LucideIcon
  tint: string
  title: string
  body: string
}[] = [
  {
    icon: UsersIcon,
    tint: "bg-accentBlue/15 text-accentBlue",
    title: "Collect from anyone",
    body: "Add contributors and collect their share instantly via Tap or QR.",
  },
  {
    icon: TargetIcon,
    tint: "bg-accentBlue/15 text-accentBlue",
    title: "Set a spending target",
    body: "Define how much you need to collect before you can spend.",
  },
  {
    icon: CreditCardIcon,
    tint: "bg-positive/15 text-positive",
    title: "One shared virtual card",
    body: "Spend from a single card linked to the pooled balance.",
  },
  {
    icon: ClockIcon,
    tint: "bg-warning/15 text-warning",
    title: "Auto-closes at deadline",
    body: "Funding stops at your chosen time. Any remaining balance is refunded proportionally.",
  },
]

/**
 * SplitPay creation flow rendered inside CreateAccountDialog: an explainer,
 * then a 3-step wizard (name → amount → funding window) that creates the pool.
 */
export function SplitPayCreate({ onDone }: { onDone: () => void }) {
  const { addSplitPayAccount } = useAccounts()

  const [phase, setPhase] = React.useState<Phase>("intro")
  const [name, setName] = React.useState("")
  const [amount, setAmount] = React.useState("")
  const [currency, setCurrency] = React.useState("AUD")
  const [mode, setMode] = React.useState<"from-now" | "specific">("from-now")
  const [presetHours, setPresetHours] = React.useState<number | null>(null)
  const [customHours, setCustomHours] = React.useState("")
  const [specificDate, setSpecificDate] = React.useState("")

  const amountValue = Number(amount)
  const nameValid = name.trim().length > 0
  const amountValid = Number.isFinite(amountValue) && amountValue > 0

  const resolvedHours =
    customHours.trim() !== "" ? Number(customHours) : presetHours
  const specificMs = specificDate ? new Date(specificDate).getTime() : NaN
  const timeValid =
    mode === "from-now"
      ? Number.isFinite(resolvedHours) && (resolvedHours ?? 0) > 0
      : Number.isFinite(specificMs) && specificMs > Date.now()

  function handleCreate() {
    if (!timeValid) return
    const deadline =
      mode === "from-now"
        ? Date.now() + (resolvedHours as number) * HOUR_MS
        : specificMs
    addSplitPayAccount({
      name: name.trim(),
      targetAmount: amountValue,
      currencyCode: currency,
      deadline,
    })
    onDone()
  }

  if (phase === "intro") {
    return (
      <div className="flex flex-col gap-5">
        <div className="flex flex-col items-center gap-3 pt-2 text-center">
          <span className="grid size-16 place-items-center rounded-full bg-accentBlue text-white shadow-[0_0_40px_-8px] shadow-accentBlue">
            <UsersIcon className="size-8" />
          </span>
          <div>
            <h2 className="font-heading text-2xl font-semibold text-foreground">
              What is SplitPay?
            </h2>
            <p className="text-sm text-muted-foreground">
              A temporary shared funding account
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="flex items-start gap-3 rounded-xl border border-panel-border bg-white/5 p-3"
            >
              <span
                className={cn(
                  "grid size-10 shrink-0 place-items-center rounded-lg",
                  f.tint
                )}
              >
                <f.icon className="size-5" />
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-semibold text-foreground">
                  {f.title}
                </span>
                <span className="block text-xs text-muted-foreground">
                  {f.body}
                </span>
              </span>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-1">
          <Button className="w-full" onClick={() => setPhase("name")}>
            Get Started
          </Button>
          <Button variant="ghost" className="w-full" onClick={onDone}>
            Not now
          </Button>
        </div>
      </div>
    )
  }

  const step = phase === "name" ? 1 : phase === "amount" ? 2 : 3

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-center">
          {phase !== "name" ? (
            <button
              type="button"
              aria-label="Back"
              onClick={() => setPhase(phase === "amount" ? "name" : "amount")}
              className="absolute left-6 rounded-md p-1 text-muted-foreground transition-colors hover:bg-white/10 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <ChevronLeftIcon className="size-5" />
            </button>
          ) : null}
          <h2 className="font-heading text-base font-semibold text-foreground">
            Create SplitPay Account
          </h2>
        </div>
        <StepProgress step={step} />
      </div>

      {phase === "name" ? (
        <div className="flex flex-col gap-4">
          <h3 className="font-heading text-xl font-semibold text-foreground">
            What is your Splitpay Target?
          </h3>
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Team dinner, Gift for Sarah..."
            className="w-full rounded-xl border border-panel-border bg-white/5 px-4 py-3.5 text-sm text-foreground placeholder:text-muted-foreground focus-visible:border-accentBlue focus-visible:outline-none"
          />
          <div className="flex flex-col gap-2">
            <span className="text-xs text-muted-foreground">Quick select:</span>
            <div className="flex flex-wrap gap-2">
              {SPLITPAY_TARGET_PRESETS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setName(preset)}
                  className={cn(
                    "rounded-full border px-3.5 py-1.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    name === preset
                      ? "border-accentBlue bg-accentBlue/15 text-accentBlue"
                      : "border-panel-border bg-white/5 text-blueLight hover:bg-white/10"
                  )}
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>
          <Button
            className="mt-2 w-full"
            disabled={!nameValid}
            onClick={() => setPhase("amount")}
          >
            Next
          </Button>
        </div>
      ) : phase === "amount" ? (
        <div className="flex flex-col gap-4">
          <h3 className="font-heading text-xl font-semibold text-foreground">
            What is your Splitpay Target Amount?
          </h3>
          <div className="flex items-stretch gap-3">
            <input
              autoFocus
              inputMode="decimal"
              value={amount}
              onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ""))}
              placeholder="0.00"
              className="min-w-0 flex-1 rounded-xl border border-panel-border bg-white/5 px-4 py-3.5 text-lg text-foreground placeholder:text-muted-foreground focus-visible:border-accentBlue focus-visible:outline-none"
            />
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              aria-label="Currency"
              className="rounded-xl border border-panel-border bg-white/5 px-4 text-sm font-medium text-foreground focus-visible:border-accentBlue focus-visible:outline-none"
            >
              {GLOBAL_CURRENCIES.map((c) => (
                <option key={c.code} value={c.code} className="text-black">
                  {c.code}
                </option>
              ))}
            </select>
          </div>
          <Button
            className="mt-2 w-full"
            disabled={!amountValid}
            onClick={() => setPhase("time")}
          >
            Next
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <h3 className="font-heading text-xl font-semibold text-foreground">
            Set funding period time limit
          </h3>

          <div className="flex rounded-xl border border-panel-border bg-white/5 p-1">
            {(["from-now", "specific"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                className={cn(
                  "flex-1 rounded-lg py-2 text-sm font-medium transition-colors",
                  mode === m
                    ? "bg-accentBlue text-blue"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {m === "from-now" ? "From now" : "Specific date"}
              </button>
            ))}
          </div>

          {mode === "from-now" ? (
            <>
              <div className="grid grid-cols-3 gap-2">
                {SPLITPAY_DURATION_PRESETS.map((d) => (
                  <button
                    key={d.label}
                    type="button"
                    onClick={() => {
                      setPresetHours(d.hours)
                      setCustomHours("")
                    }}
                    className={cn(
                      "rounded-xl border py-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                      presetHours === d.hours && customHours === ""
                        ? "border-accentBlue bg-accentBlue/15 text-accentBlue"
                        : "border-panel-border bg-white/5 text-foreground hover:bg-white/10"
                    )}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-3">
                <input
                  inputMode="numeric"
                  value={customHours}
                  onChange={(e) =>
                    setCustomHours(e.target.value.replace(/[^0-9]/g, ""))
                  }
                  placeholder="Custom hours"
                  className="min-w-0 flex-1 rounded-xl border border-panel-border bg-white/5 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:border-accentBlue focus-visible:outline-none"
                />
                <span className="text-sm text-muted-foreground">hours</span>
              </div>
            </>
          ) : (
            <input
              type="datetime-local"
              value={specificDate}
              onChange={(e) => setSpecificDate(e.target.value)}
              className="w-full rounded-xl border border-panel-border bg-white/5 px-4 py-3 text-sm text-foreground focus-visible:border-accentBlue focus-visible:outline-none [color-scheme:dark]"
            />
          )}

          <Button
            className="mt-2 w-full"
            disabled={!timeValid}
            onClick={handleCreate}
          >
            Create SplitPay Account
          </Button>
        </div>
      )}
    </div>
  )
}

function StepProgress({ step }: { step: 1 | 2 | 3 }) {
  return (
    <div className="flex gap-2">
      {[1, 2, 3].map((i) => (
        <span
          key={i}
          className={cn(
            "h-1 flex-1 rounded-full transition-colors",
            i <= step ? "bg-accentBlue" : "bg-white/10"
          )}
        />
      ))}
    </div>
  )
}
