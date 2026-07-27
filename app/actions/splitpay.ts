"use server"

/**
 * SplitPay server actions.
 *
 * Two audiences with two different proofs of identity:
 *
 * - **Public contributors** have no DosshPay session. They prove themselves
 *   with the emailed access code (first payment) or their manage-link token
 *   (everything after). These actions must never call `verifySession()`, and
 *   must never return another contributor's token.
 * - **The creator** is signed in, so those actions gate on `verifySession()`
 *   and additionally check that the account being changed is the one whose pool
 *   they are acting on.
 */
import { revalidatePath } from "next/cache"

import { verifySession } from "@/server/auth/dal"
import {
  getContributorByToken,
  getSession,
  getSessionByAccount,
  inviteContributor,
  recordContribution,
  recordCreatorTopUp,
  recordPaymentFromToken,
  registerSession,
  setAuthorised,
  startSpending,
  updatePledge,
} from "@/lib/data/splitpay"
import {
  ContributeSchema,
  InviteSchema,
  PayDifferenceSchema,
  UpdatePledgeSchema,
  fieldErrors,
} from "@/lib/splitpay"
import type { SplitPayDetails } from "@/lib/dashboard-data"

/** A rejected action. `errors` is keyed by form field; `message` is the summary
 * shown when no single field owns the problem. */
export type ActionFailure = {
  ok: false
  message: string
  errors?: Record<string, string>
}

/** Shape every SplitPay action answers in. Actions with nothing to hand back
 * carry `value: null`. */
export type ActionResult<T = null> = { ok: true; value: T } | ActionFailure

// Returns the failure branch alone, so it is assignable to every ActionResult<T>.
function invalid(message: string, errors?: Record<string, string>): ActionFailure {
  return { ok: false, message, errors }
}

/** Refresh every surface that renders this pool: the public pages, the hub, and
 * the dashboard tile. Cheap, and it keeps the creator's view honest the moment
 * a stranger pays in. */
function revalidateSession(sessionId: string, accountId?: string): void {
  revalidatePath(`/sp/${sessionId}`)
  revalidatePath(`/splitpay/${sessionId}`)
  if (accountId) revalidatePath(`/account/${accountId}/splitpay`)
  revalidatePath("/")
}

/* ----------------------------------------------------------------- public */

/** Step 2 — a non-user joins a session with the emailed code and pays in. */
export async function contributeAction(input: {
  sessionId: string
  name: string
  code: string
  amount: number
  cardNumber: string
  expiry: string
  cvv: string
  acceptedTerms: boolean
}): Promise<ActionResult<{ transactionId: string }>> {
  const parsed = ContributeSchema.safeParse(input)
  if (!parsed.success) {
    return invalid("Check the highlighted fields.", fieldErrors(parsed.error))
  }

  const result = recordContribution({
    sessionId: input.sessionId,
    code: parsed.data.code,
    name: parsed.data.name,
    amount: parsed.data.amount,
    cardNumber: parsed.data.cardNumber,
  })
  if (!result.ok) {
    // A bad code is a field problem, not a page-level one — put it on the input
    // the payer can actually fix.
    const errors = result.message.includes("code") ? { code: result.message } : undefined
    return invalid(result.message, errors)
  }

  const session = getSession(input.sessionId)
  revalidateSession(input.sessionId, session?.accountId)
  return { ok: true, value: { transactionId: result.value.contribution.id } }
}

/**
 * Recover a manage-link token from the access code plus the payer's own name —
 * the fallback for someone who reaches `/splitpay/{id}` without the emailed
 * link (they clicked through from a receipt, or the token went stale).
 *
 * Both factors are required, and the roster is never listed for them to pick
 * from: asking someone to *type* the name they used leaks nothing to a stranger
 * holding only the code.
 */
export async function resolveContributorAction(input: {
  sessionId: string
  code: string
  name: string
}): Promise<ActionResult<{ token: string }>> {
  const session = getSession(input.sessionId)
  if (!session) return invalid("That SplitPay session no longer exists.")

  if (session.details.accessCode !== input.code.trim()) {
    return invalid("Check the highlighted fields.", {
      code: "That code doesn't match this session.",
    })
  }

  const name = input.name.trim().toLowerCase()
  const contributor = session.details.contributors.find(
    (c) => c.name.toLowerCase() === name,
  )
  if (!contributor) {
    return invalid("Check the highlighted fields.", {
      name: "No contribution found under that name.",
    })
  }

  return { ok: true, value: { token: contributor.token } }
}

/** Step 5 — revise your own pledge and personal due date. Money untouched. */
export async function updatePledgeAction(input: {
  sessionId: string
  token: string
  pledged: number
  targetDate: string
}): Promise<ActionResult> {
  const parsed = UpdatePledgeSchema.safeParse(input)
  if (!parsed.success) {
    return invalid("Check the highlighted fields.", fieldErrors(parsed.error))
  }

  const result = updatePledge({
    sessionId: input.sessionId,
    token: input.token,
    pledged: parsed.data.pledged,
    // A date input gives a plain YYYY-MM-DD; read it as UTC midnight so the
    // stored instant doesn't shift with the reader's timezone.
    targetDate: parsed.data.targetDate
      ? Date.parse(`${parsed.data.targetDate}T00:00:00Z`)
      : null,
  })
  if (!result.ok) return invalid(result.message)

  const session = getSession(input.sessionId)
  revalidateSession(input.sessionId, session?.accountId)
  return { ok: true, value: null }
}

/** Step 5 — pay down what you still owe, authenticated by the manage token. */
export async function payDifferenceAction(input: {
  sessionId: string
  token: string
  amount: number
  cardNumber: string
  expiry: string
  cvv: string
}): Promise<ActionResult<{ transactionId: string }>> {
  const parsed = PayDifferenceSchema.safeParse(input)
  if (!parsed.success) {
    return invalid("Check the highlighted fields.", fieldErrors(parsed.error))
  }

  const result = recordPaymentFromToken({
    sessionId: input.sessionId,
    token: input.token,
    amount: parsed.data.amount,
    cardNumber: parsed.data.cardNumber,
  })
  if (!result.ok) return invalid(result.message)

  const session = getSession(input.sessionId)
  revalidateSession(input.sessionId, session?.accountId)
  return { ok: true, value: { transactionId: result.value.contribution.id } }
}

/**
 * Grant or revoke spend authority from the public manage page — the same
 * control as the hub's, reached through the creator's own emailed link rather
 * than a signed-in session.
 *
 * The token *is* the proof here, so the creator check is on the token's owner.
 * A contributor's token gets a refusal, not a roster they can edit.
 */
export async function authoriseByTokenAction(input: {
  sessionId: string
  token: string
  contributorId: string
  authorised: boolean
}): Promise<ActionResult> {
  const actor = getContributorByToken(input.sessionId, input.token)
  if (!actor || !actor.isCreator) {
    return invalid("Only the session creator can authorise contributors.")
  }

  const result = setAuthorised({
    sessionId: input.sessionId,
    contributorId: input.contributorId,
    authorised: input.authorised,
  })
  if (!result.ok) return invalid(result.message)

  const session = getSession(input.sessionId)
  revalidateSession(input.sessionId, session?.accountId)
  return { ok: true, value: null }
}

/* ---------------------------------------------------------------- creator */

/**
 * Resolve the pool the signed-in creator is acting on. Returns the session only
 * when the caller has a valid session *and* the account actually owns a pool —
 * so a forged `accountId` gets a miss rather than someone else's roster.
 */
async function creatorSession(accountId: string) {
  await verifySession()
  return getSessionByAccount(accountId)
}

/** Grant or revoke a contributor's authority to spend from the pooled card. */
export async function authoriseContributorAction(input: {
  accountId: string
  contributorId: string
  authorised: boolean
}): Promise<ActionResult> {
  const session = await creatorSession(input.accountId)
  if (!session) return invalid("That SplitPay pool no longer exists.")

  const result = setAuthorised({
    sessionId: session.details.sessionId,
    contributorId: input.contributorId,
    authorised: input.authorised,
  })
  if (!result.ok) return invalid(result.message)

  revalidateSession(session.details.sessionId, session.accountId)
  return { ok: true, value: null }
}

/**
 * Invite someone to the pool. Returns the invitee's share link and the session
 * access code so the creator can pass them on — Yang's email templates are the
 * eventual delivery mechanism, and this is what they will carry.
 */
export async function inviteContributorAction(input: {
  accountId: string
  name: string
  email: string
  pledged: number
}): Promise<ActionResult<{ name: string; joinPath: string; managePath: string; accessCode: string }>> {
  const parsed = InviteSchema.safeParse(input)
  if (!parsed.success) {
    return invalid("Check the highlighted fields.", fieldErrors(parsed.error))
  }

  const session = await creatorSession(input.accountId)
  if (!session) return invalid("That SplitPay pool no longer exists.")

  const result = inviteContributor({
    sessionId: session.details.sessionId,
    name: parsed.data.name,
    email: parsed.data.email,
    pledged: parsed.data.pledged,
  })
  if (!result.ok) return invalid(result.message)

  const { sessionId, accessCode } = session.details
  revalidateSession(sessionId, session.accountId)
  return {
    ok: true,
    value: {
      name: result.value.name,
      joinPath: `/sp/${sessionId}`,
      managePath: `/splitpay/${sessionId}?c=${result.value.token}`,
      accessCode,
    },
  }
}

/** The creator adding their own funds from the hub. */
export async function creatorTopUpAction(input: {
  accountId: string
  amount: number
}): Promise<ActionResult<{ transactionId: string }>> {
  const session = await creatorSession(input.accountId)
  if (!session) return invalid("That SplitPay pool no longer exists.")

  if (!(input.amount > 0) || !Number.isFinite(input.amount)) {
    return invalid("Enter an amount greater than zero.")
  }

  const result = recordCreatorTopUp({
    sessionId: session.details.sessionId,
    amount: input.amount,
  })
  if (!result.ok) return invalid(result.message)

  revalidateSession(session.details.sessionId, session.accountId)
  return { ok: true, value: { transactionId: result.value.contribution.id } }
}

/** Close funding and move the pool into spending. */
export async function startSpendingAction(input: {
  accountId: string
}): Promise<ActionResult> {
  const session = await creatorSession(input.accountId)
  if (!session) return invalid("That SplitPay pool no longer exists.")

  const result = startSpending(session.details.sessionId)
  if (!result.ok) return invalid(result.message)

  revalidateSession(session.details.sessionId, session.accountId)
  return { ok: true, value: null }
}

/**
 * Register a pool created by the dashboard wizard with the server store, so its
 * public `/sp` and `/splitpay` pages resolve. The wizard builds the pool in
 * client state first; this mirrors it across the seam.
 */
export async function registerSessionAction(input: {
  accountId: string
  label: string
  details: SplitPayDetails
}): Promise<ActionResult> {
  await verifySession()
  registerSession({
    accountId: input.accountId,
    label: input.label,
    details: input.details,
  })
  return { ok: true, value: null }
}
