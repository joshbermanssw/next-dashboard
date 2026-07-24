import type { Metadata } from "next"
import { verifySession } from "@/server/auth/dal"
import { getActivationStatus } from "@/server/bff/aggregators/activation"
import { ActivationHub } from "@/components/onboarding/activation-hub"

export const metadata: Metadata = {
  title: "DosshPay — Activate your account",
}

export default async function ActivatePage() {
  const session = await verifySession()

  const status = await getActivationStatus(
    session.upstreamJwt,
    session.customer.id,
  )

  return <ActivationHub status={status} />
}
