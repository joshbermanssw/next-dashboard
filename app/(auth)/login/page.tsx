"use client"

import Link from "next/link"
import { useActionState, useState, useRef, useTransition, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { QRCodeSVG } from "qrcode.react"
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
  MdClose,
} from "react-icons/md"
import { FaApple, FaGooglePlay } from "react-icons/fa"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"
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
          name="rememberMe"
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
  const dialogRef = useRef<HTMLDialogElement>(null)
  const openSignup = () => dialogRef.current?.showModal()
  const closeSignup = () => dialogRef.current?.close()
  const firstVisit = useFirstVisitThisSession()

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center">
      <div
        suppressHydrationWarning
        className={cn(
          "flex flex-col gap-7 rounded-xl border border-surfaceCardDark bg-blueDarkest px-8 py-10 shadow-2xl sm:px-10 sm:py-12",
          firstVisit && "animate-fade-in-up",
        )}
        style={
          firstVisit
            ? ({ "--fade-delay": "2.1s" } as React.CSSProperties)
            : undefined
        }
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
          <button
            type="button"
            onClick={openSignup}
            className="font-medium text-accentBlue hover:text-accentBlueHover cursor-pointer"
          >
            Create an account
          </button>
        </p>
      </div>

      <SignupDialog ref={dialogRef} onClose={closeSignup} />
    </div>
  )
}

const VISITED_KEY = "dosh_login_visited"

function useFirstVisitThisSession(): boolean {
  // Lazy initializer: read sessionStorage synchronously on first client
  // render. Static prerender returns true (matches the cold-open case
  // baked into HTML). After client-side navigation back to this page,
  // the initializer re-runs and returns false.
  const [first] = useState(() => {
    if (typeof window === "undefined") return true
    return sessionStorage.getItem(VISITED_KEY) !== "1"
  })

  useEffect(() => {
    if (first) sessionStorage.setItem(VISITED_KEY, "1")
  }, [first])

  return first
}

const DOWNLOAD_URL = "https://dosh-hub.vercel.app/download"
const APP_STORE_URL = "https://apps.apple.com/app/dosshpay"
const PLAY_STORE_URL = "https://play.google.com/store/apps/details?id=com.dosshpay"

function SignupDialog({
  ref,
  onClose,
}: {
  ref: React.RefObject<HTMLDialogElement | null>
  onClose: () => void
}) {
  // Click-outside-to-close on the native dialog backdrop.
  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    const handleClick = (e: MouseEvent) => {
      if (e.target === dialog) onClose()
    }
    dialog.addEventListener("click", handleClick)
    return () => dialog.removeEventListener("click", handleClick)
  }, [ref, onClose])

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      className="m-auto w-full max-w-sm rounded-2xl border border-surfaceCardDark bg-blueDarkest p-0 text-blueLightest shadow-2xl backdrop:bg-black/70 backdrop:backdrop-blur-sm open:animate-fade-in-up"
    >
      <div className="relative flex flex-col gap-6 px-8 py-10">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 inline-flex size-8 items-center justify-center rounded-full text-blueLight transition-colors hover:bg-white/10 hover:text-blueLightest cursor-pointer"
        >
          <MdClose className="size-5" />
        </button>

        <header className="space-y-2 text-center">
          <HeadingTag level={5} className="font-semibold perspective-distant">
            Sign up in the app
          </HeadingTag>
          <p className="text-sm text-blueLight">
            DosshPay accounts are created on mobile. Scan the QR code or grab
            the app from your store.
          </p>
        </header>

        <div className="mx-auto rounded-xl bg-blueLightest p-4 shadow-inner">
          <QRCodeSVG
            value={DOWNLOAD_URL}
            size={176}
            level="M"
            bgColor="#F5F7FF"
            fgColor="#00032E"
            marginSize={0}
          />
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <StoreButton
            href={APP_STORE_URL}
            icon={<FaApple className="size-5" />}
            label="Download on the"
            store="App Store"
          />
          <StoreButton
            href={PLAY_STORE_URL}
            icon={<FaGooglePlay className="size-[1.05rem]" />}
            label="Get it on"
            store="Google Play"
          />
        </div>

        <p className="text-center text-xs text-blueLight/70">
          Already signed up?{" "}
          <button
            type="button"
            onClick={onClose}
            className="font-medium text-accentBlue hover:text-accentBlueHover cursor-pointer"
          >
            Sign in instead
          </button>
        </p>
      </div>
    </dialog>
  )
}

function StoreButton({
  href,
  icon,
  label,
  store,
}: {
  href: string
  icon: React.ReactNode
  label: string
  store: string
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer noopener"
      className="flex flex-1 items-center justify-center gap-3 rounded-lg border border-white/15 bg-black/40 px-4 py-2.5 text-blueLightest transition-colors hover:border-accentBlue/50 hover:bg-black/60"
    >
      <span className="text-blueLightest">{icon}</span>
      <span className="flex flex-col items-start leading-tight">
        <span className="text-[10px] uppercase tracking-wider text-blueLight">
          {label}
        </span>
        <span className="text-sm font-semibold">{store}</span>
      </span>
    </a>
  )
}
