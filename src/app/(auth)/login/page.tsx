"use client"

import { useActionState, useState } from "react"
import { login } from "@/actions/auth"
import type { LoginFormState } from "@/lib/definitions"
import Container from "@/components/util/container"
import HeadingTag from "@/components/util/heading-tag"
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@/components/ui/input-group"
import { MdLock, MdMail, MdVisibilityOff, MdVisibility, MdSync } from "react-icons/md";
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"

const LoginForm = ({ formAction, state, pending }: { formAction: any, state: LoginFormState, pending: boolean }) => {
  const [showPassword, setShowPassword] = useState(false)
  return (
    <form action={formAction} className="space-y-8 pt-8">
      <div className="space-y-2">
        <Field>
          <FieldLabel htmlFor="email" aria-required="true" className="text-sm font-medium text-blueLight">Email Address</FieldLabel>
          <InputGroup>
          <InputGroupAddon><MdMail /></InputGroupAddon>
          <InputGroupInput id="email" name="email" type="email" required placeholder="you@example.com" />
          </InputGroup>
          <FieldError>{state?.errors?.email} </FieldError>
        </Field>
    </div>

      <div className="space-y-2">
        <Field>
          <FieldLabel htmlFor="password" aria-required="true" className="text-sm font-medium text-blueLight">Password</FieldLabel>
          <InputGroup>
          <InputGroupAddon><MdLock /></InputGroupAddon>
          <InputGroupInput id="password" name="password" type={showPassword ? "text" : "password"} required />
          <InputGroupButton onClick={() => setShowPassword(!showPassword)}>{showPassword ? <MdVisibility /> : <MdVisibilityOff />}</InputGroupButton>
          </InputGroup>
          <FieldError>{state?.errors?.password} </FieldError>
        </Field>
      </div>

      <div className="space-y-2">
        <FieldGroup className="gap-3">
          <Field orientation="horizontal">
            <Checkbox id="remember-me" />
            <FieldLabel
              htmlFor="remember-me"
              defaultChecked
            >
              Remember me
            </FieldLabel>
          </Field>
          </FieldGroup>
      </div>
      <FieldError>{state?.message} </FieldError>
      <Button
        type="submit"
        disabled={pending}
        variant="primary"
        className="w-full"
      >
        {pending ? <MdSync className="animate-spin" /> : "Sign In"}
      </Button>
    </form>
  )
}

export default function LoginPage() {
  const [state, formAction, pending] = useActionState<LoginFormState, FormData>(
    login,
    undefined
  )

  return (
    <Container className='flex flex-col gap-6 items-center justify-center min-h-screen'>
      <div className="text-center space-y-2">
        <HeadingTag level={1} className="flex items-center">{'{{}  DosshPay  {\\}}'}</HeadingTag>
      </div>
      <div className="rounded-lg bg-blueDarkest px-20 py-14 shadow-xl border border-surfaceCardDark">
        <HeadingTag level={4} className="text-center">Welcome Back</HeadingTag>
        <p className="text-base text-blueLight"> Secure login to access your digital assets</p>
        <LoginForm formAction={formAction} state={state} pending={pending} />
        <span className="flex flex-row items-center justify-center gap-2 pt-8 text-sm text-blueLightest"> Don't have an account? <Button variant="ghost" className="text-accentBlue  hover:text-accentBlue">Create an account</Button></span>
      </div>
    </Container>
  )
}

