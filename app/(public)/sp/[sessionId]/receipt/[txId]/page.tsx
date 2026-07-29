import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowRightIcon, MailIcon } from "lucide-react"

import {
  DosshPayCta,
  SessionHeader,
} from "@/components/splitpay/public-chrome"
import { getSession } from "@/lib/data/splitpay"
import { formatCurrency } from "@/lib/utils"

/** Step 3 — the confirmation shown straight after a successful contribution. */
export default async function ReceiptPage({
  params,
}: {
  params: Promise<{ sessionId: string; txId: string }>
}) {
  const { sessionId, txId } = await params
  const session = getSession(sessionId)
  if (!session) notFound()

  const { details, label } = session
  const contribution = details.contributions.find((c) => c.id === txId)
  if (!contribution) notFound()

  const contributor = details.contributors.find(
    (c) => c.id === contribution.contributorId,
  )
  const completed = contribution.status === "completed"

  return (
    <div className="flex flex-col gap-5">
      <SessionHeader sessionId={details.sessionId} label={label} />

      <div className="flex flex-col gap-4 rounded-2xl border border-panel-border bg-white/[0.03] p-5">
        <Row label="Recorded under" value={contributor?.name ?? "Guest"} />
        <div className="flex items-center justify-between border-t border-panel-border pt-4">
          <span className="text-sm text-muted-foreground">Amount</span>
          <span className="text-2xl font-bold tabular-nums text-positive">
            {formatCurrency(contribution.amount)}
          </span>
        </div>

        <div className="flex items-start gap-3 rounded-xl border border-warning/30 bg-warning/[0.08] p-3">
          <MailIcon className="mt-0.5 size-4 shrink-0 text-warning" />
          <div>
            <p className="text-xs font-semibold text-warning">Receipt Sent</p>
            <p className="mt-0.5 text-[11px] leading-relaxed text-blueLight/70">
              A payment confirmation and receipt have been sent to your email
              address.
            </p>
          </div>
        </div>

        <dl className="flex flex-col gap-3 border-t border-panel-border pt-4">
          <Row label="Transaction ID" value={contribution.id} mono />
          <Row
            label="Date"
            value={new Date(contribution.createdAt).toLocaleDateString("en-AU", {
              day: "numeric",
              month: "long",
              year: "numeric",
              timeZone: "UTC",
            })}
          />
          <Row
            label="Status"
            value={completed ? "Completed" : "Pending"}
            valueClass={completed ? "text-positive" : "text-warning"}
          />
        </dl>

        <Link
          href={`/sp/${details.sessionId}/manage`}
          className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-panel-border bg-white/5 px-4 py-3 text-sm font-medium text-blueLight transition-colors hover:bg-white/10"
        >
          View my contribution
          <ArrowRightIcon className="size-4" />
        </Link>
      </div>

      <DosshPayCta />
    </div>
  )
}

function Row({
  label,
  value,
  mono,
  valueClass,
}: {
  label: string
  value: string
  mono?: boolean
  valueClass?: string
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd
        className={[
          "text-sm font-medium text-foreground",
          mono ? "font-mono text-xs" : "",
          valueClass ?? "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {value}
      </dd>
    </div>
  )
}
