"use client"

import * as React from "react"
import { formatCountdown } from "@/lib/dashboard-data"

/**
 * Live "2d 23h 59min" countdown to `deadline` (epoch ms), re-rendering each
 * second. Client-only; SplitPay pools are created in client state, so the hook
 * only ever runs against a real deadline after hydration.
 */
export function useCountdown(deadline: number): string {
  const [now, setNow] = React.useState(() => Date.now())

  React.useEffect(() => {
    const tick = () => setNow(Date.now())
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  return formatCountdown(deadline - now)
}
