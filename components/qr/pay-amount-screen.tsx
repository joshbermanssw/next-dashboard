"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"

import { AccountPicker } from "@/components/qr/account-picker"
import { HyperSwitchSheet } from "@/components/qr/hyper-switch-sheet"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { accountKindMeta } from "@/lib/dashboard-data"
import { parseAmount, type QrAccount } from "@/lib/qr-payment"
import { usePreferCheapestRail } from "@/hooks/use-prefer-cheapest-rail"
import type { RailId } from "@/lib/payment-rails"
import { formatCurrency } from "@/lib/utils"

export type Payee = { id: string; label: string; accountNumber: string }

/**
 * Step one of paying a scanned code: how much, out of which account, and what
 * to call it.
 *
 * Reached two ways — the in-app scanner routing here after a decode, and a
 * phone's camera app opening the QR's link — so it assumes nothing about how
 * the payer arrived beyond the URL. An amount baked into the code arrives
 * prefilled; otherwise the payer names it.
 *
 * Continuing opens Hyper Switch to choose a rail, then hands off to the review
 * screen with the whole payment in the URL, so a refresh doesn't lose it.
 */
export function PayAmountScreen({
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
  const [reference, setReference] = React.useState("")
  const [shouldSavePayee, setShouldSavePayee] = React.useState(true)
  const [pickerOpen, setPickerOpen] = React.useState(false)
  const [switchOpen, setSwitchOpen] = React.useState(false)
  const [preferCheapest, setPreferCheapest] = usePreferCheapestRail()

  const from = accounts.find((a) => a.id === fromId)
  const amount = parseAmount(amountInput)
  const canContinue = Boolean(from) && amount !== null

  function goToReview(railId: RailId) {
    if (!from || amount === null) return
    const query = new URLSearchParams({
      amt: amount.toFixed(2),
      from: from.id,
      rail: railId,
      save: shouldSavePayee ? "1" : "0",
    })
    if (reference.trim()) query.set("ref", reference.trim())
    router.push(`/qr/pay/${encodeURIComponent(payee.id)}/review?${query}`)
  }

  const FromIcon = from ? accountKindMeta[from.kind].icon : null

  return (
    <div className="flex min-h-dvh flex-col bg-neutralBlack">
      <header className="px-4 pb-2 pt-5">
        <button
          type="button"
          onClick={() => router.push("/qr")}
          aria-label="Back"
          className="flex size-11 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
        >
          <ChevronLeftIcon className="size-6" />
        </button>
      </header>

      <div className="flex flex-1 flex-col gap-6 px-4 pb-8 pt-2">
        <div>
          <label
            htmlFor="pay-amount"
            className="text-base text-blueLight/60"
          >
            Amount
          </label>
          <div className="mt-2 flex items-center gap-3 rounded-2xl border border-accentBlue/60 bg-white/[0.03] px-5 py-6 focus-within:border-accentBlue">
            <span className="text-4xl font-bold text-blueLight/40">$</span>
            <input
              id="pay-amount"
              value={amountInput}
              onChange={(event) => setAmountInput(event.target.value)}
              inputMode="decimal"
              autoFocus
              placeholder="0.00"
              className="min-w-0 flex-1 bg-transparent text-4xl font-bold text-blueLightest outline-none placeholder:text-blueLight/25"
            />
          </div>
        </div>

        {from && FromIcon && (
          <div>
            <span className="text-base text-blueLight/60">From account</span>
            <button
              type="button"
              onClick={() => setPickerOpen(true)}
              className="mt-2 flex w-full items-center gap-4 rounded-2xl border border-panel-border bg-white/[0.03] px-4 py-4 text-left transition-colors hover:bg-white/[0.06]"
            >
              <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-accentBlue/15 text-accentBlue">
                <FromIcon className="size-6" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-xl font-bold text-blueLightest">
                  {from.label} account
                </span>
                <span className="block text-base text-blueLight/50">
                  {formatCurrency(from.balance, { cents: true })}
                </span>
              </span>
              <ChevronRightIcon className="size-5 shrink-0 text-blueLight/40" />
            </button>
          </div>
        )}

        <label className="flex items-center gap-4 rounded-2xl border border-panel-border bg-white/[0.03] px-4 py-4">
          <span className="min-w-0 flex-1">
            <span className="block text-xl font-bold text-blueLightest">
              Save payee
            </span>
            <span className="block text-base text-blueLight/50">
              Add {payee.label} to your saved payees
            </span>
          </span>
          <Switch
            checked={shouldSavePayee}
            onCheckedChange={setShouldSavePayee}
            className="h-8 w-14 shrink-0 p-1 data-checked:bg-emerald-500 [&>[data-slot=switch-thumb]]:size-6 [&>[data-slot=switch-thumb]]:data-checked:translate-x-6"
          />
        </label>

        <div>
          <label htmlFor="pay-reference" className="text-base text-blueLight/60">
            Reference (optional)
          </label>
          <input
            id="pay-reference"
            value={reference}
            onChange={(event) => setReference(event.target.value)}
            maxLength={140}
            placeholder="e.g., Rent payment"
            className="mt-2 w-full rounded-2xl border border-panel-border bg-white/[0.03] px-5 py-5 text-xl text-blueLightest outline-none transition-colors placeholder:text-blueLight/25 focus:border-accentBlue/60"
          />
        </div>

        <div className="mt-auto pt-4">
          <Button
            type="button"
            disabled={!canContinue}
            onClick={() => setSwitchOpen(true)}
            className="w-full rounded-full py-3.5 text-base font-semibold disabled:opacity-50"
          >
            Continue
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

      {amount !== null && (
        <HyperSwitchSheet
          amount={amount}
          open={switchOpen}
          onOpenChange={setSwitchOpen}
          onConfirm={goToReview}
          preferCheapest={preferCheapest}
          onPreferCheapestChange={setPreferCheapest}
        />
      )}
    </div>
  )
}
