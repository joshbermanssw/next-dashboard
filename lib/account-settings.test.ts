import { describe, it, expect } from "vitest"
import {
  getAccountSettings,
  seedAccounts,
  freshAccountData,
  type Account,
} from "@/lib/dashboard-data"

const byId = (id: string) => {
  const account = seedAccounts.find((a) => a.id === id)
  if (!account) throw new Error(`no seed account ${id}`)
  return account
}

describe("getAccountSettings", () => {
  it("maps the crypto account to its currency and use type", () => {
    const s = getAccountSettings(byId("crypto"))
    expect(s.currency).toBe("USDC")
    expect(s.currencyFlag).toBe("🇺🇸")
    expect(s.useType).toBe("No returns")
  })

  it("uses constant status and location for every account", () => {
    for (const account of seedAccounts) {
      const s = getAccountSettings(account)
      expect(s.status).toBe("Active")
      expect(s.location).toBe("Australia")
    }
  })

  it("derives linkedCards from the account's card list", () => {
    expect(getAccountSettings(byId("crypto")).linkedCards).toBe(2)
    expect(getAccountSettings(byId("everyday")).linkedCards).toBe(1)
  })

  it("reflects the global account's stored currency", () => {
    const s = getAccountSettings(byId("global"))
    expect(s.currency).toBe("USD")
    expect(s.currencyFlag).toBe("🇺🇸")
  })

  it("handles a freshly added account with no cards", () => {
    const account: Account = {
      id: "splitpay-1",
      customerId: "cust-test",
      kind: "splitpay",
      label: "SplitPay",
      accountType: "everyday",
      tier: "BASIC",
      currency: "AUD",
      currencyFlag: "🇦🇺",
      data: freshAccountData(),
    }
    const s = getAccountSettings(account)
    expect(s.linkedCards).toBe(0)
    expect(s.currency).toBe("AUD")
    expect(s.useType).toBe("Shared")
  })
})
