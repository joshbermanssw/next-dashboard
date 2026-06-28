import { describe, it, expect } from "vitest"
import { normalizeAccountType, extractAccountType } from "@/lib/definitions"
import {
  formatCatalogPrice,
  toCatalogPlan,
  toPlanHistoryItem,
} from "@/lib/plan"

describe("normalizeAccountType", () => {
  it("maps corporate/business variants to corporate", () => {
    expect(normalizeAccountType("corporate")).toBe("corporate")
    expect(normalizeAccountType("CORPORATE")).toBe("corporate")
    expect(normalizeAccountType("business")).toBe("corporate")
  })
  it("defaults everything else (incl. null) to everyday", () => {
    expect(normalizeAccountType("everyday")).toBe("everyday")
    expect(normalizeAccountType("personal")).toBe("everyday")
    expect(normalizeAccountType(null)).toBe("everyday")
    expect(normalizeAccountType(undefined)).toBe("everyday")
  })
})

describe("extractAccountType", () => {
  it("reads + normalizes accounts.accountType", () => {
    expect(extractAccountType({ accounts: { id: "a", accountType: "CORPORATE" } })).toBe("corporate")
  })
  it("returns undefined when absent (so the caller can default)", () => {
    expect(extractAccountType({ accounts: { id: "a" } })).toBeUndefined()
    expect(extractAccountType({ accounts: { id: "a", accountType: null } })).toBeUndefined()
    expect(extractAccountType("nope")).toBeUndefined()
  })
})

describe("formatCatalogPrice", () => {
  it("formats cents to a monthly price", () => {
    expect(formatCatalogPrice(599)).toBe("5.99 / month")
    expect(formatCatalogPrice(1099)).toBe("10.99 / month")
  })
  it("shows Free for zero or negative", () => {
    expect(formatCatalogPrice(0)).toBe("Free")
    expect(formatCatalogPrice(-1)).toBe("Free")
  })
})

describe("toCatalogPlan", () => {
  it("maps a PlanDto and infers tier from the name", () => {
    expect(
      toCatalogPlan({
        ID: 3,
        plan_name: "Premium",
        month_cost: 1099,
        features: ["Global account", "Crypto wallet"],
        learn_more_slug: "/premium",
      }),
    ).toEqual({
      id: 3,
      name: "Premium",
      tier: "PREMIUM",
      monthlyPriceMinor: 1099,
      formattedPrice: "10.99 / month",
      features: ["Global account", "Crypto wallet"],
      learnMoreSlug: "/premium",
    })
  })
  it("defaults missing features to [] and unknown names to null tier", () => {
    const r = toCatalogPlan({ ID: 9, plan_name: "Mystery", month_cost: 0 })
    expect(r.features).toEqual([])
    expect(r.tier).toBeNull()
    expect(r.formattedPrice).toBe("Free")
  })
  it("throws on malformed data", () => {
    expect(() => toCatalogPlan({ plan_name: "x" })).toThrow()
  })
})

describe("toPlanHistoryItem", () => {
  const sub = {
    id: "plan-sub-1",
    status: "cancelled",
    actualPrice: "10.99",
    currency: "AUD",
    billingCycle: "monthly",
    startedAt: "2026-05-01T00:00:00Z",
    expiresAt: null,
    cancelledAt: "2026-06-01T00:00:00Z",
    plans: { name: "Premium", planType: "PREMIUM" },
  }
  it("maps a subscription to a history item, ending at cancelledAt", () => {
    expect(toPlanHistoryItem(sub)).toEqual({
      id: "plan-sub-1",
      planName: "Premium",
      tier: "PREMIUM",
      status: "cancelled",
      formattedPrice: "AUD 10.99 / monthly",
      startedAt: "2026-05-01T00:00:00Z",
      endedAt: "2026-06-01T00:00:00Z",
    })
  })
  it("falls back to expiresAt for endedAt when not cancelled", () => {
    const r = toPlanHistoryItem({ ...sub, status: "expired", cancelledAt: null, expiresAt: "2026-07-01T00:00:00Z" })
    expect(r.endedAt).toBe("2026-07-01T00:00:00Z")
  })
})
