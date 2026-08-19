"use client"

import * as React from "react"
import { MdCheckCircle } from "react-icons/md"
import { Button } from "@/components/ui/button"

/**
 * Stands in for a provider handoff (Entrust/Onfido document scan, proof of
 * address, face check). There is no web build of that SDK here, so the step
 * models the shape of the real interaction — launch the check, wait, come back
 * verified — and says plainly that the result is simulated.
 *
 * Replace the timer with the SDK launch when the web integration lands; the
 * surrounding step contract (`verified` gates Continue) does not change.
 */
export function SimulatedCheck({
  icon,
  title,
  description,
  actionLabel = "Start Verification",
  verified,
  onVerified,
}: {
  icon: React.ReactNode
  title: string
  description: string
  actionLabel?: string
  verified: boolean
  onVerified: () => void
}) {
  const [running, setRunning] = React.useState(false)
  const timer = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  React.useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current)
    }
  }, [])

  const start = () => {
    setRunning(true)
    timer.current = setTimeout(() => {
      setRunning(false)
      onVerified()
    }, 1200)
  }

  return (
    <div className="flex flex-col items-center gap-5 py-8 text-center">
      <span
        aria-hidden
        className="flex size-16 items-center justify-center rounded-2xl bg-accentBlue/15 text-accentBlue [&_svg]:size-8"
      >
        {verified ? <MdCheckCircle className="text-positive" /> : icon}
      </span>

      <div className="space-y-1">
        <p className="text-lg font-semibold text-blueLightest">{title}</p>
        <p className="text-sm text-blueLight">
          {verified ? "Verified. You can continue." : description}
        </p>
      </div>

      {verified ? (
        <p className="rounded-xl border border-positive/30 bg-positive/10 px-4 py-2 text-sm text-positive">
          Check complete
        </p>
      ) : (
        <Button
          type="button"
          variant="secondary"
          onClick={start}
          disabled={running}
        >
          {running ? "Verifying…" : actionLabel}
        </Button>
      )}

      <p className="max-w-sm text-xs text-blueLight/60">
        Simulated for now — the live check runs in the Entrust SDK, which has no
        web build yet.
      </p>
    </div>
  )
}
