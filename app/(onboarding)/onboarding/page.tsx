import { verifySession } from "@/server/auth/dal"
import { getPlanCatalog } from "@/server/bff/clients/plan-catalog"
import { OnboardingWizard } from "@/components/onboarding/onboarding-wizard"

export default async function OnboardingPage() {
  await verifySession()

  // The everyday catalogue is the only one this flow offers; corporate signup
  // is a separate path. An empty catalogue is handled by the wizard.
  const plans = await getPlanCatalog("everyday").catch(() => [])

  return <OnboardingWizard plans={plans} />
}
