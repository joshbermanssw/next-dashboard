"use client"

import Link from "next/link"
import { useActionState, useState, useRef, useTransition } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { loginAction } from "@/app/actions/auth"
import { LoginFormSchema, type LoginFormState } from "@/lib/definitions"
import HeadingTag from "@/components/util/heading-tag"
import {
  Field,
  FieldError,
  FieldLabel,
} from "@/components/ui/field"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group"
import {
  MdLock,
  MdMail,
  MdVisibility,
  MdVisibilityOff,
  MdSync,
} from "react-icons/md"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import type * as z from "zod"

type LoginFormValues = z.infer<typeof LoginFormSchema>

function LoginForm({
  formAction,
  state,
  pending,
}: {
  formAction: (formData: FormData) => void
  state: LoginFormState
  pending: boolean
}) {
  const [showPassword, setShowPassword] = useState(false)
  const [, startTransition] = useTransition()
  const formRef = useRef<HTMLFormElement>(null)
  const {
    register,
    handleSubmit,
    formState: { isValid },
    setValue,
    watch,
  } = useForm<LoginFormValues>({
    resolver: zodResolver(LoginFormSchema),
    mode: "onChange",
    defaultValues: { email: "", password: "", rememberMe: false },
  })

  const onSubmit = () => {
    if (formRef.current) {
      const formData = new FormData(formRef.current)
      startTransition(() => formAction(formData))
    }
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit(onSubmit)} className="space-y-5">
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
        <FieldError>{state?.errors?.email}</FieldError>
      </Field>

      <Field>
        <div className="flex items-center justify-between">
          <FieldLabel
            htmlFor="password"
            aria-required="true"
            className="text-sm font-medium text-blueLight"
          >
            Password
          </FieldLabel>
          <Link
            href="/forgot-password"
            className="text-xs font-medium text-accentBlue hover:text-accentBlueHover"
          >
            Forgot password?
          </Link>
        </div>
        <InputGroup>
          <InputGroupAddon>
            <MdLock />
          </InputGroupAddon>
          <InputGroupInput
            {...register("password")}
            id="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            placeholder="Enter your password"
          />
          <InputGroupButton
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <MdVisibility /> : <MdVisibilityOff />}
          </InputGroupButton>
        </InputGroup>
        <FieldError>{state?.errors?.password}</FieldError>
      </Field>

      <Field orientation="horizontal">
        <Checkbox
          id="remember-me"
          checked={watch("rememberMe")}
          onCheckedChange={(checked) => setValue("rememberMe", !!checked)}
        />
        <FieldLabel htmlFor="remember-me" className="text-sm text-blueLight">
          Keep me signed in
        </FieldLabel>
      </Field>

      {state?.message ? (
        <p
          role="alert"
          className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >
          {state.message}
        </p>
      ) : null}

      <Button
        type="submit"
        disabled={!isValid || pending}
        variant="primary"
        className="w-full"
      >
        {pending ? (
          <>
            <MdSync className="animate-spin" /> Signing in...
          </>
        ) : (
          "Sign in"
        )}
      </Button>
    </form>
  )
}

export default function LoginPage() {
  const [state, formAction, pending] = useActionState<LoginFormState, FormData>(
    loginAction,
    undefined,
  )

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center">
      <div
        className="flex flex-col gap-7 rounded-xl border border-surfaceCardDark bg-blueDarkest px-8 py-10 shadow-2xl animate-fade-in-up sm:px-10 sm:py-12"
        style={{ "--fade-delay": "2.1s" } as React.CSSProperties}
      >
        <header className="space-y-2 text-center">
          <HeadingTag
            level={4}
            className="font-semibold perspective-distant"
          >
            Welcome back
          </HeadingTag>
          <p className="text-sm text-blueLight">
            Secure login to access your digital assets
          </p>
        </header>

        <LoginForm formAction={formAction} state={state} pending={pending} />

        <p className="text-center text-sm text-blueLightest">
          Don&apos;t have an account?{" "}
          <Link
            href="/signup"
            className="font-medium text-accentBlue hover:text-accentBlueHover"
          >
            Create an account
          </Link>
        </p>
      </div>
    </div>
  )
}
