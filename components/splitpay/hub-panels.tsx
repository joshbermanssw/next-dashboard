"use client"

import * as React from "react"
import { CheckIcon, CopyIcon, TargetIcon } from "lucide-react"

import { inviteContributorAction } from "@/app/actions/splitpay"
import { MoneyInput, PublicField } from "@/components/splitpay/form-fields"
import { Input } from "@/components/ui/input"
import type { CreatorSession } from "@/lib/splitpay"
import { formatCurrency, cn } from "@/lib/utils"

/** Target vs collected vs outstanding — what the hub's "Target" action opens. */
export function TargetPanel({ session }: { session: CreatorSession }) {
  const pledged = session.contributors.reduce((sum, c) => sum + c.pledged, 0)
  // Pledges can undershoot the target (nobody has committed to the rest yet) or
  // overshoot it (the group over-committed). Both are worth showing plainly.
  const unpledged = session.targetAmount - pledged

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-panel-border bg-white/[0.03] p-5">
      <div className="flex items-center gap-2">
        <TargetIcon className="size-4 text-accentBlue" />
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-label">
          Target breakdown
        </p>
      </div>
      <TargetRow label="Pool target" value={formatCurrency(session.targetAmount)} />
      <TargetRow
        label="Collected"
        value={formatCurrency(session.collected)}
        valueClass="text-positive"
      />
      <TargetRow
        label="Remaining to target"
        value={formatCurrency(session.remaining)}
        valueClass="text-accentBlue"
      />
      <div className="border-t border-panel-border pt-3">
        <TargetRow label="Total pledged" value={formatCurrency(pledged)} />
        <TargetRow
          label={unpledged >= 0 ? "Not yet pledged" : "Over-pledged"}
          value={formatCurrency(Math.abs(unpledged))}
          valueClass={unpledged > 0 ? "text-warning" : "text-muted-foreground"}
        />
      </div>
      <p className="text-[11px] leading-relaxed text-muted-foreground">
        {session.paidCount} of {session.contributorCount} contributors have met
        their pledge · {session.authorisedCount} authorised to spend.
      </p>
    </div>
  )
}

function TargetRow({
  label,
  value,
  valueClass,
}: {
  label: string
  value: string
  valueClass?: string
}) {
  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className={cn("text-sm font-semibold tabular-nums text-foreground", valueClass)}>
        {value}
      </span>
    </div>
  )
}

/**
 * The hub's "Invite" action: add someone to the roster, then hand back the two
 * things an invite email carries — the join link and the session access code.
 *
 * Sending the mail is Yang's side of the build; until it exists this panel is
 * where a creator gets the link to pass on by hand.
 */
export function InvitePanel({
  accountId,
  session,
}: {
  accountId: string
  session: CreatorSession
}) {
  const [pending, startTransition] = React.useTransition()
  const [errors, setErrors] = React.useState<Record<string, string>>({})
  const [message, setMessage] = React.useState<string | null>(null)
  const [invited, setInvited] = React.useState<{
    name: string
    joinPath: string
    managePath: string
  } | null>(null)

  const [name, setName] = React.useState("")
  const [email, setEmail] = React.useState("")
  const [pledged, setPledged] = React.useState("")

  function submit(event: React.FormEvent) {
    event.preventDefault()
    setErrors({})
    setMessage(null)
    startTransition(async () => {
      const result = await inviteContributorAction({
        accountId,
        name,
        email,
        pledged: Number(pledged || 0),
      })
      if (!result.ok) {
        setErrors(result.errors ?? {})
        setMessage(result.errors ? null : result.message)
        return
      }
      setInvited({
        name: result.value.name,
        joinPath: result.value.joinPath,
        managePath: result.value.managePath,
      })
      setName("")
      setEmail("")
      setPledged("")
    })
  }

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-panel-border bg-white/[0.03] p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-label">
        Invite a contributor
      </p>

      <form onSubmit={submit} noValidate className="flex flex-col gap-3">
        <PublicField label="Name" required htmlFor="inv-name" error={errors.name}>
          <Input
            id="inv-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            aria-invalid={Boolean(errors.name)}
          />
        </PublicField>
        <PublicField label="Email" required htmlFor="inv-email" error={errors.email}>
          <Input
            id="inv-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-invalid={Boolean(errors.email)}
          />
        </PublicField>
        <PublicField
          label="Pledge"
          htmlFor="inv-pledge"
          error={errors.pledged}
          hint="What you're asking them to put in."
        >
          <MoneyInput
            id="inv-pledge"
            value={pledged}
            onValueChange={setPledged}
            invalid={Boolean(errors.pledged)}
          />
        </PublicField>

        {message ? (
          <p role="alert" className="text-xs text-negative">
            {message}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-xl bg-accentBlue px-4 py-3 text-sm font-bold text-blue transition-colors hover:bg-accentBlueHover disabled:opacity-60"
        >
          {pending ? "Adding…" : "Add contributor"}
        </button>
      </form>

      <div className="flex flex-col gap-2 border-t border-panel-border pt-4">
        <p className="text-[11px] text-muted-foreground">
          {invited
            ? `${invited.name} added. Send them these:`
            : "Anyone with the link and code can contribute:"}
        </p>
        <CopyRow label="Join link" value={absoluteUrl(invited?.joinPath ?? `/sp/${session.sessionId}`)} />
        <CopyRow label="Access code" value={session.accessCode} />
        {invited ? (
          <CopyRow label="Their manage link" value={absoluteUrl(invited.managePath)} />
        ) : null}
      </div>
    </div>
  )
}

/** Absolute URL for a path, so a copied link is pasteable into an email.
 * Client-only component, so `location` is always there. */
function absoluteUrl(path: string): string {
  return `${window.location.origin}${path}`
}

function CopyRow({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = React.useState(false)

  async function copy() {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // Clipboard access can be refused (insecure origin, denied permission).
      // The value is on screen and selectable, so there is nothing to recover.
    }
  }

  return (
    <div className="flex items-center gap-2 rounded-xl border border-panel-border bg-white/5 px-3 py-2">
      <div className="min-w-0 flex-1">
        <p className="text-[10px] uppercase tracking-wide text-label">{label}</p>
        <p className="truncate font-mono text-[11px] text-blueLight">{value}</p>
      </div>
      <button
        type="button"
        onClick={copy}
        aria-label={`Copy ${label}`}
        className="grid size-7 shrink-0 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-white/10 hover:text-blueLight"
      >
        {copied ? (
          <CheckIcon className="size-3.5 text-positive" />
        ) : (
          <CopyIcon className="size-3.5" />
        )}
      </button>
    </div>
  )
}
