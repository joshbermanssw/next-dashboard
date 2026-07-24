"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { MdArrowBack } from "react-icons/md"
import HeadingTag from "@/components/util/heading-tag"
import { StepProgress } from "@/components/ui/step-progress"
import { AccountTypeStep } from "@/components/onboarding/account-type-step"
import { PlanStep } from "@/components/onboarding/plan-step"
import { PlanDetailStep } from "@/components/onboarding/plan-detail-step"
import { BillingStep } from "@/components/onboarding/billing-step"
import { completeOnboardingAction } from "@/app/actions/onboarding"
import type { AddOnKey, CatalogPlan } from "@/lib/plan"
import type { BillingCycle } from "@/lib/plan-pricing"

type Step = "account-type" | "plan" | "plan-detail" | "billing"

const ORDER: Step[] = ["account-type", "plan", "plan-detail", "billing"]

const COPY: Record<Step, { title: string; subtitle: string }> = {
  "account-type": {
    title: "Choose account type",
    subtitle: "Tell us how you'll use DosshPay",
  },
  plan: {
    title: "Choose your plan",
    subtitle: "Select a subscription plan that fits your needs",
  },
  "plan-detail": {
    title: "Review your plan",
    subtitle: "Confirm what's included and add any extras",
  },
  billing: {
    title: "Confirm payment schedule",
    subtitle: "Select how you'd like to be billed",
  },
}

export function OnboardingWizard({ plans }: { plans: CatalogPlan[] }) {
  const router = useRouter()
  const [step, setStep] = React.useState<Step>("account-type")
  const [planId, setPlanId] = React.useState<number | null>(null)
  const [selectedAddOns, setSelectedAddOns] = React.useState<AddOnKey[]>([])
  const [billingCycle, setBillingCycle] = React.useState<BillingCycle>("MONTHLY")
  const [pending, startTransition] = React.useTransition()
  const [error, setError] = React.useState<string | null>(null)

  const selectedPlan = plans.find((p) => p.id === planId) ?? null

  const goTo = (next: Step) => {
    setError(null)
    setStep(next)
  }

  const goBack = () => {
    const index = ORDER.indexOf(step)
    if (index > 0) goTo(ORDER[index - 1])
  }

  const handlePlanChosen = (id: number) => {
    // Add-ons belong to a specific plan, so switching plans clears them rather
    // than carrying a selection the new plan may not offer.
    if (id !== planId) setSelectedAddOns([])
    setPlanId(id)
    goTo("plan-detail")
  }

  const handleConfirm = () => {
    if (!selectedPlan) return
    setError(null)
    startTransition(async () => {
      const result = await completeOnboardingAction({
        planId: selectedPlan.id,
        billingCycle,
        selectedAddOns,
      })
      if (!result.ok) {
        setError(result.message)
        return
      }
      router.push("/activate")
    })
  }

  const { title, subtitle } = COPY[step]

  return (
    <div className="flex flex-col gap-7 rounded-2xl border border-panel-border bg-blueDarkest/80 px-6 py-8 shadow-2xl backdrop-blur-sm sm:px-10 sm:py-10">
      <header className="space-y-2">
        {step !== "account-type" ? (
          <button
            type="button"
            onClick={goBack}
            disabled={pending}
            aria-label="Back to the previous step"
            className="mb-2 inline-flex size-9 items-center justify-center rounded-full border border-surfaceCardDark text-blueLight transition-colors hover:bg-white/10 hover:text-blueLightest disabled:opacity-50"
          >
            <MdArrowBack className="size-5" />
          </button>
        ) : null}
        <HeadingTag level={5} className="font-semibold perspective-distant">
          {title}
        </HeadingTag>
        <p className="text-sm text-blueLight">{subtitle}</p>
      </header>

      <StepProgress current={ORDER.indexOf(step) + 1} total={ORDER.length} />

      {step === "account-type" ? (
        <AccountTypeStep onContinue={() => goTo("plan")} />
      ) : null}

      {step === "plan" ? (
        <PlanStep
          plans={plans}
          selectedPlanId={planId}
          onSelect={handlePlanChosen}
        />
      ) : null}

      {step === "plan-detail" && selectedPlan ? (
        <PlanDetailStep
          plan={selectedPlan}
          selectedAddOns={selectedAddOns}
          onToggleAddOn={(key) =>
            setSelectedAddOns((current) =>
              current.includes(key)
                ? current.filter((k) => k !== key)
                : [...current, key],
            )
          }
          onContinue={() => goTo("billing")}
        />
      ) : null}

      {step === "billing" && selectedPlan ? (
        <BillingStep
          plan={selectedPlan}
          selectedAddOns={selectedAddOns}
          billingCycle={billingCycle}
          onCycleChange={setBillingCycle}
          onConfirm={handleConfirm}
          pending={pending}
          error={error}
        />
      ) : null}
    </div>
  )
}
