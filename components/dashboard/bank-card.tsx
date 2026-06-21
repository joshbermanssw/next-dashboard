import { EyeIcon, PlusIcon } from "lucide-react"
import type { BankCard as BankCardType } from "@/lib/dashboard-data"
import { cn } from "@/lib/utils"

export function BankCard({ card }: { card: BankCardType }) {
  return (
    <div
      className={cn(
        "group relative flex aspect-[300/184] flex-col justify-between overflow-hidden rounded-2xl p-5 text-white shadow-lg ring-1 ring-white/10",
        card.gradient
      )}
    >
      {/* soft top-right highlight */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-10 -top-16 size-40 rounded-full bg-white/15 blur-2xl"
      />

      <div className="relative flex items-center gap-2">
        <img
          src="/logos/dosh/dosh-d-white.svg"
          alt=""
          width={20}
          height={20}
          className="size-5"
        />
        <span className="text-sm font-semibold tracking-wide">DOSSHPAY</span>
      </div>

      <div className="relative flex items-end justify-between">
        <div className="flex flex-col gap-2">
          <div className="flex gap-1" aria-hidden>
            {Array.from({ length: 6 }).map((_, i) => (
              <span key={i} className="size-1 rounded-full bg-white/40" />
            ))}
          </div>
          <span className="text-lg font-medium tracking-[0.2em] text-white/90">
            ••••&nbsp;{card.last4}
          </span>
        </div>
        <button
          type="button"
          aria-label="Reveal card number"
          className="rounded-full p-1.5 text-white/70 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
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
      className="group flex aspect-[300/184] flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-panel-border bg-white/[0.02] text-blueLight transition-colors hover:border-accentBlue/40 hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <span className="flex size-9 items-center justify-center rounded-full bg-white/10 transition-colors group-hover:bg-accentBlue/20">
        <PlusIcon className="size-4" />
      </span>
      <span className="text-sm font-medium">Add card</span>
    </button>
  )
}
