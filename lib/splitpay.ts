/**
 * Shared SplitPay rules: input schemas for the public contributor flow, card
 * checks, and the projections that decide what a public page is allowed to see.
 *
 * Pure and dependency-light so it can be imported from both the server actions
 * and the client forms. The mutable session store lives next door in
 * `lib/data/splitpay.ts`; this file never touches it.
 */
import { z } from "zod"

import {
  contributorStatus,
  paidCount,
  stillOwed,
  type ContributorStatus,
  type SavedCard,
  type SplitPayContribution,
  type SplitPayContributor,
  type SplitPayDetails,
  type SplitPayStatus,
} from "@/lib/dashboard-data"

/* ------------------------------------------------------------------ cards */

/** Digits only — strips the spaces people type into a card field. */
export function normalizeCardNumber(input: string): string {
  return input.replace(/\D/g, "")
}

/**
 * Luhn check digit. Catches transposed and mistyped card numbers before we
 * pretend to charge them; it is a format check, not an authorisation.
 */
export function luhnValid(digits: string): boolean {
  if (!/^\d{12,19}$/.test(digits)) return false
  let sum = 0
  let double = false
  for (let i = digits.length - 1; i >= 0; i--) {
    let d = digits.charCodeAt(i) - 48
    if (double) {
      d *= 2
      if (d > 9) d -= 9
    }
    sum += d
    double = !double
  }
  return sum % 10 === 0
}

/** Card brand from the leading digits — the two the SplitPay card supports,
 * plus Amex so an Amex payer gets a useful label rather than "Card". */
export function cardBrand(digits: string): string {
  if (/^4/.test(digits)) return "Visa"
  if (/^(5[1-5]|2(2[2-9]|[3-6]\d|7[01]|720))/.test(digits)) return "Mastercard"
  if (/^3[47]/.test(digits)) return "Amex"
  return "Card"
}

/** `MM/YY` that has not yet passed, evaluated against the end of that month. */
export function expiryInFuture(expiry: string, now = Date.now()): boolean {
  const match = /^(\d{2})\s*\/\s*(\d{2})$/.exec(expiry.trim())
  if (!match) return false
  const month = Number(match[1])
  if (month < 1 || month > 12) return false
  // Cards expire at the end of the printed month, so compare against the first
  // instant of the following month.
  const endOfMonth = Date.UTC(2000 + Number(match[2]), month, 1)
  return endOfMonth > now
}

/** What survives a payment: enough to recognise the card, nothing to reuse it. */
export function toSavedCard(digits: string): SavedCard {
  return { brand: cardBrand(digits), last4: digits.slice(-4) }
}

/* ---------------------------------------------------------------- schemas */

const CardFields = {
  cardNumber: z
    .string()
    .transform(normalizeCardNumber)
    .refine(luhnValid, { error: "Enter a valid card number." }),
  expiry: z
    .string()
    .refine((v) => expiryInFuture(v), { error: "Enter a valid expiry date." }),
  cvv: z
    .string()
    .trim()
    .regex(/^\d{3,4}$/, { error: "Enter the 3 or 4 digit CVV." }),
}

/** Step 2 — a non-user joining a session and paying into it. */
export const ContributeSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, { error: "Enter your name." })
    .max(60, { error: "That name is too long." }),
  /** Taken at face value — nothing is checked against a roster. It labels the
   * contributor row and addresses the receipt. */
  email: z.email({ error: "Enter a valid email address." }),
  code: z
    .string()
    .trim()
    .regex(/^\d{6}$/, { error: "Enter the 6-digit code from your email." }),
  amount: z
    .number({ error: "Enter an amount." })
    .positive({ error: "Enter an amount greater than zero." })
    .finite({ error: "Enter an amount." }),
  ...CardFields,
  acceptedTerms: z.literal(true, {
    error: "Accept the SplitPay terms to continue.",
  }),
})
export type ContributeInput = z.infer<typeof ContributeSchema>

/** Step 5 — a contributor revising their pledge. Money is deliberately absent:
 * `amount` is the ledger, and only a payment moves it. */
/**
 * Step 2 for someone who already banks with DosshPay: the emailed code still
 * gates entry, but identity comes from the session and the money comes from one
 * of their accounts, so there is no name to type and no card to key in.
 */
export const ContributeAsUserSchema = z.object({
  code: z
    .string()
    .trim()
    .regex(/^\d{6}$/, { error: "Enter the 6-digit code from your email." }),
  accountId: z.string().trim().min(1, { error: "Choose an account to pay from." }),
  amount: z
    .number({ error: "Enter an amount." })
    .positive({ error: "Enter an amount greater than zero." })
    .finite({ error: "Enter an amount." }),
})
export type ContributeAsUserInput = z.infer<typeof ContributeAsUserSchema>

export const UpdatePledgeSchema = z.object({
  pledged: z
    .number({ error: "Enter a pledge amount." })
    .nonnegative({ error: "A pledge cannot be negative." })
    .finite({ error: "Enter a pledge amount." }),
  /** `YYYY-MM-DD` from the date input, or empty to clear the date. */
  targetDate: z
    .string()
    .trim()
    .regex(/^(\d{4}-\d{2}-\d{2})?$/, { error: "Enter a valid date." }),
})
export type UpdatePledgeInput = z.infer<typeof UpdatePledgeSchema>

/** Step 5 — paying down an outstanding pledge with a card. */
export const PayDifferenceSchema = z.object({
  amount: z
    .number({ error: "Enter an amount." })
    .positive({ error: "Enter an amount greater than zero." })
    .finite({ error: "Enter an amount." }),
  ...CardFields,
})
export type PayDifferenceInput = z.infer<typeof PayDifferenceSchema>

/** Creator-side invite from the hub. */
export const InviteSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, { error: "Enter a name." })
    .max(60, { error: "That name is too long." }),
  email: z.email({ error: "Enter a valid email address." }),
  pledged: z
    .number({ error: "Enter a pledge amount." })
    .nonnegative({ error: "A pledge cannot be negative." })
    .finite({ error: "Enter a pledge amount." }),
})
export type InviteInput = z.infer<typeof InviteSchema>

/** First error message per field, shaped for `useActionState` form rendering. */
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {}
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form")
    out[key] ??= issue.message
  }
  return out
}

/* ------------------------------------------------------------ projections */

/**
 * A contributor as a public page may see them: enough to render the roster and
 * the progress bars, and nothing that would let a visitor act as them. Note the
 * absent `token` and `email` — the token is a credential, and a stranger paying
 * into a dinner fund has no business harvesting the other guests' addresses.
 */
export type PublicContributor = {
  id: string
  name: string
  initial: string
  pledged: number
  amount: number
  status: ContributorStatus
  isCreator: boolean
  authorised: boolean
  /**
   * Whether this row belongs to a DosshPay customer — the deck's split of a
   * session into existing users and non-users. A boolean rather than the
   * customer id: the roster is a public surface, and which customer someone is
   * is not the roster's business.
   */
  hasAccount: boolean
}

/** A session as a public page may see it. `accessCode` is deliberately absent:
 * the code is the gate, so it can never travel in the payload the gate guards. */
export type PublicSession = {
  sessionId: string
  label: string
  targetAmount: number
  collected: number
  remaining: number
  pct: number
  deadline: number
  status: SplitPayStatus
  contributors: PublicContributor[]
  contributorCount: number
  paidCount: number
}

/** The signed-in-by-token view of one's own contribution, for the Step 5 page. */
export type ViewerContribution = {
  id: string
  name: string
  initial: string
  pledged: number
  amount: number
  stillOwed: number
  status: ContributorStatus
  targetDate: number | null
  isCreator: boolean
  authorised: boolean
  savedCard: SavedCard | null
  /** Most recent payment, which is what the receipt panel shows. */
  latest: SplitPayContribution | null
}

export function toPublicContributor(c: SplitPayContributor): PublicContributor {
  return {
    id: c.id,
    name: c.name,
    initial: c.initial,
    pledged: c.pledged,
    amount: c.amount,
    status: contributorStatus(c),
    isCreator: c.isCreator,
    authorised: c.authorised,
    hasAccount: c.customerId !== null,
  }
}

export function toPublicSession(
  details: SplitPayDetails,
  label: string,
): PublicSession {
  const remaining = Math.max(0, details.targetAmount - details.collected)
  return {
    sessionId: details.sessionId,
    label,
    targetAmount: details.targetAmount,
    collected: details.collected,
    remaining,
    pct: fundedPct(details),
    deadline: details.deadline,
    status: details.status,
    contributors: details.contributors.map(toPublicContributor),
    contributorCount: details.contributors.length,
    paidCount: paidCount(details.contributors),
  }
}

export function toViewerContribution(
  c: SplitPayContributor,
  details: SplitPayDetails,
): ViewerContribution {
  const mine = details.contributions.filter((t) => t.contributorId === c.id)
  return {
    id: c.id,
    name: c.name,
    initial: c.initial,
    pledged: c.pledged,
    amount: c.amount,
    stillOwed: stillOwed(c),
    status: contributorStatus(c),
    targetDate: c.targetDate,
    isCreator: c.isCreator,
    authorised: c.authorised,
    savedCard: c.savedCard,
    latest: mine.length > 0 ? mine[mine.length - 1] : null,
  }
}

/**
 * The creator's view. Adds what only they may see: each invitee's email and
 * manage token (so the hub can rebuild their link), and the session access code
 * they need in order to share it at all.
 */
export type CreatorContributor = PublicContributor & {
  email: string | null
  token: string
}

export type CreatorSession = Omit<PublicSession, "contributors"> & {
  accountNumber: string
  accessCode: string
  contributors: CreatorContributor[]
  authorisedCount: number
}

export function toCreatorSession(
  details: SplitPayDetails,
  label: string,
): CreatorSession {
  const base = toPublicSession(details, label)
  return {
    ...base,
    accountNumber: details.accountNumber,
    accessCode: details.accessCode,
    contributors: details.contributors.map((c) => ({
      ...toPublicContributor(c),
      email: c.email,
      token: c.token,
    })),
    authorisedCount: details.contributors.filter((c) => c.authorised).length,
  }
}

/** Percent of target collected, clamped to 0–100. */
export function fundedPct(details: {
  collected: number
  targetAmount: number
}): number {
  if (!(details.targetAmount > 0)) return 0
  return Math.min(100, Math.max(0, (details.collected / details.targetAmount) * 100))
}
