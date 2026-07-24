import { describe, it, expect } from "vitest"
import {
  priceFor,
  formatMinor,
  cycleSuffix,
  cycleLabel,
  MONTHS_PER_YEAR,
} from "@/lib/plan-pricing"
import { toCatalogPlan, type CatalogPlan } from "@/lib/plan"

// Mirrors the live Standard plan from GET {assets}/plans/everyday.
const standard: CatalogPlan = toCatalogPlan({
  ID: 2,
  plan_name: "Standard",
  month_cost: 599,
  features: ["All Basic features"],
  add_ons: [
    { name: "Splitpay", cost: 500, description: "Share expenses" },
    { name: "Multipay", cost: 500, description: "Split payments" },
  ],
  learn_more_slug: "/standard",
})

const free: CatalogPlan = toCatalogPlan({
  ID: 1,
  plan_name: "Basic",
  month_cost: 0,
  features: [],
  add_ons: [],
  learn_more_slug: "/basic",
})

describe("catalogue add-ons", () => {
  it("keeps only add-ons the soft-provisioning enum accepts", () => {
    // Multipay is advertised by the catalogue but rejected upstream, so it must
    // never reach the picker.
    expect(standard.addOns.map((a) => a.key)).toEqual(["SPLIT_PAY"])
  })

  it("carries the add-on price and description through", () => {
    expect(standard.addOns[0]).toMatchObject({
      key: "SPLIT_PAY",
      name: "Splitpay",
      description: "Share expenses",
      monthlyPriceMinor: 500,
    })
  })

  it("defaults to no add-ons when the field is absent", () => {
    expect(free.addOns).toEqual([])
  })
})

describe("priceFor — monthly", () => {
  it("charges the base price with no add-ons", () => {
    expect(priceFor(standard, [], "MONTHLY")).toEqual({
      baseMinor: 599,
      addOnsMinor: 0,
      totalMinor: 599,
      savingsMinor: 0,
    })
  })

  it("adds the selected add-on to the monthly total", () => {
    expect(priceFor(standard, ["SPLIT_PAY"], "MONTHLY")).toMatchObject({
      baseMinor: 599,
      addOnsMinor: 500,
      totalMinor: 1099,
    })
  })

  it("never reports savings on a monthly cycle", () => {
    expect(priceFor(standard, ["SPLIT_PAY"], "MONTHLY").savingsMinor).toBe(0)
  })

  it("prices a free plan at zero", () => {
    expect(priceFor(free, [], "MONTHLY").totalMinor).toBe(0)
  })
})

describe("priceFor — annual", () => {
  it("discounts the base plan by 10% over twelve months", () => {
    // 599 x 12 = 7188, less 10% = 6469.2, rounded to 6469 -> "$64.69".
    expect(priceFor(standard, [], "ANNUAL").baseMinor).toBe(6469)
  })

  it("does NOT discount add-ons", () => {
    const { addOnsMinor } = priceFor(standard, ["SPLIT_PAY"], "ANNUAL")
    expect(addOnsMinor).toBe(500 * MONTHS_PER_YEAR)
  })

  it("sums base and add-ons into the total", () => {
    const p = priceFor(standard, ["SPLIT_PAY"], "ANNUAL")
    expect(p.totalMinor).toBe(p.baseMinor + p.addOnsMinor)
    expect(p.totalMinor).toBe(6469 + 6000)
  })

  it("reports savings against twelve monthly payments", () => {
    const annual = priceFor(standard, ["SPLIT_PAY"], "ANNUAL")
    const monthly = priceFor(standard, ["SPLIT_PAY"], "MONTHLY")
    expect(annual.savingsMinor).toBe(
      monthly.totalMinor * MONTHS_PER_YEAR - annual.totalMinor,
    )
  })

  it("saves nothing on a free plan", () => {
    expect(priceFor(free, [], "ANNUAL")).toMatchObject({
      totalMinor: 0,
      savingsMinor: 0,
    })
  })
})

describe("priceFor — selection handling", () => {
  it("ignores add-on keys the plan does not offer", () => {
    expect(priceFor(free, ["SPLIT_PAY"], "MONTHLY").addOnsMinor).toBe(0)
  })
})

describe("formatting", () => {
  it("renders minor units as dollars", () => {
    expect(formatMinor(1599)).toBe("$15.99")
    expect(formatMinor(6469)).toBe("$64.69")
    expect(formatMinor(0)).toBe("$0.00")
  })

  it("returns an em dash for a non-finite amount", () => {
    expect(formatMinor(Number.NaN)).toBe("—")
  })

  it("suffixes and labels each cycle", () => {
    expect(cycleSuffix("MONTHLY")).toBe("AUD / month")
    expect(cycleSuffix("ANNUAL")).toBe("AUD / year")
    expect(cycleLabel("MONTHLY")).toBe("Monthly")
    expect(cycleLabel("ANNUAL")).toBe("Annual")
  })
})
