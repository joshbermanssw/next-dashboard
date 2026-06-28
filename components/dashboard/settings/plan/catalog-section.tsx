import type { CatalogPlan } from "@/lib/plan"
import { PlanOptionCard } from "./plan-option-card"

export function CatalogSection({
  plans,
  currentPlanId,
  hasActivePlan,
}: {
  plans: CatalogPlan[]
  currentPlanId: number | null
  hasActivePlan: boolean
}) {
  if (plans.length === 0) return null

  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-label">
        {hasActivePlan ? "Change plan" : "Choose a plan"}
      </h2>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {plans.map((plan) => (
          <PlanOptionCard
            key={plan.id}
            plan={plan}
            isCurrent={plan.id === currentPlanId}
            hasActivePlan={hasActivePlan}
          />
        ))}
      </div>
    </section>
  )
}
