"use client"

import { cn } from "@/lib/utils"

type SelectableCardProps = {
  selected: boolean
  onSelect: () => void
  /** `radio` for one-of-many, `checkbox` for independent toggles. */
  role: "radio" | "checkbox"
  disabled?: boolean
  className?: string
  children: React.ReactNode
}

/**
 * A bordered, tappable option card.
 *
 * Built on a native button with an explicit `role` and `aria-checked` so the
 * whole card is one control — keyboard-reachable and announced as selected,
 * rather than a div wrapping a hidden input.
 */
export function SelectableCard({
  selected,
  onSelect,
  role,
  disabled,
  className,
  children,
}: SelectableCardProps) {
  return (
    <button
      type="button"
      role={role}
      aria-checked={selected}
      disabled={disabled}
      onClick={onSelect}
      className={cn(
        "flex w-full items-start gap-4 rounded-xl border p-4 text-left transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accentBlue/60",
        selected
          ? "border-accentBlue bg-accentBlue/10"
          : "border-panel-border bg-white/5 hover:bg-white/10",
        disabled && "cursor-not-allowed opacity-50 hover:bg-white/5",
        className,
      )}
    >
      {children}
    </button>
  )
}

/** The ring/dot (radio) or ring/tick (checkbox) indicator inside a card. */
export function SelectionIndicator({
  selected,
  shape = "circle",
}: {
  selected: boolean
  shape?: "circle" | "square"
}) {
  return (
    <span
      aria-hidden
      className={cn(
        "mt-0.5 flex size-5 shrink-0 items-center justify-center border-2 transition-colors",
        shape === "circle" ? "rounded-full" : "rounded-md",
        selected ? "border-accentBlue" : "border-blueLight/40",
      )}
    >
      {selected ? (
        <span
          className={cn(
            "bg-accentBlue",
            shape === "circle" ? "size-2.5 rounded-full" : "size-2.5 rounded-sm",
          )}
        />
      ) : null}
    </span>
  )
}
