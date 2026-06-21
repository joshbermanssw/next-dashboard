import * as React from "react"
import { cn } from "@/lib/utils"

/**
 * Panel — the dark "glass" surface used across the dashboard for charts,
 * lists, and tiles. Distinct from `Card`, which is the light surface used for
 * KPIs and the login flow. Tokens live in globals.css (`bg-panel`,
 * `border-panel-border`).
 */
function Panel({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="panel"
      className={cn(
        "rounded-2xl border border-panel-border bg-panel p-5 backdrop-blur-sm sm:p-6",
        className
      )}
      {...props}
    />
  )
}

function PanelHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="panel-header"
      className={cn("flex items-start justify-between gap-4", className)}
      {...props}
    />
  )
}

function PanelTitle({ className, ...props }: React.ComponentProps<"h2">) {
  return (
    <h2
      data-slot="panel-title"
      className={cn(
        "text-lg font-semibold tracking-tight text-blueLightest",
        className
      )}
      {...props}
    />
  )
}

export { Panel, PanelHeader, PanelTitle }
