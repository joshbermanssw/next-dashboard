"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { CheckIcon, ChevronLeftIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { payViaQr } from "@/app/actions/qr-payment"
import type { Payee } from "@/components/qr/pay-amount-screen"
import type { QrAccount } from "@/lib/qr-payment"
import type { RailQuote } from "@/lib/payment-rails"
import { formatCurrency } from "@/lib/utils"

/**
 * Last step: everything about the payment on one screen, then send.
 *
 * The whole payment arrives in the URL, so this survives a refresh and a
 * back-forward without holding client state across routes.
 */
export function ReviewPayment({
  payee,
  from,
  amount,
  rail,
  reference,
  savePayee,
}: {
  payee: Payee
  from: QrAccount
  amount: number
  rail: RailQuote
  reference: string | null
  savePayee: boolean
}) {
  const router = useRouter()
  const [error, setError] = React.useState<string | null>(null)
  const [sent, setSent] = React.useState<{
    paid: number
    fee: number
    remaining: number
    points: number
  } | null>(null)
  const [pending, startTransition] = React.useTransition()

  function send() {
    setError(null)
    startTransition(async () => {
      const result = await payViaQr({
        fromAccountId: from.id,
        toAccountId: payee.id,
        amount,
        railId: rail.id,
        reference: reference ?? undefined,
        savePayee,
      })
      if (result.ok) {
        setSent(result.value)
        // The dashboard reads balances server-side; make sure it re-fetches.
        router.refresh()
      } else {
        setError(result.message)
      }
    })
  }

  if (sent) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-6 bg-neutralBlack px-6 text-center">
        <span className="flex size-16 items-center justify-center rounded-full bg-accentBlue text-blueDarker">
          <CheckIcon className="size-8" strokeWidth={3} />
        </span>
        <div className="space-y-1">
          <p className="text-3xl font-bold text-blueLightest">
            {formatCurrency(sent.paid, { cents: true })}
          </p>
          <p className="text-base text-blueLight/70">Paid to {payee.label}</p>
        </div>
        <div className="space-y-1 text-sm text-blueLight/50">
          <p>
            Sent via {rail.label} · fee{" "}
            {formatCurrency(sent.fee, { cents: true })} · {sent.points} pts
            earned
          </p>
          <p>
            {from.label} balance is now{" "}
            {formatCurrency(sent.remaining, { cents: true })}
          </p>
        </div>
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

  return (
    <div className="flex min-h-dvh flex-col bg-neutralBlack">
      <header className="relative flex items-center justify-center px-4 pb-4 pt-5">
        <button
          type="button"
          onClick={() => router.back()}
          aria-label="Back"
          className="absolute left-4 flex size-11 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
        >
          <ChevronLeftIcon className="size-6" />
        </button>
        <div className="text-center">
          <h1 className="text-2xl font-bold text-blueLightest">
            Review payment
          </h1>
          <p className="text-base text-blueLight/50">{payee.label}</p>
        </div>
      </header>

      <div className="flex flex-1 flex-col px-4 pb-8 pt-2">
        <dl className="rounded-2xl border border-panel-border bg-white/[0.03] px-5">
          <Row label="To" value={payee.label} />
          <Row label="Account" value={payee.accountNumber} />
          <Row label="From" value={`${from.label} account`} />
          <Row label="Amount" value={formatCurrency(amount, { cents: true })} />
          <Row label="Via" value={rail.label} />
          <Row
            label="Fee"
            value={`${rail.fee.toFixed(2)} ${from.currency}`}
          />
          <Row label="Reference" value={reference ?? "-"} />
          <Row label="When" value="Now" last />
        </dl>

        {error && (
          <p role="alert" className="mt-4 text-center text-sm text-red-400">
            {error}
          </p>
        )}

        <div className="mt-auto pt-8">
          <Button
            type="button"
            onClick={send}
            disabled={pending}
            className="w-full rounded-full py-4 text-base font-semibold disabled:opacity-50"
          >
            {pending ? "Sending…" : "Send payment"}
          </Button>
        </div>
      </div>
    </div>
  )
}

function Row({
  label,
  value,
  last = false,
}: {
  label: string
  value: string
  last?: boolean
}) {
  return (
    <div
      className={
        last
          ? "flex items-center justify-between gap-4 py-4"
          : "flex items-center justify-between gap-4 border-b border-panel-border py-4"
      }
    >
      <dt className="shrink-0 text-base text-blueLight/50">{label}</dt>
      <dd className="min-w-0 truncate text-right text-base font-bold text-blueLightest">
        {value}
      </dd>
    </div>
  )
}
