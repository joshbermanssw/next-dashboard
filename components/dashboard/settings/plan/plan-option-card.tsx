"use client"

import { useTransition } from "react"
import { toast } from "sonner"
import { CircleCheck, LoaderCircle } from "lucide-react"
import { subscribeToPlanAction } from "@/app/actions/plan"
import type { CatalogPlan } from "@/lib/plan"
import { Panel } from "@/components/ui/panel"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function PlanOptionCard({
  plan,
  isCurrent,
  hasActivePlan,
}: {
  plan: CatalogPlan
  isCurrent: boolean
  hasActivePlan: boolean
}) {
  const [pending, startTransition] = useTransition()

  function onSubscribe() {
    startTransition(async () => {
      // The catalogue only carries a monthly price, so monthly is the cycle the
      // data supports today.
      const res = await subscribeToPlanAction(plan.id, "monthly")
      if (res.success) toast.success(res.message)
      else toast.error(res.message)
    })
  }

  return (
    <Panel
      className={cn(
        "flex flex-col gap-3 p-5",
        isCurrent && "ring-1 ring-accentBlue/40",
      )}
    >
      <div className="flex items-baseline justify-between gap-2">
        <h3 className="text-base font-semibold text-blueLightest">{plan.name}</h3>
        <span className="text-sm text-blueLight">{plan.formattedPrice}</span>
      </div>

      {plan.features.length > 0 && (
        <ul className="flex flex-col gap-1.5">
          {plan.features.map((feature) => (
            <li key={feature} className="flex items-start gap-2 text-sm text-blueLight">
              <CircleCheck className="mt-0.5 size-4 shrink-0 text-accentBlue" aria-hidden />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      )}

      <Button
        type="button"
        variant={isCurrent ? "secondary" : "primary"}
        className="mt-1 w-full"
        disabled={isCurrent || pending}
        onClick={onSubscribe}
      >
        {pending ? (
          <>
            <LoaderCircle className="animate-spin" /> Updating…
          </>
        ) : isCurrent ? (
          "Current plan"
        ) : hasActivePlan ? (
          "Switch to this plan"
        ) : (
          "Subscribe"
        )}
      </Button>
    </Panel>
  )
}
