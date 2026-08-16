"use server"

/**
 * Server action behind the QR payment flow.
 *
 * The payer is always signed in — `/qr/pay/*` is a protected route — so this
 * gates on the session and moves money through the same ledger SplitPay
 * funding uses (`lib/data/balances.ts`).
 *
 * The rail's fee is charged to the payer on top of the amount; the payee is
 * credited the amount they asked for. Choosing a cheaper rail therefore costs
 * the payer less without changing what the payee receives, which is the whole
 * proposition behind Hyper Switch.
 */
import { revalidatePath } from "next/cache"
import { z } from "zod"

import { verifySession } from "@/server/auth/dal"
import { getAccount, getAccountsForCustomer } from "@/lib/data/accounts"
import { balanceOf, credit, debit } from "@/lib/data/balances"
import { savePayee } from "@/lib/data/payees"
import { getRail, isRailId, railFee } from "@/lib/payment-rails"

export type QrPaymentResult =
  | {
      ok: true
      value: { paid: number; fee: number; remaining: number; points: number }
    }
  | { ok: false; message: string }

const PaySchema = z.object({
  fromAccountId: z.string().min(1),
  toAccountId: z.string().min(1),
  amount: z.coerce.number().positive().finite().max(1_000_000),
  railId: z.string().refine(isRailId, "Unknown payment method."),
  /** Free text the payer attaches to the payment. */
  reference: z.string().trim().max(140).optional(),
  savePayee: z.boolean().optional(),
})

export async function payViaQr(
  input: z.input<typeof PaySchema>,
): Promise<QrPaymentResult> {
  const { customer } = await verifySession()

  const parsed = PaySchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, message: "That payment didn't look right." }
  }
  // `reference` is validated but not stored: there is no transaction ledger to
  // hang it off yet, so it lives on the review screen only. It becomes a field
  // on the payment request when the BFF lands.
  const { fromAccountId, toAccountId, amount, railId } = parsed.data

  if (fromAccountId === toAccountId) {
    return { ok: false, message: "Choose a different account to pay from." }
  }

  // The payer may only spend their own money. The URL names the *payee*, which
  // anyone can point at — the source account is the half that needs proving.
  const owned = getAccountsForCustomer(customer.id)
  if (!owned.some((account) => account.id === fromAccountId)) {
    return { ok: false, message: "We couldn't find that account." }
  }

  const payee = getAccount(toAccountId)
  if (!payee) {
    return { ok: false, message: "We couldn't find who you're paying." }
  }

  const rail = getRail(railId)!
  const fee = railFee(rail, amount)

  // One debit for amount + fee, so a payer who can cover the amount but not the
  // fee is refused here rather than going overdrawn by the fee alone.
  const taken = debit(fromAccountId, amount + fee)
  if (!taken.ok) return taken

  credit(toAccountId, amount)

  if (parsed.data.savePayee) {
    savePayee(
      customer.id,
      {
        accountId: payee.id,
        name: payee.label,
        accountNumber: payee.accountNumber,
      },
      Date.now(),
    )
  }

  // The dashboard renders both balances; neither is honest until it re-reads.
  revalidatePath("/")
  revalidatePath(`/account/${fromAccountId}`)
  revalidatePath(`/account/${toAccountId}`)

  return {
    ok: true,
    value: {
      paid: amount,
      fee,
      remaining: balanceOf(fromAccountId) ?? 0,
      points: rail.points,
    },
  }
}
