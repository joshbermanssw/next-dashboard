import "server-only"

/**
 * Data-access seam for account balances that move.
 *
 * `lib/data/accounts.ts` is a read-only view over a static seed, which is fine
 * while nothing spends. Funding a SplitPay pool from a DosshPay account is the
 * first thing that does, so the debit has to land somewhere both the pay page
 * and the dashboard can see.
 *
 * Rather than make the whole account seed mutable, this keeps a per-account
 * delta applied on read. The seed stays the immutable starting point, and
 * `balanceOf` is the only thing that needs to know a ledger exists. When the
 * backend lands, this file becomes `POST /accounts/{id}/debits` and the map
 * goes away.
 *
 * Same two caveats as the session store: per-process, and reset when the server
 * restarts.
 */
import { getAccount } from "@/lib/data/accounts"

export type DebitResult =
  | { ok: true; value: { balance: number } }
  | { ok: false; message: string }

/** accountId → signed adjustment on top of that account's seeded balance. */
const deltas = new Map<string, number>()

/** The account's balance including everything debited this session, or `null`
 * if the account is unknown. */
export function balanceOf(accountId: string): number | null {
  const account = getAccount(accountId)
  if (!account) return null
  return round2(account.data.balance + (deltas.get(accountId) ?? 0))
}

/**
 * Take money out of an account.
 *
 * Refuses to overdraw — a SplitPay contribution funded from a balance that
 * isn't there would credit the pool with money the customer doesn't have, and
 * the two sides would never reconcile.
 */
export function debit(accountId: string, amount: number): DebitResult {
  const balance = balanceOf(accountId)
  if (balance === null) {
    return { ok: false, message: "We couldn't find that account." }
  }

  const taking = round2(amount)
  if (!(taking > 0)) {
    return { ok: false, message: "Enter an amount greater than zero." }
  }
  if (taking > balance) {
    return { ok: false, message: "That's more than this account holds." }
  }

  deltas.set(accountId, round2((deltas.get(accountId) ?? 0) - taking))
  return { ok: true, value: { balance: balanceOf(accountId)! } }
}

/** Put money back — the other half of a debit, for a payment that fails after
 * the balance has already moved. */
export function credit(accountId: string, amount: number): void {
  if (!getAccount(accountId)) return
  deltas.set(accountId, round2((deltas.get(accountId) ?? 0) + round2(amount)))
}

/** Every account whose balance has moved, for layering live figures over the
 * static seed the client renders from (see the dashboard layout). */
export function movedBalances(): { accountId: string; balance: number }[] {
  return [...deltas.keys()].flatMap((accountId) => {
    const balance = balanceOf(accountId)
    return balance === null ? [] : [{ accountId, balance }]
  })
}

/** Drop every adjustment. Test seam — the map is module state, so a test that
 * debits would otherwise leak into the next one. */
export function resetBalances(): void {
  deltas.clear()
}

/** Money is cents-precise; keep float drift out of running balances. */
function round2(n: number): number {
  return Math.round(n * 100) / 100
}
