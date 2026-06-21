"use client"

import * as React from "react"
import { PlusIcon } from "lucide-react"
import { accountTabs } from "@/lib/dashboard-data"
import { cn } from "@/lib/utils"

export function AccountTabs() {
  const [active, setActive] = React.useState(accountTabs[0].id)

  return (
    <div className="flex flex-wrap items-center gap-2">
      {accountTabs.map((tab) => {
        const isActive = tab.id === active
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActive(tab.id)}
            aria-pressed={isActive}
            className={cn(
              "inline-flex items-center gap-2 rounded-lg border px-3.5 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              isActive
                ? "border-accentBlue/40 bg-accentBlue/15 text-accentBlue"
                : "border-panel-border bg-white/5 text-blueLight hover:bg-white/10"
            )}
          >
            <tab.icon className="size-4" />
            {tab.label}
          </button>
        )
      })}

      <button
        type="button"
        className="ml-auto inline-flex items-center gap-1.5 rounded-lg border border-panel-border bg-white/5 px-3.5 py-2 text-sm font-medium text-blueLight transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <PlusIcon className="size-4" />
        Add account
      </button>
    </div>
  )
}
