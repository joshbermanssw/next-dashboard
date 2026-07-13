import Link from "next/link"
import { Panel } from "@/components/ui/panel"

/** Shown when a `/account/[accountId]/cards/[cardId]` URL doesn't resolve to a
 * card in the accounts context (unknown id, or wrong owning account). */
export function CardNotFound() {
  return (
    <Panel className="flex flex-col items-start gap-3 p-6">
      <p className="text-base font-medium text-blueLightest">Card not found</p>
      <p className="text-sm text-blueLight">
        We couldn&apos;t find that card. It may have been removed.
      </p>
      <Link
        href="/"
        className="text-sm font-medium text-accentBlue hover:text-accentBlueHover"
      >
        Back to dashboard
      </Link>
    </Panel>
  )
}
