"use client"

import * as React from "react"
import {
  Select,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"
import { Select as SelectPrimitive } from "@base-ui/react/select"
import { cn } from "@/lib/utils"

export type Country = {
  /** ISO 3166-1 alpha-2 — the stable key, since dial codes are not unique. */
  iso: string
  name: string
  /** E.164 calling code including the leading "+". */
  dial: string
  flag: string
}

// A curated set rather than the full ISO list — enough to cover the app's
// markets without a 200-row dropdown. AU leads because the catalogue prices in
// AUD and the mobile flow's example number is +61.
export const COUNTRIES: Country[] = [
  { iso: "AU", name: "Australia", dial: "+61", flag: "🇦🇺" },
  { iso: "NZ", name: "New Zealand", dial: "+64", flag: "🇳🇿" },
  { iso: "GB", name: "United Kingdom", dial: "+44", flag: "🇬🇧" },
  { iso: "US", name: "United States", dial: "+1", flag: "🇺🇸" },
  { iso: "CA", name: "Canada", dial: "+1", flag: "🇨🇦" },
  { iso: "IE", name: "Ireland", dial: "+353", flag: "🇮🇪" },
  { iso: "SG", name: "Singapore", dial: "+65", flag: "🇸🇬" },
  { iso: "HK", name: "Hong Kong", dial: "+852", flag: "🇭🇰" },
  { iso: "IN", name: "India", dial: "+91", flag: "🇮🇳" },
  { iso: "PH", name: "Philippines", dial: "+63", flag: "🇵🇭" },
  { iso: "ZA", name: "South Africa", dial: "+27", flag: "🇿🇦" },
  { iso: "DE", name: "Germany", dial: "+49", flag: "🇩🇪" },
  { iso: "FR", name: "France", dial: "+33", flag: "🇫🇷" },
  { iso: "AE", name: "United Arab Emirates", dial: "+971", flag: "🇦🇪" },
  { iso: "JP", name: "Japan", dial: "+81", flag: "🇯🇵" },
]

export const DEFAULT_COUNTRY_ISO = "AU"

function countryByIso(iso: string): Country {
  return COUNTRIES.find((c) => c.iso === iso) ?? COUNTRIES[0]
}

/**
 * Splits an E.164 value into a known country + the national remainder.
 *
 * Prefers `fallbackIso` when its dial code matches, so the visible country
 * doesn't jump between two that share a code (e.g. +1 US/CA) as the user types.
 * The longest matching dial wins otherwise, which disambiguates +1 from +1876.
 */
function splitE164(value: string, fallbackIso: string): {
  iso: string
  national: string
} {
  if (!value.startsWith("+")) {
    return { iso: fallbackIso, national: value.replace(/\D/g, "") }
  }
  const fallback = countryByIso(fallbackIso)
  if (value.startsWith(fallback.dial)) {
    return { iso: fallback.iso, national: value.slice(fallback.dial.length) }
  }
  const match = [...COUNTRIES]
    .sort((a, b) => b.dial.length - a.dial.length)
    .find((c) => value.startsWith(c.dial))
  return match
    ? { iso: match.iso, national: value.slice(match.dial.length) }
    : { iso: fallbackIso, national: value.replace(/\D/g, "") }
}

type PhoneInputProps = {
  /** Full E.164 value, e.g. "+61412345678". Empty string until first input. */
  value: string
  onChange: (value: string) => void
  onBlur?: () => void
  id?: string
  disabled?: boolean
  invalid?: boolean
  placeholder?: string
}

/**
 * Phone field with a country calling-code dropdown, in the shadcn idiom: a
 * bordered group holding a flag + dial-code selector and a national-number
 * input that together produce one E.164 string.
 *
 * The composed value is the source of truth; the selected country is remembered
 * locally only to keep the flag stable while typing.
 */
export function PhoneInput({
  value,
  onChange,
  onBlur,
  id,
  disabled,
  invalid,
  placeholder = "412 345 678",
}: PhoneInputProps) {
  const [iso, setIso] = React.useState(DEFAULT_COUNTRY_ISO)

  const { iso: derivedIso, national } = splitE164(value, iso)
  // Keep local country in step when the value implies a different one (e.g. a
  // restored draft), without letting it drift while the dial code is ambiguous.
  React.useEffect(() => {
    if (derivedIso !== iso) setIso(derivedIso)
  }, [derivedIso, iso])

  const country = countryByIso(iso)

  const emit = (nextIso: string, nextNational: string) => {
    const digits = nextNational.replace(/\D/g, "")
    // Empty stays empty so the field reads as "not entered" (and stays invalid),
    // rather than becoming a bare dial code the user never typed.
    onChange(digits ? `${countryByIso(nextIso).dial}${digits}` : "")
  }

  return (
    <div
      data-slot="phone-input"
      className={cn(
        "flex w-full items-center rounded-lg border border-input transition-colors",
        "focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50",
        invalid && "border-destructive ring-3 ring-destructive/20",
        disabled && "opacity-50",
      )}
    >
      <Select
        value={iso}
        onValueChange={(next) => {
          const nextIso = String(next)
          setIso(nextIso)
          emit(nextIso, national)
        }}
        disabled={disabled}
      >
        <SelectPrimitive.Trigger
          aria-label="Country calling code"
          className="flex h-8 shrink-0 items-center gap-1.5 rounded-l-lg border-0 bg-transparent pr-1.5 pl-2.5 text-sm outline-none select-none focus-visible:bg-white/5 disabled:cursor-not-allowed"
        >
          <span className="text-base leading-none">{country.flag}</span>
          <span className="text-blueLightest">{country.dial}</span>
          <SelectPrimitive.Icon
            render={<ChevronIcon />}
          />
        </SelectPrimitive.Trigger>
        <SelectContent align="start" className="min-w-56">
          {COUNTRIES.map((c) => (
            <SelectItem key={c.iso} value={c.iso}>
              <span className="text-base leading-none">{c.flag}</span>
              <span className="flex-1">{c.name}</span>
              <span className="text-muted-foreground">{c.dial}</span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <span aria-hidden className="h-5 w-px shrink-0 bg-input" />

      <input
        id={id}
        type="tel"
        inputMode="tel"
        autoComplete="tel-national"
        disabled={disabled}
        aria-invalid={invalid || undefined}
        value={national}
        onChange={(e) => emit(iso, e.target.value)}
        onBlur={onBlur}
        placeholder={placeholder}
        className="h-8 w-full min-w-0 flex-1 bg-transparent px-2.5 text-base text-foreground outline-none placeholder:text-blueLight/40 disabled:cursor-not-allowed md:text-sm"
      />
    </div>
  )
}

function ChevronIcon() {
  return (
    <svg
      className="pointer-events-none size-4 text-muted-foreground"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden
    >
      <path
        d="m4 6 4 4 4-4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
