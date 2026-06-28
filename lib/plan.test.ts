import { describe, it, expect } from "vitest"
import {
  formatPlanPrice,
  formatPlanDate,
  extractFeatures,
  planRenewalLine,
  toCurrentPlan,
  type CurrentPlan,
} from "@/lib/plan"

describe("formatPlanPrice", () => {
  it("formats string amount with currency and cycle", () => {
    expect(formatPlanPrice("29.99", "USD", "monthly")).toBe("USD 29.99 / monthly")
  })
  it("formats numeric amount to 2dp", () => {
    expect(formatPlanPrice(29, "GHS", "yearly")).toBe("GHS 29.00 / yearly")
  })
  it("omits empty currency", () => {
    expect(formatPlanPrice("19.5", "", "monthly")).toBe("19.50 / monthly")
  })
  it("returns em dash for missing/invalid amount", () => {
    expect(formatPlanPrice(null, "USD", "monthly")).toBe("—")
    expect(formatPlanPrice("abc", "USD", "monthly")).toBe("—")
  })
})

describe("formatPlanDate", () => {
  it("formats an ISO date in UTC", () => {
    expect(formatPlanDate("2026-07-15T00:00:00Z")).toBe("15 Jul 2026")
  })
  it("returns null for missing or invalid input", () => {
    expect(formatPlanDate(null)).toBeNull()
    expect(formatPlanDate("not-a-date")).toBeNull()
  })
})

describe("extractFeatures", () => {
  it("reads a string array", () => {
    expect(extractFeatures(["a", "b"])).toEqual(["a", "b"])
  })
  it("reads an { items } object", () => {
    expect(extractFeatures({ items: ["x", "y"] })).toEqual(["x", "y"])
  })
  it("returns [] for anything else", () => {
    expect(extractFeatures({})).toEqual([])
    expect(extractFeatures(undefined)).toEqual([])
  })
})

describe("planRenewalLine", () => {
  const base: CurrentPlan = {
    planName: "Premium", tier: "PREMIUM", status: "active",
    formattedPrice: "USD 29.99 / monthly", currency: "USD", billingCycle: "monthly",
    renewAt: null, expiresAt: null, trialEndsAt: null, features: [],
  }
  it("shows trial end when on trial", () => {
    expect(planRenewalLine({ ...base, status: "trial", trialEndsAt: "2026-07-15T00:00:00Z" }))
      .toBe("Trial ends 15 Jul 2026")
  })
  it("shows renewal when active", () => {
    expect(planRenewalLine({ ...base, renewAt: "2026-08-01T00:00:00Z" }))
      .toBe("Renews on 1 Aug 2026")
  })
  it("falls back to expiry", () => {
    expect(planRenewalLine({ ...base, status: "expired", expiresAt: "2026-06-01T00:00:00Z" }))
      .toBe("Expires 1 Jun 2026")
  })
  it("returns empty when no dates", () => {
    expect(planRenewalLine(base)).toBe("")
  })
})

describe("toCurrentPlan", () => {
  const wire = {
    planId: 3,
    actualPrice: "29.99",
    currency: "USD",
    billingCycle: "monthly",
    status: "active",
    renewAt: "2026-08-01T00:00:00Z",
    expiresAt: null,
    trialEndsAt: null,
    plans: {
      id: 3, name: "Premium", slug: "premium", planType: "PREMIUM",
      basePrice: "29.99", currency: "USD", billingCycle: "monthly",
      features: { items: ["Global accounts", "Multi-pay"] },
    },
  }
  it("maps a full subscription object", () => {
    expect(toCurrentPlan(wire)).toEqual({
      planName: "Premium", tier: "PREMIUM", status: "active",
      formattedPrice: "USD 29.99 / monthly", currency: "USD", billingCycle: "monthly",
      renewAt: "2026-08-01T00:00:00Z", expiresAt: null, trialEndsAt: null,
      features: ["Global accounts", "Multi-pay"],
    })
  })
  it("falls back to plans.basePrice and tolerates unknown tier/status", () => {
    const result = toCurrentPlan({
      planId: 1,
      plans: { id: 1, name: "Basic", planType: "MYSTERY", basePrice: "0", currency: "USD", billingCycle: "monthly" },
    })
    expect(result.tier).toBeNull()
    expect(result.status).toBe("active")
    expect(result.formattedPrice).toBe("USD 0.00 / monthly")
    expect(result.features).toEqual([])
  })
  it("throws on structurally invalid data (missing plans.name)", () => {
    expect(() => toCurrentPlan({ planId: 1, plans: { id: 1 } })).toThrow()
  })
})
