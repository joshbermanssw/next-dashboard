import { cn } from "@/lib/utils"
import type { CardDesign } from "@/lib/plan"

/**
 * The bank-card face: the plan-tier SVG (gradient, DosshPay wordmark,
 * contactless glyph, brand mark and rounded corners are all baked in) with the
 * `•••• last4` overlaid at the bottom-left. Shared by the hub card and the
 * Card Settings hero.
 *
 * Those two render at very different widths, so the number is sized in `cqw`
 * against the card itself rather than in fixed pixels — it stays in proportion
 * on the small dashboard tile and the full-width hero alike, the way the
 * artwork baked into the SVG already does.
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
    <div className={cn("@container relative aspect-[1200/766]", className)}>
      <img
        src={`/cards/${design}.svg`}
        alt=""
        aria-hidden
        className="pointer-events-none absolute inset-0 size-full object-contain drop-shadow-lg"
      />
      <div className="absolute inset-x-0 bottom-0 flex items-end px-[6%] pb-[6%]">
        <span className="text-[6cqw] font-medium leading-none tracking-[0.2em] text-white/95 [text-shadow:0_1px_3px_rgb(0_0_0/0.35)]">
          ••••&nbsp;{last4}
        </span>
      </div>
    </div>
  )
}
