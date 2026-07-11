import { EyeIcon, PlusIcon } from "lucide-react"
import type { BankCard as BankCardType } from "@/lib/dashboard-data"
import type { CardDesign } from "@/lib/plan"

export function BankCard({
  card,
  design,
}: {
  card: BankCardType
  design: CardDesign
}) {
  return (
    <div className="group relative aspect-[1200/766]">
      {/* Card face — gradient, DosshPay wordmark, and contactless glyph are all
          baked into the SVG, including its rounded corners. */}
      <img
        src={`/cards/${design}.svg`}
        alt=""
        aria-hidden
        className="pointer-events-none absolute inset-0 size-full object-contain drop-shadow-lg"
      />

      <div className="absolute inset-x-0 bottom-0 flex items-end justify-between px-5 pb-5">
        <span className="text-lg font-medium tracking-[0.2em] text-white/95 [text-shadow:0_1px_3px_rgb(0_0_0/0.35)]">
          ••••&nbsp;{card.last4}
        </span>
        <button
          type="button"
          aria-label="Reveal card number"
          className="rounded-full p-1.5 text-white/80 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
        >
          <EyeIcon className="size-4" />
        </button>
      </div>
    </div>
  )
}

export function AddCard() {
  return (
    <button
      type="button"
      className="group flex aspect-[1200/766] flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-panel-border bg-white/[0.02] text-blueLight transition-colors hover:border-accentBlue/40 hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <span className="flex size-9 items-center justify-center rounded-full bg-white/10 transition-colors group-hover:bg-accentBlue/20">
        <PlusIcon className="size-4" />
      </span>
      <span className="text-sm font-medium">Add card</span>
    </button>
  )
}
