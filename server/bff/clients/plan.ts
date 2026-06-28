import "server-only"
import { bffFetch, UpstreamError } from "@/server/bff/http"
import { services } from "@/server/config/services"
import {
  toCurrentPlan,
  toPlanHistoryItem,
  type CurrentPlan,
  type PlanHistoryItem,
} from "@/lib/plan"

type PlanWireResponse = { success: boolean; data: unknown }

function planUrl(accountId: string, suffix = ""): string {
  return `${services.accounts.baseUrl}/account/${accountId}/plan${suffix}`
}

export async function getCurrentPlan(
  bearer: string,
  accountId: string,
): Promise<CurrentPlan | null> {
  try {
    const res = await bffFetch<PlanWireResponse>(planUrl(accountId), {
      bearer,
      method: "GET",
    })
    if (!res?.success || res.data == null) return null
    return toCurrentPlan(res.data)
  } catch (err) {
    // No active plan → treat as empty, not an error.
    if (err instanceof UpstreamError && err.status === 404) return null
    throw err
  }
}

export async function getPlanHistory(
  bearer: string,
  accountId: string,
): Promise<PlanHistoryItem[]> {
  try {
    const res = await bffFetch<PlanWireResponse>(planUrl(accountId, "/history"), {
      bearer,
      method: "GET",
    })
    if (!res?.success || !Array.isArray(res.data)) return []
    return res.data.map(toPlanHistoryItem)
  } catch (err) {
    if (err instanceof UpstreamError && err.status === 404) return []
    throw err
  }
}

export async function subscribePlan(
  bearer: string,
  accountId: string,
  planId: number,
  billingCycle: string,
): Promise<void> {
  await bffFetch(planUrl(accountId), {
    bearer,
    method: "POST",
    // `Id` is the legacy duplicate of planId the backend still requires.
    body: JSON.stringify({
      planId,
      Id: planId,
      billingCycle,
      autoRenew: true,
      isTrialPeriod: false,
    }),
  })
}

export async function cancelPlan(
  bearer: string,
  accountId: string,
  planSubscriptionId: string,
  cancelReason?: string,
): Promise<void> {
  await bffFetch(planUrl(accountId, `/${planSubscriptionId}`), {
    bearer,
    method: "DELETE",
    body: JSON.stringify(cancelReason ? { cancelReason } : {}),
  })
}
