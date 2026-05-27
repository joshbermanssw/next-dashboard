"use client"

import Link from "next/link"
import { useState, useTransition } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import HeadingTag from "@/components/util/heading-tag"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  MdCheckCircle,
  MdLock,
  MdSync,
  MdVisibility,
  MdVisibilityOff,
} from "react-icons/md"

const ResetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, { error: "Use at least 8 characters." })
      .regex(/[A-Z]/, { error: "Add an uppercase letter." })
      .regex(/[0-9]/, { error: "Add a number." }),
    confirm: z.string(),
  })
  .refine((data) => data.password === data.confirm, {
    path: ["confirm"],
    message: "Passwords don't match.",
  })

type ResetPasswordValues = z.infer<typeof ResetPasswordSchema>

export default function ResetPasswordPage() {
  const [done, setDone] = useState(false)
  const [pending, startTransition] = useTransition()
  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    formState: { isValid, errors },
  } = useForm<ResetPasswordValues>({
    resolver: zodResolver(ResetPasswordSchema),
    mode: "onChange",
    defaultValues: { password: "", confirm: "" },
  })

  const passwordValue = watch("password")

  const onSubmit = () => {
    startTransition(() => {
      return new Promise<void>((resolve) =>
        setTimeout(() => {
          setDone(true)
          resolve()
        }, 1200),
      )
    })
  }

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center">
      <div
        className="flex flex-col gap-7 rounded-xl border border-surfaceCardDark bg-blueDarkest px-8 py-10 shadow-2xl animate-fade-in-up sm:px-10 sm:py-12"
        style={{ "--fade-delay": "0.2s" } as React.CSSProperties}
      >
        {done ? (
          <SuccessState />
        ) : (
          <>
            <header className="space-y-2 text-center">
              <HeadingTag level={4} className="font-semibold perspective-distant">
                Set a new password
              </HeadingTag>
              <p className="text-sm text-blueLight">
                Choose something you haven&apos;t used here before. We&apos;ll
                sign you in after.
              </p>
            </header>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <Field>
                <FieldLabel
                  htmlFor="password"
                  aria-required="true"
                  className="text-sm font-medium text-blueLight"
                >
                  New password
                </FieldLabel>
                <InputGroup>
                  <InputGroupAddon>
                    <MdLock />
                  </InputGroupAddon>
                  <InputGroupInput
                    {...register("password")}
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="At least 8 characters"
                  />
                  <InputGroupButton
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? <MdVisibility /> : <MdVisibilityOff />}
                  </InputGroupButton>
                </InputGroup>
                <FieldError>{errors.password?.message}</FieldError>
                <StrengthMeter value={passwordValue} />
              </Field>

              <Field>
                <FieldLabel
                  htmlFor="confirm"
                  aria-required="true"
                  className="text-sm font-medium text-blueLight"
                >
                  Confirm password
                </FieldLabel>
                <InputGroup>
                  <InputGroupAddon>
                    <MdLock />
                  </InputGroupAddon>
                  <InputGroupInput
                    {...register("confirm")}
                    id="confirm"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="Type it again"
                  />
                </InputGroup>
                <FieldError>{errors.confirm?.message}</FieldError>
              </Field>

              <Button
                type="submit"
                disabled={!isValid || pending}
                variant="primary"
                className="w-full"
              >
                {pending ? (
                  <>
                    <MdSync className="animate-spin" /> Updating...
                  </>
                ) : (
                  "Update password"
                )}
              </Button>
            </form>

            <Link
              href="/login"
              className="text-center text-sm font-medium text-accentBlue hover:text-accentBlueHover"
            >
              Back to sign in
            </Link>
          </>
        )}
      </div>
    </div>
  )
}

function StrengthMeter({ value }: { value: string }) {
  const score = scorePassword(value)
  const labels = ["Too weak", "Weak", "Decent", "Strong", "Excellent"]
  const colors = [
    "bg-destructive",
    "bg-destructive/80",
    "bg-yellow-500",
    "bg-accentBlue",
    "bg-emerald-400",
  ]

  return (
    <div className="space-y-1.5 pt-1" aria-hidden={!value}>
      <div className="flex gap-1">
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            className={cn(
              "h-1 flex-1 rounded-full bg-white/10 transition-colors",
              i < score && colors[score],
            )}
          />
        ))}
      </div>
      {value ? (
        <p className="text-xs text-blueLight">{labels[score]}</p>
      ) : null}
    </div>
  )
}

function scorePassword(value: string): number {
  if (!value) return 0
  let score = 0
  if (value.length >= 8) score++
  if (/[A-Z]/.test(value) && /[a-z]/.test(value)) score++
  if (/[0-9]/.test(value)) score++
  if (/[^A-Za-z0-9]/.test(value) && value.length >= 12) score++
  return Math.min(score, 4)
}

function SuccessState() {
  return (
    <>
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="flex size-14 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-400">
          <MdCheckCircle className="size-7" />
        </div>
        <HeadingTag level={4} className="font-semibold perspective-distant">
          Password updated
        </HeadingTag>
        <p className="text-sm text-blueLight">
          Your password has been changed. You can use it to sign in now.
        </p>
      </div>
      <Button asChild variant="primary" className="w-full">
        <Link href="/login">Continue to sign in</Link>
      </Button>
    </>
  )
}
