import * as z from "zod"

export const LoginFormSchema = z.object({
  rememberMe: z.boolean().optional(),
  email: z.email({ error: "Please enter a valid email." }).trim(),
  password: z
    .string()
    .min(1, { error: "Password is required." })
    .trim(),
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

export type SessionPayload = {
  userId: string
  accessToken: string
  refreshToken: string
  customer: Customer
  expiresAt: Date
}
