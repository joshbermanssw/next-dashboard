"use client"

import * as React from "react"
import { MdHome } from "react-icons/md"
import {
  SectionSteps,
  type StepDefinition,
} from "@/components/kyc/section-steps"
import { SimulatedCheck } from "@/components/kyc/simulated-check"
import { TextField } from "@/components/kyc/text-field"
import { PhoneInput } from "@/components/ui/phone-input"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import type { KycSectionProps } from "@/components/kyc/types"
import { ContactSectionSchema } from "@/lib/kyc"
import {
  formatAddress,
  searchAddresses,
  type AddressSuggestion,
} from "@/lib/kyc-options"

type Draft = {
  mobile: string
  email: string
  confirmEmail: string
  address: AddressSuggestion | null
  proofVerified: boolean
}

function draftFrom(initial: KycSectionProps<"contact">["initial"]): Draft {
  return {
    mobile: initial?.mobile ?? "",
    email: initial?.email ?? "",
    confirmEmail: initial?.confirmEmail ?? "",
    address: initial?.address ?? null,
    proofVerified: initial?.proofOfAddressVerified ?? false,
  }
}

const E164 = /^\+[1-9]\d{7,14}$/
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/**
 * Contact Details — the channels the account is reachable on, plus where the
 * customer actually lives. The address is picked from the lookup rather than
 * typed free-form, so it arrives already broken into its parts.
 */
export function ContactSection({
  initial,
  closeHref,
  onSubmit,
  pending,
  error,
}: KycSectionProps<"contact">) {
  const [draft, setDraft] = React.useState<Draft>(() => draftFrom(initial))
  const [query, setQuery] = React.useState(() =>
    initial?.address ? formatAddress(initial.address) : "",
  )
  const [invalid, setInvalid] = React.useState<string | null>(null)

  const set = <K extends keyof Draft>(key: K, value: Draft[K]) =>
    setDraft((current) => ({ ...current, [key]: value }))

  const suggestions = React.useMemo(() => searchAddresses(query), [query])
  const emailsMatch =
    draft.confirmEmail.trim().toLowerCase() === draft.email.trim().toLowerCase()

  const steps: StepDefinition[] = [
    {
      title: "Mobile Number",
      subtitle: "Confirm this is your number for account verification",
      canContinue: E164.test(draft.mobile.replace(/[\s()-]/g, "")),
      content: (
        <div className="flex flex-col gap-2">
          <Label className="text-blueLightest">Mobile Number</Label>
          <PhoneInput
            value={draft.mobile}
            onChange={(v) => set("mobile", v)}
          />
        </div>
      ),
    },
    {
      title: "Email Address",
      subtitle: "Please enter and confirm your email address",
      canContinue: EMAIL.test(draft.email.trim()) && emailsMatch,
      content: (
        <div className="flex flex-col gap-5">
          <TextField
            label="Email Address"
            type="email"
            autoComplete="email"
            value={draft.email}
            onChange={(v) => set("email", v)}
          />
          <TextField
            label="Confirm Email Address"
            type="email"
            value={draft.confirmEmail}
            onChange={(v) => set("confirmEmail", v)}
            error={
              draft.confirmEmail.length > 0 && !emailsMatch
                ? "Email addresses do not match."
                : null
            }
          />
        </div>
      ),
    },
    {
      title: "Address",
      subtitle: "Please confirm your current residential address",
      canContinue: draft.address !== null,
      content: (
        <div className="flex flex-col gap-3">
          <Label htmlFor="address-search" className="text-blueLightest">
            Search address
          </Label>
          <Input
            id="address-search"
            value={query}
            placeholder="Start typing your street address"
            autoComplete="off"
            onChange={(event) => {
              setQuery(event.target.value)
              // Editing the query invalidates the pick it produced.
              if (draft.address) set("address", null)
            }}
          />

          {suggestions.length > 0 && !draft.address ? (
            <ul className="overflow-hidden rounded-xl border border-panel-border">
              {suggestions.map((suggestion) => (
                <li key={suggestion.id}>
                  <button
                    type="button"
                    onClick={() => {
                      set("address", suggestion)
                      setQuery(formatAddress(suggestion))
                    }}
                    className={cn(
                      "flex w-full flex-col gap-0.5 border-b border-panel-border bg-white/5 p-4 text-left transition-colors last:border-b-0",
                      "hover:bg-white/10 focus-visible:outline-none focus-visible:bg-white/10",
                    )}
                  >
                    <span className="font-medium text-blueLightest">
                      {suggestion.line1}
                    </span>
                    <span className="text-sm text-blueLight">
                      {suggestion.suburb}, {suggestion.state},{" "}
                      {suggestion.country}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          ) : null}

          {draft.address ? (
            <p className="rounded-xl border border-accentBlue/30 bg-accentBlue/10 p-4 text-sm text-blueLightest">
              {formatAddress(draft.address)}
              <span className="mt-0.5 block text-blueLight">
                {draft.address.country}
              </span>
            </p>
          ) : null}
        </div>
      ),
    },
    {
      title: "Proof of Address",
      subtitle: "Tap below to start the secure verification flow.",
      canContinue: draft.proofVerified,
      content: (
        <SimulatedCheck
          icon={<MdHome />}
          title="Proof of Address"
          description="You'll need a bank statement or utility bill from the last 3 months."
          verified={draft.proofVerified}
          onVerified={() => set("proofVerified", true)}
        />
      ),
    },
  ]

  const complete = () => {
    const parsed = ContactSectionSchema.safeParse({
      mobile: draft.mobile,
      email: draft.email,
      confirmEmail: draft.confirmEmail,
      address: draft.address ?? undefined,
      proofOfAddressVerified: draft.proofVerified,
    })

    if (!parsed.success) {
      setInvalid(parsed.error.issues[0]?.message ?? "Check your answers.")
      return
    }

    setInvalid(null)
    onSubmit(parsed.data)
  }

  return (
    <SectionSteps
      steps={steps}
      closeHref={closeHref}
      pending={pending}
      error={invalid ?? error}
      onComplete={complete}
    />
  )
}
