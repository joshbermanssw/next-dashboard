import * as z from "zod"
import type { AccountType } from "@/lib/definitions"

export type PlanTier = "BASIC" | "STANDARD" | "PREMIUM"
export type PlanStatus = "active" | "cancelled" | "expired" | "trial"

/** Bank-card face, one per `public/cards/<design>.svg`. */
export type CardDesign = "basic" | "standard" | "premium" | "business"

/**
 * Picks the bank-card face. A corporate account always shows the business card;
 * everyday accounts show the card matching their plan tier, defaulting to
 * `basic` when the tier is unknown (no plan / the plan fetch failed).
 */
export function planTierToCardDesign(
  tier: PlanTier | null,
  accountType: AccountType,
): CardDesign {
  if (accountType === "corporate") return "business"
  switch (tier) {
    case "PREMIUM":
      return "premium"
    case "STANDARD":
      return "standard"
    default:
      return "basic"
  }
}

const MoneySchema = z.union([z.string(), z.number()]).nullish()

const PlanDetailsSchema = z.object({
  name: z.string(),
  slug: z.string().optional(),
  planType: z.string().nullish(),
  basePrice: MoneySchema,
  currency: z.string().optional(),
  billingCycle: z.string().optional(),
  features: z.unknown().optional(),
})

// data returned by GET /account/{accountId}/plan — a single subscription object.
export const PlanSubscriptionSchema = z.object({
  id: z.string().nullish(),
  planId: z.number(),
  actualPrice: MoneySchema,
  currency: z.string().optional(),
  billingCycle: z.string().optional(),
  status: z.string().nullish(),
  renewAt: z.string().nullish(),
  expiresAt: z.string().nullish(),
  trialEndsAt: z.string().nullish(),
  plans: PlanDetailsSchema,
})

export type CurrentPlan = {
  subscriptionId: string | null
  planId: number
  planName: string
  tier: PlanTier | null
  status: PlanStatus
  formattedPrice: string
  currency: string
  billingCycle: string
  renewAt: string | null
  expiresAt: string | null
  trialEndsAt: string | null
  features: string[]
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

export function formatPlanDate(iso: string | null | undefined): string | null {
  if (!iso) return null
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return null
  return `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`
}

export function formatPlanPrice(
  amount: string | number | null | undefined,
  currency: string,
  billingCycle: string,
): string {
  if (amount === null || amount === undefined || amount === "") return "—"
  const n = typeof amount === "number" ? amount : Number(amount)
  if (Number.isNaN(n)) return "—"
  const money = [currency.trim(), n.toFixed(2)].filter(Boolean).join(" ")
  return billingCycle ? `${money} / ${billingCycle}` : money
}

export function extractFeatures(raw: unknown): string[] {
  if (Array.isArray(raw)) return raw.filter((x): x is string => typeof x === "string")
  if (raw && typeof raw === "object") {
    const items = (raw as { items?: unknown }).items
    if (Array.isArray(items)) return items.filter((x): x is string => typeof x === "string")
  }
  return []
}

function asTier(v: unknown): PlanTier | null {
  return v === "BASIC" || v === "STANDARD" || v === "PREMIUM" ? v : null
}

function asStatus(v: unknown): PlanStatus {
  return v === "active" || v === "cancelled" || v === "expired" || v === "trial" ? v : "active"
}

export function planRenewalLine(plan: CurrentPlan): string {
  if (plan.status === "trial" && plan.trialEndsAt) {
    const d = formatPlanDate(plan.trialEndsAt)
    if (d) return `Trial ends ${d}`
  }
  if (plan.status === "active" && plan.renewAt) {
    const d = formatPlanDate(plan.renewAt)
    if (d) return `Renews on ${d}`
  }
  if (plan.expiresAt) {
    const d = formatPlanDate(plan.expiresAt)
    if (d) return `Expires ${d}`
  }
  return ""
}

export function toCurrentPlan(data: unknown): CurrentPlan {
  const p = PlanSubscriptionSchema.parse(data)
  const currency = p.currency ?? p.plans.currency ?? ""
  const billingCycle = p.billingCycle ?? p.plans.billingCycle ?? ""
  const price = p.actualPrice ?? p.plans.basePrice ?? null
  return {
    subscriptionId: p.id ?? null,
    planId: p.planId,
    planName: p.plans.name,
    tier: asTier(p.plans.planType),
    status: asStatus(p.status),
    formattedPrice: formatPlanPrice(price, currency, billingCycle),
    currency,
    billingCycle,
    renewAt: p.renewAt ?? null,
    expiresAt: p.expiresAt ?? null,
    trialEndsAt: p.trialEndsAt ?? null,
    features: extractFeatures(p.plans.features),
  }
}

// ── Plan catalogue (GET {assets}/plans/{accountType} → payload: PlanDto[]) ──

// PlanDto exposes a monthly price only, in cents, and no currency.
const PlanDtoSchema = z.object({
  ID: z.number(),
  plan_name: z.string(),
  month_cost: z.number(),
  features: z.array(z.string()).optional().default([]),
  learn_more_slug: z.string().optional().default(""),
})

export type CatalogPlan = {
  id: number
  name: string
  tier: PlanTier | null
  monthlyPriceMinor: number
  formattedPrice: string
  features: string[]
  learnMoreSlug: string
}

// Catalogue carries no currency, so the price is shown symbol-free (or "Free").
export function formatCatalogPrice(monthCostMinor: number): string {
  if (!Number.isFinite(monthCostMinor) || monthCostMinor <= 0) return "Free"
  return `${(monthCostMinor / 100).toFixed(2)} / month`
}

export function toCatalogPlan(dto: unknown): CatalogPlan {
  const d = PlanDtoSchema.parse(dto)
  return {
    id: d.ID,
    name: d.plan_name,
    tier: asTier(d.plan_name.toUpperCase()),
    monthlyPriceMinor: d.month_cost,
    formattedPrice: formatCatalogPrice(d.month_cost),
    features: d.features,
    learnMoreSlug: d.learn_more_slug,
  }
}

// ── Plan history (GET {api}/account/{id}/plan/history → data: subscription[]) ──

const PlanHistorySubSchema = z.object({
  id: z.string(),
  status: z.string().nullish(),
  actualPrice: MoneySchema,
  currency: z.string().optional(),
  billingCycle: z.string().optional(),
  startedAt: z.string().nullish(),
  expiresAt: z.string().nullish(),
  cancelledAt: z.string().nullish(),
  plans: PlanDetailsSchema,
})

export type PlanHistoryItem = {
  id: string
  planName: string
  tier: PlanTier | null
  status: PlanStatus
  formattedPrice: string
  startedAt: string | null
  endedAt: string | null
}

export function toPlanHistoryItem(data: unknown): PlanHistoryItem {
  const p = PlanHistorySubSchema.parse(data)
  const currency = p.currency ?? p.plans.currency ?? ""
  const billingCycle = p.billingCycle ?? p.plans.billingCycle ?? ""
  const price = p.actualPrice ?? p.plans.basePrice ?? null
  return {
    id: p.id,
    planName: p.plans.name,
    tier: asTier(p.plans.planType),
    status: asStatus(p.status),
    formattedPrice: formatPlanPrice(price, currency, billingCycle),
    startedAt: p.startedAt ?? null,
    endedAt: p.cancelledAt ?? p.expiresAt ?? null,
  }
}
