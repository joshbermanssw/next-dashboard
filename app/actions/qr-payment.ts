"use server"

/**
 * Server action behind the QR confirm screen.
 *
 * The payer is always signed in — `/qr/pay/*` is a protected route — so this
 * gates on the session and moves money through the same ledger SplitPay
 * funding uses (`lib/data/balances.ts`).
 */
import { revalidatePath } from "next/cache"
import { z } from "zod"

import { verifySession } from "@/server/auth/dal"
import { getAccount, getAccountsForCustomer } from "@/lib/data/accounts"
import { balanceOf, credit, debit } from "@/lib/data/balances"

export type QrPaymentResult =
  | { ok: true; value: { paid: number; remaining: number } }
  | { ok: false; message: string }

const PaySchema = z.object({
  fromAccountId: z.string().min(1),
  toAccountId: z.string().min(1),
  amount: z.coerce.number().positive().finite().max(1_000_000),
})

export async function payViaQr(
  input: z.input<typeof PaySchema>,
): Promise<QrPaymentResult> {
  const { customer } = await verifySession()

  const parsed = PaySchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, message: "That payment didn't look right." }
  }
  const { fromAccountId, toAccountId, amount } = parsed.data

  if (fromAccountId === toAccountId) {
    return { ok: false, message: "Choose a different account to pay from." }
  }

  // The payer may only spend their own money. The URL names the *payee*, which
  // anyone can point at — the source account is the half that needs proving.
  const owned = getAccountsForCustomer(customer.id)
  if (!owned.some((account) => account.id === fromAccountId)) {
    return { ok: false, message: "We couldn't find that account." }
  }

  if (!getAccount(toAccountId)) {
    return { ok: false, message: "We couldn't find who you're paying." }
  }

  // Refuses to overdraw, so this is the balance check as well as the debit.
  const taken = debit(fromAccountId, amount)
  if (!taken.ok) return taken

  credit(toAccountId, amount)

  // The dashboard renders both balances; neither is honest until it re-reads.
  revalidatePath("/")
  revalidatePath(`/account/${fromAccountId}`)
  revalidatePath(`/account/${toAccountId}`)

  return {
    ok: true,
    value: { paid: amount, remaining: balanceOf(fromAccountId) ?? 0 },
  }
}
