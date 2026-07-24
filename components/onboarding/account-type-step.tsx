"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  SelectableCard,
  SelectionIndicator,
} from "@/components/onboarding/selectable-card"

type AccountTypeChoice = "everyday" | "corporate"

/**
 * Corporate signup is a separate flow (it needs a business type, company
 * details and a different plan catalogue) and is not built for web yet. It is
 * shown but disabled so the choice is visible and the absence is explicit,
 * rather than the option silently missing.
 */
const OPTIONS: Array<{
  value: AccountTypeChoice
  title: string
  description: string
  available: boolean
}> = [
  {
    value: "everyday",
    title: "Everyday user",
    description:
      "Manage your money, send and receive payments, and access DosshPay services.",
    available: true,
  },
  {
    value: "corporate",
    title: "Corporate user",
    description:
      "For employees of a registered company, and business or trust owners setting up an account.",
    available: false,
  },
]

export function AccountTypeStep({ onContinue }: { onContinue: () => void }) {
  const [choice, setChoice] = React.useState<AccountTypeChoice | null>(null)

  return (
    <div className="flex flex-col gap-5">
      <div role="radiogroup" aria-label="Account type" className="flex flex-col gap-3">
        {OPTIONS.map((option) => (
          <SelectableCard
            key={option.value}
            role="radio"
            selected={choice === option.value}
            disabled={!option.available}
            onSelect={() => setChoice(option.value)}
          >
            <SelectionIndicator selected={choice === option.value} />
            <span className="flex flex-col gap-1">
              <span className="flex flex-wrap items-center gap-2">
                <span className="font-semibold text-blueLightest">
                  {option.title}
                </span>
                {!option.available ? (
                  <Badge variant="secondary">Coming soon on web</Badge>
                ) : null}
              </span>
              <span className="text-sm text-blueLight">{option.description}</span>
            </span>
          </SelectableCard>
        ))}
      </div>

      <Button
        type="button"
        variant="primary"
        className="w-full"
        disabled={choice !== "everyday"}
        onClick={onContinue}
      >
        Continue
      </Button>
    </div>
  )
}
