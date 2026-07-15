"use client"

import * as React from "react"
import { ChevronLeftIcon } from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { SplitPayCreate } from "@/components/dashboard/splitpay-create"
import { useAccounts } from "@/contexts/accounts-context"
import {
  accountKindMeta,
  AUD_CURRENCY,
  CURRENCY_BY_CODE,
  currencyOptionsForKind,
  type AccountKind,
  type CurrencyOption,
} from "@/lib/dashboard-data"
import { cn } from "@/lib/utils"

/**
 * Create-account dialog. Opened from the "Add account" menu with a chosen
 * `kind`. SplitPay runs its own explainer + 3-step wizard; every other kind
 * runs the currency → review flow (Crypto/Global pick a currency; the rest
 * skip straight to review on their fixed AUD). The dialog unmounts its body on
 * close, so each flow mounts fresh — no reset wiring needed.
 */
export function CreateAccountDialog({
  kind,
  open,
  onOpenChange,
}: {
  kind: AccountKind | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const close = () => onOpenChange(false)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={kind === "splitpay" ? "max-w-lg" : undefined}>
        {kind === "splitpay" ? (
          <SplitPayCreate onDone={close} />
        ) : kind ? (
          <CurrencyReviewFlow kind={kind} onDone={close} />
        ) : null}
      </DialogContent>
    </Dialog>
  )
}

type Step = "currency" | "review"

function CurrencyReviewFlow({
  kind,
  onDone,
}: {
  kind: AccountKind
  onDone: () => void
}) {
  const { addAccount } = useAccounts()
  const options = currencyOptionsForKind(kind)
  const meta = accountKindMeta[kind]

  const [step, setStep] = React.useState<Step>(options ? "currency" : "review")
  const [selectedCode, setSelectedCode] = React.useState(
    options?.[0].code ?? AUD_CURRENCY.code
  )
  const selected = CURRENCY_BY_CODE[selectedCode] ?? AUD_CURRENCY

  function handleCreate() {
    addAccount(kind, selectedCode)
    onDone()
  }

  if (step === "currency" && options) {
    return (
      <>
        <DialogHeader>
          <DialogTitle>Currency</DialogTitle>
          <DialogDescription>
            Select the currency you want to use for your {meta.label} account.
          </DialogDescription>
        </DialogHeader>

        <div
          role="radiogroup"
          aria-label="Currency"
          className="flex max-h-80 flex-col gap-2 overflow-y-auto"
        >
          {options.map((option) => (
            <CurrencyRow
              key={option.code}
              option={option}
              selected={option.code === selectedCode}
              onSelect={() => setSelectedCode(option.code)}
            />
          ))}
        </div>

        <DialogFooter>
          <Button className="w-full" onClick={() => setStep("review")}>
            Review Details
          </Button>
        </DialogFooter>
      </>
    )
  }

  return (
    <>
      <DialogHeader>
        <div className="flex items-center gap-2">
          {options ? (
            <button
              type="button"
              onClick={() => setStep("currency")}
              aria-label="Back to currency"
              className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-white/10 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <ChevronLeftIcon className="size-5" />
            </button>
          ) : null}
          <DialogTitle>Review details</DialogTitle>
        </div>
      </DialogHeader>

      <dl className="overflow-hidden rounded-xl border border-panel-border bg-white/5">
        <ReviewRow label="Account" value={meta.label} />
        <ReviewRow label="Currency" value={selected.name} />
        <ReviewRow label="Region" value={selected.flag} />
        <ReviewRow label="Available" value="Immediately" />
      </dl>

      <DialogFooter>
        <Button className="w-full" onClick={handleCreate}>
          Create {meta.label} Account
        </Button>
      </DialogFooter>
    </>
  )
}

function CurrencyRow({
  option,
  selected,
  onSelect,
}: {
  option: CurrencyOption
  selected: boolean
  onSelect: () => void
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onSelect}
      className={cn(
        "flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        selected
          ? "border-accentBlue bg-accentBlue/10"
          : "border-panel-border bg-white/5 hover:bg-white/10"
      )}
    >
      <span className="text-xl leading-none">{option.flag}</span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-medium text-foreground">
          {option.code} • {option.symbol}
        </span>
        <span className="block text-xs text-muted-foreground">
          {option.name}
        </span>
      </span>
      <span
        aria-hidden
        className={cn(
          "grid size-5 shrink-0 place-items-center rounded-full border-2 transition-colors",
          selected ? "border-accentBlue" : "border-muted-foreground/50"
        )}
      >
        {selected ? (
          <span className="size-2.5 rounded-full bg-accentBlue" />
        ) : null}
      </span>
    </button>
  )
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-panel-border px-4 py-3.5 last:border-b-0">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="text-sm font-medium text-foreground">{value}</dd>
    </div>
  )
}
