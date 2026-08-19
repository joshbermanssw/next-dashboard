"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { saveKycSectionAction } from "@/app/actions/kyc"
import { BiometricsSection } from "@/components/kyc/sections/biometrics-section"
import { ContactSection } from "@/components/kyc/sections/contact-section"
import { DocumentSection } from "@/components/kyc/sections/document-section"
import { FundsSection } from "@/components/kyc/sections/funds-section"
import { PersonalSection } from "@/components/kyc/sections/personal-section"
import type {
  KycApplication,
  KycSectionData,
  KycSectionKey,
} from "@/lib/kyc"

export const KYC_SECTION_LIST_HREF = "/activate/identity"

/**
 * Picks the wizard for a section and owns submission for all of them.
 *
 * Sections are submitted whole — the backend takes one payload per section —
 * so there is a single save at the end of each, and a successful save returns
 * the customer to the list with the next section unlocked.
 */
export function KycWizard({
  section,
  application,
}: {
  section: KycSectionKey
  application: KycApplication
}) {
  const router = useRouter()
  const [pending, startTransition] = React.useTransition()
  const [error, setError] = React.useState<string | null>(null)

  const submit = <K extends KycSectionKey>(key: K, data: KycSectionData[K]) => {
    setError(null)
    startTransition(async () => {
      const result = await saveKycSectionAction(key, data)
      if (!result.ok) {
        setError(result.message)
        return
      }
      router.push(KYC_SECTION_LIST_HREF)
      router.refresh()
    })
  }

  const shared = {
    closeHref: KYC_SECTION_LIST_HREF,
    pending,
    error,
  }

  switch (section) {
    case "personal":
      return (
        <PersonalSection
          {...shared}
          initial={application.personal}
          onSubmit={(data) => submit("personal", data)}
        />
      )
    case "contact":
      return (
        <ContactSection
          {...shared}
          initial={application.contact}
          onSubmit={(data) => submit("contact", data)}
        />
      )
    case "funds":
      return (
        <FundsSection
          {...shared}
          initial={application.funds}
          onSubmit={(data) => submit("funds", data)}
        />
      )
    case "primary-document":
      return (
        <DocumentSection
          {...shared}
          section="primary-document"
          initial={application["primary-document"]}
          onSubmit={(data) => submit("primary-document", data)}
        />
      )
    case "secondary-document":
      return (
        <DocumentSection
          {...shared}
          section="secondary-document"
          initial={application["secondary-document"]}
          onSubmit={(data) => submit("secondary-document", data)}
        />
      )
    case "biometrics":
      return (
        <BiometricsSection
          {...shared}
          initial={application.biometrics}
          onSubmit={(data) => submit("biometrics", data)}
        />
      )
  }
}
