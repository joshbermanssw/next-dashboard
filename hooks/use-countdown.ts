"use client"

import * as React from "react"
import { formatCountdown } from "@/lib/dashboard-data"

/**
 * Live "2d 23h 59min" countdown to `deadline` (epoch ms), re-rendering each
 * second.
 *
 * Pass `initial` when the countdown is server-rendered (the public SplitPay
 * pages are). The server and the browser reach `Date.now()` milliseconds apart,
 * which is enough to straddle a minute boundary and produce two different
 * strings; rendering the server's value until the first tick keeps hydration
 * matched. Without it the hook falls back to reading the clock directly, which
 * is fine for pools that only ever render client-side.
 */
export function useCountdown(deadline: number, initial?: string): string {
  const [now, setNow] = React.useState<number | null>(null)

  React.useEffect(() => {
    const tick = () => setNow(Date.now())
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  if (now === null) return initial ?? formatCountdown(deadline - Date.now())
  return formatCountdown(deadline - now)
}
