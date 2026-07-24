"use client"

import * as React from "react"
import { MdSync } from "react-icons/md"
import { Button } from "@/components/ui/button"
import { OtpInput } from "@/components/ui/otp-input"
import { resendOtpAction } from "@/app/actions/signup"
import { OTP_LENGTH } from "@/lib/signup"

/** Seconds the Resend link stays disabled after a successful send. */
const RESEND_COOLDOWN_S = 30

function useCountdown(): [number, (seconds: number) => void] {
  const [remaining, setRemaining] = React.useState(0)

  React.useEffect(() => {
    if (remaining <= 0) return
    const timer = setTimeout(() => setRemaining((s) => s - 1), 1000)
    return () => clearTimeout(timer)
  }, [remaining])

  return [remaining, setRemaining]
}

export function VerifyStep({
  email,
  phone,
  customerId,
  deviceId,
  pending,
  error,
  onSubmit,
}: {
  email: string
  phone: string
  customerId: string
  deviceId: string
  pending: boolean
  error: string | null
  onSubmit: (otp: string) => void
}) {
  const [otp, setOtp] = React.useState("")
  const [cooldown, setCooldown] = useCountdown()
  const [resending, startResend] = React.useTransition()
  const [notice, setNotice] = React.useState<string | null>(null)

  const complete = otp.length === OTP_LENGTH

  const handleResend = () => {
    setNotice(null)
    startResend(async () => {
      const result = await resendOtpAction({ customerId, email, phone, deviceId })
      if (result.ok) {
        setOtp("")
        setCooldown(RESEND_COOLDOWN_S)
        setNotice(`A new code is on its way to ${email}.`)
        return
      }
      // A 429 means the backend is still rate-limiting us; reflect that in the
      // link rather than letting the customer hammer it.
      if (result.retryAfter) setCooldown(RESEND_COOLDOWN_S)
      setNotice(result.message)
    })
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        if (complete) onSubmit(otp)
      }}
      className="space-y-5"
    >
      <p className="text-sm text-blueLight">
        Enter the code sent to{" "}
        <span className="font-medium text-blueLightest">{email}</span>
      </p>

      <OtpInput
        value={otp}
        onChange={setOtp}
        length={OTP_LENGTH}
        autoFocus
        invalid={Boolean(error)}
        label="Verification code"
        aria-describedby={error ? "otp-error" : undefined}
      />

      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={handleResend}
          disabled={cooldown > 0 || resending || pending}
          className="text-sm font-medium text-accentBlue transition-colors hover:text-accentBlueHover disabled:text-blueLight/40"
        >
          {cooldown > 0 ? `Resend code in ${cooldown}s` : "Resend code"}
        </button>
      </div>

      {notice ? (
        <p role="status" className="text-xs text-blueLight/70">
          {notice}
        </p>
      ) : null}

      {error ? (
        <p
          id="otp-error"
          role="alert"
          className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >
          {error}
        </p>
      ) : null}

      <Button
        type="submit"
        variant="primary"
        className="w-full"
        disabled={!complete || pending}
      >
        {pending ? (
          <>
            <MdSync className="animate-spin" /> Verifying...
          </>
        ) : (
          "Continue"
        )}
      </Button>
    </form>
  )
}
