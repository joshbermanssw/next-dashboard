"use client"

import * as React from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { MdMail, MdPerson, MdInfoOutline } from "react-icons/md"
import { Button } from "@/components/ui/button"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import { PhoneInput } from "@/components/ui/phone-input"
import { checkEmailAction, checkPhoneAction } from "@/app/actions/signup"
import {
  SignupDetailsSchema,
  type AvailabilityResult,
  type SignupDetails,
} from "@/lib/signup"

const takenMessage = (r: AvailabilityResult | null): string | undefined =>
  r?.status === "taken" ? r.message : undefined

export function DetailsStep({
  defaultValues,
  onSubmit,
}: {
  defaultValues: SignupDetails | null
  onSubmit: (values: SignupDetails) => void
}) {
  const {
    register,
    control,
    handleSubmit,
    getValues,
    formState: { isValid, errors },
  } = useForm<SignupDetails>({
    resolver: zodResolver(SignupDetailsSchema),
    mode: "onChange",
    defaultValues: defaultValues ?? {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
    },
  })

  const [emailStatus, setEmailStatus] = React.useState<AvailabilityResult | null>(
    null,
  )
  const [phoneStatus, setPhoneStatus] = React.useState<AvailabilityResult | null>(
    null,
  )
  const [, startProbe] = React.useTransition()

  /**
   * Probes on blur rather than on every keystroke: the user has finished with
   * the field, so it costs one request instead of one per character and needs
   * no debounce. The verdict is cleared on change (see `register` below), so a
   * result can never outlive the value that produced it.
   */
  const probe = (
    field: "email" | "phone",
    check: (value: string) => Promise<AvailabilityResult>,
    set: (result: AvailabilityResult | null) => void,
  ) => {
    const parsed = SignupDetailsSchema.shape[field].safeParse(getValues(field))
    if (!parsed.success) {
      set(null)
      return
    }
    startProbe(async () => set(await check(parsed.data)))
  }

  const emailTaken = takenMessage(emailStatus)
  const phoneTaken = takenMessage(phoneStatus)

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <Field>
          <FieldLabel
            htmlFor="firstName"
            aria-required="true"
            className="text-sm font-medium text-blueLight"
          >
            First name
          </FieldLabel>
          <InputGroup>
            <InputGroupAddon>
              <MdPerson />
            </InputGroupAddon>
            <InputGroupInput
              {...register("firstName")}
              id="firstName"
              autoComplete="given-name"
              placeholder="Josh"
            />
          </InputGroup>
          <FieldError>{errors.firstName?.message}</FieldError>
        </Field>

        <Field>
          <FieldLabel
            htmlFor="lastName"
            aria-required="true"
            className="text-sm font-medium text-blueLight"
          >
            Last name
          </FieldLabel>
          <InputGroup>
            <InputGroupAddon>
              <MdPerson />
            </InputGroupAddon>
            <InputGroupInput
              {...register("lastName")}
              id="lastName"
              autoComplete="family-name"
              placeholder="Berman"
            />
          </InputGroup>
          <FieldError>{errors.lastName?.message}</FieldError>
        </Field>
      </div>

      <Field>
        <FieldLabel
          htmlFor="email"
          aria-required="true"
          className="text-sm font-medium text-blueLight"
        >
          E-mail
        </FieldLabel>
        <InputGroup>
          <InputGroupAddon>
            <MdMail />
          </InputGroupAddon>
          <InputGroupInput
            {...register("email", {
              onChange: () => setEmailStatus(null),
              onBlur: () => probe("email", checkEmailAction, setEmailStatus),
            })}
            id="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            autoCapitalize="none"
            spellCheck={false}
            placeholder="you@example.com"
          />
        </InputGroup>
        <FieldError>{errors.email?.message ?? emailTaken}</FieldError>
      </Field>

      <Field>
        <FieldLabel
          htmlFor="phone"
          aria-required="true"
          className="text-sm font-medium text-blueLight"
        >
          Mobile number
        </FieldLabel>
        <Controller
          control={control}
          name="phone"
          render={({ field }) => (
            <PhoneInput
              id="phone"
              value={field.value}
              invalid={Boolean(errors.phone) || Boolean(phoneTaken)}
              onChange={(v) => {
                field.onChange(v)
                setPhoneStatus(null)
              }}
              onBlur={() => {
                field.onBlur()
                probe("phone", checkPhoneAction, setPhoneStatus)
              }}
            />
          )}
        />
        {errors.phone?.message || phoneTaken ? (
          <FieldError>{errors.phone?.message ?? phoneTaken}</FieldError>
        ) : (
          <p className="text-xs text-blueLight/70">
            Pick your country code, then enter your number.
          </p>
        )}
      </Field>

      <Button
        type="submit"
        variant="primary"
        className="w-full"
        disabled={!isValid || Boolean(emailTaken) || Boolean(phoneTaken)}
      >
        Continue
      </Button>

      <p className="flex items-start gap-2 text-xs text-blueLight/70">
        <MdInfoOutline className="mt-0.5 size-4 shrink-0" />
        <span>
          By registering, you agree to our Terms of Use and Privacy Policy.
        </span>
      </p>
    </form>
  )
}
