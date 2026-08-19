/**
 * Identity verification (KYC) — the "Finish setting up" flow behind the
 * "Verify your identity" row on `/activate`.
 *
 * The backend models this as one application made of independently submitted
 * sections (`PUT /kyc/applications/{id}/sections/{sectionKey}`), so this module
 * mirrors that: one schema per section, a section is either submitted or not,
 * and the application is complete when every section has been submitted.
 *
 * Nothing here talks to the network — see `server/kyc/store.ts` for where the
 * data currently lands.
 */

import * as z from "zod"
import {
  ACTIVITIES,
  GENDERS,
  INCOME_BANDS,
  INCOME_SOURCES,
  INDUSTRIES,
  OCCUPATIONS,
  PRIMARY_DOCUMENT_TYPES,
  RELATIONSHIP_STATUSES,
  SECONDARY_DOCUMENT_TYPES,
  TFN_EXEMPTION_REASONS,
  TITLES,
  TRANSACTION_COUNTRIES,
  VISA_STATUSES,
} from "./kyc-options"

export const KYC_SECTIONS = [
  "personal",
  "contact",
  "funds",
  "primary-document",
  "secondary-document",
  "biometrics",
] as const

export type KycSectionKey = (typeof KYC_SECTIONS)[number]

export function isKycSectionKey(value: string): value is KycSectionKey {
  return (KYC_SECTIONS as readonly string[]).includes(value)
}

export const SECTION_META: Record<
  KycSectionKey,
  { title: string; description: string }
> = {
  personal: {
    title: "Personal Details",
    description: "Name, DOB, visa status",
  },
  contact: {
    title: "Contact Details",
    description: "Mobile, email, address & proof",
  },
  funds: {
    title: "Source of Funds",
    description: "Income, industry & activities",
  },
  "primary-document": {
    title: "Primary Document",
    description: "Passport, licence or ID",
  },
  "secondary-document": {
    title: "Secondary Document",
    description: "Additional identity document",
  },
  biometrics: {
    title: "Biometrics",
    description: "Face verification via Entrust",
  },
}

// ── Shared field helpers ────────────────────────────────────────────────────

const NAME_MAX = 60

const requiredName = (label: string) =>
  z
    .string()
    .trim()
    .min(1, { error: `${label} is required.` })
    .max(NAME_MAX, { error: `${label} must be ${NAME_MAX} characters or fewer.` })

const optionalName = z
  .string()
  .trim()
  .max(NAME_MAX, { error: `Use ${NAME_MAX} characters or fewer.` })
  .optional()

const MINIMUM_AGE = 18

/**
 * True when someone born on `iso` has had their 18th birthday. Compares whole
 * calendar dates rather than elapsed milliseconds so it can't be thrown off by
 * leap years or the local clock's time of day.
 */
export function isOldEnough(iso: string): boolean {
  const dob = new Date(`${iso}T00:00:00`)
  if (Number.isNaN(dob.getTime())) return false
  const eligibleFrom = new Date(
    dob.getFullYear() + MINIMUM_AGE,
    dob.getMonth(),
    dob.getDate(),
  )
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return eligibleFrom <= today
}

// ── Personal Details ────────────────────────────────────────────────────────

export const PersonalSectionSchema = z
  .object({
    title: z.enum(TITLES, { error: "Select a title." }),
    firstName: requiredName("First name"),
    middleNames: optionalName,
    lastName: requiredName("Last name"),
    alias: optionalName,
    dateOfBirth: z
      .string()
      .min(1, { error: "Enter your date of birth." })
      .refine(isOldEnough, {
        error: `You must be at least ${MINIMUM_AGE} years old to register.`,
      }),
    gender: z.enum(GENDERS, { error: "Select an option." }),
    relationshipStatus: z.enum(RELATIONSHIP_STATUSES, {
      error: "Select an option.",
    }),
    visaStatus: z.enum(VISA_STATUSES, { error: "Select an option." }),
    // A TFN is optional by law, but a customer who withholds one has to say why.
    tfn: z
      .string()
      .trim()
      .refine((v) => v.length === 0 || /^\d{9}$/.test(v), {
        error: "A TFN is 9 digits.",
      })
      .optional(),
    tfnExemptionReason: z.enum(TFN_EXEMPTION_REASONS).optional(),
  })
  .refine((v) => Boolean(v.tfn) || Boolean(v.tfnExemptionReason), {
    error: "Enter your TFN, or tell us why you don't have one.",
    path: ["tfnExemptionReason"],
  })

// ── Contact Details ─────────────────────────────────────────────────────────

const AddressSchema = z.object({
  id: z.string(),
  line1: z.string().min(1),
  suburb: z.string().min(1),
  state: z.string().min(1),
  postcode: z.string().min(1),
  country: z.string().min(1),
})

export const ContactSectionSchema = z
  .object({
    mobile: z
      .string()
      .trim()
      .refine((v) => /^\+[1-9]\d{7,14}$/.test(v.replace(/[\s()-]/g, "")), {
        error: "Include your country code, e.g. +61 412 345 678.",
      }),
    email: z
      .string()
      .trim()
      .pipe(z.email({ error: "Enter a valid email address." })),
    confirmEmail: z.string().trim(),
    address: AddressSchema,
    // Set by the proof-of-address step; the section can't be submitted without it.
    proofOfAddressVerified: z.literal(true, {
      error: "Complete the proof of address check.",
    }),
  })
  .refine((v) => v.email.toLowerCase() === v.confirmEmail.toLowerCase(), {
    error: "Email addresses do not match.",
    path: ["confirmEmail"],
  })

// ── Source of Funds ─────────────────────────────────────────────────────────

export const FundsSectionSchema = z.object({
  incomeSources: z
    .array(z.enum(INCOME_SOURCES))
    .min(1, { error: "Select at least one income source." }),
  annualIncome: z.enum(INCOME_BANDS, { error: "Select an income range." }),
  industry: z.enum(INDUSTRIES, { error: "Select an industry." }),
  occupation: z.enum(OCCUPATIONS, { error: "Select an occupation." }),
  activities: z
    .array(z.enum(ACTIVITIES))
    .min(1, { error: "Select at least one activity." }),
  transactionCountries: z
    .array(z.enum(TRANSACTION_COUNTRIES))
    .min(1, { error: "Select at least one country." }),
})

// ── Documents and biometrics ────────────────────────────────────────────────
//
// The real captures run in the Entrust/Onfido SDK, which has no web build here.
// The schemas record what was captured and that the provider cleared it; the UI
// stands in for the SDK handoff.

export const PrimaryDocumentSectionSchema = z.object({
  documentType: z.enum(PRIMARY_DOCUMENT_TYPES, {
    error: "Choose a document.",
  }),
  verified: z.literal(true, { error: "Complete the document check." }),
})

export const SecondaryDocumentSectionSchema = z.object({
  documentType: z.enum(SECONDARY_DOCUMENT_TYPES, {
    error: "Choose a document.",
  }),
  verified: z.literal(true, { error: "Complete the document check." }),
})

export const BiometricsSectionSchema = z.object({
  verified: z.literal(true, { error: "Complete the face check." }),
})

export const SECTION_SCHEMAS = {
  personal: PersonalSectionSchema,
  contact: ContactSectionSchema,
  funds: FundsSectionSchema,
  "primary-document": PrimaryDocumentSectionSchema,
  "secondary-document": SecondaryDocumentSectionSchema,
  biometrics: BiometricsSectionSchema,
} as const satisfies Record<KycSectionKey, z.ZodType>

/** The submitted shape of each section, derived from its schema. */
export type KycSectionData = {
  [K in KycSectionKey]: z.infer<(typeof SECTION_SCHEMAS)[K]>
}

/**
 * Looks up a section's schema while keeping the tie to its data type.
 *
 * Indexing `SECTION_SCHEMAS` with a generic key widens the result to a union of
 * every schema, which TypeScript can't relate back to `KycSectionData[K]`. The
 * assertion is sound — the map is built from those same schemas — and lives
 * here alone so no call site has to repeat it.
 */
export function sectionSchema<K extends KycSectionKey>(
  key: K,
): z.ZodType<KycSectionData[K]> {
  return SECTION_SCHEMAS[key] as unknown as z.ZodType<KycSectionData[K]>
}

/** A section is present once submitted; absent means outstanding. */
export type KycApplication = Partial<KycSectionData>

// ── Progress ────────────────────────────────────────────────────────────────

/**
 * `current` is the one section the customer can work on. Sections unlock in
 * order — the backend builds the application incrementally, and a document
 * check can't be run before the identity it belongs to has been captured.
 */
export type KycSectionState = "done" | "current" | "locked"

export type KycSectionView = {
  key: KycSectionKey
  title: string
  description: string
  state: KycSectionState
}

export function deriveKycSections(app: KycApplication): KycSectionView[] {
  let currentTaken = false

  return KYC_SECTIONS.map((key) => {
    const done = app[key] !== undefined
    let state: KycSectionState = "locked"

    if (done) {
      state = "done"
    } else if (!currentTaken) {
      state = "current"
      currentTaken = true
    }

    return { key, ...SECTION_META[key], state }
  })
}

export function kycCompletedCount(app: KycApplication): number {
  return KYC_SECTIONS.filter((key) => app[key] !== undefined).length
}

export function isKycComplete(app: KycApplication): boolean {
  return kycCompletedCount(app) === KYC_SECTIONS.length
}

/** Whether a section can be opened. Done sections reopen for review/editing. */
export function isKycSectionOpen(
  app: KycApplication,
  key: KycSectionKey,
): boolean {
  const section = deriveKycSections(app).find((s) => s.key === key)
  return section?.state !== "locked"
}
