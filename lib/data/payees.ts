import "server-only"

/**
 * Data-access seam for saved payees.
 *
 * "Save payee" on the QR payment screen writes here. Nothing reads it back into
 * the UI yet — there is no payees screen designed — but the toggle is a real
 * write rather than a dead control, so the flow is honest and the seam exists
 * for whatever surfaces them later.
 *
 * Same two caveats as the SplitPay session store: per-process, and reset when
 * the server restarts.
 */

// TODO(bff): becomes `GET/POST /customers/{id}/payees` when the backend lands.
// Keep `SavedPayee` stable so callers don't move.

export type SavedPayee = {
  /** Account the payee is paid into — the identity of the row. */
  accountId: string
  /** Display name shown to the payer. */
  name: string
  /** The number quoted on the review screen. */
  accountNumber: string
  /** When it was saved, for a most-recent-first list later. */
  savedAt: number
}

/** customerId → their saved payees, keyed by the account being paid. */
const byCustomer = new Map<string, Map<string, SavedPayee>>()

/**
 * Remember a payee for this customer. Saving the same account twice refreshes
 * the existing row rather than duplicating it — the account is the identity.
 */
export function savePayee(
  customerId: string,
  payee: Omit<SavedPayee, "savedAt">,
  savedAt: number,
): void {
  const existing = byCustomer.get(customerId) ?? new Map<string, SavedPayee>()
  existing.set(payee.accountId, { ...payee, savedAt })
  byCustomer.set(customerId, existing)
}

/** A customer's saved payees, most recently saved first. */
export function getPayees(customerId: string): SavedPayee[] {
  return [...(byCustomer.get(customerId)?.values() ?? [])].sort(
    (a, b) => b.savedAt - a.savedAt,
  )
}

/** Drop every saved payee. Test seam — the map is module state. */
export function resetPayees(): void {
  byCustomer.clear()
}
