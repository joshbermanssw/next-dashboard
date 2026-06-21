import { recentExpenses } from "@/lib/dashboard-data"
import { Panel, PanelHeader, PanelTitle } from "@/components/ui/panel"
import { formatCurrency } from "@/lib/utils"

export function RecentExpenses() {
  return (
    <Panel className="flex flex-col gap-2">
      <PanelHeader>
        <PanelTitle>Recent Expenses</PanelTitle>
        <button
          type="button"
          className="text-sm font-medium text-accentBlue transition-colors hover:text-accentBlueHover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          View All
        </button>
      </PanelHeader>

      <ul className="mt-2 divide-y divide-panel-border">
        {recentExpenses.map((expense) => (
          <li
            key={expense.id}
            className="flex items-center justify-between gap-4 py-4"
          >
            <div className="flex min-w-0 flex-col">
              <span className="truncate font-medium text-blueLightest">
                {expense.name}
              </span>
              <span className="truncate text-sm text-label">
                {expense.date} • {expense.category}
              </span>
            </div>
            <span className="shrink-0 font-medium tabular-nums text-blueLightest">
              {formatCurrency(expense.amount, { cents: true })}
            </span>
          </li>
        ))}
      </ul>
    </Panel>
  )
}
