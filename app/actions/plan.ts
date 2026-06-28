"use server"

import { revalidatePath } from "next/cache"
import { verifySession } from "@/server/auth/dal"
import { subscribePlan, cancelPlan } from "@/server/bff/clients/plan"

export type PlanActionState = { success: boolean; message: string }

const PLAN_PATH = "/settings/plan"

export async function subscribeToPlanAction(
  planId: number,
  billingCycle: string,
): Promise<PlanActionState> {
  const session = await verifySession()
  if (!session.accountId) {
    return { success: false, message: "No account linked to your profile." }
  }
  if (!Number.isInteger(planId)) {
    return { success: false, message: "Invalid plan." }
  }

  try {
    await subscribePlan(session.upstreamJwt, session.accountId, planId, billingCycle)
    revalidatePath(PLAN_PATH)
    return { success: true, message: "Your plan has been updated." }
  } catch {
    return { success: false, message: "Couldn't update your plan. Please try again." }
  }
}

export async function cancelPlanAction(
  planSubscriptionId: string,
  cancelReason?: string,
): Promise<PlanActionState> {
  const session = await verifySession()
  if (!session.accountId) {
    return { success: false, message: "No account linked to your profile." }
  }
  if (!planSubscriptionId) {
    return { success: false, message: "Missing subscription." }
  }

  try {
    await cancelPlan(
      session.upstreamJwt,
      session.accountId,
      planSubscriptionId,
      cancelReason?.trim() || undefined,
    )
    revalidatePath(PLAN_PATH)
    return { success: true, message: "Your plan has been cancelled." }
  } catch {
    return { success: false, message: "Couldn't cancel your plan. Please try again." }
  }
}
