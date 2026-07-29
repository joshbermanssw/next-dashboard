"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { CheckIcon, LockIcon } from "lucide-react"

import { contributeAsUserAction } from "@/app/actions/splitpay"
import { PublicField, MoneyInput } from "@/components/splitpay/form-fields"
import { Input } from "@/components/ui/input"
import { formatCurrency, cn } from "@/lib/utils"

/** One account the signed-in customer can fund from. */
export type FundingAccount = {
  id: string
  label: string
  balance: number
  currency: string
  currencyFlag: string
}

/**
 * Step 2 for an existing DosshPay customer.
 *
 * The deck's card form is explicitly "for non users". Someone who already banks
 * with DosshPay has an identity and a balance, so asking them to type their
 * name and key in a PAN is asking for things we already hold. This is the same
 * step — code, amount, confirm — funded from an account instead.
 */
export function UserContributeForm({
  sessionId,
  remaining,
  displayName,
  accounts,
  poolCurrency,
}: {
  sessionId: string
  remaining: number
  displayName: string
  /** Already filtered to accounts that can fund this pool. */
  accounts: FundingAccount[]
  poolCurrency: string
}) {
  const router = useRouter()
  const [pending, startTransition] = React.useTransition()
  const [errors, setErrors] = React.useState<Record<string, string>>({})
  const [message, setMessage] = React.useState<string | null>(null)

  const [accountId, setAccountId] = React.useState(accounts[0]?.id ?? "")
  const [code, setCode] = React.useState("")
  const [amount, setAmount] = React.useState("")
  const [accepted, setAccepted] = React.useState(false)

  const selected = accounts.find((a) => a.id === accountId) ?? null
  const short =
    selected !== null && amount !== "" && Number(amount) > selected.balance

  function submit(event: React.FormEvent) {
    event.preventDefault()
    setErrors({})
    setMessage(null)

    startTransition(async () => {
      const result = await contributeAsUserAction({
        sessionId,
        code,
        accountId,
        amount: Number(amount),
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

  if (accounts.length === 0) {
    return (
      <div className="rounded-2xl border border-warning/30 bg-warning/[0.08] px-4 py-5 text-center">
        <p className="text-sm font-semibold text-warning">
          No account can fund this pool
        </p>
        <p className="mt-1 text-xs leading-relaxed text-blueLight/70">
          This session collects in {poolCurrency}, and none of your accounts hold{" "}
          {poolCurrency}. Open one, or contribute by card from a signed-out
          browser.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-5">
      <div className="flex items-center gap-3 rounded-xl border border-accentBlue/25 bg-accentBlue/[0.07] px-4 py-3">
        <span className="grid size-8 shrink-0 place-items-center rounded-full bg-accentBlue/20 text-xs font-bold text-accentBlue">
          {initialsOf(displayName)}
        </span>
        <div className="min-w-0">
          <p className="text-[11px] uppercase tracking-[0.14em] text-label">
            Contributing as
          </p>
          <p className="truncate text-sm font-semibold text-blueLightest">
            {displayName}
          </p>
        </div>
      </div>

      <PublicField
        label="Pay from"
        required
        htmlFor="sp-from"
        error={errors.accountId}
        hint={selected ? `Balance ${formatCurrency(selected.balance)}` : undefined}
      >
        <div className="flex flex-col gap-2">
          {accounts.map((account) => {
            const active = account.id === accountId
            return (
              <button
                key={account.id}
                type="button"
                id={account.id === accounts[0].id ? "sp-from" : undefined}
                onClick={() => setAccountId(account.id)}
                aria-pressed={active}
                className={cn(
                  "flex items-center justify-between gap-3 rounded-xl border px-4 py-3 text-left transition-colors",
                  active
                    ? "border-accentBlue bg-accentBlue/10"
                    : "border-panel-border bg-white/[0.03] hover:bg-white/[0.06]"
                )}
              >
                <span className="flex min-w-0 items-center gap-2">
                  <span aria-hidden>{account.currencyFlag}</span>
                  <span className="truncate text-sm font-medium text-blueLightest">
                    {account.label}
                  </span>
                </span>
                <span className="flex shrink-0 items-center gap-2">
                  <span className="text-sm tabular-nums text-blueLight">
                    {formatCurrency(account.balance)}
                  </span>
                  {active ? (
                    <CheckIcon className="size-4 text-accentBlue" />
                  ) : null}
                </span>
              </button>
            )
          })}
        </div>
      </PublicField>

      <PublicField
        label="Verification Code"
        required
        error={errors.code}
        htmlFor="sp-code"
        hint="From your invite email — a DosshPay account doesn't skip this"
      >
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
        error={errors.amount ?? (short ? "That's more than this account holds." : undefined)}
        htmlFor="sp-amount"
        hint={`Remaining to target: ${formatCurrency(remaining)}`}
      >
        <MoneyInput
          id="sp-amount"
          value={amount}
          onValueChange={setAmount}
          invalid={Boolean(errors.amount) || short}
        />
      </PublicField>

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
        disabled={pending || short}
        className="w-full rounded-xl bg-accentBlue px-4 py-3.5 text-sm font-bold text-blue transition-colors hover:bg-accentBlueHover disabled:opacity-60"
      >
        {pending ? "Processing…" : "Confirm contribution"}
      </button>

      <p className="flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground">
        <LockIcon className="size-3" />
        Paid from your DosshPay balance — no card needed
      </p>
    </form>
  )
}

function initialsOf(name: string): string {
  const words = name.trim().split(/\s+/)
  if (words.length > 1) {
    return (words[0][0] + words[words.length - 1][0]).toUpperCase()
  }
  return words[0].slice(0, 2).toUpperCase()
}
