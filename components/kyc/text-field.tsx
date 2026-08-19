"use client"

import * as React from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type TextFieldProps = {
  label: string
  value: string
  onChange: (value: string) => void
  type?: React.HTMLInputTypeAttribute
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"]
  placeholder?: string
  autoComplete?: string
  maxLength?: number
  /** Shown under the field and marks the input invalid. */
  error?: string | null
  hint?: string
}

/** Label + input + message, in the spacing the identity steps use throughout. */
export function TextField({
  label,
  value,
  onChange,
  type = "text",
  inputMode,
  placeholder,
  autoComplete,
  maxLength,
  error,
  hint,
}: TextFieldProps) {
  const id = React.useId()

  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id} className="text-blueLightest">
        {label}
      </Label>
      <Input
        id={id}
        type={type}
        inputMode={inputMode}
        value={value}
        placeholder={placeholder}
        autoComplete={autoComplete}
        maxLength={maxLength}
        aria-invalid={error ? true : undefined}
        onChange={(event) => onChange(event.target.value)}
      />
      {error ? (
        <p className="text-sm text-destructive">{error}</p>
      ) : hint ? (
        <p className="text-sm text-blueLight/70">{hint}</p>
      ) : null}
    </div>
  )
}
