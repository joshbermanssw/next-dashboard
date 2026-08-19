"use client"

import * as React from "react"
import {
  SectionSteps,
  type StepDefinition,
} from "@/components/kyc/section-steps"
import { SingleSelectList, toOptions } from "@/components/kyc/option-list"
import { TextField } from "@/components/kyc/text-field"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import type { KycSectionProps } from "@/components/kyc/types"
import { isOldEnough, PersonalSectionSchema } from "@/lib/kyc"
import {
  GENDER_LABELS,
  GENDERS,
  RELATIONSHIP_STATUS_LABELS,
  RELATIONSHIP_STATUSES,
  TFN_EXEMPTION_REASON_LABELS,
  TFN_EXEMPTION_REASONS,
  TITLE_LABELS,
  TITLES,
  VISA_STATUS_LABELS,
  VISA_STATUSES,
  type Gender,
  type RelationshipStatus,
  type TfnExemptionReason,
  type Title,
  type VisaStatus,
} from "@/lib/kyc-options"

type Draft = {
  title: Title | null
  firstName: string
  middleNames: string
  lastName: string
  alias: string
  dateOfBirth: string
  gender: Gender | null
  relationshipStatus: RelationshipStatus | null
  visaStatus: VisaStatus | null
  tfn: string
  tfnExemptionReason: TfnExemptionReason | null
}

function draftFrom(
  initial: KycSectionProps<"personal">["initial"],
): Draft {
  return {
    title: initial?.title ?? null,
    firstName: initial?.firstName ?? "",
    middleNames: initial?.middleNames ?? "",
    lastName: initial?.lastName ?? "",
    alias: initial?.alias ?? "",
    dateOfBirth: initial?.dateOfBirth ?? "",
    gender: initial?.gender ?? null,
    relationshipStatus: initial?.relationshipStatus ?? null,
    visaStatus: initial?.visaStatus ?? null,
    tfn: initial?.tfn ?? "",
    tfnExemptionReason: initial?.tfnExemptionReason ?? null,
  }
}

/**
 * Personal Details — legal name through to tax file number.
 *
 * Every answer here is checked against an identity document later, so the copy
 * asks for the legal spelling rather than a preferred one.
 */
export function PersonalSection({
  initial,
  closeHref,
  onSubmit,
  pending,
  error,
}: KycSectionProps<"personal">) {
  const [draft, setDraft] = React.useState<Draft>(() => draftFrom(initial))
  const [invalid, setInvalid] = React.useState<string | null>(null)

  const set = <K extends keyof Draft>(key: K, value: Draft[K]) =>
    setDraft((current) => ({ ...current, [key]: value }))

  const dobEntered = draft.dateOfBirth.length > 0
  const dobValid = dobEntered && isOldEnough(draft.dateOfBirth)
  const tfnValid = /^\d{9}$/.test(draft.tfn.trim())

  const steps: StepDefinition[] = [
    {
      title: "Personal Information",
      subtitle:
        "Please provide your full legal name as it appears on your identification documents.",
      canContinue:
        draft.title !== null &&
        draft.firstName.trim().length > 0 &&
        draft.lastName.trim().length > 0,
      content: (
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <Label className="text-blueLightest">Title</Label>
            <Select
              value={draft.title}
              onValueChange={(next) => set("title", String(next) as Title)}
            >
              <SelectTrigger aria-label="Title" className="h-11 w-full">
                <SelectValue placeholder="Select">
                  {(value: unknown) =>
                    value ? TITLE_LABELS[value as Title] : "Select"
                  }
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {TITLES.map((title) => (
                  <SelectItem key={title} value={title}>
                    {TITLE_LABELS[title]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <TextField
            label="First Name"
            value={draft.firstName}
            onChange={(v) => set("firstName", v)}
            autoComplete="given-name"
          />
          <TextField
            label="Middle Name(s)"
            value={draft.middleNames}
            onChange={(v) => set("middleNames", v)}
            autoComplete="additional-name"
          />
          <TextField
            label="Last Name"
            value={draft.lastName}
            onChange={(v) => set("lastName", v)}
            autoComplete="family-name"
          />
          <TextField
            label="Alias/Known As"
            value={draft.alias}
            onChange={(v) => set("alias", v)}
            hint="Optional — any other name you're known by."
          />
        </div>
      ),
    },
    {
      title: "Date of Birth",
      subtitle:
        "Please enter your date of birth. You must be at least 18 years old to register.",
      canContinue: dobValid,
      content: (
        <TextField
          label="Date of Birth"
          type="date"
          value={draft.dateOfBirth}
          onChange={(v) => set("dateOfBirth", v)}
          error={
            dobEntered && !dobValid
              ? "You must be at least 18 years old to register."
              : null
          }
        />
      ),
    },
    {
      title: "Gender",
      subtitle: "Please select your gender as per your ID",
      canContinue: draft.gender !== null,
      content: (
        <SingleSelectList
          label="Gender"
          options={toOptions(GENDERS, GENDER_LABELS)}
          value={draft.gender}
          onChange={(v) => set("gender", v)}
        />
      ),
    },
    {
      title: "Relationship Status",
      subtitle: "Please select your current relationship status",
      canContinue: draft.relationshipStatus !== null,
      content: (
        <SingleSelectList
          label="Relationship status"
          options={toOptions(
            RELATIONSHIP_STATUSES,
            RELATIONSHIP_STATUS_LABELS,
          )}
          value={draft.relationshipStatus}
          onChange={(v) => set("relationshipStatus", v)}
        />
      ),
    },
    {
      title: "Visa Status in Australia",
      subtitle: "Please select your current visa status in Australia",
      canContinue: draft.visaStatus !== null,
      content: (
        <SingleSelectList
          label="Visa status"
          options={toOptions(VISA_STATUSES, VISA_STATUS_LABELS)}
          value={draft.visaStatus}
          onChange={(v) => set("visaStatus", v)}
        />
      ),
    },
    {
      title: "TFN Number",
      subtitle:
        "Please enter your Tax File Number (TFN) below, or tell us why you don't have one.",
      // A TFN is never compulsory — but withholding one has to be explained.
      canContinue: tfnValid || draft.tfnExemptionReason !== null,
      content: (
        <div className="flex flex-col gap-6">
          <TextField
            label="Tax File Number"
            value={draft.tfn}
            onChange={(v) => set("tfn", v.replace(/\D/g, "").slice(0, 9))}
            inputMode="numeric"
            placeholder="123456789"
            error={
              draft.tfn.length > 0 && !tfnValid ? "A TFN is 9 digits." : null
            }
            hint="9 digits, no spaces."
          />

          {!tfnValid ? (
            <div className="flex flex-col gap-3">
              <p className="text-sm font-medium text-blueLightest">
                No TFN? Select a reason
              </p>
              <SingleSelectList
                label="Reason for not providing a TFN"
                options={toOptions(
                  TFN_EXEMPTION_REASONS,
                  TFN_EXEMPTION_REASON_LABELS,
                )}
                value={draft.tfnExemptionReason}
                onChange={(v) => set("tfnExemptionReason", v)}
              />
            </div>
          ) : null}
        </div>
      ),
    },
  ]

  const complete = () => {
    const parsed = PersonalSectionSchema.safeParse({
      ...draft,
      title: draft.title ?? undefined,
      gender: draft.gender ?? undefined,
      relationshipStatus: draft.relationshipStatus ?? undefined,
      visaStatus: draft.visaStatus ?? undefined,
      // A TFN and a reason are mutually exclusive: whichever is set wins.
      tfn: tfnValid ? draft.tfn.trim() : undefined,
      tfnExemptionReason: tfnValid
        ? undefined
        : (draft.tfnExemptionReason ?? undefined),
      middleNames: draft.middleNames.trim() || undefined,
      alias: draft.alias.trim() || undefined,
    })

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
