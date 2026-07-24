import * as z from "zod"

/**
 * Strips the separators people type into a phone field. The backend wants a
 * bare E.164 string; the placeholder invites "+61 412 345 678".
 */
export function normalizePhone(raw: string): string {
  return raw.replace(/[\s()-]/g, "")
}

const NAME_MAX = 60

const nameField = (label: string) =>
  z
    .string()
    .trim()
    .min(1, { error: `${label} is required.` })
    .max(NAME_MAX, { error: `${label} must be ${NAME_MAX} characters or fewer.` })

export const SignupDetailsSchema = z.object({
  firstName: nameField("First name"),
  lastName: nameField("Last name"),
  // `.trim()` must come BEFORE the email check — chaining it after runs the
  // format test against the raw string, so a pasted " josh@x.com " fails.
  email: z
    .string()
    .trim()
    .pipe(z.email({ error: "Enter a valid email address." })),
  phone: z
    .string()
    .trim()
    .min(1, { error: "Mobile number is required." })
    .refine((v) => /^\+[1-9]\d{7,14}$/.test(normalizePhone(v)), {
      error: "Include your country code, e.g. +61 412 345 678.",
    }),
})

export type SignupDetails = z.infer<typeof SignupDetailsSchema>

/** Mirrors the rule shown under the field: 8+ chars, letters and numbers. */
export const PasswordSchema = z
  .string()
  .min(8, { error: "Use at least 8 characters." })
  .refine((v) => /[a-zA-Z]/.test(v), {
    error: "Include at least one letter.",
  })
  .refine((v) => /\d/.test(v), { error: "Include at least one number." })

export const SignupPasswordSchema = z
  .object({
    password: PasswordSchema,
    confirmPassword: z.string().min(1, { error: "Confirm your password." }),
  })
  .refine((v) => v.password === v.confirmPassword, {
    error: "Passwords do not match.",
    path: ["confirmPassword"],
  })

export type SignupPassword = z.infer<typeof SignupPasswordSchema>

// Backend errors are sometimes safe to surface ("Email already in use") and
// sometimes a leaked stack trace or ORM/DB internal. The dev API has been seen
// returning raw Prisma errors ("Invalid `prisma.customers.create()` invocation:
// Unique constraint failed on the fields: (`email`)") — those must never reach
// a user. Kept here (pure) so it is unit-tested; the server action calls it.
const TECHNICAL_ERROR = /prisma|invocation|constraint|violat/i
// Newline/backtick, C++-style `::`, a stack frame ("at fn ("), or a file:line
// ref (".js:42"). The trailing "(" on the `at` clause keeps prose like
// "try again at a later time" from matching.
const LOOKS_LIKE_TRACE = /[\n`]|::|\bat\s+\S+\s*\(|\.\w+:\d+/

/**
 * Whether an upstream `message` reads like human-facing prose rather than a
 * trace or internal identifier, and is therefore safe to show as-is.
 */
export function isDisplayableUpstreamMessage(
  message: unknown,
): message is string {
  return (
    typeof message === "string" &&
    message.trim().length > 0 &&
    message.length <= 160 &&
    !TECHNICAL_ERROR.test(message) &&
    !LOOKS_LIKE_TRACE.test(message)
  )
}

export const OTP_LENGTH = 6

export const OtpSchema = z.object({
  otp: z
    .string()
    .regex(new RegExp(`^\\d{${OTP_LENGTH}}$`), {
      error: `Enter the ${OTP_LENGTH}-digit code.`,
    }),
})

/** Everything the wizard has gathered by the time it calls registration/init. */
export const RegistrationInitSchema = SignupDetailsSchema.extend({
  password: PasswordSchema,
})

export type RegistrationInit = z.infer<typeof RegistrationInitSchema>

// ── Server-action results ───────────────────────────────────────────────────
// Each action returns a discriminated result rather than throwing, so the
// wizard can keep its collected state and re-render the failing step in place.

export type SignupActionResult<T = Record<string, never>> =
  | ({ ok: true } & T)
  | { ok: false; message: string }

/** `POST /registration/init` — the account exists but is unverified after this. */
export type InitResult = SignupActionResult<{ customerId: string }>

/** `POST /registration/verify` — session cookie is set on success. */
export type VerifyResult = SignupActionResult

/** `POST /otp/resend` — `retryAfter` is only present on a 429. */
export type ResendResult =
  | { ok: true; expiresAt: string }
  | { ok: false; message: string; retryAfter?: string }

/** Availability probe result for the email / phone fields. */
export type AvailabilityResult =
  | { status: "available" }
  | { status: "taken"; message: string }
  /** The probe itself failed — never blocks the user; init is the real gate. */
  | { status: "unknown" }
