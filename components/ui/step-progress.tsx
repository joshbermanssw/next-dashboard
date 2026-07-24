import { cn } from "@/lib/utils"

type StepProgressProps = {
  /** 1-based index of the step being shown. */
  current: number
  total: number
  className?: string
}

/**
 * Segmented progress bar for a multi-step flow.
 *
 * The bars are decorative — progress is announced through the visible
 * "Step 2 of 4" caption, so assistive tech gets one clear statement instead of
 * a run of unlabelled elements.
 */
export function StepProgress({ current, total, className }: StepProgressProps) {
  const clamped = Math.max(1, Math.min(total, current))

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div aria-hidden className="flex gap-2">
        {Array.from({ length: total }, (_, i) => (
          <span
            key={i}
            className={cn(
              "h-1 flex-1 rounded-full transition-colors",
              i < clamped ? "bg-accentBlue" : "bg-white/10",
            )}
          />
        ))}
      </div>
      <p className="text-xs font-medium text-blueLight/70">
        Step {clamped} of {total}
      </p>
    </div>
  )
}
