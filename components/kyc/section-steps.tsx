"use client"

import * as React from "react"
import { StepShell } from "@/components/kyc/step-shell"

export type StepDefinition = {
  title: string
  subtitle?: string
  /** The answer on this step is valid. */
  canContinue: boolean
  content: React.ReactNode
  /** Defaults to "Continue", or "Complete" on the last step. */
  continueLabel?: string
}

/**
 * Runs a section's steps one screen at a time.
 *
 * Sections describe their steps declaratively and keep their own draft state;
 * this owns only the position within them, so every section gets identical
 * back/continue behaviour without repeating the wiring.
 */
export function SectionSteps({
  steps,
  closeHref,
  pending,
  error,
  onComplete,
}: {
  steps: StepDefinition[]
  closeHref: string
  pending: boolean
  error: string | null
  onComplete: () => void
}) {
  const [index, setIndex] = React.useState(0)

  const safeIndex = Math.min(index, steps.length - 1)
  const step = steps[safeIndex]
  const isLast = safeIndex === steps.length - 1

  return (
    <StepShell
      title={step.title}
      subtitle={step.subtitle}
      closeHref={closeHref}
      onBack={safeIndex > 0 ? () => setIndex(safeIndex - 1) : undefined}
      canContinue={step.canContinue}
      continueLabel={step.continueLabel ?? (isLast ? "Complete" : "Continue")}
      pending={pending}
      error={error}
      onContinue={() => (isLast ? onComplete() : setIndex(safeIndex + 1))}
    >
      {step.content}
    </StepShell>
  )
}
