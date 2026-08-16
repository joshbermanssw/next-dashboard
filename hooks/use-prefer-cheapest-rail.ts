"use client"

import * as React from "react"

const STORAGE_KEY = "dosshpay.prefer-cheapest-rail"

/**
 * "Always use cheapest method" — the payer's standing Hyper Switch preference.
 *
 * A device preference rather than account state: it changes which rail the
 * sheet opens on, never what a payment costs, so it has no business going near
 * the session. Read after mount so the server render and the first client
 * render agree.
 */
export function usePreferCheapestRail(): [boolean, (value: boolean) => void] {
  const [preferCheapest, setPreferCheapest] = React.useState(false)

  React.useEffect(() => {
    setPreferCheapest(window.localStorage.getItem(STORAGE_KEY) === "1")
  }, [])

  const update = React.useCallback((value: boolean) => {
    setPreferCheapest(value)
    window.localStorage.setItem(STORAGE_KEY, value ? "1" : "0")
  }, [])

  return [preferCheapest, update]
}
