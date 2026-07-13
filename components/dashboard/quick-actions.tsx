"use client"

import Link from "next/link"
import { quickActions } from "@/lib/dashboard-data"
import { useAccounts } from "@/contexts/accounts-context"

const actionClass =
  "group flex flex-col items-center justify-center gap-3 rounded-2xl border border-panel-border bg-white/[0.03] py-5 transition-colors hover:bg-white/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"

export function QuickActions() {
  const { selected } = useAccounts()

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
      {quickActions.map((action) => {
        const inner = (
          <>
            <span className="flex size-10 items-center justify-center rounded-full bg-accentBlue/15 text-accentBlue transition-colors group-hover:bg-accentBlue/25">
              <action.icon className="size-4" />
            </span>
            <span className="text-sm font-medium text-blueLight">
              {action.label}
            </span>
          </>
        )

        // Manage opens the selected account's settings. The others are visual
        // placeholders for now.
        if (action.id === "manage") {
          return (
            <Link
              key={action.id}
              href={`/account/${selected.id}`}
              className={actionClass}
            >
              {inner}
            </Link>
          )
        }

        return (
          <button key={action.id} type="button" className={actionClass}>
            {inner}
          </button>
        )
      })}
    </div>
  )
}
