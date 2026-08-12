/**
 * The wire format behind DosshPay payment QR codes.
 *
 * A Receive screen encodes an ordinary https URL pointing at this app's
 * `/qr/pay/{accountId}` confirm page, optionally carrying the amount the payee
 * asked for. That single payload serves two readers:
 *
 * - **The in-app scanner**, which parses it locally and routes straight to the
 *   confirm page without a round trip.
 * - **Any phone's camera app**, which sees a normal link and opens the same
 *   page in a browser.
 *
 * Keeping this module pure (no React, no DOM, no server imports) is what lets
 * both the scanner and the confirm page agree on one definition of a payload.
 */
import { z } from "zod"
import type { AccountKind } from "@/lib/dashboard-data"

/** Path prefix every payment QR points at. */
const PAY_PATH = "/qr/pay/"

/** Query key carrying the requested amount. */
const AMOUNT_PARAM = "amt"

/**
 * Upper bound on a requested amount. Not a business limit — it just stops a
 * malformed or hostile code rendering "A$1e21" on the confirm screen.
 */
const MAX_AMOUNT = 1_000_000

const AmountSchema = z.coerce.number().positive().finite().max(MAX_AMOUNT)

/** A decoded payment QR: who is being paid, and how much they asked for. */
export type PaymentRequest = {
  /** Account the money lands in. */
  accountId: string
  /** What the payee requested, or `null` when the payer names the amount. */
  amount: number | null
}

/**
 * An account as the QR screens render it — the shrunken, serialisable view a
 * server component hands to the client. Icons are looked up client-side from
 * `kind`, since components can't cross the boundary.
 */
export type QrAccount = {
  id: string
  label: string
  kind: AccountKind
  /** Settlement currency code, e.g. "AUDM". */
  currency: string
  /** Live balance, including anything moved this session. */
  balance: number
}

/** Build the URL a Receive QR encodes. `origin` is the app's own origin. */
export function buildPaymentUrl(
  origin: string,
  { accountId, amount }: PaymentRequest,
): string {
  const url = new URL(`${PAY_PATH}${encodeURIComponent(accountId)}`, origin)
  if (amount !== null) url.searchParams.set(AMOUNT_PARAM, amount.toFixed(2))
  return url.toString()
}

/**
 * Read a scanned string as a payment request, or `null` if it isn't one of ours.
 *
 * A camera points at whatever is in front of it, so this is deliberately strict
 * about identity: anything not on `origin`, and anything off the `/qr/pay/`
 * path, is rejected rather than navigated to.
 *
 * It is deliberately *lenient* about the amount, though — a missing or
 * malformed `amt` degrades to "payer names the amount" instead of failing the
 * whole scan. Nothing moves until the payer confirms a figure they can see, so
 * there's nothing to be gained by being brittle here.
 */
export function parsePaymentUrl(
  value: string,
  origin: string,
): PaymentRequest | null {
  let url: URL
  try {
    url = new URL(value)
  } catch {
    return null
  }

  if (url.origin !== origin) return null
  if (!url.pathname.startsWith(PAY_PATH)) return null

  const accountId = safeDecode(url.pathname.slice(PAY_PATH.length))
  // One path segment, non-empty — `/qr/pay/a/b` is not an account id.
  if (!accountId || accountId.includes("/")) return null

  return { accountId, amount: parseAmount(url.searchParams.get(AMOUNT_PARAM)) }
}

/**
 * Read a requested amount from a raw query value. `null` covers both "absent"
 * and "not a usable amount" — see the leniency note on `parsePaymentUrl`.
 */
export function parseAmount(raw: string | null | undefined): number | null {
  if (raw === null || raw === undefined || raw.trim() === "") return null
  const parsed = AmountSchema.safeParse(raw)
  return parsed.success ? round2(parsed.data) : null
}

function safeDecode(segment: string): string | null {
  try {
    return decodeURIComponent(segment)
  } catch {
    // A lone "%" is a malformed escape — not an account id.
    return null
  }
}

/** Money is cents-precise; keep float drift out of requested amounts. */
function round2(n: number): number {
  return Math.round(n * 100) / 100
}
