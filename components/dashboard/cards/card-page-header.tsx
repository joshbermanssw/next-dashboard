import Link from "next/link"
import { ChevronLeftIcon } from "lucide-react"

/**
 * Header for the card-settings screens. `compact` = a centered title with a
 * back chevron (the Card Settings hub, matching the iOS pushed screen);
 * `page` = a back chevron above a large left-aligned title and optional
 * subtitle (Card Details / Manage card).
 */
export function CardPageHeader({
  backHref,
  title,
  subtitle,
  variant = "page",
}: {
  backHref: string
  title: string
  subtitle?: string
  variant?: "compact" | "page"
}) {
  const back = (
    <Link
      href={backHref}
      aria-label="Back"
      className="flex size-10 shrink-0 items-center justify-center rounded-full border border-panel-border text-blueLightest transition-colors hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <ChevronLeftIcon className="size-5" />
    </Link>
  )

  if (variant === "compact") {
    return (
      <div className="relative flex h-10 items-center justify-center">
        <div className="absolute left-0">{back}</div>
        <h1 className="text-lg font-semibold text-blueLightest">{title}</h1>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {back}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-blueLightest">
          {title}
        </h1>
        {subtitle && (
          <p className="max-w-md text-sm text-blueLight">{subtitle}</p>
        )}
      </div>
    </div>
  )
}
