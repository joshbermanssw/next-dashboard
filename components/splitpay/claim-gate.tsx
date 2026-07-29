"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { KeyRoundIcon } from "lucide-react"

import { resolveContributorAction } from "@/app/actions/splitpay"
import { PublicField } from "@/components/splitpay/form-fields"
import { Input } from "@/components/ui/input"

/**
 * Fallback for reaching the manage page without the emailed link — no `?c=`
 * token, or one that no longer resolves.
 *
 * Asks for the access code *and* the name the contribution was recorded under.
 * The roster is deliberately not offered as a picker: a stranger who has only
 * the code should learn nothing about who else is in the session.
 */
export function ClaimGate({ sessionId }: { sessionId: string }) {
  const router = useRouter()
  const [pending, startTransition] = React.useTransition()
  const [errors, setErrors] = React.useState<Record<string, string>>({})
  const [message, setMessage] = React.useState<string | null>(null)
  const [code, setCode] = React.useState("")
  const [name, setName] = React.useState("")

  function submit(event: React.FormEvent) {
    event.preventDefault()
    setErrors({})
    setMessage(null)
    startTransition(async () => {
      const result = await resolveContributorAction({ sessionId, code, name })
      if (!result.ok) {
        setErrors(result.errors ?? {})
        setMessage(result.errors ? null : result.message)
        return
      }
      router.replace(`/sp/${sessionId}/manage?c=${result.value.token}`)
    })
  }

  return (
    <form
      onSubmit={submit}
      noValidate
      className="flex flex-col gap-4 rounded-2xl border border-panel-border bg-white/[0.03] p-5"
    >
      <div className="flex flex-col items-center gap-2 pb-1 text-center">
        <span className="grid size-10 place-items-center rounded-full bg-accentBlue/15 text-accentBlue">
          <KeyRoundIcon className="size-4" />
        </span>
        <p className="text-base font-semibold text-foreground">
          Find your contribution
        </p>
        <p className="text-xs leading-relaxed text-muted-foreground">
          Enter the code from your invite email and the name you contributed
          under.
        </p>
      </div>

      <PublicField label="Verification Code" required htmlFor="cg-code" error={errors.code}>
        <Input
          id="cg-code"
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
          inputMode="numeric"
          autoComplete="one-time-code"
          placeholder="Enter 6-digit code"
          aria-invalid={Boolean(errors.code)}
          className="text-center tracking-[0.4em] placeholder:tracking-normal"
        />
      </PublicField>

      <PublicField label="Your Name" required htmlFor="cg-name" error={errors.name}>
        <Input
          id="cg-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoComplete="name"
          aria-invalid={Boolean(errors.name)}
        />
      </PublicField>

      {message ? (
        <p role="alert" className="text-xs text-negative">
          {message}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-xl bg-accentBlue px-4 py-3 text-sm font-bold text-blue transition-colors hover:bg-accentBlueHover disabled:opacity-60"
      >
        {pending ? "Checking…" : "Continue"}
      </button>
    </form>
  )
}
