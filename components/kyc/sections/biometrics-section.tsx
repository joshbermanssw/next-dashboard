"use client"

import * as React from "react"
import { MdFace } from "react-icons/md"
import {
  SectionSteps,
  type StepDefinition,
} from "@/components/kyc/section-steps"
import { SimulatedCheck } from "@/components/kyc/simulated-check"
import type { KycSectionProps } from "@/components/kyc/types"
import { BiometricsSectionSchema } from "@/lib/kyc"

/**
 * Biometrics — the liveness/face-match check that ties the person to the
 * document they submitted. One step, because the whole interaction belongs to
 * the provider's SDK.
 */
export function BiometricsSection({
  initial,
  closeHref,
  onSubmit,
  pending,
  error,
}: KycSectionProps<"biometrics">) {
  const [verified, setVerified] = React.useState(initial?.verified ?? false)
  const [invalid, setInvalid] = React.useState<string | null>(null)

  const steps: StepDefinition[] = [
    {
      title: "Biometrics",
      subtitle:
        "A quick face scan confirms you're the person on the document you submitted.",
      canContinue: verified,
      content: (
        <SimulatedCheck
          icon={<MdFace />}
          title="Face verification"
          description="Find good lighting and look straight at the camera."
          verified={verified}
          onVerified={() => setVerified(true)}
        />
      ),
    },
  ]

  const complete = () => {
    const parsed = BiometricsSectionSchema.safeParse({ verified })

    if (!parsed.success) {
      setInvalid(parsed.error.issues[0]?.message ?? "Complete the face check.")
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
