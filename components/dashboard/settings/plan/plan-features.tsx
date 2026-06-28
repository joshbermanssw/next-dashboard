import { CircleCheck } from "lucide-react"
import { Panel, PanelTitle } from "@/components/ui/panel"

export function PlanFeatures({ features }: { features: string[] }) {
  if (features.length === 0) return null
  return (
    <Panel className="flex flex-col gap-3 p-5">
      <PanelTitle className="text-xs font-semibold uppercase tracking-[0.14em] text-label">
        Plan features
      </PanelTitle>
      <ul className="flex flex-col gap-2.5">
        {features.map((feature) => (
          <li key={feature} className="flex items-center gap-3 text-sm text-blueLightest">
            <CircleCheck className="size-4 shrink-0 text-accentBlue" aria-hidden />
            <span>{feature}</span>
          </li>
        ))}
      </ul>
    </Panel>
  )
}
