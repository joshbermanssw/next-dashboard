import "server-only"

import { getAccountsForCustomer } from "@/lib/data/accounts"
import { balanceOf } from "@/lib/data/balances"
import type { QrAccount } from "@/lib/qr-payment"

/**
 * The accounts a customer can pay *out of*, shrunk to what the QR screens
 * render and carrying live balances.
 *
 * Excludes SplitPay pools — those are funded through their own contributor
 * flow, not spent at a counter — and the payee itself, since paying an account
 * from itself is not a payment.
 */
export function payerAccounts(
  customerId: string,
  excludeAccountId?: string,
): QrAccount[] {
  return getAccountsForCustomer(customerId)
    .filter(
      (account) =>
        account.kind !== "splitpay" && account.id !== excludeAccountId,
    )
    .map((account) => ({
      id: account.id,
      label: account.label,
      kind: account.kind,
      currency: account.currency,
      balance: balanceOf(account.id) ?? account.data.balance,
    }))
}
