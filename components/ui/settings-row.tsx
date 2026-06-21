import * as React from "react"
import { ChevronRightIcon, type LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

type SettingsRowProps = {
  icon: LucideIcon
  label: string
  subtitle?: string
  tone?: "default" | "danger"
  /** Trailing content (Switch, value text). Replaces the default chevron. */
  trailing?: React.ReactNode
  onClick?: () => void
}

/**
 * A single settings/profile row: tinted icon tile, label (+ optional subtitle),
 * and a trailing slot. Interactive when `onClick` is set (renders a button and
 * shows a chevron unless a `trailing` element is provided). Reused by the
 * settings menu, notification prefs, and personal-details list.
 */
export function SettingsRow({
  icon: Icon,
  label,
  subtitle,
  tone = "default",
  trailing,
  onClick,
}: SettingsRowProps) {
  const interactive = Boolean(onClick)
  const Comp = interactive ? "button" : "div"

  return (
    <Comp
      type={interactive ? "button" : undefined}
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-3 rounded-xl px-2 py-2.5 text-left transition-colors",
        interactive &&
          "hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      )}
    >
      <span
        className={cn(
          "flex size-9 shrink-0 items-center justify-center rounded-lg bg-white/5",
          tone === "danger" ? "text-negative" : "text-accentBlue"
        )}
      >
        <Icon className="size-4.5" />
      </span>

      <span className="flex min-w-0 flex-col">
        <span
          className={cn(
            "truncate text-sm font-medium",
            tone === "danger" ? "text-negative" : "text-blueLightest"
          )}
        >
          {label}
        </span>
        {subtitle && (
          <span className="truncate text-xs text-label">{subtitle}</span>
        )}
      </span>

      <span className="ml-auto flex shrink-0 items-center text-label">
        {trailing ?? (interactive && <ChevronRightIcon className="size-4" />)}
      </span>
    </Comp>
  )
}
