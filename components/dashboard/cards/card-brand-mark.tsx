import { cn } from "@/lib/utils"
import type { CardBrand } from "@/lib/dashboard-data"

/**
 * Small standalone brand mark (Mastercard / Visa) with the "rewards" sublabel,
 * as shown on the Card Details rows. The full-bleed card faces bake their own
 * brand art into the SVG; these are the compact marks for list rows.
 */
export function CardBrandMark({
  brand,
  className,
}: {
  brand: CardBrand
  className?: string
}) {
  return (
    <span
      className={cn(
        "flex w-14 shrink-0 flex-col items-center gap-0.5",
        className
      )}
      aria-hidden
    >
      {brand === "visa" ? <VisaMark /> : <MastercardMark />}
    </span>
  )
}

function MastercardMark() {
  return (
    <>
      <svg viewBox="0 0 40 26" className="h-6 w-auto" role="img">
        <circle cx="16" cy="13" r="11" fill="#EB001B" />
        <circle cx="24" cy="13" r="11" fill="#F79E1B" fillOpacity="0.92" />
      </svg>
      <span className="text-[10px] font-medium leading-none tracking-tight text-blueLight/70">
        rewards
      </span>
    </>
  )
}

function VisaMark() {
  return (
    <>
      <span className="text-base font-bold italic leading-none tracking-tight text-[#1434CB]">
        VISA
      </span>
      <span className="text-[9px] font-semibold uppercase leading-none tracking-[0.12em] text-blueLight/70">
        Rewards
      </span>
    </>
  )
}
