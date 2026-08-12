import { notFound } from "next/navigation"

import { verifySession } from "@/server/auth/dal"
import { getAccount, getAccountsForCustomer } from "@/lib/data/accounts"
import { balanceOf } from "@/lib/data/balances"
import { ConfirmPayment } from "@/components/qr/confirm-payment"
import { parseAmount, type QrAccount } from "@/lib/qr-payment"

export const metadata = { title: "Confirm payment · DosshPay" }

/**
 * Confirm screen for a scanned payment code.
 *
 * Deliberately *not* device-gated the way `/qr` is: paying needs no camera, and
 * this URL is what a phone's own camera app opens. It stays behind the session
 * gate like every other dashboard route.
 */
export default async function QrPayPage({
  params,
  searchParams,
}: {
  params: Promise<{ accountId: string }>
  searchParams: Promise<{ amt?: string }>
}) {
  const { customer } = await verifySession()
  const { accountId } = await params
  const { amt } = await searchParams

  const payee = getAccount(accountId)
  if (!payee) notFound()

  // TODO(bff): the payee's display name comes from resolving the account's
  // customer. The single-tenant seed has no such lookup, so the account's own
  // label is the honest answer for now.
  const accounts: QrAccount[] = getAccountsForCustomer(customer.id)
    .filter(
      (account) => account.kind !== "splitpay" && account.id !== payee.id,
    )
    .map((account) => ({
      id: account.id,
      label: account.label,
      kind: account.kind,
      currency: account.currency,
      balance: balanceOf(account.id) ?? account.data.balance,
    }))

  return (
    <ConfirmPayment
      payee={{ id: payee.id, label: payee.label }}
      accounts={accounts}
      requestedAmount={parseAmount(amt)}
    />
  )
}
