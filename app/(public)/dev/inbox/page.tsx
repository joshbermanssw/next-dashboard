import Link from "next/link"
import { notFound } from "next/navigation"
import { InboxIcon } from "lucide-react"

import { listSessions } from "@/lib/data/splitpay"
import { contributorStatus, formatCountdown, stillOwed } from "@/lib/dashboard-data"
import { fundedPct } from "@/lib/splitpay"
import { formatCurrency } from "@/lib/utils"

/**
 * Dev-only mock inbox.
 *
 * Yang owns the real invite emails; nothing here sends anything. This renders
 * the two messages from the deck against live session data so the non-DosshPay
 * journey can be walked end to end — invite → pay → receipt → manage — without
 * a mail server. Deleting this file breaks no product code.
 */
// Reads the mutable session store, so it must be rendered per request rather
// than frozen into the build (which is what it did before this line).
export const dynamic = "force-dynamic"

export default async function MockInboxPage() {
  if (process.env.NODE_ENV === "production") notFound()

  const sessions = listSessions()

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-2 rounded-2xl border border-warning/30 bg-warning/[0.08] px-4 py-3">
        <InboxIcon className="size-4 shrink-0 text-warning" />
        <p className="text-xs text-warning">
          Dev mock inbox — these emails are rendered locally, never sent.
        </p>
      </div>

      {sessions.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No SplitPay sessions in the store yet.
        </p>
      ) : null}

      {sessions.map(({ details, label }) => {
        const creator = details.contributors.find((c) => c.isCreator)
        const pct = fundedPct(details)

        return (
          <section key={details.sessionId} className="flex flex-col gap-4">
            <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-label">
              {label} · Session {details.sessionId}
            </h2>

            {/* Email #1 — the invite that starts the whole journey. */}
            <EmailCard
              subject="You're invited to join a SplitPay session"
              from="DosshPay Notifications <noreply@dosshpay.com>"
            >
              <p className="text-sm text-blue">
                <span className="font-semibold">{creator?.name ?? "A friend"}</span>{" "}
                invited you to contribute to a SplitPay session.
              </p>

              <dl className="flex flex-col gap-2 rounded-lg bg-blue/5 p-3 text-xs">
                <EmailRow label="Session" value={details.sessionId} />
                <EmailRow label="Target" value={formatCurrency(details.targetAmount)} />
                <EmailRow
                  label="Funding ends in"
                  value={formatCountdown(details.deadline - Date.now())}
                />
                <EmailRow label="Verification code" value={details.accessCode} />
              </dl>

              <p className="text-[11px] leading-relaxed text-blue/60">
                By contributing, you agree to the SplitPay Terms.
              </p>

              <EmailButton href={`/sp/${details.sessionId}`}>
                Join SplitPay Session
              </EmailButton>
            </EmailCard>

            {/* Email #2 — the follow-up, one per contributor so any of them can
                be walked through the manage page. */}
            {details.contributors.map((c) => (
              <EmailCard
                key={c.id}
                subject={`Action required: Your SplitPay contribution for ${label}`}
                from="DosshPay <no-reply@dosshpay.app>"
                to={c.email ?? "you@dosshpay.app"}
              >
                <p className="text-sm text-blue">
                  Hi <span className="font-semibold">{c.name}</span>,
                  {contributorStatus(c) === "paid"
                    ? " you're all square on this SplitPay session."
                    : " you have an outstanding contribution for this SplitPay session."}
                </p>

                <dl className="flex flex-col gap-2 rounded-lg bg-blue/5 p-3 text-xs">
                  <EmailRow label="Session" value={label} />
                  <EmailRow label="Session ID" value={details.sessionId} />
                  <EmailRow
                    label="Your contribution"
                    value={formatCurrency(c.amount)}
                  />
                  <EmailRow label="Your pledge" value={formatCurrency(c.pledged)} />
                  <EmailRow
                    label="Still owed"
                    value={formatCurrency(stillOwed(c))}
                  />
                  <EmailRow
                    label="Group progress"
                    value={`${Math.round(pct)}% · ${formatCurrency(
                      details.collected
                    )} of ${formatCurrency(details.targetAmount)} collected`}
                  />
                </dl>

                <EmailButton
                  href={`/sp/${details.sessionId}/manage?c=${c.token}`}
                >
                  View &amp; Update My Contribution
                </EmailButton>
              </EmailCard>
            ))}
          </section>
        )
      })}
    </div>
  )
}

function EmailCard({
  subject,
  from,
  to,
  children,
}: {
  subject: string
  from: string
  to?: string
  children: React.ReactNode
}) {
  return (
    <article className="overflow-hidden rounded-xl border border-panel-border bg-card">
      <header className="flex flex-col gap-0.5 border-b border-blue/10 px-4 py-3 text-[11px] text-blue/60">
        <span>
          <span className="font-medium text-blue/80">From</span> {from}
        </span>
        {to ? (
          <span>
            <span className="font-medium text-blue/80">To</span> {to}
          </span>
        ) : null}
        <span className="pt-1 text-xs font-semibold text-blue">{subject}</span>
      </header>
      <div className="flex flex-col gap-3 px-4 py-4">{children}</div>
    </article>
  )
}

function EmailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="text-blue/60">{label}</dt>
      <dd className="text-right font-medium text-blue">{value}</dd>
    </div>
  )
}

function EmailButton({
  href,
  children,
}: {
  href: string
  children: React.ReactNode
}) {
  return (
    <Link
      href={href}
      className="block rounded-lg bg-accentBlue px-4 py-2.5 text-center text-sm font-bold text-blue transition-opacity hover:opacity-90"
    >
      {children}
    </Link>
  )
}
