"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import {
  CreditCardIcon,
  MailIcon,
  PlusIcon,
  ShieldCheckIcon,
} from "lucide-react"

import {
  authoriseSelfAction,
  payDifferenceAction,
  updatePledgeAction,
} from "@/app/actions/splitpay"
import { ContributorRoster } from "@/components/splitpay/contributor-roster"
import { FundingBar } from "@/components/splitpay/public-chrome"
import {
  CardFields,
  MoneyInput,
  PublicField,
  useCardFields,
} from "@/components/splitpay/form-fields"
import { Input } from "@/components/ui/input"
import type { PublicSession, ViewerContribution } from "@/lib/splitpay"
import { formatCurrency, cn } from "@/lib/utils"

type Tab = "update" | "contributors"

/**
 * Step 5 — what a contributor sees when they follow the "View & Update My
 * Contribution" link: where they stand, what they can revise, and who else has
 * paid.
 */
export function ManageView({
  session,
  viewer,
  token,
}: {
  session: PublicSession
  viewer: ViewerContribution
  /** The manage-link token that resolved this viewer; proves who is acting. */
  token: string
}) {
  const [tab, setTab] = React.useState<Tab>("update")

  return (
    <div className="flex flex-col gap-5">
      {/* Sits directly under the session's target/collected strip: the sign-off
          is against that target, so it reads before the personal detail below. */}
      <AuthoriseSpendRow
        sessionId={session.sessionId}
        token={token}
        viewer={viewer}
      />

      <ContributionSummary session={session} viewer={viewer} />

      <div className="grid grid-cols-2 gap-1 rounded-full border border-panel-border bg-white/[0.03] p-1">
        <TabButton active={tab === "update"} onClick={() => setTab("update")}>
          Update
        </TabButton>
        <TabButton
          active={tab === "contributors"}
          onClick={() => setTab("contributors")}
        >
          Contributors
        </TabButton>
      </div>

      {tab === "update" ? (
        <>
          <UpdatePledgeCard
            sessionId={session.sessionId}
            token={token}
            viewer={viewer}
          />
          <PayDifferenceCard
            sessionId={session.sessionId}
            token={token}
            viewer={viewer}
            remaining={session.remaining}
          />
          <PaymentMethodRow viewer={viewer} />
        </>
      ) : (
        <ContributorRoster
          contributors={session.contributors}
          targetAmount={session.targetAmount}
          collected={session.collected}
          viewerId={viewer.id}
          // The creator can run the Authorise controls from their own emailed
          // link, exactly as they would from the dashboard hub.
          authority={
            viewer.isCreator
              ? { kind: "token", sessionId: session.sessionId, token }
              : { kind: "none" }
          }
        />
      )}
    </div>
  )
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full px-4 py-2 text-sm font-semibold transition-colors",
        active
          ? "bg-accentBlue text-blue"
          : "text-muted-foreground hover:text-blueLight"
      )}
    >
      {children}
    </button>
  )
}

function ContributionSummary({
  session,
  viewer,
}: {
  session: PublicSession
  viewer: ViewerContribution
}) {
  const settled = viewer.stillOwed === 0 && viewer.amount > 0

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-panel-border bg-white/[0.03] p-5">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">Recorded under</span>
        <span className="text-sm font-semibold text-foreground">
          {viewer.name}
        </span>
      </div>
      <div className="flex items-center justify-between border-t border-panel-border pt-4">
        <span className="text-sm text-muted-foreground">Amount</span>
        <span className="text-2xl font-bold tabular-nums text-positive">
          {formatCurrency(viewer.amount)}
        </span>
      </div>

      <div
        className={cn(
          "flex items-start gap-3 rounded-xl border p-3",
          settled
            ? "border-positive/30 bg-positive/[0.08]"
            : "border-warning/30 bg-warning/[0.08]"
        )}
      >
        <MailIcon
          className={cn(
            "mt-0.5 size-4 shrink-0",
            settled ? "text-positive" : "text-warning"
          )}
        />
        <div>
          <p
            className={cn(
              "text-xs font-semibold",
              settled ? "text-positive" : "text-warning"
            )}
          >
            {settled ? "Contribution Complete" : "Contribution Pending"}
          </p>
          <p className="mt-0.5 text-[11px] leading-relaxed text-blueLight/70">
            {settled
              ? "You've met your pledge for this session. Thanks!"
              : `Your contribution has been recorded. ${formatCurrency(
                  viewer.stillOwed
                )} still owed against your pledge.`}
          </p>
        </div>
      </div>

      <dl className="flex flex-col gap-3 border-t border-panel-border pt-4">
        {viewer.latest ? (
          <>
            <SummaryRow label="Transaction ID" value={viewer.latest.id} mono />
            <SummaryRow
              label="Date"
              value={new Date(viewer.latest.createdAt).toLocaleDateString(
                "en-AU",
                { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }
              )}
            />
          </>
        ) : null}
        <SummaryRow
          label="Status"
          value={settled ? "Complete" : "Pending"}
          valueClass={settled ? "text-positive" : "text-warning"}
        />
      </dl>

      <div className="border-t border-panel-border pt-4">
        <FundingBar
          collected={session.collected}
          targetAmount={session.targetAmount}
          pct={session.pct}
        />
      </div>
    </div>
  )
}

/**
 * The contributor's own sign-off: "my share is good to go, the pool may start
 * spending". It sits directly under the session's target/collected strip, which
 * is the number it speaks to — you agree to spending against *that* target.
 *
 * Distinct from the creator's roster control, which grants someone else the
 * authority. This is consent, given for oneself, and withdrawable while the
 * pool is still funding — once spending has actually started there is nothing
 * left to consent to.
 */
function AuthoriseSpendRow({
  sessionId,
  token,
  viewer,
}: {
  sessionId: string
  token: string
  viewer: ViewerContribution
}) {
  const router = useRouter()
  const [pending, startTransition] = React.useTransition()
  const [error, setError] = React.useState<string | null>(null)

  // The creator's authority is the one everyone else's is granted from — the
  // store refuses to revoke it, so there is no decision to offer them here.
  if (viewer.isCreator) return null

  function toggle() {
    setError(null)
    startTransition(async () => {
      const result = await authoriseSelfAction({
        sessionId,
        token,
        authorised: !viewer.authorised,
      })
      if (!result.ok) {
        setError(result.message)
        return
      }
      router.refresh()
    })
  }

  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-2xl border p-5",
        viewer.authorised
          ? "border-positive/30 bg-positive/[0.06]"
          : "border-panel-border bg-white/[0.03]"
      )}
    >
      <div className="flex items-start gap-3">
        <ShieldCheckIcon
          className={cn(
            "mt-0.5 size-4 shrink-0",
            viewer.authorised ? "text-positive" : "text-label"
          )}
        />
        <div>
          <p className="text-xs font-semibold text-foreground">
            {viewer.authorised
              ? "You've authorised spending"
              : "Authorise spending"}
          </p>
          <p className="mt-0.5 text-[11px] leading-relaxed text-blueLight/70">
            {viewer.authorised
              ? "Your share is signed off. You can withdraw this while the pool is still funding."
              : "Confirm your share is good to go, so the pool can start spending against its target."}
          </p>
        </div>
      </div>

      {error ? (
        <p role="alert" className="text-xs text-negative">
          {error}
        </p>
      ) : null}

      <button
        type="button"
        onClick={toggle}
        disabled={pending}
        className={cn(
          "w-full rounded-xl px-4 py-3 text-sm font-bold transition-colors disabled:opacity-60",
          viewer.authorised
            ? "border border-positive/40 bg-positive/10 text-positive hover:bg-positive/20"
            : "bg-accentBlue text-blue hover:bg-accentBlueHover"
        )}
      >
        {pending
          ? "Saving…"
          : viewer.authorised
            ? "Authorised — Withdraw"
            : "Authorise Start Spend"}
      </button>
    </div>
  )
}

function SummaryRow({
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
        className={cn(
          "text-sm font-medium text-foreground",
          mono && "font-mono text-xs",
          valueClass
        )}
      >
        {value}
      </dd>
    </div>
  )
}

/**
 * Pledge and personal due date only. `Amount Paid` is shown but disabled — it
 * is the ledger, and the only thing that moves it is a payment.
 */
function UpdatePledgeCard({
  sessionId,
  token,
  viewer,
}: {
  sessionId: string
  token: string
  viewer: ViewerContribution
}) {
  const router = useRouter()
  const [pending, startTransition] = React.useTransition()
  const [errors, setErrors] = React.useState<Record<string, string>>({})
  const [saved, setSaved] = React.useState(false)

  const [pledged, setPledged] = React.useState(String(viewer.pledged))
  const [targetDate, setTargetDate] = React.useState(
    viewer.targetDate
      ? new Date(viewer.targetDate).toISOString().slice(0, 10)
      : ""
  )

  function save(event: React.FormEvent) {
    event.preventDefault()
    setErrors({})
    setSaved(false)
    startTransition(async () => {
      const result = await updatePledgeAction({
        sessionId,
        token,
        pledged: Number(pledged),
        targetDate,
      })
      if (!result.ok) {
        setErrors(result.errors ?? { form: result.message })
        return
      }
      setSaved(true)
      router.refresh()
    })
  }

  return (
    <form
      onSubmit={save}
      className="flex flex-col gap-4 rounded-2xl border border-panel-border bg-white/[0.03] p-5"
    >
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-label">
        Update your contribution
      </p>

      <PublicField
        label="Amount Paid"
        htmlFor="sp-paid"
        hint="Set by your payments — use Pay below to change it."
      >
        <MoneyInput
          id="sp-paid"
          value={String(viewer.amount)}
          onValueChange={() => {}}
          disabled
        />
      </PublicField>

      <PublicField label="Pledged Amount" htmlFor="sp-pledged" error={errors.pledged}>
        <MoneyInput
          id="sp-pledged"
          value={pledged}
          onValueChange={setPledged}
          invalid={Boolean(errors.pledged)}
        />
      </PublicField>

      <PublicField label="Target Date" htmlFor="sp-date" error={errors.targetDate}>
        <Input
          id="sp-date"
          type="date"
          value={targetDate}
          onChange={(e) => setTargetDate(e.target.value)}
          aria-invalid={Boolean(errors.targetDate)}
        />
      </PublicField>

      {errors.form ? (
        <p role="alert" className="text-xs text-negative">
          {errors.form}
        </p>
      ) : null}
      {saved ? <p className="text-xs text-positive">Saved.</p> : null}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-xl bg-accentBlue px-4 py-3 text-sm font-bold text-blue transition-colors hover:bg-accentBlueHover disabled:opacity-60"
      >
        {pending ? "Saving…" : "Save Changes"}
      </button>
    </form>
  )
}

/** The one control that moves money: pay down what's still owed, by card. */
function PayDifferenceCard({
  sessionId,
  token,
  viewer,
  remaining,
}: {
  sessionId: string
  token: string
  viewer: ViewerContribution
  /** What the pool still needs — caps what any one payment can add. */
  remaining: number
}) {
  const router = useRouter()
  const [open, setOpen] = React.useState(false)
  const [pending, startTransition] = React.useTransition()
  const [errors, setErrors] = React.useState<Record<string, string>>({})
  const [message, setMessage] = React.useState<string | null>(null)
  const [amount, setAmount] = React.useState(
    viewer.stillOwed > 0 ? String(viewer.stillOwed) : ""
  )
  const card = useCardFields()

  if (remaining === 0) {
    return (
      <p className="rounded-2xl border border-positive/30 bg-positive/[0.08] px-4 py-3 text-center text-xs text-positive">
        This session has reached its target — no further payments needed.
      </p>
    )
  }

  function pay(event: React.FormEvent) {
    event.preventDefault()
    setErrors({})
    setMessage(null)
    startTransition(async () => {
      const result = await payDifferenceAction({
        sessionId,
        token,
        amount: Number(amount),
        cardNumber: card.number,
        expiry: card.expiry,
        cvv: card.cvv,
      })
      if (!result.ok) {
        setErrors(result.errors ?? {})
        setMessage(result.errors ? null : result.message)
        return
      }
      setOpen(false)
      router.refresh()
    })
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-accentBlue/40 bg-accentBlue/10 px-4 py-3.5 text-sm font-bold text-accentBlue transition-colors hover:bg-accentBlue/20"
      >
        <PlusIcon className="size-4" />
        {viewer.stillOwed > 0
          ? `Pay ${formatCurrency(viewer.stillOwed)} still owed`
          : "Add more funds"}
      </button>
    )
  }

  return (
    <form
      onSubmit={pay}
      className="flex flex-col gap-4 rounded-2xl border border-panel-border bg-white/[0.03] p-5"
    >
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-label">
        Add funds
      </p>

      <PublicField
        label="Amount"
        required
        htmlFor="sp-pay-amount"
        error={errors.amount}
        hint={`Remaining to target: ${formatCurrency(remaining)}`}
      >
        <MoneyInput
          id="sp-pay-amount"
          value={amount}
          onValueChange={setAmount}
          invalid={Boolean(errors.amount)}
        />
      </PublicField>

      <CardFields fields={card} errors={errors} />

      {message ? (
        <p role="alert" className="text-xs text-negative">
          {message}
        </p>
      ) : null}

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="flex-1 rounded-xl border border-panel-border bg-white/5 px-4 py-3 text-sm font-medium text-blueLight transition-colors hover:bg-white/10"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={pending}
          className="flex-1 rounded-xl bg-accentBlue px-4 py-3 text-sm font-bold text-blue transition-colors hover:bg-accentBlueHover disabled:opacity-60"
        >
          {pending ? "Processing…" : "Pay Now"}
        </button>
      </div>
    </form>
  )
}

function PaymentMethodRow({ viewer }: { viewer: ViewerContribution }) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-panel-border bg-white/[0.03] px-4 py-3.5">
      <div className="flex items-center gap-3">
        <CreditCardIcon className="size-4 text-label" />
        <div>
          <p className="text-sm font-medium text-foreground">Payment Method</p>
          <p className="text-[11px] text-muted-foreground">
            {viewer.savedCard
              ? `${viewer.savedCard.brand} ···· ${viewer.savedCard.last4}`
              : "No card saved"}
          </p>
        </div>
      </div>
    </div>
  )
}
