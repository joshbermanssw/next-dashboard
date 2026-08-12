"use client"

import * as React from "react"
import Link from "next/link"
import { quickActions } from "@/lib/dashboard-data"
import { MoreSheet } from "@/components/dashboard/more-sheet"
import { useAccounts } from "@/contexts/accounts-context"

const actionClass =
  "group flex flex-col items-center justify-center gap-3 rounded-2xl border border-panel-border bg-white/[0.03] py-5 transition-colors hover:bg-white/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"

export function QuickActions({
  /** Whether this request came from a phone. Everything the More sheet holds is
   * mobile-only, so on desktop More stays the placeholder it has always been
   * rather than opening an empty sheet. */
  isMobile,
}: {
  isMobile: boolean
}) {
  const { selected } = useAccounts()
  const [moreOpen, setMoreOpen] = React.useState(false)

  return (
    <>
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

          // Manage opens the selected account's settings.
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

          // More opens the sheet holding the QR flow. The others are visual
          // placeholders for now.
          if (action.id === "more" && isMobile) {
            return (
              <button
                key={action.id}
                type="button"
                onClick={() => setMoreOpen(true)}
                aria-haspopup="dialog"
                aria-expanded={moreOpen}
                className={actionClass}
              >
                {inner}
              </button>
            )
          }

          return (
            <button key={action.id} type="button" className={actionClass}>
              {inner}
            </button>
          )
        })}
      </div>

      {isMobile && <MoreSheet open={moreOpen} onOpenChange={setMoreOpen} />}
    </>
  )
}
