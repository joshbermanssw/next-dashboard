import { notFound, redirect } from "next/navigation"

import { verifySession } from "@/server/auth/dal"
import { getAccount } from "@/lib/data/accounts"
import { ReviewPayment } from "@/components/qr/review-payment"
import { parseAmount } from "@/lib/qr-payment"
import { isRailId, quoteRails } from "@/lib/payment-rails"
import { payerAccounts } from "@/server/qr/payer-accounts"

export const metadata = { title: "Review payment · DosshPay" }

/**
 * The review step, with the whole payment carried in the URL so a refresh (or
 * arriving from history) rebuilds it exactly.
 *
 * Anything missing or unrecognised sends the payer back to step one rather
 * than rendering a half-built payment — the numbers on this screen are the
 * ones they're about to authorise, so guessing at them isn't an option.
 */
export default async function QrPayReviewPage({
  params,
  searchParams,
}: {
  params: Promise<{ accountId: string }>
  searchParams: Promise<{
    amt?: string
    from?: string
    rail?: string
    ref?: string
    save?: string
  }>
}) {
  const { customer } = await verifySession()
  const { accountId } = await params
  const { amt, from, rail, ref, save } = await searchParams

  const payee = getAccount(accountId)
  if (!payee) notFound()

  const backToStepOne = `/qr/pay/${encodeURIComponent(accountId)}`

  const amount = parseAmount(amt)
  if (amount === null || !isRailId(rail)) redirect(backToStepOne)

  const fromAccount = payerAccounts(customer.id, payee.id).find(
    (account) => account.id === from,
  )
  if (!fromAccount) redirect(backToStepOne)

  // Priced here rather than trusted from the URL: the fee is what the payer is
  // agreeing to, so it's recomputed from the amount and rail on every render.
  const quote = quoteRails(amount).find((q) => q.id === rail)!

  return (
    <ReviewPayment
      payee={{
        id: payee.id,
        label: payee.label,
        accountNumber: payee.accountNumber,
      }}
      from={fromAccount}
      amount={amount}
      rail={quote}
      reference={ref?.trim() || null}
      savePayee={save === "1"}
    />
  )
}
