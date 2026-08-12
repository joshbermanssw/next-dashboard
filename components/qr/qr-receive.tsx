"use client"

import * as React from "react"
import { QRCodeSVG } from "qrcode.react"
import { ChevronRightIcon, XIcon } from "lucide-react"

import { AccountPicker } from "@/components/qr/account-picker"
import { accountKindMeta } from "@/lib/dashboard-data"
import { buildPaymentUrl, parseAmount, type QrAccount } from "@/lib/qr-payment"

/**
 * The Receive tab: a QR code someone else scans to pay you.
 *
 * The code encodes an ordinary https link (see `lib/qr-payment.ts`), so it
 * resolves both in the DosshPay scanner and in any phone's camera app. Typing
 * an amount re-renders it live — the amount is part of the payload, not a
 * separate instruction to the payer.
 */
export function QrReceive({
  accounts,
  displayName,
}: {
  accounts: QrAccount[]
  /** Who the payer sees they're paying. */
  displayName: string
}) {
  const [accountId, setAccountId] = React.useState(accounts[0]?.id ?? "")
  const [amountInput, setAmountInput] = React.useState("")
  const [pickerOpen, setPickerOpen] = React.useState(false)
  const [origin, setOrigin] = React.useState("")

  // Read after mount: the payload depends on the origin, which the server
  // render has no honest value for — building it there would hydrate against a
  // different string.
  React.useEffect(() => setOrigin(window.location.origin), [])

  const selected = accounts.find((a) => a.id === accountId) ?? accounts[0]
  const amount = parseAmount(amountInput)
  const value =
    origin && selected
      ? buildPaymentUrl(origin, { accountId: selected.id, amount })
      : ""

  const Icon = selected ? accountKindMeta[selected.kind].icon : null

  return (
    <div className="flex flex-1 flex-col items-center gap-8 overflow-y-auto px-6 pb-10 pt-6">
      <div className="rounded-[2rem] bg-white/[0.06] p-4 shadow-2xl">
        <div className="flex size-[262px] items-center justify-center rounded-3xl bg-blueLightest p-5">
          {value ? (
            <QRCodeSVG
              value={value}
              size={222}
              level="M"
              bgColor="#F5F7FF"
              fgColor="#00032E"
              marginSize={0}
            />
          ) : (
            <span className="size-[222px] animate-pulse rounded-lg bg-blueDarker/10" />
          )}
        </div>
      </div>

      <div className="text-center">
        <p className="text-2xl font-bold text-blueLightest">{displayName}</p>
        {amount === null ? (
          <p className="mt-1 text-base text-blueLight/60">
            Show this code to receive a payment
          </p>
        ) : (
          <p className="mt-1 text-base font-semibold text-accentBlue">
            Requesting A${amount.toFixed(2)}
          </p>
        )}
      </div>

      <div className="w-full max-w-sm rounded-2xl border border-panel-border bg-white/[0.03]">
        <div className="px-5 py-4">
          <label
            htmlFor="receive-amount"
            className="text-xs font-medium uppercase tracking-wide text-blueLight/50"
          >
            Amount (optional)
          </label>
          <div className="mt-1.5 flex items-center gap-2">
            <span className="text-3xl font-semibold text-blueLight/50">A$</span>
            <input
              id="receive-amount"
              value={amountInput}
              onChange={(event) => setAmountInput(event.target.value)}
              inputMode="decimal"
              placeholder="0.00"
              className="min-w-0 flex-1 bg-transparent text-3xl font-semibold text-blueLightest outline-none placeholder:text-blueLight/30"
            />
            {amountInput !== "" && (
              <button
                type="button"
                onClick={() => setAmountInput("")}
                aria-label="Clear amount"
                className="flex size-7 shrink-0 items-center justify-center rounded-full bg-white/10 text-blueLight transition-colors hover:bg-white/20"
              >
                <XIcon className="size-4" />
              </button>
            )}
          </div>
        </div>

        {selected && Icon && (
          <button
            type="button"
            onClick={() => setPickerOpen(true)}
            className="flex w-full items-center gap-4 border-t border-panel-border px-5 py-4 text-left transition-colors hover:bg-white/[0.03]"
          >
            <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-accentBlue/15 text-accentBlue">
              <Icon className="size-5" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm text-blueLight/60">
                Receiving into
              </span>
              <span className="block truncate text-base font-semibold text-blueLightest">
                {selected.label} · {selected.currency}
              </span>
            </span>
            <ChevronRightIcon className="size-5 shrink-0 text-blueLight/50" />
          </button>
        )}
      </div>

      <AccountPicker
        title="Receive to"
        description="Choose which account this QR code pays into."
        accounts={accounts}
        selectedId={selected?.id ?? ""}
        onSelect={setAccountId}
        open={pickerOpen}
        onOpenChange={setPickerOpen}
      />
    </div>
  )
}
