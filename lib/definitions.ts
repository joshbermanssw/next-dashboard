import * as z from "zod"

export const LoginFormSchema = z.object({
  rememberMe: z.boolean().optional(),
  email: z.email({ error: "Please enter a valid email." }).trim(),
  password: z.string().min(1, { error: "Password is required." }).trim(),
})

export type LoginFormState =
  | {
      errors?: {
        email?: string[]
        password?: string[]
        rememberMe?: string[]
      }
      message?: string
    }
  | undefined

export type Customer = {
  id: string
  email: string
  firstName: string
  lastName: string
  phone: string
  isActive: boolean
}

export type AccountType = "everyday" | "corporate"

const CustomerDataSchema = z.object({
  accounts: z
    .object({ id: z.string(), accountType: z.string().nullish() })
    .nullish(),
})

export function extractAccountId(data: unknown): string | undefined {
  const parsed = CustomerDataSchema.safeParse(data)
  if (!parsed.success) return undefined
  const id = parsed.data.accounts?.id
  return id && id.length > 0 ? id : undefined
}

// Maps an account's raw type to a catalogue path segment. The backend may store
// it as "corporate"/"business"/"CORPORATE" etc.; anything not clearly corporate
// (including null) falls back to "everyday" — the consumer default.
export function normalizeAccountType(raw: unknown): AccountType {
  const s = typeof raw === "string" ? raw.trim().toLowerCase() : ""
  return s.includes("corp") || s.includes("business") ? "corporate" : "everyday"
}

export function extractAccountType(data: unknown): AccountType | undefined {
  const parsed = CustomerDataSchema.safeParse(data)
  if (!parsed.success) return undefined
  const raw = parsed.data.accounts?.accountType
  return raw == null ? undefined : normalizeAccountType(raw)
}
