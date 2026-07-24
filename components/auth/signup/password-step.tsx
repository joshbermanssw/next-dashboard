"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { MdLock, MdSync, MdVisibility, MdVisibilityOff } from "react-icons/md"
import { Button } from "@/components/ui/button"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group"
import { SignupPasswordSchema, type SignupPassword } from "@/lib/signup"

export function PasswordStep({
  pending,
  error,
  onSubmit,
}: {
  pending: boolean
  error: string | null
  onSubmit: (password: string) => void
}) {
  const [showPassword, setShowPassword] = React.useState(false)
  const [showConfirm, setShowConfirm] = React.useState(false)
  const {
    register,
    handleSubmit,
    formState: { isValid, errors },
  } = useForm<SignupPassword>({
    resolver: zodResolver(SignupPasswordSchema),
    mode: "onChange",
    defaultValues: { password: "", confirmPassword: "" },
  })

  return (
    <form
      onSubmit={handleSubmit((values) => onSubmit(values.password))}
      className="space-y-5"
    >
      <Field>
        <FieldLabel
          htmlFor="password"
          aria-required="true"
          className="text-sm font-medium text-blueLight"
        >
          Password
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
            placeholder="Create a password"
          />
          <InputGroupButton
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <MdVisibility /> : <MdVisibilityOff />}
          </InputGroupButton>
        </InputGroup>
        {errors.password?.message ? (
          <FieldError>{errors.password.message}</FieldError>
        ) : (
          <p className="text-xs text-blueLight/70">
            At least 8 characters, including letters and numbers.
          </p>
        )}
      </Field>

      <Field>
        <FieldLabel
          htmlFor="confirmPassword"
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
            {...register("confirmPassword")}
            id="confirmPassword"
            type={showConfirm ? "text" : "password"}
            autoComplete="new-password"
            placeholder="Re-enter your password"
          />
          <InputGroupButton
            onClick={() => setShowConfirm(!showConfirm)}
            aria-label={showConfirm ? "Hide password" : "Show password"}
          >
            {showConfirm ? <MdVisibility /> : <MdVisibilityOff />}
          </InputGroupButton>
        </InputGroup>
        <FieldError>{errors.confirmPassword?.message}</FieldError>
      </Field>

      {error ? (
        <p
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
        disabled={!isValid || pending}
      >
        {pending ? (
          <>
            <MdSync className="animate-spin" /> Creating account...
          </>
        ) : (
          "Continue"
        )}
      </Button>
    </form>
  )
}
