"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { CheckIcon, ChevronRightIcon, XIcon } from "lucide-react"

import { AccountPicker } from "@/components/qr/account-picker"
import { Button } from "@/components/ui/button"
import { payViaQr } from "@/app/actions/qr-payment"
import { accountKindMeta } from "@/lib/dashboard-data"
import { parseAmount, type QrAccount } from "@/lib/qr-payment"
import { formatCurrency } from "@/lib/utils"

type Payee = { id: string; label: string }

/**
 * The confirm screen behind a scanned code.
 *
 * Reached two ways — the in-app scanner routing here after a decode, and a
 * phone's own camera app opening the QR's link — so it can assume nothing
 * about how the payer arrived beyond the URL.
 */
export function ConfirmPayment({
  payee,
  accounts,
  requestedAmount,
}: {
  payee: Payee
  /** The payer's own accounts, minus the one being paid. */
  accounts: QrAccount[]
  /** What the payee asked for, or `null` when the payer names it. */
  requestedAmount: number | null
}) {
  const router = useRouter()
  const [fromId, setFromId] = React.useState(accounts[0]?.id ?? "")
  const [amountInput, setAmountInput] = React.useState(
    requestedAmount === null ? "" : requestedAmount.toFixed(2),
  )
  const [pickerOpen, setPickerOpen] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [paid, setPaid] = React.useState<{ paid: number; remaining: number } | null>(
    null,
  )
  const [pending, startTransition] = React.useTransition()

  const from = accounts.find((a) => a.id === fromId)
  const amount = parseAmount(amountInput)
  // A fixed request is the payee's number, not the payer's to edit.
  const amountIsFixed = requestedAmount !== null
  const canPay = Boolean(from) && amount !== null && !pending

  function submit() {
    if (!from || amount === null) return
    setError(null)
    startTransition(async () => {
      const result = await payViaQr({
        fromAccountId: from.id,
        toAccountId: payee.id,
        amount,
      })
      if (result.ok) {
        setPaid(result.value)
        // The dashboard reads balances server-side; make sure it re-fetches.
        router.refresh()
      } else {
        setError(result.message)
      }
    })
  }

  if (paid) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-6 bg-blueDarker px-6 text-center">
        <span className="flex size-16 items-center justify-center rounded-full bg-accentBlue text-blueDarker">
          <CheckIcon className="size-8" strokeWidth={3} />
        </span>
        <div className="space-y-1">
          <p className="text-3xl font-bold text-blueLightest">
            {formatCurrency(paid.paid, { cents: true })}
          </p>
          <p className="text-base text-blueLight/70">Paid to {payee.label}</p>
        </div>
        <p className="text-sm text-blueLight/50">
          {from?.label} balance is now{" "}
          {formatCurrency(paid.remaining, { cents: true })}
        </p>
        <Button
          type="button"
          onClick={() => router.push("/")}
          className="mt-2 w-full max-w-xs rounded-full py-3.5 text-base font-semibold"
        >
          Done
        </Button>
      </div>
    )
  }

  const FromIcon = from ? accountKindMeta[from.kind].icon : null

  return (
    <div className="flex min-h-dvh flex-col bg-blueDarker">
      <header className="flex items-center justify-between px-4 pb-2 pt-5">
        <h1 className="text-lg font-semibold text-blueLightest">
          Confirm payment
        </h1>
        <button
          type="button"
          onClick={() => router.push("/qr")}
          aria-label="Cancel"
          className="flex size-9 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
        >
          <XIcon className="size-5" />
        </button>
      </header>

      <div className="flex flex-1 flex-col items-center gap-8 px-6 pb-10 pt-10">
        <div className="text-center">
          <p className="text-sm uppercase tracking-wide text-blueLight/50">
            Paying
          </p>
          <p className="mt-1 text-2xl font-bold text-blueLightest">
            {payee.label}
          </p>
        </div>

        {amountIsFixed ? (
          <p className="text-5xl font-bold text-blueLightest">
            A${(amount ?? 0).toFixed(2)}
          </p>
        ) : (
          <div className="w-full max-w-sm text-center">
            <label
              htmlFor="pay-amount"
              className="text-xs font-medium uppercase tracking-wide text-blueLight/50"
            >
              Amount
            </label>
            <div className="mt-2 flex items-center justify-center gap-2">
              <span className="text-4xl font-semibold text-blueLight/50">
                A$
              </span>
              <input
                id="pay-amount"
                value={amountInput}
                onChange={(event) => setAmountInput(event.target.value)}
                inputMode="decimal"
                autoFocus
                placeholder="0.00"
                className="w-40 bg-transparent text-4xl font-semibold text-blueLightest outline-none placeholder:text-blueLight/30"
              />
            </div>
          </div>
        )}

        {from && FromIcon && (
          <button
            type="button"
            onClick={() => setPickerOpen(true)}
            className="flex w-full max-w-sm items-center gap-4 rounded-2xl border border-panel-border bg-white/[0.03] px-5 py-4 text-left transition-colors hover:bg-white/[0.06]"
          >
            <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-accentBlue/15 text-accentBlue">
              <FromIcon className="size-5" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm text-blueLight/60">
                Paying from
              </span>
              <span className="block truncate text-base font-semibold text-blueLightest">
                {from.label} · {formatCurrency(from.balance, { cents: true })}
              </span>
            </span>
            <ChevronRightIcon className="size-5 shrink-0 text-blueLight/50" />
          </button>
        )}

        {error && (
          <p role="alert" className="max-w-sm text-center text-sm text-red-400">
            {error}
          </p>
        )}

        <div className="mt-auto w-full max-w-sm">
          <Button
            type="button"
            onClick={submit}
            disabled={!canPay}
            className="w-full rounded-full py-3.5 text-base font-semibold disabled:opacity-50"
          >
            {pending ? "Paying…" : "Confirm & pay"}
          </Button>
        </div>
      </div>

      <AccountPicker
        title="Pay from"
        description="Choose which account this payment comes out of."
        accounts={accounts}
        selectedId={fromId}
        onSelect={setFromId}
        open={pickerOpen}
        onOpenChange={setPickerOpen}
      />
    </div>
  )
}
