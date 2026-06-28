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

const CustomerDataSchema = z.object({
  accounts: z.object({ id: z.string() }).nullish(),
})

export function extractAccountId(data: unknown): string | undefined {
  const parsed = CustomerDataSchema.safeParse(data)
  if (!parsed.success) return undefined
  const id = parsed.data.accounts?.id
  return id && id.length > 0 ? id : undefined
}
