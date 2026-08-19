import { describe, it, expect } from "vitest"
import {
  ContactSectionSchema,
  deriveKycSections,
  isKycComplete,
  isKycSectionOpen,
  isOldEnough,
  PersonalSectionSchema,
  type KycApplication,
  type KycSectionData,
} from "@/lib/kyc"

function isoYearsAgo(years: number, dayOffset = 0): string {
  const d = new Date()
  d.setFullYear(d.getFullYear() - years)
  d.setDate(d.getDate() + dayOffset)
  return d.toISOString().slice(0, 10)
}

describe("deriveKycSections", () => {
  it("opens the first section and locks the rest", () => {
    const states = deriveKycSections({}).map((s) => s.state)
    expect(states).toEqual([
      "current",
      "locked",
      "locked",
      "locked",
      "locked",
      "locked",
    ])
  })

  it("moves `current` to the next outstanding section as sections complete", () => {
    const sections = deriveKycSections({ personal: personalFixture() })
    expect(sections[0].state).toBe("done")
    expect(sections[1].state).toBe("current")
    expect(sections[2].state).toBe("locked")
  })

  it("treats a locked section as unreachable and an open one as reachable", () => {
    const app: KycApplication = { personal: personalFixture() }
    expect(isKycSectionOpen(app, "personal")).toBe(true) // done, reopenable
    expect(isKycSectionOpen(app, "contact")).toBe(true) // current
    expect(isKycSectionOpen(app, "biometrics")).toBe(false) // locked
  })

  it("is complete only when every section has been submitted", () => {
    expect(isKycComplete({ biometrics: { verified: true } })).toBe(false)
    expect(
      isKycComplete({
        personal: personalFixture(),
        contact: contactFixture(),
        funds: fundsFixture(),
        "primary-document": { documentType: "passport", verified: true },
        "secondary-document": { documentType: "medicare-card", verified: true },
        biometrics: { verified: true },
      }),
    ).toBe(true)
  })
})

describe("isOldEnough", () => {
  it("accepts someone on their 18th birthday and rejects the day before", () => {
    expect(isOldEnough(isoYearsAgo(18))).toBe(true)
    expect(isOldEnough(isoYearsAgo(18, 1))).toBe(false)
  })

  it("rejects an unparseable date", () => {
    expect(isOldEnough("not-a-date")).toBe(false)
  })
})

describe("PersonalSectionSchema", () => {
  it("accepts a TFN on its own", () => {
    expect(PersonalSectionSchema.safeParse(personalFixture()).success).toBe(true)
  })

  it("accepts an exemption reason instead of a TFN", () => {
    const parsed = PersonalSectionSchema.safeParse({
      ...personalFixture(),
      tfn: undefined,
      tfnExemptionReason: "foreign-resident",
    })
    expect(parsed.success).toBe(true)
  })

  it("rejects a submission with neither a TFN nor a reason", () => {
    const parsed = PersonalSectionSchema.safeParse({
      ...personalFixture(),
      tfn: undefined,
    })
    expect(parsed.success).toBe(false)
  })

  it("rejects someone under 18", () => {
    const parsed = PersonalSectionSchema.safeParse({
      ...personalFixture(),
      dateOfBirth: isoYearsAgo(17),
    })
    expect(parsed.success).toBe(false)
  })
})

describe("ContactSectionSchema", () => {
  it("rejects a confirmation email that doesn't match", () => {
    const parsed = ContactSectionSchema.safeParse({
      ...contactFixture(),
      confirmEmail: "someone.else@example.com",
    })
    expect(parsed.success).toBe(false)
  })

  it("matches confirmation regardless of case", () => {
    const parsed = ContactSectionSchema.safeParse({
      ...contactFixture(),
      confirmEmail: "MARCUS@EXAMPLE.COM",
    })
    expect(parsed.success).toBe(true)
  })
})

function personalFixture(): KycSectionData["personal"] {
  return {
    title: "mr",
    firstName: "Marcus",
    lastName: "Tiffen",
    dateOfBirth: isoYearsAgo(30),
    gender: "male",
    relationshipStatus: "single",
    visaStatus: "citizen",
    tfn: "123456789",
  }
}

function contactFixture(): KycSectionData["contact"] {
  return {
    mobile: "+61410624386",
    email: "marcus@example.com",
    confirmEmail: "marcus@example.com",
    address: {
      id: "1",
      line1: "28 Church Av",
      suburb: "Mascot",
      state: "NSW",
      postcode: "2020",
      country: "Australia",
    },
    proofOfAddressVerified: true,
  }
}

function fundsFixture(): KycSectionData["funds"] {
  return {
    incomeSources: ["salary"],
    annualIncome: "100k-150k",
    industry: "banking-finance",
    occupation: "analyst",
    activities: ["bills-utilities"],
    transactionCountries: ["AU"],
  }
}
