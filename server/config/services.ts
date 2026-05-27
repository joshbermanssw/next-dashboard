import "server-only"

function required(name: string): string {
  const value = process.env[name]
  if (!value) throw new Error(`Missing required env var: ${name}`)
  return value
}

export const services = {
  auth: { baseUrl: required("MS_AUTH_BASE_URL") },
  accounts: { baseUrl: process.env.MS_ACCOUNTS_BASE_URL ?? required("MS_AUTH_BASE_URL") },
} as const

export type ServiceName = keyof typeof services
