"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { MdArrowBack, MdCheckCircle } from "react-icons/md"
import HeadingTag from "@/components/util/heading-tag"
import { Button } from "@/components/ui/button"
import { StepProgress } from "@/components/ui/step-progress"
import { DetailsStep } from "@/components/auth/signup/details-step"
import { PasswordStep } from "@/components/auth/signup/password-step"
import { VerifyStep } from "@/components/auth/signup/verify-step"
import { startSignupAction, verifySignupAction } from "@/app/actions/signup"
import type { SignupDetails } from "@/lib/signup"

type Step = "details" | "password" | "verify" | "signin"

const TOTAL_STEPS = 3

const STEP_INDEX: Record<Step, number> = {
  details: 1,
  password: 2,
  verify: 3,
  // The sign-in hand-off is a terminal state, not a fourth step.
  signin: 3,
}

const COPY: Record<Step, { title: string; subtitle: string }> = {
  details: {
    title: "Create your account",
    subtitle: "Let's start with the basics",
  },
  password: {
    title: "Create a password",
    subtitle: "Choose a strong password to secure your account",
  },
  verify: {
    title: "Enter your code",
    subtitle: "We sent a 6-digit code to your email",
  },
  signin: {
    title: "Account verified",
    subtitle: "Sign in to finish setting up DosshPay",
  },
}

/**
 * Three-step account creation: details, password, emailed code.
 *
 * All collected values live in this component's state and never leave the
 * browser except as server-action arguments — in particular the password is
 * held only until the code is verified, because `/registration/verify` returns
 * no refresh token and the session has to be established with a real login.
 * A page refresh therefore drops it, which the verify step handles by sending
 * the customer to sign in manually rather than stranding them.
 */
export function SignupWizard() {
  const router = useRouter()
  const [step, setStep] = React.useState<Step>("details")
  const [details, setDetails] = React.useState<SignupDetails | null>(null)
  const [password, setPassword] = React.useState("")
  const [registration, setRegistration] = React.useState<{
    customerId: string
    deviceId: string
  } | null>(null)
  const [pending, startTransition] = React.useTransition()
  const [error, setError] = React.useState<string | null>(null)

  const goBack = () => {
    setError(null)
    if (step === "password") setStep("details")
  }

  const handleDetails = (values: SignupDetails) => {
    setDetails(values)
    setError(null)
    setStep("password")
  }

  const handlePassword = (chosenPassword: string) => {
    if (!details) return
    setError(null)
    startTransition(async () => {
      const result = await startSignupAction({ ...details, password: chosenPassword })
      if (!result.ok) {
        setError(result.message)
        return
      }
      setPassword(chosenPassword)
      setRegistration({ customerId: result.customerId, deviceId: result.deviceId })
      setStep("verify")
    })
  }

  const handleVerify = (otp: string) => {
    if (!details || !registration) return
    setError(null)
    startTransition(async () => {
      const result = await verifySignupAction({
        customerId: registration.customerId,
        deviceId: registration.deviceId,
        firstName: details.firstName,
        lastName: details.lastName,
        email: details.email,
        phone: details.phone,
        otp,
        password,
      })
      if (!result.ok) {
        setError(result.message)
        return
      }
      if (result.requiresLogin) {
        setStep("signin")
        return
      }
      router.push("/onboarding")
    })
  }

  const { title, subtitle } = COPY[step]
  const canGoBack = step === "password"

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center">
      <div className="flex flex-col gap-7 rounded-xl border border-surfaceCardDark bg-blueDarkest px-8 py-10 shadow-2xl sm:px-10 sm:py-12">
        <header className="space-y-2 text-center">
          {canGoBack ? (
            <button
              type="button"
              onClick={goBack}
              disabled={pending}
              aria-label="Back to your details"
              className="mb-2 inline-flex size-9 items-center justify-center rounded-full border border-surfaceCardDark text-blueLight transition-colors hover:bg-white/10 hover:text-blueLightest disabled:opacity-50"
            >
              <MdArrowBack className="size-5" />
            </button>
          ) : null}
          <HeadingTag level={4} className="font-semibold perspective-distant">
            {title}
          </HeadingTag>
          <p className="text-sm text-blueLight">{subtitle}</p>
        </header>

        {step !== "signin" ? (
          <StepProgress current={STEP_INDEX[step]} total={TOTAL_STEPS} />
        ) : null}

        {step === "details" ? (
          <DetailsStep defaultValues={details} onSubmit={handleDetails} />
        ) : null}

        {step === "password" ? (
          <PasswordStep
            pending={pending}
            error={error}
            onSubmit={handlePassword}
          />
        ) : null}

        {step === "verify" && details && registration ? (
          <VerifyStep
            email={details.email}
            phone={details.phone}
            customerId={registration.customerId}
            deviceId={registration.deviceId}
            pending={pending}
            error={error}
            onSubmit={handleVerify}
          />
        ) : null}

        {step === "signin" ? <SignInHandoff /> : null}

        {step !== "signin" ? (
          <p className="text-center text-sm text-blueLightest">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-medium text-accentBlue hover:text-accentBlueHover"
            >
              Sign in
            </Link>
          </p>
        ) : null}
      </div>
    </div>
  )
}

/**
 * Shown when the account was created and verified but the automatic sign-in
 * did not complete. The account is usable — this only asks for credentials.
 */
function SignInHandoff() {
  return (
    <div className="flex flex-col items-center gap-4 text-center">
      <div className="flex size-14 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-400">
        <MdCheckCircle className="size-7" />
      </div>
      <p className="text-sm text-blueLight">
        Your DosshPay account is ready. Sign in to choose your plan and finish
        setting up.
      </p>
      <Button asChild variant="primary" className="w-full">
        <Link href="/login">Continue to sign in</Link>
      </Button>
    </div>
  )
}
