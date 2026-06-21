"use client"

import * as React from "react"
import { CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"

const RANGES = ["1M", "3M", "6M", "1Y"] as const
export type Range = (typeof RANGES)[number]

/**
 * Compact time-range pill (matches the "6M" control in the design). Cycles
 * through 1M → 3M → 6M → 1Y on click. Reused by every chart panel.
 */
export function RangeSelector({
  defaultRange = "6M",
  onRangeChange,
  className,
}: {
  defaultRange?: Range
  onRangeChange?: (range: Range) => void
  className?: string
}) {
  const [range, setRange] = React.useState<Range>(defaultRange)

  function cycle() {
    const next = RANGES[(RANGES.indexOf(range) + 1) % RANGES.length]
    setRange(next)
    onRangeChange?.(next)
  }

  return (
    <button
      type="button"
      onClick={cycle}
      aria-label={`Time range: ${range}. Click to change.`}
      className={cn(
        "inline-flex items-center gap-2 rounded-lg border border-panel-border bg-white/5 px-3 py-1.5 text-sm font-medium text-blueLight transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className
      )}
    >
      <CalendarIcon className="size-3.5 text-label" />
      {range}
    </button>
  )
}
