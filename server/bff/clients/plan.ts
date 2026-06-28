import "server-only"
import { bffFetch, UpstreamError } from "@/server/bff/http"
import { services } from "@/server/config/services"
import { toCurrentPlan, type CurrentPlan } from "@/lib/plan"

type PlanWireResponse = { success: boolean; data: unknown }

export async function getCurrentPlan(
  bearer: string,
  accountId: string,
): Promise<CurrentPlan | null> {
  try {
    const res = await bffFetch<PlanWireResponse>(
      `${services.accounts.baseUrl}/account/${accountId}/plan`,
      { bearer, method: "GET" },
    )
    if (!res?.success || res.data == null) return null
    return toCurrentPlan(res.data)
  } catch (err) {
    // No active plan → treat as empty, not an error.
    if (err instanceof UpstreamError && err.status === 404) return null
    throw err
  }
}
