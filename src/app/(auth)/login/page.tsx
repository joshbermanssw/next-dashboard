"use client"

import { useActionState, useState, useRef } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { login } from "@/actions/auth"
import { LoginFormSchema, type LoginFormState } from "@/lib/definitions"
import Container from "@/components/util/container"
import HeadingTag from "@/components/util/heading-tag"
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@/components/ui/input-group"
import { MdLock, MdMail, MdVisibilityOff, MdVisibility, MdSync } from "react-icons/md";
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import type * as z from "zod"

type LoginFormValues = z.infer<typeof LoginFormSchema>

const LoginForm = ({ formAction, state, pending }: { formAction: any, state: LoginFormState, pending: boolean }) => {
  const [showPassword, setShowPassword] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)
  const { register, handleSubmit, formState: { isValid }, setValue, watch } = useForm<LoginFormValues>({
    resolver: zodResolver(LoginFormSchema),
    mode: "onChange",
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  })

  const onSubmit = () => {
    if (formRef.current) {
      const formData = new FormData(formRef.current)
      formAction(formData)
    }
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit(onSubmit)} className=" py-8">
      <div className="space-y-2">
        <Field>
          <FieldLabel htmlFor="email" aria-required="true" className="text-sm font-medium text-blueLight">Email Address</FieldLabel>
          <InputGroup>
            <InputGroupAddon><MdMail /></InputGroupAddon>
            <InputGroupInput {...register("email")} id="email" type="email" placeholder="you@example.com" />
          </InputGroup>
          <FieldError>{state?.errors?.email} </FieldError>
        </Field>
      </div>

      <div className="space-y-2 pt-4">
        <Field>
          <FieldLabel htmlFor="password" aria-required="true" className="text-sm font-medium text-blueLight">Password</FieldLabel>
          <InputGroup>
            <InputGroupAddon><MdLock /></InputGroupAddon>
            <InputGroupInput {...register("password")} id="password" type={showPassword ? "text" : "password"} />
            <InputGroupButton onClick={() => setShowPassword(!showPassword)}>{showPassword ? <MdVisibility /> : <MdVisibilityOff />}</InputGroupButton>
          </InputGroup>
          <FieldDescription className='flex justify-end'><Button variant="ghost" size='xs' className="text-accentBlue  hover:text-accentBlue">Forgot password?</Button></FieldDescription>
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
            <FieldLabel htmlFor="remember-me">
              Remember me
            </FieldLabel>
          </Field>
        </FieldGroup>
      </div>
      <FieldError>{state?.message} </FieldError>
      <Button
        type="submit"
        disabled={!isValid || pending}
        variant="primary"
        className="w-full mt-6"
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
