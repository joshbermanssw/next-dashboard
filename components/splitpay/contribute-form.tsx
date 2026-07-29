"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { LockIcon } from "lucide-react"

import { contributeAction } from "@/app/actions/splitpay"
import { PublicField, MoneyInput, CardFields, useCardFields } from "@/components/splitpay/form-fields"
import { Input } from "@/components/ui/input"
import { formatCurrency, cn } from "@/lib/utils"

/**
 * Step 2 — the form a non-DosshPay invitee fills in to join a session and pay.
 *
 * Strictly the *non-user* path, as the deck labels it. Signed-in customers get
 * `UserContributeForm` instead, which knows who they are and takes the money
 * from a balance — so nothing here needs to accommodate them.
 *
 * Everything it collects is validated again in `contributeAction`; the checks
 * here exist to give fast feedback, not to be trusted.
 */
export function ContributeForm({
  sessionId,
  remaining,
}: {
  sessionId: string
  remaining: number
}) {
  const router = useRouter()
  const [pending, startTransition] = React.useTransition()
  const [errors, setErrors] = React.useState<Record<string, string>>({})
  const [message, setMessage] = React.useState<string | null>(null)

  const [name, setName] = React.useState("")
  const [email, setEmail] = React.useState("")
  const [code, setCode] = React.useState("")
  const [amount, setAmount] = React.useState("")
  const [accepted, setAccepted] = React.useState(false)
  const card = useCardFields()

  function submit(event: React.FormEvent) {
    event.preventDefault()
    setErrors({})
    setMessage(null)

    startTransition(async () => {
      const result = await contributeAction({
        sessionId,
        name,
        email,
        code,
        amount: Number(amount),
        cardNumber: card.number,
        expiry: card.expiry,
        cvv: card.cvv,
        acceptedTerms: accepted,
      })
      if (!result.ok) {
        setErrors(result.errors ?? {})
        setMessage(result.errors ? null : result.message)
        return
      }
      router.push(`/sp/${sessionId}/receipt/${result.value.transactionId}`)
    })
  }

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-5">
      <PublicField label="Your Name" required error={errors.name} htmlFor="sp-name"
        hint="This name will appear in the contributor list">
        <Input
          id="sp-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoComplete="name"
          aria-invalid={Boolean(errors.name)}
        />
      </PublicField>

      <PublicField
        label="Email Address"
        required
        error={errors.email}
        htmlFor="sp-email"
        hint="Where your receipt and return link are sent"
      >
        <Input
          id="sp-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          placeholder="you@example.com"
          aria-invalid={Boolean(errors.email)}
        />
      </PublicField>

      <PublicField label="Verification Code" required error={errors.code} htmlFor="sp-code">
        <Input
          id="sp-code"
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
          inputMode="numeric"
          autoComplete="one-time-code"
          placeholder="Enter 6-digit code"
          aria-invalid={Boolean(errors.code)}
          className="text-center tracking-[0.4em] placeholder:tracking-normal"
        />
      </PublicField>

      <PublicField
        label="Contribution Amount"
        required
        error={errors.amount}
        htmlFor="sp-amount"
        hint={`Remaining to target: ${formatCurrency(remaining)}`}
      >
        <MoneyInput id="sp-amount" value={amount} onValueChange={setAmount}
          invalid={Boolean(errors.amount)} />
      </PublicField>

      <CardFields fields={card} errors={errors} />

      <label
        className={cn(
          "flex cursor-pointer items-start gap-3 rounded-xl border p-3 text-xs leading-relaxed transition-colors",
          errors.acceptedTerms
            ? "border-negative/50 bg-negative/5"
            : "border-panel-border bg-white/[0.03]"
        )}
      >
        <input
          type="checkbox"
          checked={accepted}
          onChange={(e) => setAccepted(e.target.checked)}
          className="mt-0.5 size-4 shrink-0 accent-accentBlue"
        />
        <span className="text-muted-foreground">
          I agree to the{" "}
          <span className="font-medium text-accentBlue">
            SplitPay Terms and Conditions
          </span>{" "}
          and authorize this payment.
        </span>
      </label>

      {message ? (
        <p role="alert" className="text-sm text-negative">
          {message}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-xl bg-accentBlue px-4 py-3.5 text-sm font-bold text-blue transition-colors hover:bg-accentBlueHover disabled:opacity-60"
      >
        {pending ? "Processing…" : "Pay Now"}
      </button>

      <p className="flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground">
        <LockIcon className="size-3" />
        Secured by 256-bit SSL encryption
      </p>
    </form>
  )
}
