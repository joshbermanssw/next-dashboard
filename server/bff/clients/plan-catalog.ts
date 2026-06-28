import "server-only"
import { bffFetch } from "@/server/bff/http"
import { services } from "@/server/config/services"
import { toCatalogPlan, type CatalogPlan } from "@/lib/plan"
import type { AccountType } from "@/lib/definitions"

// The Assets API uses a `{ success, payload }` envelope and needs no bearer.
type CatalogWireResponse = { success: boolean; payload?: unknown }

export async function getPlanCatalog(
  accountType: AccountType,
): Promise<CatalogPlan[]> {
  const res = await bffFetch<CatalogWireResponse>(
    `${services.assets.baseUrl}/plans/${accountType}`,
    { method: "GET" },
  )
  if (!res?.success || !Array.isArray(res.payload)) return []
  return res.payload.map(toCatalogPlan)
}
