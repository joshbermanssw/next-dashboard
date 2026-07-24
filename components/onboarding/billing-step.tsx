"use client"

import { MdCalendarMonth, MdLock, MdSell, MdSync, MdWorkspacePremium } from "react-icons/md"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { AddOnKey, CatalogPlan } from "@/lib/plan"
import {
  cycleLabel,
  formatMinor,
  priceFor,
  type BillingCycle,
} from "@/lib/plan-pricing"

const CYCLES: BillingCycle[] = ["MONTHLY", "ANNUAL"]

export function BillingStep({
  plan,
  selectedAddOns,
  billingCycle,
  onCycleChange,
  onConfirm,
  pending,
  error,
}: {
  plan: CatalogPlan
  selectedAddOns: AddOnKey[]
  billingCycle: BillingCycle
  onCycleChange: (cycle: BillingCycle) => void
  onConfirm: () => void
  pending: boolean
  error: string | null
}) {
  const price = priceFor(plan, selectedAddOns, billingCycle)

  return (
    <div className="flex flex-col gap-5">
      <div
        role="radiogroup"
        aria-label="Billing schedule"
        className="grid grid-cols-2 gap-2 rounded-full bg-white/5 p-1"
      >
        {CYCLES.map((cycle) => (
          <button
            key={cycle}
            type="button"
            role="radio"
            aria-checked={billingCycle === cycle}
            onClick={() => onCycleChange(cycle)}
            className={cn(
              "rounded-full px-4 py-2 text-sm font-medium transition-colors",
              billingCycle === cycle
                ? "bg-accentBlue text-blue"
                : "text-blueLight hover:text-blueLightest",
            )}
          >
            {cycleLabel(cycle)}
          </button>
        ))}
      </div>

      {price.savingsMinor > 0 ? (
        <p className="text-center text-sm font-medium text-positive">
          Save {formatMinor(price.savingsMinor)} a year
        </p>
      ) : null}

      <dl className="divide-y divide-panel-border overflow-hidden rounded-xl border border-panel-border bg-white/5">
        <SummaryRow
          icon={<MdWorkspacePremium className="size-4" />}
          label="Plan"
          value={plan.name}
        />
        <SummaryRow
          icon={<MdCalendarMonth className="size-4" />}
          label="Billing schedule"
          value={cycleLabel(billingCycle)}
        />
        <SummaryRow
          icon={<MdSell className="size-4" />}
          label="Price"
          value={formatMinor(price.totalMinor)}
          emphasis
        />
      </dl>

      {error ? (
        <p
          role="alert"
          className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >
          {error}
        </p>
      ) : null}

      <Button
        type="button"
        variant="primary"
        className="w-full"
        onClick={onConfirm}
        disabled={pending}
      >
        {pending ? (
          <>
            <MdSync className="animate-spin" /> Setting up your account...
          </>
        ) : (
          "Confirm payment schedule"
        )}
      </Button>

      <p className="flex items-start gap-2 text-xs text-blueLight/70">
        <MdLock aria-hidden className="mt-0.5 size-4 shrink-0" />
        <span>
          You won&apos;t be charged until you add a payment method. You can
          change your billing schedule any time.
        </span>
      </p>
    </div>
  )
}

function SummaryRow({
  icon,
  label,
  value,
  emphasis,
}: {
  icon: React.ReactNode
  label: string
  value: string
  emphasis?: boolean
}) {
  return (
    <div className="flex items-center justify-between gap-4 px-4 py-3.5">
      <dt className="flex items-center gap-3 text-sm text-blueLight">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-white/5 text-blueLight">
          {icon}
        </span>
        {label}
      </dt>
      <dd
        className={cn(
          "text-sm font-semibold",
          emphasis ? "text-positive" : "text-blueLightest",
        )}
      >
        {value}
      </dd>
    </div>
  )
}
