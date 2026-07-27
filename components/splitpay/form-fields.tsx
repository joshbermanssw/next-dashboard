"use client"

import * as React from "react"

import { Input } from "@/components/ui/input"
import { cardBrand, normalizeCardNumber } from "@/lib/splitpay"
import { cn } from "@/lib/utils"

/** Labelled field for the public pages: label, optional hint, inline error. */
export function PublicField({
  label,
  htmlFor,
  required,
  hint,
  error,
  children,
}: {
  label: string
  htmlFor: string
  required?: boolean
  hint?: string
  error?: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="text-xs font-medium text-blueLight">
        {label}
        {required ? <span className="ml-0.5 text-negative">*</span> : null}
      </label>
      {children}
      {error ? (
        <p role="alert" className="text-[11px] text-negative">
          {error}
        </p>
      ) : hint ? (
        <p className="text-[11px] text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  )
}

/** Amount input with a leading `$`. Keeps digits and a single decimal point so
 * the value always parses as a number. */
export function MoneyInput({
  id,
  value,
  onValueChange,
  invalid,
  disabled,
}: {
  id: string
  value: string
  onValueChange: (next: string) => void
  invalid?: boolean
  disabled?: boolean
}) {
  return (
    <div className="relative">
      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
        $
      </span>
      <Input
        id={id}
        value={value}
        disabled={disabled}
        onChange={(e) => onValueChange(sanitizeAmount(e.target.value))}
        inputMode="decimal"
        placeholder="0.00"
        aria-invalid={invalid}
        className="pl-7"
      />
    </div>
  )
}

/** Digits plus at most one decimal point, capped at two decimal places. */
function sanitizeAmount(raw: string): string {
  const cleaned = raw.replace(/[^\d.]/g, "")
  const [whole, ...rest] = cleaned.split(".")
  if (rest.length === 0) return whole
  return `${whole}.${rest.join("").slice(0, 2)}`
}

/* ------------------------------------------------------------- card fields */

export type CardFieldState = {
  number: string
  expiry: string
  cvv: string
  setNumber: (next: string) => void
  setExpiry: (next: string) => void
  setCvv: (next: string) => void
}

/** Card entry state with the formatting people expect while typing. */
export function useCardFields(): CardFieldState {
  const [number, setNumberRaw] = React.useState("")
  const [expiry, setExpiryRaw] = React.useState("")
  const [cvv, setCvvRaw] = React.useState("")

  return {
    number,
    expiry,
    cvv,
    setNumber: (next) => setNumberRaw(groupDigits(next)),
    setExpiry: (next) => setExpiryRaw(formatExpiry(next)),
    setCvv: (next) => setCvvRaw(next.replace(/\D/g, "").slice(0, 4)),
  }
}

/** `4242424242424242` → `4242 4242 4242 4242`, capped at 19 digits. */
function groupDigits(raw: string): string {
  const digits = normalizeCardNumber(raw).slice(0, 19)
  return digits.replace(/(.{4})/g, "$1 ").trim()
}

/**
 * `1226` → `12/26`. Only inserts the slash once two digits are in, so
 * backspacing through it doesn't fight the user.
 */
function formatExpiry(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 4)
  if (digits.length <= 2) return digits
  return `${digits.slice(0, 2)}/${digits.slice(2)}`
}

/** Card number / expiry / CVV — the block shared by Step 2 and "pay the
 * difference" on Step 5. The values are validated server-side and then
 * discarded; only brand and last four are ever stored. */
export function CardFields({
  fields,
  errors,
}: {
  fields: CardFieldState
  errors: Record<string, string>
}) {
  const brand = cardBrand(normalizeCardNumber(fields.number))
  const showBrand = normalizeCardNumber(fields.number).length >= 2

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-panel-border bg-white/[0.03] p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-label">
        Card Information
      </p>

      <PublicField label="Card Number" required htmlFor="sp-card" error={errors.cardNumber}>
        <div className="relative">
          <Input
            id="sp-card"
            value={fields.number}
            onChange={(e) => fields.setNumber(e.target.value)}
            inputMode="numeric"
            autoComplete="cc-number"
            placeholder="1234 5678 9012 3456"
            aria-invalid={Boolean(errors.cardNumber)}
            className={cn(showBrand && "pr-20")}
          />
          {showBrand ? (
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-medium text-muted-foreground">
              {brand}
            </span>
          ) : null}
        </div>
      </PublicField>

      <div className="grid grid-cols-2 gap-3">
        <PublicField label="Expiry Date" required htmlFor="sp-exp" error={errors.expiry}>
          <Input
            id="sp-exp"
            value={fields.expiry}
            onChange={(e) => fields.setExpiry(e.target.value)}
            inputMode="numeric"
            autoComplete="cc-exp"
            placeholder="MM/YY"
            aria-invalid={Boolean(errors.expiry)}
          />
        </PublicField>
        <PublicField label="CVV" required htmlFor="sp-cvv" error={errors.cvv}>
          <Input
            id="sp-cvv"
            value={fields.cvv}
            onChange={(e) => fields.setCvv(e.target.value)}
            inputMode="numeric"
            autoComplete="cc-csc"
            placeholder="123"
            aria-invalid={Boolean(errors.cvv)}
          />
        </PublicField>
      </div>
    </div>
  )
}
