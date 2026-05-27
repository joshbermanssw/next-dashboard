import "server-only"
import { bffFetch } from "@/server/bff/http"
import { services } from "@/server/config/services"
import type { Customer } from "@/lib/definitions"

type LoginUpstreamResponse = {
  customer: Customer
  accessToken: string
  refreshToken?: string
  expiresInSeconds: number
}

export async function upstreamLogin(input: {
  email: string
  password: string
}): Promise<LoginUpstreamResponse> {
  return bffFetch<LoginUpstreamResponse>(
    `${services.auth.baseUrl}/auth/login`,
    {
      method: "POST",
      body: JSON.stringify(input),
    },
  )
}

export async function upstreamLogout(bearer: string): Promise<void> {
  try {
    await bffFetch(`${services.auth.baseUrl}/auth/logout`, {
      method: "POST",
      bearer,
    })
  } catch {
    /* idempotent: backend may already have invalidated the token */
  }
}
