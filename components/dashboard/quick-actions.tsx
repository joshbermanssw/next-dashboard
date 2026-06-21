import { quickActions } from "@/lib/dashboard-data"

export function QuickActions() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
      {quickActions.map((action) => (
        <button
          key={action.id}
          type="button"
          className="group flex flex-col items-center justify-center gap-3 rounded-2xl border border-panel-border bg-white/[0.03] py-5 transition-colors hover:bg-white/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <span className="flex size-10 items-center justify-center rounded-full bg-accentBlue/15 text-accentBlue transition-colors group-hover:bg-accentBlue/25">
            <action.icon className="size-4" />
          </span>
          <span className="text-sm font-medium text-blueLight">
            {action.label}
          </span>
        </button>
      ))}
    </div>
  )
}
