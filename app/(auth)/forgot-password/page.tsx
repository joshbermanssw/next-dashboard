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
  InputGroupInput,
} from "@/components/ui/input-group"
import { Button } from "@/components/ui/button"
import {
  MdArrowBack,
  MdMail,
  MdMarkEmailRead,
  MdSync,
} from "react-icons/md"

const ForgotPasswordSchema = z.object({
  email: z.email({ error: "Please enter a valid email." }).trim(),
})

type ForgotPasswordValues = z.infer<typeof ForgotPasswordSchema>

export default function ForgotPasswordPage() {
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  const {
    register,
    handleSubmit,
    formState: { isValid, errors },
  } = useForm<ForgotPasswordValues>({
    resolver: zodResolver(ForgotPasswordSchema),
    mode: "onChange",
    defaultValues: { email: "" },
  })

  const onSubmit = (values: ForgotPasswordValues) => {
    startTransition(() => {
      // Mocked: pretend to call the BFF.
      return new Promise<void>((resolve) =>
        setTimeout(() => {
          setSubmittedEmail(values.email)
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
        {submittedEmail ? (
          <SuccessState email={submittedEmail} />
        ) : (
          <>
            <header className="space-y-2 text-center">
              <HeadingTag level={4} className="font-semibold perspective-distant">
                Forgot your password?
              </HeadingTag>
              <p className="text-sm text-blueLight">
                Enter the email you signed up with and we&apos;ll send you a
                reset link.
              </p>
            </header>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <Field>
                <FieldLabel
                  htmlFor="email"
                  aria-required="true"
                  className="text-sm font-medium text-blueLight"
                >
                  Email address
                </FieldLabel>
                <InputGroup>
                  <InputGroupAddon>
                    <MdMail />
                  </InputGroupAddon>
                  <InputGroupInput
                    {...register("email")}
                    id="email"
                    type="email"
                    inputMode="email"
                    autoComplete="username"
                    autoCapitalize="none"
                    spellCheck={false}
                    placeholder="you@example.com"
                  />
                </InputGroup>
                <FieldError>{errors.email?.message}</FieldError>
              </Field>

              <Button
                type="submit"
                disabled={!isValid || pending}
                variant="primary"
                className="w-full"
              >
                {pending ? (
                  <>
                    <MdSync className="animate-spin" /> Sending link...
                  </>
                ) : (
                  "Send reset link"
                )}
              </Button>
            </form>

            <BackToSignIn />
          </>
        )}
      </div>
    </div>
  )
}

function SuccessState({ email }: { email: string }) {
  return (
    <>
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="flex size-14 items-center justify-center rounded-full bg-accentBlue/10 text-accentBlue">
          <MdMarkEmailRead className="size-7" />
        </div>
        <HeadingTag level={4} className="font-semibold perspective-distant">
          Check your inbox
        </HeadingTag>
        <p className="text-sm text-blueLight">
          We&apos;ve sent a password reset link to{" "}
          <span className="font-medium text-blueLightest">{email}</span>. The
          link expires in 30 minutes.
        </p>
      </div>

      <p className="text-center text-xs text-blueLight">
        Didn&apos;t get it? Check spam, or{" "}
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="font-medium text-accentBlue hover:text-accentBlueHover"
        >
          send it again
        </button>
        .
      </p>

      <BackToSignIn />
    </>
  )
}

function BackToSignIn() {
  return (
    <Link
      href="/login"
      className="inline-flex items-center justify-center gap-1.5 text-sm font-medium text-accentBlue hover:text-accentBlueHover"
    >
      <MdArrowBack className="size-4" />
      Back to sign in
    </Link>
  )
}
