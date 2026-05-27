import "server-only"

export type BffFetchOptions = RequestInit & {
  timeoutMs?: number
  bearer?: string
}

export class UpstreamError extends Error {
  status: number
  body: unknown
  constructor(status: number, body: unknown, message?: string) {
    super(message ?? `Upstream error ${status}`)
    this.status = status
    this.body = body
  }
}

export async function bffFetch<T = unknown>(
  url: string,
  { timeoutMs = 5000, bearer, headers, ...init }: BffFetchOptions = {},
): Promise<T> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const res = await fetch(url, {
      ...init,
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...(bearer ? { Authorization: `Bearer ${bearer}` } : {}),
        ...headers,
      },
      cache: "no-store",
    })
    const text = await res.text()
    const body = text ? safeJson(text) : null
    if (!res.ok) throw new UpstreamError(res.status, body)
    return body as T
  } finally {
    clearTimeout(timer)
  }
}

function safeJson(text: string): unknown {
  try {
    return JSON.parse(text)
  } catch {
    return text
  }
}
