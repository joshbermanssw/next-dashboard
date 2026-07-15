/**
 * Data-access seam for the account → card hierarchy.
 *
 * Today these read the in-memory seed; this is the single place to swap for BFF
 * calls when the backend lands (`GET /customers/{id}/accounts`,
 * `GET /accounts/{accountId}/cards`, `GET /accounts/{accountId}/cards/{cardId}`).
 * Ownership is modelled as fields (`Card.accountId`, `Account.customerId`), so
 * lookups are O(1) index reads, never scans.
 *
 * Safe to import from both server components (route pages) and client code
 * (the accounts provider) — it holds no server-only dependencies.
 */
import {
  seedAccounts,
  type Account,
  type BankCard,
} from "@/lib/dashboard-data"

// Built once over the static seed → O(1) lookups by id.
const accountsById = new Map<string, Account>()
const cardsById = new Map<string, { card: BankCard; account: Account }>()

for (const account of seedAccounts) {
  accountsById.set(account.id, account)
  for (const card of account.data.cards) {
    cardsById.set(card.id, { card, account })
  }
}

/** Every account owned by a customer. Single-tenant stub: the seed accounts,
 * stamped with the caller's customer id. */
export function getAccountsForCustomer(customerId: string): Account[] {
  return seedAccounts.map((account) => ({ ...account, customerId }))
}

/** One account by id, or `null` if unknown. */
export function getAccount(accountId: string): Account | null {
  return accountsById.get(accountId) ?? null
}

/** The cards belonging to an account. */
export function getCardsForAccount(accountId: string): BankCard[] {
  return accountsById.get(accountId)?.data.cards ?? []
}

/**
 * One card and its owning account, resolved under the account it's claimed to
 * belong to. Returns `null` if the card is unknown or the account id doesn't
 * match its owner — so a mismatched `/account/{a}/cards/{c}` URL `notFound()`s
 * instead of leaking another account's card.
 */
// TODO(bff): once these read a real backend, scope resolution to the session
// customer (`getAccount(customerId, id)` / `getCard(customerId, accountId, cardId)`)
// and `notFound()` on mismatch — today's single-tenant seed hides the missing
// ownership check, which becomes an IDOR the moment accounts span customers.
export function getCard(
  accountId: string,
  cardId: string,
): { card: BankCard; account: Account } | null {
  const hit = cardsById.get(cardId)
  return hit && hit.account.id === accountId ? hit : null
}
