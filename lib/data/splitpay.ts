import "server-only"

/**
 * Data-access seam for SplitPay sessions.
 *
 * Unlike `lib/data/accounts.ts`, this one is *mutable*: the public contributor
 * pages have no React context to write into, so the session has to live
 * somewhere both they and the creator's dashboard can reach. Today that is a
 * module-level map seeded from `seedAccounts`; when the backend lands this is
 * the single file to replace (`GET/POST /splitpay/{sessionId}/contributions`
 * and friends). Everything above it already speaks in results, not exceptions.
 *
 * Two consequences of the in-memory store, both fine for a demo and both gone
 * once it is a real API: state resets when the server process restarts (dev
 * hot-reload included), and it is per-process rather than shared.
 *
 * `server-only` is load-bearing. Importing this from a client component would
 * hand the browser its own copy of the map, which would then silently diverge
 * from the server's.
 */
import {
  generateContributorToken,
  seedAccounts,
  type SplitPayContribution,
  type SplitPayContributor,
  type SplitPayDetails,
} from "@/lib/dashboard-data"
import { toSavedCard } from "@/lib/splitpay"

/** A session plus the bits of its owning account the public pages need. */
export type StoredSession = {
  accountId: string
  /** Pool name, e.g. "Barcelona Trip Fund" — the owning account's label. */
  label: string
  details: SplitPayDetails
}

export type StoreResult<T> = { ok: true; value: T } | { ok: false; message: string }

const sessions = new Map<string, StoredSession>()
const sessionIdByAccount = new Map<string, string>()

for (const account of seedAccounts) {
  if (!account.splitpay) continue
  register({
    accountId: account.id,
    label: account.label,
    // Cloned so mutations here never scribble on the exported seed, which the
    // client-side accounts provider reads independently.
    details: structuredClone(account.splitpay),
  })
}

function register(session: StoredSession): void {
  sessions.set(session.details.sessionId, session)
  sessionIdByAccount.set(session.accountId, session.details.sessionId)
}

/* -------------------------------------------------------------- accessors */

/** One session by its public id ("123-455"), or `null` if unknown. */
export function getSession(sessionId: string): StoredSession | null {
  return sessions.get(sessionId) ?? null
}

/**
 * Every session the store knows about, used to seed the dashboard's accounts
 * provider (and by the dev mock inbox).
 *
 * Safe only because the stub is single-tenant — every pool belongs to the one
 * customer. When accounts span customers this must take a customer id and
 * filter, or it becomes a way to enumerate other people's pools.
 */
export function listSessions(): StoredSession[] {
  return [...sessions.values()]
}

/** The session belonging to an account, or `null` if that account has no pool. */
export function getSessionByAccount(accountId: string): StoredSession | null {
  const sessionId = sessionIdByAccount.get(accountId)
  return sessionId ? (sessions.get(sessionId) ?? null) : null
}

/**
 * Resolve the visitor behind an emailed manage link. Compared with a plain
 * lookup because the token is the only thing standing between a stranger and
 * someone else's contribution.
 */
export function getContributorByToken(
  sessionId: string,
  token: string,
): SplitPayContributor | null {
  const session = sessions.get(sessionId)
  if (!session || !token) return null
  return session.details.contributors.find((c) => c.token === token) ?? null
}

/** Whether `code` is the session's emailed access code. */
export function verifyAccessCode(sessionId: string, code: string): boolean {
  const session = sessions.get(sessionId)
  return Boolean(session) && session!.details.accessCode === code.trim()
}

/** Register a pool created through the dashboard wizard, so its public pages
 * work too. Idempotent — re-registering the same session just replaces it. */
export function registerSession(session: StoredSession): void {
  register(session)
}

/* -------------------------------------------------------------- mutations */

/**
 * Take a payment into the pool.
 *
 * The payer is matched to an existing contributor by name, case-insensitively,
 * so an invitee who pays the amount they were asked for lands on their own row
 * rather than creating a duplicate. That is the direct consequence of a
 * session-wide access code plus a self-declared name: with no per-invitee
 * secret, the name is the only signal there is. A per-invitee code would let us
 * bind the payment to the invite instead.
 */
export function recordContribution(input: {
  sessionId: string
  code: string
  name: string
  amount: number
  cardNumber: string
}): StoreResult<{ contribution: SplitPayContribution; contributor: SplitPayContributor }> {
  const session = sessions.get(input.sessionId)
  if (!session) return { ok: false, message: "That SplitPay session no longer exists." }

  const { details } = session
  if (details.accessCode !== input.code.trim()) {
    return { ok: false, message: "That code doesn't match this session." }
  }

  const blocked = fundingBlocked(details)
  if (blocked) return blocked

  const name = input.name.trim()
  const contributor =
    details.contributors.find(
      (c) => c.name.toLowerCase() === name.toLowerCase(),
    ) ?? addContributor(details, { name, email: null, pledged: 0 })

  return applyPayment(details, contributor, input.amount, input.cardNumber)
}

/**
 * Take a payment from a contributor already resolved by their manage-link
 * token — the "pay the difference" button on the Step 5 page. No access code
 * is asked for because the token already proved who they are.
 */
export function recordPaymentFromToken(input: {
  sessionId: string
  token: string
  amount: number
  cardNumber: string
}): StoreResult<{ contribution: SplitPayContribution; contributor: SplitPayContributor }> {
  const session = sessions.get(input.sessionId)
  if (!session) return { ok: false, message: "That SplitPay session no longer exists." }

  const contributor = getContributorByToken(input.sessionId, input.token)
  if (!contributor) return { ok: false, message: "We couldn't find your contribution." }

  const blocked = fundingBlocked(session.details)
  if (blocked) return blocked

  return applyPayment(session.details, contributor, input.amount, input.cardNumber)
}

/** The funding-window guards both payment paths share. Returns the failure to
 * pass straight back to the caller, or `null` when the pool is open. */
function fundingBlocked(
  details: SplitPayDetails,
): { ok: false; message: string } | null {
  if (details.status !== "funding") {
    return { ok: false, message: "This session has closed for funding." }
  }
  if (Date.now() > details.deadline) {
    return { ok: false, message: "Funding for this session has ended." }
  }
  if (details.collected >= details.targetAmount) {
    return { ok: false, message: "This session has already reached its target." }
  }
  return null
}

/** Move money onto a contributor's row and the pool's total, as one step so the
 * two can't disagree. */
function applyPayment(
  details: SplitPayDetails,
  contributor: SplitPayContributor,
  amount: number,
  /** `null` when the money came from a DosshPay balance rather than a card,
   * which is how the creator tops up their own pool. */
  cardNumber: string | null,
): StoreResult<{ contribution: SplitPayContribution; contributor: SplitPayContributor }> {
  const remaining = Math.max(0, details.targetAmount - details.collected)
  // Clamp rather than reject: someone paying the last $80 of a $100 ask should
  // fund the pool, not bounce off it.
  const applied = Math.min(round2(amount), remaining)
  if (!(applied > 0)) {
    return { ok: false, message: "Enter an amount greater than zero." }
  }

  contributor.amount = round2(contributor.amount + applied)
  if (cardNumber !== null) contributor.savedCard = toSavedCard(cardNumber)
  details.collected = round2(details.collected + applied)

  const contribution: SplitPayContribution = {
    id: nextTransactionId(),
    contributorId: contributor.id,
    amount: applied,
    createdAt: Date.now(),
    status: "completed",
  }
  details.contributions.push(contribution)

  return { ok: true, value: { contribution, contributor } }
}

/**
 * The creator adding their own money to the pool, funded from their DosshPay
 * balance rather than a card — the hub's "Top up" action.
 */
export function recordCreatorTopUp(input: {
  sessionId: string
  amount: number
}): StoreResult<{ contribution: SplitPayContribution; contributor: SplitPayContributor }> {
  const session = sessions.get(input.sessionId)
  if (!session) return { ok: false, message: "That SplitPay session no longer exists." }

  const creator = session.details.contributors.find((c) => c.isCreator)
  if (!creator) return { ok: false, message: "This pool has no creator on record." }

  const blocked = fundingBlocked(session.details)
  if (blocked) return blocked

  return applyPayment(session.details, creator, input.amount, null)
}

/** Revise a contributor's own pledge and personal due date. Deliberately cannot
 * touch `amount` — only the payment paths move money. */
export function updatePledge(input: {
  sessionId: string
  token: string
  pledged: number
  targetDate: number | null
}): StoreResult<SplitPayContributor> {
  const contributor = getContributorByToken(input.sessionId, input.token)
  if (!contributor) {
    return { ok: false, message: "We couldn't find your contribution." }
  }
  contributor.pledged = round2(Math.max(0, input.pledged))
  contributor.targetDate = input.targetDate
  return { ok: true, value: contributor }
}

/** Grant or revoke a contributor's authority to spend from the pooled card. */
export function setAuthorised(input: {
  sessionId: string
  contributorId: string
  authorised: boolean
}): StoreResult<SplitPayContributor> {
  const session = sessions.get(input.sessionId)
  if (!session) return { ok: false, message: "That SplitPay session no longer exists." }

  const contributor = session.details.contributors.find(
    (c) => c.id === input.contributorId,
  )
  if (!contributor) return { ok: false, message: "We couldn't find that contributor." }
  if (contributor.isCreator && !input.authorised) {
    // The creator's own authority is what everyone else's is granted from;
    // revoking it would leave a pool nobody can spend.
    return { ok: false, message: "The creator is always authorised." }
  }

  contributor.authorised = input.authorised
  return { ok: true, value: contributor }
}

/** Add an invitee to the roster and hand back their manage-link token. */
export function inviteContributor(input: {
  sessionId: string
  name: string
  email: string
  pledged: number
}): StoreResult<SplitPayContributor> {
  const session = sessions.get(input.sessionId)
  if (!session) return { ok: false, message: "That SplitPay session no longer exists." }

  const name = input.name.trim()
  const clash = session.details.contributors.find(
    (c) =>
      c.name.toLowerCase() === name.toLowerCase() ||
      (c.email !== null && c.email.toLowerCase() === input.email.toLowerCase()),
  )
  if (clash) return { ok: false, message: `${clash.name} is already on this session.` }

  return {
    ok: true,
    value: addContributor(session.details, {
      name,
      email: input.email.trim(),
      pledged: round2(Math.max(0, input.pledged)),
    }),
  }
}

/** Move a pool from funding to spending. */
export function startSpending(sessionId: string): StoreResult<SplitPayDetails> {
  const session = sessions.get(sessionId)
  if (!session) return { ok: false, message: "That SplitPay session no longer exists." }
  if (session.details.status !== "funding") {
    return { ok: false, message: "This session is not in funding." }
  }
  session.details.status = "spending"
  return { ok: true, value: session.details }
}

/* --------------------------------------------------------------- internals */

function addContributor(
  details: SplitPayDetails,
  input: { name: string; email: string | null; pledged: number },
): SplitPayContributor {
  const contributor: SplitPayContributor = {
    id: `sp-${slug(input.name)}-${details.contributors.length + 1}`,
    name: input.name,
    initial: initialsOf(input.name),
    email: input.email,
    pledged: input.pledged,
    amount: 0,
    targetDate: null,
    isCreator: false,
    authorised: false,
    token: generateContributorToken(),
    savedCard: null,
  }
  details.contributors.push(contributor)
  return contributor
}

/** "Mara Solano" → "MS"; single-word names keep two letters ("Benji" → "BJ"
 * is not derivable, so fall back to the first two characters). */
function initialsOf(name: string): string {
  const words = name.trim().split(/\s+/)
  if (words.length > 1) {
    return (words[0][0] + words[words.length - 1][0]).toUpperCase()
  }
  return words[0].slice(0, 2).toUpperCase()
}

function slug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "").slice(0, 12) || "guest"
}

/**
 * Receipt number. Random rather than sequential because it addresses a public
 * page (`/sp/{id}/receipt/{txId}`) that names the payer and their amount —
 * counting up from the last one would let anyone walk the pool's ledger.
 */
function nextTransactionId(): string {
  const n = Math.floor(Math.random() * 100_000_000)
  return `TXN-${String(n).padStart(8, "0")}`
}

/** Money is cents-precise; keep float drift out of the running totals. */
function round2(n: number): number {
  return Math.round(n * 100) / 100
}

/** Contributors who may spend from the pooled card — the "Authorised" gate in
 * the flow diagram. Exported for the hub's summary line. */
export function authorisedCount(details: SplitPayDetails): number {
  return details.contributors.filter((c) => c.authorised).length
}
