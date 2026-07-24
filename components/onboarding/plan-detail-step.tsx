"use client"

import { MdCheckCircle } from "react-icons/md"
import { Button } from "@/components/ui/button"
import {
  SelectableCard,
  SelectionIndicator,
} from "@/components/onboarding/selectable-card"
import type { AddOnKey, CatalogPlan } from "@/lib/plan"
import {
  formatMinor,
  priceFor,
  ONBOARDING_CURRENCY,
} from "@/lib/plan-pricing"

export function PlanDetailStep({
  plan,
  selectedAddOns,
  onToggleAddOn,
  onContinue,
}: {
  plan: CatalogPlan
  selectedAddOns: AddOnKey[]
  onToggleAddOn: (key: AddOnKey) => void
  onContinue: () => void
}) {
  // Shown monthly here regardless of the eventual billing cycle — the cycle is
  // chosen on the next step, and quoting an annual figure before then would
  // pre-empt a choice the customer has not made.
  const price = priceFor(plan, selectedAddOns, "MONTHLY")

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <p className="text-sm text-blueLight">{plan.name} plan</p>
        <p className="flex items-baseline gap-2">
          <span className="text-3xl font-semibold text-blueLightest">
            {formatMinor(price.totalMinor)}
          </span>
          <span className="text-sm text-blueLight">
            {ONBOARDING_CURRENCY} / month
          </span>
        </p>
      </div>

      {plan.features.length > 0 ? (
        <ul className="flex flex-col gap-3">
          {plan.features.map((feature) => (
            <li key={feature} className="flex items-start gap-3 text-sm text-blueLight">
              <MdCheckCircle
                aria-hidden
                className="mt-0.5 size-5 shrink-0 text-positive"
              />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      ) : null}

      {plan.addOns.length > 0 ? (
        <div className="flex flex-col gap-3">
          <p className="text-sm font-medium text-blueLightest">Optional extras</p>
          {plan.addOns.map((addOn) => {
            const selected = selectedAddOns.includes(addOn.key)
            return (
              <SelectableCard
                key={addOn.key}
                role="checkbox"
                selected={selected}
                onSelect={() => onToggleAddOn(addOn.key)}
                className="items-center"
              >
                <SelectionIndicator selected={selected} shape="square" />
                <span className="flex flex-1 flex-col gap-0.5">
                  <span className="font-medium text-blueLightest">{addOn.name}</span>
                  {addOn.description ? (
                    <span className="text-sm text-blueLight">
                      {addOn.description}
                    </span>
                  ) : null}
                </span>
                <span className="shrink-0 text-sm font-medium text-blueLightest">
                  {formatMinor(addOn.monthlyPriceMinor)}/month
                </span>
              </SelectableCard>
            )
          })}
        </div>
      ) : null}

      <Button type="button" variant="primary" className="w-full" onClick={onContinue}>
        Select plan
      </Button>
    </div>
  )
}
