import "server-only"
import { bffFetch } from "@/server/bff/http"
import { services } from "@/server/config/services"
import type { Customer } from "@/lib/definitions"

// Internal shape consumed by the login action.
type LoginUpstreamResponse = {
  customer: Customer
  accessToken: string
  refreshToken?: string
  expiresInSeconds: number
}

// Wire shape returned by the backend: data nested under `data`, expiry as `expiresIn`.
type LoginWireResponse = {
  success: boolean
  data: {
    accessToken: string
    refreshToken?: string
    expiresIn: number
    tokenType: string
    customer: Customer
  }
}

export async function upstreamLogin(input: {
  email: string
  password: string
}): Promise<LoginUpstreamResponse> {
  const res = await bffFetch<LoginWireResponse>(
    `${services.auth.baseUrl}/auth/login`,
    {
      method: "POST",
      // Backend expects `identifier`, not `email`.
      body: JSON.stringify({
        identifier: input.email,
        password: input.password,
      }),
    },
  )
  const { customer, accessToken, refreshToken, expiresIn } = res.data
  return { customer, accessToken, refreshToken, expiresInSeconds: expiresIn }
}

// Internal shape consumed by the refresh flow.
type RefreshUpstreamResult = {
  accessToken: string
  refreshToken: string
  expiresInSeconds: number
}

// Wire shape: same `{ success, data }` envelope as login, but tokens only — no
// `customer`. The refresh token is single-use and rotated on every call; the new
// one MUST replace the stored token (reuse → 403).
type RefreshWireResponse = {
  success: boolean
  data: {
    accessToken: string
    refreshToken: string
    expiresIn: number
    tokenType: string
  }
}

export async function upstreamRefresh(
  refreshToken: string,
): Promise<RefreshUpstreamResult> {
  const res = await bffFetch<RefreshWireResponse>(
    `${services.auth.baseUrl}/auth/refresh`,
    {
      method: "POST",
      body: JSON.stringify({ refreshToken }),
    },
  )
  const { accessToken, refreshToken: rotated, expiresIn } = res.data
  return { accessToken, refreshToken: rotated, expiresInSeconds: expiresIn }
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
