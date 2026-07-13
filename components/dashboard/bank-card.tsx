import Link from "next/link"
import { PlusIcon, SettingsIcon } from "lucide-react"
import type { BankCard as BankCardType } from "@/lib/dashboard-data"
import type { CardDesign } from "@/lib/plan"
import { CardFace } from "@/components/dashboard/cards/card-face"

export function BankCard({
  card,
  design,
}: {
  card: BankCardType
  design: CardDesign
}) {
  return (
    <Link
      href={`/account/${card.accountId}/cards/${card.id}`}
      aria-label={`${card.name} ending ${card.last4}, card settings`}
      className="group relative block rounded-2xl transition-transform duration-200 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    >
      <CardFace design={design} last4={card.last4} />

      {/* Settings cog — fades in on hover/focus (desktop), always shown on touch
          where there is no hover. Decorative: the whole card is the link. */}
      <span
        aria-hidden
        className="absolute right-[5%] top-[7%] flex size-8 items-center justify-center rounded-full bg-black/25 text-white/90 backdrop-blur-sm transition-opacity duration-200 md:opacity-0 md:group-hover:opacity-100 md:group-focus-visible:opacity-100"
      >
        <SettingsIcon className="size-4" />
      </span>
    </Link>
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
