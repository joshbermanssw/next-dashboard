import { headers } from "next/headers"

import { verifySession } from "@/server/auth/dal"
import { isMobileRequest } from "@/server/device"
import { getAccountsForCustomer } from "@/lib/data/accounts"
import { balanceOf } from "@/lib/data/balances"
import { MobileOnly } from "@/components/qr/mobile-only"
import { QrScreen } from "@/components/qr/qr-screen"
import type { QrAccount } from "@/lib/qr-payment"

export const metadata = { title: "QR payments · DosshPay" }

export default async function QrPage() {
  // Auth gate per project rules.
  const { customer } = await verifySession()

  // Device gate decided here rather than in the client, so a desktop visitor
  // never sees a camera prompt flash before being turned away.
  if (!isMobileRequest(await headers())) return <MobileOnly />

  // These screens live outside the dashboard layout, so there's no accounts
  // provider to read — the server hands down exactly what they render.
  const accounts: QrAccount[] = getAccountsForCustomer(customer.id)
    // A SplitPay pool is funded through its own contributor flow, not by
    // someone scanning a code at a counter.
    .filter((account) => account.kind !== "splitpay")
    .map((account) => ({
      id: account.id,
      label: account.label,
      kind: account.kind,
      currency: account.currency,
      balance: balanceOf(account.id) ?? account.data.balance,
    }))

  const displayName =
    [customer.firstName, customer.lastName].filter(Boolean).join(" ") ||
    "Your DosshPay account"

  return <QrScreen accounts={accounts} displayName={displayName} />
}
