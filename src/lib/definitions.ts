import * as z from "zod"

export const LoginFormSchema = z.object({
  rememberMe: z.preprocess((val) => val === "on" || val === true, z.boolean()).optional(),
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

export type SessionPayload = {
  userId: string
  role: string
  expiresAt: Date
}
