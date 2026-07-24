"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

type OtpInputProps = {
  value: string
  onChange: (value: string) => void
  length?: number
  disabled?: boolean
  invalid?: boolean
  autoFocus?: boolean
  /** Labels the group for assistive tech, e.g. "Verification code". */
  label: string
  /** Ties the group to a description element (hint or error text). */
  "aria-describedby"?: string
}

const DIGITS_ONLY = /\D/g

/**
 * Segmented one-time-code input.
 *
 * Rendered as one single-character input per digit so browser and password-manager
 * autofill still work, and so each box is individually focusable. The boxes are
 * wrapped in a labelled group, which is what a screen reader announces — the
 * per-box labels are positional ("Digit 3 of 6") rather than repeating the
 * group's purpose.
 */
export function OtpInput({
  value,
  onChange,
  length = 6,
  disabled,
  invalid,
  autoFocus,
  label,
  "aria-describedby": describedBy,
}: OtpInputProps) {
  const refs = React.useRef<Array<HTMLInputElement | null>>([])
  const digits = React.useMemo(
    () => Array.from({ length }, (_, i) => value[i] ?? ""),
    [value, length],
  )

  const focusBox = (index: number) => {
    const clamped = Math.max(0, Math.min(length - 1, index))
    refs.current[clamped]?.focus()
    refs.current[clamped]?.select()
  }

  const writeAt = (index: number, digit: string) => {
    const next = digits.slice()
    next[index] = digit
    // Trailing empties would make "12__56" round-trip as a 6-char string with
    // holes; trimming keeps `value.length` an honest count of entered digits.
    onChange(next.join("").replace(/\s/g, "").slice(0, length))
  }

  const handleChange = (index: number, raw: string) => {
    const cleaned = raw.replace(DIGITS_ONLY, "")
    if (cleaned.length === 0) {
      writeAt(index, "")
      return
    }
    // Typing over a filled box yields two characters — keep the new one.
    const digit = cleaned[cleaned.length - 1]
    writeAt(index, digit)
    if (index < length - 1) focusBox(index + 1)
  }

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === "Backspace") {
      if (digits[index]) {
        writeAt(index, "")
        return
      }
      // Already empty: step back and clear the previous box in one press, which
      // is what people expect when correcting a code.
      e.preventDefault()
      if (index > 0) {
        writeAt(index - 1, "")
        focusBox(index - 1)
      }
      return
    }
    if (e.key === "ArrowLeft") {
      e.preventDefault()
      focusBox(index - 1)
    }
    if (e.key === "ArrowRight") {
      e.preventDefault()
      focusBox(index + 1)
    }
  }

  const handlePaste = (index: number, e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData("text").replace(DIGITS_ONLY, "")
    if (!pasted) return
    e.preventDefault()
    // Pasting a whole code anywhere fills from that box onward.
    const next = digits.slice()
    for (let i = 0; i < pasted.length && index + i < length; i++) {
      next[index + i] = pasted[i]
    }
    onChange(next.join("").slice(0, length))
    focusBox(index + pasted.length)
  }

  return (
    <div
      role="group"
      aria-label={label}
      aria-describedby={describedBy}
      className="flex gap-2 sm:gap-3"
    >
      {digits.map((digit, i) => (
        <input
          key={i}
          ref={(el) => {
            refs.current[i] = el
          }}
          value={digit}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={(e) => handlePaste(i, e)}
          onFocus={(e) => e.target.select()}
          disabled={disabled}
          autoFocus={autoFocus && i === 0}
          inputMode="numeric"
          // `one-time-code` lets iOS/macOS offer the emailed code above the keyboard.
          autoComplete={i === 0 ? "one-time-code" : "off"}
          aria-label={`Digit ${i + 1} of ${length}`}
          aria-invalid={invalid || undefined}
          maxLength={2}
          className={cn(
            "h-14 w-full min-w-0 rounded-xl border bg-white/5 text-center text-xl font-semibold text-blueLightest",
            "transition-colors focus-visible:outline-none disabled:opacity-50",
            invalid
              ? "border-destructive focus-visible:border-destructive"
              : "border-panel-border focus-visible:border-accentBlue",
          )}
        />
      ))}
    </div>
  )
}
