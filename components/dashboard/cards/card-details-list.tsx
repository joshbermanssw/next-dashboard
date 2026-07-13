"use client"

import { useState } from "react"
import { EyeIcon, EyeOffIcon } from "lucide-react"
import { Panel } from "@/components/ui/panel"
import { CardBrandMark } from "@/components/dashboard/cards/card-brand-mark"
import type { BankCard } from "@/lib/dashboard-data"

/**
 * Card Details reveal row for the opened card: brand mark, name, and the
 * number / CVC masked until the eye is toggled. Reveal is client-only stub
 * state — nothing is fetched or persisted.
 */
export function CardDetailsList({ card }: { card: BankCard }) {
  const [revealed, setRevealed] = useState(false)

  return (
    <Panel className="flex items-start gap-4 p-5">
      <CardBrandMark brand={card.brand} />

      <div className="flex min-w-0 flex-1 flex-col gap-3">
        <div className="flex items-center justify-between gap-3">
          <p className="truncate text-base font-semibold text-blueLightest">
            {card.name}
          </p>
          <button
            type="button"
            onClick={() => setRevealed((v) => !v)}
            aria-pressed={revealed}
            aria-label={revealed ? "Hide card details" : "Reveal card details"}
            className="flex size-9 shrink-0 items-center justify-center rounded-full text-blueLight transition-colors hover:bg-white/5 hover:text-blueLightest focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {revealed ? (
              <EyeOffIcon className="size-4.5" />
            ) : (
              <EyeIcon className="size-4.5" />
            )}
          </button>
        </div>

        <p className="font-mono text-lg tracking-wider text-blueLightest tabular-nums">
          {revealed ? card.number : `•••• ${card.last4}`}
        </p>

        <div className="flex gap-8 font-mono text-sm text-blueLight tabular-nums">
          <span>
            <span className="mr-2 font-sans text-xs uppercase tracking-wide text-label">
              Exp
            </span>
            {card.expiry}
          </span>
          <span>
            <span className="mr-2 font-sans text-xs uppercase tracking-wide text-label">
              CVC
            </span>
            {revealed ? card.cvc : "•••"}
          </span>
        </div>
      </div>
    </Panel>
  )
}
