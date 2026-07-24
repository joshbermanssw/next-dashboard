import type { AddOnKey, CatalogPlan } from "@/lib/plan"

/** Billing cycles `PUT /customers/{id}/soft-provisioning` accepts. */
export type BillingCycle = "MONTHLY" | "ANNUAL"

export const MONTHS_PER_YEAR = 12

/**
 * Annual plans are 10% off — the "Save 10%" line on the billing step.
 *
 * The discount applies to the base plan only, not to add-ons. That is what
 * reproduces the figures in the product design: Standard at 599/month becomes
 * 599 x 12 x 0.9 = 6469 ("$64.69") a year, while a 500/month add-on stays
 * 500 x 12. Nothing upstream quotes an annual price, so this is the only place
 * the number is derived; keep it here rather than inline in a component.
 */
export const ANNUAL_DISCOUNT_RATE = 0.1

/**
 * The plan catalogue carries prices in minor units with no currency attached
 * (see `formatCatalogPrice`). Onboarding is the one surface that must name a
 * currency, because it is quoting a real charge. AUD matches the catalogue's
 * pricing today; when the catalogue starts returning a currency, read it from
 * there and delete this.
 */
export const ONBOARDING_CURRENCY = "AUD"

export type PriceBreakdown = {
  /** Base plan cost for the chosen cycle, in minor units. */
  baseMinor: number
  /** Combined add-on cost for the chosen cycle, in minor units. */
  addOnsMinor: number
  /** What the customer is charged per cycle, in minor units. */
  totalMinor: number
  /**
   * Amount saved versus paying monthly for a year, in minor units.
   * Always 0 for a monthly cycle.
   */
  savingsMinor: number
}

function addOnsMonthlyMinor(
  plan: CatalogPlan,
  selected: readonly AddOnKey[],
): number {
  return plan.addOns
    .filter((a) => selected.includes(a.key))
    .reduce((sum, a) => sum + a.monthlyPriceMinor, 0)
}

/**
 * Prices a plan + add-on selection for one billing cycle.
 *
 * Everything is computed in minor units and rounded once at the end of each
 * component, so the parts always sum to the total the customer is shown.
 */
export function priceFor(
  plan: CatalogPlan,
  selectedAddOns: readonly AddOnKey[],
  cycle: BillingCycle,
): PriceBreakdown {
  const baseMonthly = plan.monthlyPriceMinor
  const addOnsMonthly = addOnsMonthlyMinor(plan, selectedAddOns)

  if (cycle === "MONTHLY") {
    return {
      baseMinor: baseMonthly,
      addOnsMinor: addOnsMonthly,
      totalMinor: baseMonthly + addOnsMonthly,
      savingsMinor: 0,
    }
  }

  const baseAnnual = Math.round(
    baseMonthly * MONTHS_PER_YEAR * (1 - ANNUAL_DISCOUNT_RATE),
  )
  const addOnsAnnual = addOnsMonthly * MONTHS_PER_YEAR
  const undiscounted = (baseMonthly + addOnsMonthly) * MONTHS_PER_YEAR

  return {
    baseMinor: baseAnnual,
    addOnsMinor: addOnsAnnual,
    totalMinor: baseAnnual + addOnsAnnual,
    savingsMinor: undiscounted - (baseAnnual + addOnsAnnual),
  }
}

/** `1599` -> `"$15.99"`. Minor units to a display string, symbol included. */
export function formatMinor(minor: number): string {
  if (!Number.isFinite(minor)) return "—"
  return `$${(minor / 100).toFixed(2)}`
}

/** The per-cycle suffix shown beside a price, e.g. "AUD / month". */
export function cycleSuffix(cycle: BillingCycle): string {
  return `${ONBOARDING_CURRENCY} / ${cycle === "ANNUAL" ? "year" : "month"}`
}

/** Human label for a cycle, used in the confirmation summary. */
export function cycleLabel(cycle: BillingCycle): string {
  return cycle === "ANNUAL" ? "Annual" : "Monthly"
}
