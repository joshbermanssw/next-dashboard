import type { Customer } from "@/lib/definitions"

type Envelope<T> = { success: boolean; payload: T }

async function bff<T>(path: string, init?: RequestInit): Promise<Envelope<T>> {
  const res = await fetch(`/api/bff${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
    ...init,
  })
  const json = (await res.json().catch(() => ({ success: false, payload: {} }))) as Envelope<T>
  if (!res.ok) {
    const message = (json.payload as { message?: string })?.message ?? "Request failed"
    throw new BffError(message, res.status, json.payload)
  }
  return json
}

export class BffError extends Error {
  status: number
  payload: unknown
  constructor(message: string, status: number, payload: unknown) {
    super(message)
    this.status = status
    this.payload = payload
  }
}

export type LoginInput = { email: string; password: string; rememberMe?: boolean }

export type LoginErrors = {
  errors?: { email?: string[]; password?: string[]; rememberMe?: string[] }
  message?: string
}

export function login(input: LoginInput) {
  return bff<{ customer: Customer }>("/auth/login", {
    method: "POST",
    body: JSON.stringify(input),
  })
}

export function logout() {
  return bff<null>("/auth/logout", { method: "POST" })
}

export async function fetchMe(): Promise<Customer | null> {
  try {
    const res = await bff<{ customer: Customer }>("/auth/me", { method: "GET" })
    return res.payload.customer
  } catch (err) {
    if (err instanceof BffError && err.status === 401) return null
    throw err
  }
}
