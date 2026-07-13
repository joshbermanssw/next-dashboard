import { describe, it, expect } from "vitest"
import {
  brandLabel,
  accountCardDesign,
  seedAccounts,
  type Account,
} from "@/lib/dashboard-data"

describe("brandLabel", () => {
  it("labels each brand", () => {
    expect(brandLabel("mastercard")).toBe("Mastercard")
    expect(brandLabel("visa")).toBe("Visa")
  })
})

describe("accountCardDesign", () => {
  const base = seedAccounts[0]

  it("maps an everyday account's tier to its face", () => {
    expect(
      accountCardDesign({ ...base, accountType: "everyday", tier: "PREMIUM" })
    ).toBe("premium")
    expect(
      accountCardDesign({ ...base, accountType: "everyday", tier: "STANDARD" })
    ).toBe("standard")
    expect(
      accountCardDesign({ ...base, accountType: "everyday", tier: "BASIC" })
    ).toBe("basic")
  })

  it("falls back to basic when an everyday account has no tier", () => {
    expect(
      accountCardDesign({ ...base, accountType: "everyday", tier: null })
    ).toBe("basic")
  })

  it("always shows the business face for corporate accounts", () => {
    const corp: Account = { ...base, accountType: "corporate", tier: "PREMIUM" }
    expect(accountCardDesign(corp)).toBe("business")
    expect(accountCardDesign({ ...corp, tier: null })).toBe("business")
  })

  it("resolves each seed account without throwing", () => {
    for (const account of seedAccounts) {
      expect(accountCardDesign(account)).toMatch(
        /^(basic|standard|premium|business)$/
      )
    }
  })
})
