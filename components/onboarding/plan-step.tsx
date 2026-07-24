"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import {
  SelectableCard,
  SelectionIndicator,
} from "@/components/onboarding/selectable-card"
import { planTierToCardDesign, type CatalogPlan } from "@/lib/plan"
import { formatMinor, ONBOARDING_CURRENCY } from "@/lib/plan-pricing"

function priceLine(plan: CatalogPlan): string {
  return plan.monthlyPriceMinor <= 0
    ? "Free"
    : `${ONBOARDING_CURRENCY} ${formatMinor(plan.monthlyPriceMinor).replace("$", "")} / month`
}

export function PlanStep({
  plans,
  selectedPlanId,
  onSelect,
}: {
  plans: CatalogPlan[]
  selectedPlanId: number | null
  onSelect: (planId: number) => void
}) {
  const [choice, setChoice] = React.useState<number | null>(selectedPlanId)

  if (plans.length === 0) {
    return (
      <p className="rounded-xl border border-panel-border bg-white/5 p-4 text-sm text-blueLight">
        We couldn&apos;t load the available plans just now. Refresh the page to
        try again.
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-5">
      <div role="radiogroup" aria-label="Subscription plan" className="flex flex-col gap-3">
        {plans.map((plan) => (
          <SelectableCard
            key={plan.id}
            role="radio"
            selected={choice === plan.id}
            onSelect={() => setChoice(plan.id)}
            className="items-center"
          >
            <SelectionIndicator selected={choice === plan.id} />
            <img
              src={`/cards/${planTierToCardDesign(plan.tier, "everyday")}.svg`}
              alt=""
              aria-hidden
              className="hidden w-24 shrink-0 rounded-md drop-shadow-md sm:block"
            />
            <span className="flex flex-col gap-1">
              <span className="font-semibold text-blueLightest">{plan.name}</span>
              <span className="text-sm text-blueLight">{priceLine(plan)}</span>
            </span>
          </SelectableCard>
        ))}
      </div>

      <Button
        type="button"
        variant="primary"
        className="w-full"
        disabled={choice === null}
        onClick={() => choice !== null && onSelect(choice)}
      >
        Continue
      </Button>
    </div>
  )
}
