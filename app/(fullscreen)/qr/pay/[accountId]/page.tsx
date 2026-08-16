import { notFound } from "next/navigation"

import { verifySession } from "@/server/auth/dal"
import { getAccount } from "@/lib/data/accounts"
import { PayAmountScreen } from "@/components/qr/pay-amount-screen"
import { parseAmount } from "@/lib/qr-payment"
import { payerAccounts } from "@/server/qr/payer-accounts"

export const metadata = { title: "Send payment · DosshPay" }

/**
 * Step one of paying a scanned code.
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

  return (
    <PayAmountScreen
      payee={{
        id: payee.id,
        // TODO(bff): the payee's display name comes from resolving the
        // account's customer. The single-tenant seed has no such lookup, so the
        // account's own label is the honest answer for now.
        label: payee.label,
        accountNumber: payee.accountNumber,
      }}
      accounts={payerAccounts(customer.id, payee.id)}
      requestedAmount={parseAmount(amt)}
    />
  )
}
