import { describe, it, expect } from "vitest"
import {
  brandLabel,
  accountCardDesign,
  seedAccounts,
  CRYPTO_CURRENCIES,
  GLOBAL_CURRENCIES,
  CURRENCY_BY_CODE,
  currencyOptionsForKind,
  AUD_CURRENCY,
  formatCountdown,
  SPLITPAY_DURATION_PRESETS,
  SPLITPAY_TARGET_PRESETS,
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

describe("currencies", () => {
  it("catalogues have unique codes and complete fields", () => {
    const all = [...CRYPTO_CURRENCIES, ...GLOBAL_CURRENCIES]
    const codes = all.map((c) => c.code)
    expect(new Set(codes).size).toBe(codes.length)
    for (const c of all) {
      expect(c.code).toBeTruthy()
      expect(c.symbol).toBeTruthy()
      expect(c.name).toBeTruthy()
      expect(c.flag).toBeTruthy()
    }
  })

  it("indexes every catalogue currency by code", () => {
    for (const c of [...CRYPTO_CURRENCIES, ...GLOBAL_CURRENCIES]) {
      expect(CURRENCY_BY_CODE[c.code]).toEqual(c)
    }
  })

  it("offers stablecoins for crypto and fiat for global", () => {
    expect(currencyOptionsForKind("crypto")).toBe(CRYPTO_CURRENCIES)
    expect(currencyOptionsForKind("global")).toBe(GLOBAL_CURRENCIES)
  })

  it("fixes everyday, splitpay and asset to AUD (no currency step)", () => {
    expect(currencyOptionsForKind("everyday")).toBeNull()
    expect(currencyOptionsForKind("splitpay")).toBeNull()
    expect(currencyOptionsForKind("asset")).toBeNull()
    expect(AUD_CURRENCY.code).toBe("AUD")
  })

  it("seeds every account with a currency that resolves in the catalogue", () => {
    for (const account of seedAccounts) {
      expect(CURRENCY_BY_CODE[account.currency]).toBeTruthy()
      expect(account.currencyFlag).toBe(CURRENCY_BY_CODE[account.currency].flag)
    }
  })
})

describe("splitpay", () => {
  const SECOND = 1000
  const MINUTE = 60 * SECOND
  const HOUR = 60 * MINUTE
  const DAY = 24 * HOUR

  it("formats a full d/h/min countdown", () => {
    expect(formatCountdown(2 * DAY + 23 * HOUR + 59 * MINUTE)).toBe(
      "2d 23h 59min"
    )
  })

  it("drops leading zero units but always keeps minutes", () => {
    expect(formatCountdown(59 * MINUTE)).toBe("59min")
    expect(formatCountdown(HOUR + MINUTE)).toBe("1h 1min")
    expect(formatCountdown(DAY)).toBe("1d 0h 0min")
  })

  it("clamps to 0min at or below zero", () => {
    expect(formatCountdown(0)).toBe("0min")
    expect(formatCountdown(30 * SECOND)).toBe("0min")
    expect(formatCountdown(-5 * HOUR)).toBe("0min")
  })

  it("exposes non-empty target and duration presets", () => {
    expect(SPLITPAY_TARGET_PRESETS).toContain("Wedding")
    expect(SPLITPAY_DURATION_PRESETS.map((d) => d.label)).toEqual([
      "6h",
      "12h",
      "1d",
      "2d",
      "3d",
      "7d",
    ])
    expect(SPLITPAY_DURATION_PRESETS.find((d) => d.label === "2d")?.hours).toBe(
      48
    )
  })
})
