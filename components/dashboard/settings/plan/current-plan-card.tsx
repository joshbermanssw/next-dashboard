import { Panel } from "@/components/ui/panel"
import { planRenewalLine, type CurrentPlan } from "@/lib/plan"

const TIER_LABEL: Record<string, string> = {
  BASIC: "Basic",
  STANDARD: "Standard",
  PREMIUM: "Premium",
}

export function CurrentPlanCard({ plan }: { plan: CurrentPlan }) {
  const renewal = planRenewalLine(plan)
  return (
    <Panel className="flex flex-col gap-3 p-5">
      <span className="text-xs font-semibold uppercase tracking-[0.14em] text-label">
        Current plan
      </span>
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="text-2xl font-semibold text-blueLightest">{plan.planName}</h2>
        {plan.tier ? (
          <span className="rounded-full bg-accentBlue/15 px-2.5 py-0.5 text-xs font-medium text-accentBlue">
            {TIER_LABEL[plan.tier] ?? plan.tier}
          </span>
        ) : null}
        <span className="ml-auto rounded-full bg-white/10 px-2.5 py-0.5 text-xs font-medium capitalize text-blueLight">
          {plan.status}
        </span>
      </div>
      <p className="text-sm text-blueLight">{plan.formattedPrice}</p>
      {renewal ? <p className="text-sm text-label">{renewal}</p> : null}
    </Panel>
  )
}
