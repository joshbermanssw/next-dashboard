import * as z from "zod"

export type PlanTier = "BASIC" | "STANDARD" | "PREMIUM"
export type PlanStatus = "active" | "cancelled" | "expired" | "trial"

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
