import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useState, useRef } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { LoginFormSchema, type LoginFormState } from "@/lib/definitions"
import { login, BffError } from "@/api/auth"
import { meQueryOptions } from "@/queries/user"
import Container from "@/components/util/container"
import HeadingTag from "@/components/util/heading-tag"
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@/components/ui/input-group"
import { MdLock, MdMail, MdVisibilityOff, MdVisibility, MdSync } from "react-icons/md"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import type * as z from "zod"

type LoginFormValues = z.infer<typeof LoginFormSchema>

export const Route = createFileRoute("/login")({
  beforeLoad: async ({ context }) => {
    const me = await context.queryClient.ensureQueryData(meQueryOptions)
    if (me) throw redirect({ to: "/" })
  },
  component: LoginPage,
})

function LoginPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [showPassword, setShowPassword] = useState(false)
  const [state, setState] = useState<LoginFormState>(undefined)
  const formRef = useRef<HTMLFormElement>(null)
  const { register, handleSubmit, formState: { isValid }, setValue, watch } = useForm<LoginFormValues>({
    resolver: zodResolver(LoginFormSchema),
    mode: "onChange",
    defaultValues: { email: "", password: "", rememberMe: false },
  })

  const mutation = useMutation({
    mutationFn: login,
    onSuccess: (data) => {
      queryClient.setQueryData(meQueryOptions.queryKey, data.payload.customer)
      setState(undefined)
      navigate({ to: "/" })
    },
    onError: (err) => {
      if (err instanceof BffError) {
        const payload = err.payload as LoginFormState
        setState(payload ?? { message: err.message })
      } else {
        setState({ message: "Unable to connect to authentication service." })
      }
    },
  })

  const onSubmit = (values: LoginFormValues) => {
    mutation.mutate(values)
  }

  const pending = mutation.isPending

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-neutralBlack">
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 z-[0] h-full w-full object-cover"
      >
        <source src="/video/login-bg.webm" type="video/webm" />
      </video>
      <div className="absolute inset-0 z-[1] bg-black/50" />
      <div className="relative z-10">
        <Container className="flex flex-col gap-6 items-center justify-center min-h-screen">
          <FloatingLogo />
          <div
            className="flex flex-col gap-6 rounded-lg bg-blueDarkest px-20 py-14 shadow-xl border border-surfaceCardDark animate-fade-in-up"
            style={{ "--fade-delay": "2.1s" } as React.CSSProperties}
          >
            <HeadingTag level={4} className="text-center font-semibold perspective-distant">
              Welcome Back
            </HeadingTag>
            <p className="text-base text-blueLight">Secure login to access your digital assets</p>
            <form ref={formRef} onSubmit={handleSubmit(onSubmit)} className=" py-8">
              <div className="space-y-2">
                <Field>
                  <FieldLabel htmlFor="email" aria-required="true" className="text-sm font-medium text-blueLight">
                    Email Address
                  </FieldLabel>
                  <InputGroup>
                    <InputGroupAddon><MdMail /></InputGroupAddon>
                    <InputGroupInput {...register("email")} id="email" type="email" placeholder="you@example.com" />
                  </InputGroup>
                  <FieldError>{state?.errors?.email} </FieldError>
                </Field>
              </div>

              <div className="space-y-2 pt-4">
                <Field>
                  <FieldLabel htmlFor="password" aria-required="true" className="text-sm font-medium text-blueLight">
                    Password
                  </FieldLabel>
                  <InputGroup>
                    <InputGroupAddon><MdLock /></InputGroupAddon>
                    <InputGroupInput
                      {...register("password")}
                      id="password"
                      type={showPassword ? "text" : "password"}
                    />
                    <InputGroupButton onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <MdVisibility /> : <MdVisibilityOff />}
                    </InputGroupButton>
                  </InputGroup>
                  <FieldDescription className="flex justify-end">
                    <Button variant="ghost" size="xs" className="text-accentBlue  hover:text-accentBlue">
                      Forgot password?
                    </Button>
                  </FieldDescription>
                  <FieldError>{state?.errors?.password} </FieldError>
                </Field>
              </div>

              <div className="space-y-2">
                <FieldGroup className="gap-3">
                  <Field orientation="horizontal">
                    <Checkbox
                      id="remember-me"
                      checked={watch("rememberMe")}
                      onCheckedChange={(checked) => setValue("rememberMe", !!checked)}
                    />
                    <FieldLabel htmlFor="remember-me">Remember me</FieldLabel>
                  </Field>
                </FieldGroup>
              </div>
              <FieldError>{state?.message} </FieldError>
              <Button type="submit" disabled={!isValid || pending} variant="primary" className="w-full mt-6">
                {pending ? <MdSync className="animate-spin" /> : "Sign In"}
              </Button>
            </form>
            <span className="flex flex-row items-center justify-center gap-2 pt-8 text-sm text-blueLightest">
              Don't have an account?{" "}
              <Button variant="ghost" className="text-accentBlue  hover:text-accentBlue">
                Create an account
              </Button>
            </span>
          </div>
        </Container>
      </div>
    </div>
  )
}

function FloatingLogo() {
  return (
    <div className="fixed flex-col gap-2 top-6 left-6">
      <div className="flex items-center gap-2">
        <img src="/logos/dosh/dosh-d-white.svg" alt="DosshPay Logo" width={20} height={20} className="text-white" />
        <HeadingTag level={6} className="text-center font-semibold perspective-distant">
          Welcome to DosshPay
        </HeadingTag>
      </div>
      <p> Do more with your adaptable DigiWallet</p>
    </div>
  )
}
