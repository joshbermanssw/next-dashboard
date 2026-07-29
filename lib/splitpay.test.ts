import { describe, expect, it } from "vitest"

import {
  ContributeSchema,
  InviteSchema,
  UpdatePledgeSchema,
  cardBrand,
  expiryInFuture,
  fieldErrors,
  fundedPct,
  luhnValid,
  normalizeCardNumber,
  toCreatorSession,
  toPublicContributor,
  toPublicSession,
  toSavedCard,
  toViewerContribution,
} from "@/lib/splitpay"
import {
  contributorStatus,
  paidCount,
  stillOwed,
  seedAccounts,
  type SplitPayContributor,
} from "@/lib/dashboard-data"

const details = seedAccounts.find((a) => a.id === "splitpay")!.splitpay!

function contributor(over: Partial<SplitPayContributor> = {}): SplitPayContributor {
  return {
    id: "c1",
    name: "Test Person",
    initial: "TP",
    email: "t@example.com",
    customerId: null,
    pledged: 100,
    amount: 0,
    targetDate: null,
    isCreator: false,
    authorised: false,
    token: "secret-token",
    savedCard: null,
    ...over,
  }
}

describe("card checks", () => {
  it("strips non-digits from a typed card number", () => {
    expect(normalizeCardNumber("4242 4242-4242 4242")).toBe("4242424242424242")
  })

  it("accepts valid card numbers and rejects mistyped ones", () => {
    expect(luhnValid("4242424242424242")).toBe(true)
    expect(luhnValid("5555555555554444")).toBe(true)
    expect(luhnValid("378282246310005")).toBe(true)
    // A single transposed digit must fail — that is the whole point of Luhn.
    expect(luhnValid("4242424242424243")).toBe(false)
    expect(luhnValid("1234")).toBe(false)
    expect(luhnValid("")).toBe(false)
  })

  it("names the brand from the leading digits", () => {
    expect(cardBrand("4242424242424242")).toBe("Visa")
    expect(cardBrand("5555555555554444")).toBe("Mastercard")
    expect(cardBrand("2223000048400011")).toBe("Mastercard")
    expect(cardBrand("378282246310005")).toBe("Amex")
    expect(cardBrand("9999999999999999")).toBe("Card")
  })

  it("treats a card as valid through the end of its printed month", () => {
    const midJune2026 = Date.UTC(2026, 5, 15)
    expect(expiryInFuture("06/26", midJune2026)).toBe(true)
    expect(expiryInFuture("05/26", midJune2026)).toBe(false)
    expect(expiryInFuture("13/26", midJune2026)).toBe(false)
    expect(expiryInFuture("00/26", midJune2026)).toBe(false)
    expect(expiryInFuture("nonsense", midJune2026)).toBe(false)
  })

  it("keeps only brand and last four from a card", () => {
    expect(toSavedCard("4242424242424242")).toEqual({ brand: "Visa", last4: "4242" })
  })
})

describe("pledge arithmetic", () => {
  it("reads status from amount against pledge", () => {
    expect(contributorStatus(contributor({ pledged: 100, amount: 100 }))).toBe("paid")
    expect(contributorStatus(contributor({ pledged: 100, amount: 150 }))).toBe("paid")
    expect(contributorStatus(contributor({ pledged: 100, amount: 40 }))).toBe("partial")
    expect(contributorStatus(contributor({ pledged: 100, amount: 0 }))).toBe("pending")
  })

  it("never calls a zero pledge paid", () => {
    // Nothing was asked of them, so nothing has been settled.
    expect(contributorStatus(contributor({ pledged: 0, amount: 0 }))).toBe("pending")
  })

  it("never reports a negative amount owed", () => {
    expect(stillOwed(contributor({ pledged: 100, amount: 250 }))).toBe(0)
    expect(stillOwed(contributor({ pledged: 400, amount: 150 }))).toBe(250)
  })

  it("counts the contributors who met their pledge", () => {
    expect(paidCount(details.contributors)).toBe(2)
  })

  it("clamps funded percentage to 0–100", () => {
    expect(fundedPct({ collected: 1_400, targetAmount: 2_400 })).toBeCloseTo(58.33, 1)
    expect(fundedPct({ collected: 5_000, targetAmount: 2_400 })).toBe(100)
    expect(fundedPct({ collected: 100, targetAmount: 0 })).toBe(0)
  })
})

describe("public projections", () => {
  it("withholds the token and email from the public contributor view", () => {
    const projected = toPublicContributor(contributor())
    expect(projected).not.toHaveProperty("token")
    expect(projected).not.toHaveProperty("email")
    expect(projected.status).toBe("pending")
  })

  it("withholds the access code and every token from the public session", () => {
    const session = toPublicSession(details, "Barcelona Trip Fund")
    const serialised = JSON.stringify(session)

    expect(session).not.toHaveProperty("accessCode")
    expect(serialised).not.toContain(details.accessCode)
    expect(serialised).not.toContain("seedtokenbenji1")
  })

  it("summarises the pool for the roster footer", () => {
    const session = toPublicSession(details, "Barcelona Trip Fund")
    expect(session.contributorCount).toBe(6)
    expect(session.paidCount).toBe(2)
    expect(session.remaining).toBe(1_000)
  })

  it("gives the viewer their own outstanding balance and latest receipt", () => {
    const benji = details.contributors.find((c) => c.name === "Benji")!
    const viewer = toViewerContribution(benji, details)

    expect(viewer.amount).toBe(150)
    expect(viewer.stillOwed).toBe(250)
    expect(viewer.status).toBe("partial")
    expect(viewer.latest?.id).toBe("TXN-69420724")
  })

  it("gives a viewer with no payments a null receipt", () => {
    const priya = details.contributors.find((c) => c.name === "Priya Nair")!
    expect(toViewerContribution(priya, details).latest).toBeNull()
  })

  it("gives the creator the code and tokens the public view withholds", () => {
    const session = toCreatorSession(details, "Barcelona Trip Fund")
    expect(session.accessCode).toBe(details.accessCode)
    expect(session.contributors.find((c) => c.name === "Benji")?.token).toBe(
      "seedtokenbenji1"
    )
    expect(session.authorisedCount).toBe(2)
  })
})

describe("schemas", () => {
  const valid = {
    name: "Benji",
    email: "benji@email.com",
    code: "846201",
    amount: 150,
    cardNumber: "4242 4242 4242 4242",
    expiry: "06/30",
    cvv: "123",
    acceptedTerms: true as const,
  }

  it("accepts a well-formed contribution and normalises the card", () => {
    const parsed = ContributeSchema.safeParse(valid)
    expect(parsed.success).toBe(true)
    if (parsed.success) expect(parsed.data.cardNumber).toBe("4242424242424242")
  })

  it("rejects a code that is not six digits", () => {
    expect(ContributeSchema.safeParse({ ...valid, code: "12345" }).success).toBe(false)
    expect(ContributeSchema.safeParse({ ...valid, code: "abcdef" }).success).toBe(false)
  })

  it("rejects a zero or negative contribution", () => {
    expect(ContributeSchema.safeParse({ ...valid, amount: 0 }).success).toBe(false)
    expect(ContributeSchema.safeParse({ ...valid, amount: -5 }).success).toBe(false)
  })

  it("requires the terms checkbox", () => {
    const parsed = ContributeSchema.safeParse({ ...valid, acceptedTerms: false })
    expect(parsed.success).toBe(false)
    if (!parsed.success) {
      expect(fieldErrors(parsed.error).acceptedTerms).toMatch(/terms/i)
    }
  })

  it("rejects a card that fails Luhn", () => {
    const parsed = ContributeSchema.safeParse({ ...valid, cardNumber: "4242424242424243" })
    expect(parsed.success).toBe(false)
    if (!parsed.success) {
      expect(fieldErrors(parsed.error).cardNumber).toMatch(/card number/i)
    }
  })

  it("allows an empty target date but not a malformed one", () => {
    expect(UpdatePledgeSchema.safeParse({ pledged: 100, targetDate: "" }).success).toBe(true)
    expect(
      UpdatePledgeSchema.safeParse({ pledged: 100, targetDate: "2026-08-15" }).success
    ).toBe(true)
    expect(
      UpdatePledgeSchema.safeParse({ pledged: 100, targetDate: "15/08/2026" }).success
    ).toBe(false)
  })

  it("rejects a negative pledge", () => {
    expect(UpdatePledgeSchema.safeParse({ pledged: -1, targetDate: "" }).success).toBe(false)
  })

  it("requires a real email on an invite", () => {
    expect(
      InviteSchema.safeParse({ name: "Ringo", email: "ringo@example.com", pledged: 100 })
        .success
    ).toBe(true)
    expect(
      InviteSchema.safeParse({ name: "Ringo", email: "not-an-email", pledged: 100 }).success
    ).toBe(false)
  })

  it("reports one error per field, in field order", () => {
    const parsed = ContributeSchema.safeParse({
      ...valid,
      name: "",
      email: "not-an-email",
      code: "1",
    })
    expect(parsed.success).toBe(false)
    if (!parsed.success) {
      const errors = fieldErrors(parsed.error)
      expect(Object.keys(errors)).toEqual(["name", "email", "code"])
    }
  })
})
