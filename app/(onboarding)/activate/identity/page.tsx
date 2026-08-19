import type { Metadata } from "next"
import { verifySession } from "@/server/auth/dal"
import { readKycApplication } from "@/server/kyc/store"
import { KycSectionList } from "@/components/kyc/section-list"
import { deriveKycSections } from "@/lib/kyc"

export const metadata: Metadata = {
  title: "DosshPay — Verify your identity",
}

export default async function IdentityPage() {
  const session = await verifySession()
  const application = readKycApplication(session.customer.id)

  return (
    <KycSectionList
      sections={deriveKycSections(application)}
      showDevReset={process.env.NODE_ENV !== "production"}
    />
  )
}
