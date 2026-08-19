import type { Metadata } from "next"
import { notFound, redirect } from "next/navigation"
import { verifySession } from "@/server/auth/dal"
import { readKycApplication } from "@/server/kyc/store"
import { KycWizard } from "@/components/kyc/kyc-wizard"
import { isKycSectionKey, isKycSectionOpen, SECTION_META } from "@/lib/kyc"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ section: string }>
}): Promise<Metadata> {
  const { section } = await params
  const title = isKycSectionKey(section) ? SECTION_META[section].title : "Verify"
  return { title: `DosshPay — ${title}` }
}

export default async function KycSectionPage({
  params,
}: {
  params: Promise<{ section: string }>
}) {
  const session = await verifySession()

  const { section } = await params
  if (!isKycSectionKey(section)) notFound()

  const application = readKycApplication(session.customer.id)
  // Sections unlock in order, so a deep link to one that isn't reachable yet
  // goes back to the list rather than presenting a form that can't be saved.
  if (!isKycSectionOpen(application, section)) redirect("/activate/identity")

  return <KycWizard section={section} application={application} />
}
