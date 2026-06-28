import { Panel, PanelTitle } from "@/components/ui/panel"
import { formatPlanDate, type PlanHistoryItem } from "@/lib/plan"

function dateRange(item: PlanHistoryItem): string {
  const start = formatPlanDate(item.startedAt)
  const end = formatPlanDate(item.endedAt)
  if (start && end) return `${start} – ${end}`
  if (start) return `Since ${start}`
  return ""
}

export function PlanHistory({ items }: { items: PlanHistoryItem[] }) {
  if (items.length === 0) return null

  return (
    <Panel className="flex flex-col gap-3 p-5">
      <PanelTitle className="text-xs font-semibold uppercase tracking-[0.14em] text-label">
        Plan history
      </PanelTitle>
      <ul className="flex flex-col divide-y divide-white/5">
        {items.map((item) => {
          const range = dateRange(item)
          return (
            <li key={item.id} className="flex items-center justify-between gap-3 py-2.5">
              <div className="flex min-w-0 flex-col">
                <span className="truncate text-sm font-medium text-blueLightest">
                  {item.planName}
                </span>
                {range && <span className="text-xs text-label">{range}</span>}
              </div>
              <div className="flex shrink-0 flex-col items-end">
                <span className="text-sm text-blueLight">{item.formattedPrice}</span>
                <span className="text-xs capitalize text-label">{item.status}</span>
              </div>
            </li>
          )
        })}
      </ul>
    </Panel>
  )
}
