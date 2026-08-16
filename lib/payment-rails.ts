/**
 * Hyper Switch: the payment rails a QR payment can travel on.
 *
 * Every rail moves the same money — they differ in what they cost, how many
 * reward points they earn, and how long they take. The sheet exists so the
 * payer sees that trade-off instead of having a rail chosen for them.
 *
 * Fees scale with the amount (bar SWIFT, which is genuinely a flat wire fee),
 * so the quote moves as the payer types rather than looking frozen.
 *
 * Pure module — no React, no server imports — so the sheet, the review screen,
 * and the server action all price a payment the same way.
 */

export const RAIL_IDS = ["crypto", "npp", "visa", "eftpos", "swift"] as const

export type RailId = (typeof RAIL_IDS)[number]

/** How quickly money lands, and how that reads on the availability dot. */
type Settlement = "instant" | "delayed"

export type PaymentRail = {
  id: RailId
  label: string
  /** Human settlement time, shown under the label. */
  speed: string
  settlement: Settlement
  /** Reward points earned by paying on this rail. */
  points: number
  /** Proportion of the amount taken as fee. */
  rate: number
  /** Flat fee, charged instead of `rate` when non-zero. */
  flat: number
  /** Brand mark to render in place of the status dot, where one exists. */
  brand?: "visa" | "eftpos"
}

/**
 * The rails, in the order the sheet lists them (cheapest-first for the instant
 * ones, with the slow wire last regardless of price).
 */
export const PAYMENT_RAILS: readonly PaymentRail[] = [
  {
    id: "crypto",
    label: "Crypto",
    speed: "Instant",
    settlement: "instant",
    points: 5,
    rate: 0.0043,
    flat: 0,
  },
  {
    id: "npp",
    label: "FAST PAYMENT (NPP)",
    speed: "Instant",
    settlement: "instant",
    points: 10,
    rate: 0.0049,
    flat: 0,
  },
  {
    id: "visa",
    label: "Visa",
    speed: "Instant",
    settlement: "instant",
    points: 20,
    rate: 0.0052,
    flat: 0,
    brand: "visa",
  },
  {
    id: "eftpos",
    label: "Eftpos",
    speed: "Instant",
    settlement: "instant",
    points: 20,
    rate: 0.0055,
    flat: 0,
    brand: "eftpos",
  },
  {
    id: "swift",
    label: "SWIFT",
    speed: "1–5 days",
    settlement: "delayed",
    points: 15,
    rate: 0,
    flat: 10,
  },
]

const RAIL_BY_ID = new Map(PAYMENT_RAILS.map((rail) => [rail.id, rail]))

/** One rail priced against a specific amount. */
export type RailQuote = PaymentRail & {
  fee: number
  /** True for the single cheapest rail in the quote. */
  isCheapest: boolean
}

/** A rail by id, or `undefined` if the id isn't one of ours. */
export function getRail(id: string): PaymentRail | undefined {
  return RAIL_BY_ID.get(id as RailId)
}

/** Narrowing guard for values arriving from a URL or a form. */
export function isRailId(value: unknown): value is RailId {
  return typeof value === "string" && RAIL_BY_ID.has(value as RailId)
}

/** What one rail charges to move `amount`. */
export function railFee(rail: PaymentRail, amount: number): number {
  return round2(rail.flat > 0 ? rail.flat : amount * rail.rate)
}

/**
 * Every rail priced for `amount`, in display order, with the cheapest flagged.
 *
 * Ties go to the first rail in `PAYMENT_RAILS` — deliberate, since that order
 * already runs cheapest-first among the instant rails.
 */
export function quoteRails(amount: number): RailQuote[] {
  const priced = PAYMENT_RAILS.map((rail) => ({
    ...rail,
    fee: railFee(rail, amount),
    isCheapest: false,
  }))

  let cheapest = priced[0]
  for (const quote of priced) {
    if (quote.fee < cheapest.fee) cheapest = quote
  }
  cheapest.isCheapest = true

  return priced
}

/** The cheapest rail for `amount`. */
export function cheapestRail(amount: number): RailQuote {
  return quoteRails(amount).find((quote) => quote.isCheapest)!
}

/** Money is cents-precise; keep float drift out of fees. */
function round2(n: number): number {
  return Math.round(n * 100) / 100
}
