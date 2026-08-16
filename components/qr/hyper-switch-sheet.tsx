"use client"

import * as React from "react"
import { XIcon, ZapIcon } from "lucide-react"
import { FaCcVisa } from "react-icons/fa"

import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerTitle,
} from "@/components/ui/drawer"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { quoteRails, type RailId, type RailQuote } from "@/lib/payment-rails"
import { cn, formatCurrency } from "@/lib/utils"

/**
 * Hyper Switch: pick the rail a payment travels on.
 *
 * Every rail delivers the same amount to the payee — they differ in fee, reward
 * points, and speed — so the sheet's job is to make that trade-off visible
 * rather than quietly routing for the payer. When they land on something dearer
 * than the cheapest option, it says so and offers the swap in one tap.
 */
export function HyperSwitchSheet({
  amount,
  open,
  onOpenChange,
  onConfirm,
  preferCheapest,
  onPreferCheapestChange,
}: {
  /** What's being sent, which is what the rails are priced against. */
  amount: number
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Called with the chosen rail when the payer continues. */
  onConfirm: (railId: RailId) => void
  /** "Always use cheapest method" — preselects, never auto-continues. */
  preferCheapest: boolean
  onPreferCheapestChange: (value: boolean) => void
}) {
  const quotes = quoteRails(amount)
  const cheapest = quotes.find((quote) => quote.isCheapest)!
  const [selectedId, setSelectedId] = React.useState<RailId>(cheapest.id)

  // Re-open on the cheapest rail when that preference is on, and otherwise
  // start from wherever the amount now puts the best price.
  React.useEffect(() => {
    if (open) setSelectedId(cheapest.id)
  }, [open, cheapest.id])

  const selected = quotes.find((q) => q.id === selectedId) ?? cheapest
  const dearerThanCheapest = !selected.isCheapest

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      {/* Taller than the primitive's default 80vh: all five rails have to be
          comparable at a glance, which is the entire point of the sheet. */}
      <DrawerContent className="max-h-[96dvh] border-panel-border bg-blueDarker text-blueLightest">
        <div className="relative px-4 pb-2 pt-2 text-center">
          <DrawerTitle className="text-2xl font-bold text-blueLightest">
            Hyper Switch
          </DrawerTitle>
          <DrawerDescription className="mt-1 text-base text-blueLight/60">
            Sending via{" "}
            <span className="font-semibold text-accentBlue">
              {selected.label}
            </span>
          </DrawerDescription>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            aria-label="Close"
            className="absolute right-2 top-0 flex size-9 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
          >
            <XIcon className="size-5" />
          </button>
        </div>

        <div
          role="radiogroup"
          aria-label="Payment method"
          className="min-h-0 flex-1 space-y-2.5 overflow-y-auto px-4 py-2"
        >
          {quotes.map((quote) => (
            <RailRow
              key={quote.id}
              quote={quote}
              selected={quote.id === selectedId}
              onSelect={() => setSelectedId(quote.id)}
            />
          ))}
        </div>

        <div className="border-t border-panel-border px-4 pb-3 pt-3">
          <label className="flex cursor-pointer items-center gap-3 pb-3">
            <Checkbox
              checked={preferCheapest}
              onCheckedChange={onPreferCheapestChange}
              className="size-6 rounded-md"
            />
            <span className="text-base text-blueLightest">
              Always use cheapest method
            </span>
          </label>

          {dearerThanCheapest ? (
            <div className="space-y-3">
              <Button
                type="button"
                onClick={() => onConfirm(cheapest.id)}
                className="w-full gap-2 rounded-full py-3.5 text-base font-semibold"
              >
                <ZapIcon className="size-4 fill-current" />
                Switch to {cheapest.label} - cheapest
              </Button>
              <button
                type="button"
                onClick={() => onConfirm(selected.id)}
                className="w-full rounded-full border border-panel-border bg-white/5 py-3.5 text-base font-semibold text-blueLightest transition-colors hover:bg-white/10"
              >
                Continue with {selected.label}
              </button>
            </div>
          ) : (
            <Button
              type="button"
              onClick={() => onConfirm(selected.id)}
              className="w-full rounded-full py-3.5 text-base font-semibold"
            >
              Continue with {selected.label}
            </Button>
          )}

          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="mt-3 w-full py-2 text-base text-blueLight/60 transition-colors hover:text-blueLightest"
          >
            Cancel
          </button>
        </div>
      </DrawerContent>
    </Drawer>
  )
}

function RailRow({
  quote,
  selected,
  onSelect,
}: {
  quote: RailQuote
  selected: boolean
  onSelect: () => void
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onSelect}
      className={cn(
        "flex w-full items-center gap-3 rounded-2xl border px-4 py-3.5 text-left transition-colors",
        selected
          ? "border-accentBlue/60 bg-accentBlue/10"
          : "border-panel-border bg-white/[0.03] hover:bg-white/[0.06]",
      )}
    >
      <RailMark quote={quote} />

      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-center gap-2">
          <span className="text-base font-bold text-blueLightest">
            {quote.label}
          </span>
          {quote.isCheapest && (
            <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-xs font-bold uppercase text-emerald-400">
              Best
            </span>
          )}
        </span>
        <span className="mt-0.5 block text-sm text-blueLight/50">
          {quote.speed}
        </span>
      </span>

      <span className="flex shrink-0 items-baseline gap-3">
        <span
          className={cn(
            "text-base font-bold",
            quote.isCheapest ? "text-accentBlue" : "text-blueLightest",
          )}
        >
          {formatCurrency(quote.fee, { cents: true })}
        </span>
        <span className="text-sm text-blueLight/50">
          <span className="font-semibold text-blueLight/80">{quote.points}</span>{" "}
          pts
        </span>
      </span>
    </button>
  )
}

/** Brand mark where the rail has one, otherwise a settlement-speed dot. */
function RailMark({ quote }: { quote: RailQuote }) {
  if (quote.brand === "visa") {
    return <FaCcVisa className="size-8 shrink-0 text-[#1434CB]" title="Visa" />
  }
  if (quote.brand === "eftpos") {
    return (
      <span className="flex h-7 w-10 shrink-0 items-center justify-center rounded bg-[#8B1538] text-[10px] font-bold italic text-white">
        eftpos
      </span>
    )
  }
  return (
    <span
      aria-hidden
      className={cn(
        "size-3 shrink-0 rounded-full",
        quote.settlement === "instant" ? "bg-amber-500" : "bg-red-500",
      )}
    />
  )
}
