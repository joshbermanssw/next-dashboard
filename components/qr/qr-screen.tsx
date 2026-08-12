"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { XIcon } from "lucide-react"

import { QrReceive } from "@/components/qr/qr-receive"
import { QrScanner } from "@/components/qr/qr-scanner"
import type { QrAccount } from "@/lib/qr-payment"
import { cn } from "@/lib/utils"

const TABS = [
  { id: "pay", label: "Pay" },
  { id: "receive", label: "Receive" },
] as const

type TabId = (typeof TABS)[number]["id"]

/**
 * The QR screen: scan someone's code to pay, or show your own to be paid.
 *
 * Only the active panel is mounted. That matters for Pay — leaving the camera
 * running behind the Receive tab would hold the device's camera open (and its
 * indicator light on) for a screen that doesn't use it.
 */
export function QrScreen({
  accounts,
  displayName,
}: {
  accounts: QrAccount[]
  displayName: string
}) {
  const router = useRouter()
  const [tab, setTab] = React.useState<TabId>("pay")

  return (
    <div className="relative flex min-h-dvh flex-col bg-blueDarker">
      {/* The camera fills the screen and the controls float over it, so the
          scanner is a full-bleed layer rather than a sibling panel. */}
      {tab === "pay" && (
        <div id="qr-panel-pay" role="tabpanel" aria-label="Pay">
          <QrScanner />
        </div>
      )}

      <header className="relative z-10 flex items-center justify-center px-4 pb-4 pt-5">
        <div
          role="tablist"
          aria-label="QR payments"
          className="inline-flex rounded-full bg-white/15 p-1 backdrop-blur-sm"
        >
          {TABS.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={tab === id}
              aria-controls={`qr-panel-${id}`}
              onClick={() => setTab(id)}
              className={cn(
                "w-28 rounded-full py-2 text-base font-medium transition-colors",
                tab === id
                  ? "bg-white/35 text-white"
                  : "text-white/70 hover:text-white",
              )}
            >
              {label}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => router.push("/")}
          aria-label="Close"
          className="absolute right-4 flex size-9 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
        >
          <XIcon className="size-5" />
        </button>
      </header>

      {tab === "receive" && (
        <div
          id="qr-panel-receive"
          role="tabpanel"
          aria-label="Receive"
          className="flex flex-1 flex-col"
        >
          <QrReceive accounts={accounts} displayName={displayName} />
        </div>
      )}
    </div>
  )
}
