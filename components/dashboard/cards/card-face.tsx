import { cn } from "@/lib/utils"
import type { CardDesign } from "@/lib/plan"

/**
 * The bank-card face: the plan-tier SVG (gradient, DosshPay wordmark,
 * contactless glyph, brand mark and rounded corners are all baked in) with the
 * `•••• last4` overlaid at the bottom-left. Shared by the hub card and the
 * Card Settings hero.
 */
export function CardFace({
  design,
  last4,
  className,
}: {
  design: CardDesign
  last4: string
  className?: string
}) {
  return (
    <div className={cn("relative aspect-[1200/766]", className)}>
      <img
        src={`/cards/${design}.svg`}
        alt=""
        aria-hidden
        className="pointer-events-none absolute inset-0 size-full object-contain drop-shadow-lg"
      />
      <div className="absolute inset-x-0 bottom-0 flex items-end px-[6%] pb-[6%]">
        <span className="text-lg font-medium tracking-[0.2em] text-white/95 [text-shadow:0_1px_3px_rgb(0_0_0/0.35)] sm:text-xl">
          ••••&nbsp;{last4}
        </span>
      </div>
    </div>
  )
}
