"use client"

import * as React from "react"
import { MdBadge, MdDescription } from "react-icons/md"
import {
  SectionSteps,
  type StepDefinition,
} from "@/components/kyc/section-steps"
import { SimulatedCheck } from "@/components/kyc/simulated-check"
import { SingleSelectList, toOptions } from "@/components/kyc/option-list"
import type { KycSectionProps } from "@/components/kyc/types"
import { sectionSchema } from "@/lib/kyc"
import {
  PRIMARY_DOCUMENT_TYPE_HINTS,
  PRIMARY_DOCUMENT_TYPE_LABELS,
  PRIMARY_DOCUMENT_TYPES,
  SECONDARY_DOCUMENT_TYPE_HINTS,
  SECONDARY_DOCUMENT_TYPE_LABELS,
  SECONDARY_DOCUMENT_TYPES,
} from "@/lib/kyc-options"

export type DocumentSectionKey = "primary-document" | "secondary-document"

const CONFIG = {
  "primary-document": {
    subtitle: "Choose one photo ID to verify. Have it with you before you start.",
    options: toOptions(PRIMARY_DOCUMENT_TYPES, PRIMARY_DOCUMENT_TYPE_LABELS, {
      hints: PRIMARY_DOCUMENT_TYPE_HINTS,
      icon: () => <MdBadge />,
    }),
  },
  "secondary-document": {
    subtitle:
      "One more document, to confirm the details on your primary ID.",
    options: toOptions(
      SECONDARY_DOCUMENT_TYPES,
      SECONDARY_DOCUMENT_TYPE_LABELS,
      { hints: SECONDARY_DOCUMENT_TYPE_HINTS, icon: () => <MdDescription /> },
    ),
  },
} as const satisfies Record<DocumentSectionKey, unknown>

/**
 * Document capture — pick the document, then hand off to the scanning provider.
 *
 * Both document sections are the same two steps over different catalogues, so
 * they share one component keyed by which section is being filled in.
 */
export function DocumentSection<K extends DocumentSectionKey>({
  section,
  initial,
  closeHref,
  onSubmit,
  pending,
  error,
}: KycSectionProps<K> & { section: K }) {
  const config = CONFIG[section]

  const [documentType, setDocumentType] = React.useState<string | null>(
    initial?.documentType ?? null,
  )
  const [verified, setVerified] = React.useState(initial?.verified ?? false)
  const [invalid, setInvalid] = React.useState<string | null>(null)

  const chosen = config.options.find((o) => o.value === documentType)

  const steps: StepDefinition[] = [
    {
      title: chosen ? "Confirm your document" : "Choose your document",
      subtitle: config.subtitle,
      canContinue: documentType !== null,
      content: (
        <SingleSelectList
          label="Document type"
          options={[...config.options]}
          value={documentType}
          onChange={(value) => {
            // Switching documents invalidates a scan of the previous one.
            if (value !== documentType) setVerified(false)
            setDocumentType(value)
          }}
        />
      ),
    },
    {
      title: chosen?.label ?? "Document check",
      subtitle: "Tap below to start the secure verification flow.",
      canContinue: verified,
      content: (
        <SimulatedCheck
          icon={<MdBadge />}
          title={chosen?.label ?? "Document check"}
          description={
            chosen?.hint ?? "Have your document ready and well lit."
          }
          verified={verified}
          onVerified={() => setVerified(true)}
        />
      ),
    },
  ]

  const complete = () => {
    const parsed = sectionSchema(section).safeParse({ documentType, verified })

    if (!parsed.success) {
      setInvalid(parsed.error.issues[0]?.message ?? "Check your answers.")
      return
    }

    setInvalid(null)
    onSubmit(parsed.data)
  }

  return (
    <SectionSteps
      steps={steps}
      closeHref={closeHref}
      pending={pending}
      error={invalid ?? error}
      onComplete={complete}
    />
  )
}
