import Link from "next/link"
import { verifySession } from "@/server/auth/dal"
import { getCurrentPlan, getPlanHistory } from "@/server/bff/clients/plan"
import { getPlanCatalog } from "@/server/bff/clients/plan-catalog"
import { resolveAccount } from "@/server/auth/account"
import { CurrentPlanCard } from "@/components/dashboard/settings/plan/current-plan-card"
import { PlanFeatures } from "@/components/dashboard/settings/plan/plan-features"
import { CatalogSection } from "@/components/dashboard/settings/plan/catalog-section"
import { CancelPlan } from "@/components/dashboard/settings/plan/cancel-plan"
import { PlanHistory } from "@/components/dashboard/settings/plan/plan-history"
import { Panel } from "@/components/ui/panel"

function PlanMessage({ title, body }: { title: string; body: string }) {
  return (
    <Panel className="flex flex-col gap-1 p-5">
      <p className="text-base font-medium text-blueLightest">{title}</p>
      <p className="text-sm text-blueLight">{body}</p>
    </Panel>
  )
}

export default async function PlanPage() {
  const session = await verifySession()
  const { accountId, accountType } = await resolveAccount(session)

  if (!accountId) {
    return (
      <div className="flex flex-1 flex-col gap-6 px-4 py-6 lg:px-6">
        <h1 className="text-2xl font-semibold text-blueLightest">Your Plan</h1>
        <div className="flex max-w-4xl flex-col gap-6">
          <PlanMessage
            title="No account found"
            body="We couldn't find an account linked to your profile. Please contact support."
          />
        </div>
      </div>
    )
  }

  // Each fetch is independently guarded so one failing section doesn't break the
  // others. revalidatePath() re-runs all three after a subscribe/cancel.
  const [planResult, catalog, history] = await Promise.all([
    getCurrentPlan(session.upstreamJwt, accountId)
      .then((plan) => ({ ok: true as const, plan }))
      .catch(() => ({ ok: false as const, plan: null })),
    getPlanCatalog(accountType).catch(() => []),
    getPlanHistory(session.upstreamJwt, accountId).catch(() => []),
  ])

  const plan = planResult.ok ? planResult.plan : null

  return (
    <div className="flex flex-1 flex-col gap-6 px-4 py-6 lg:px-6">
      <h1 className="text-2xl font-semibold text-blueLightest">Your Plan</h1>

      <div className="flex max-w-4xl flex-col gap-6">
        {!planResult.ok ? (
          <PlanMessage
            title="Couldn't load your current plan"
            body="You can still choose a plan below. Try refreshing to see your active plan."
          />
        ) : plan ? (
          <>
            <CurrentPlanCard plan={plan} />
            <PlanFeatures features={plan.features} />
            {plan.subscriptionId && <CancelPlan subscriptionId={plan.subscriptionId} />}
          </>
        ) : (
          <PlanMessage
            title="No active plan"
            body="You don't have an active subscription. Choose a plan below to get started."
          />
        )}

        <CatalogSection
          plans={catalog}
          currentPlanId={plan?.planId ?? null}
          hasActivePlan={Boolean(plan)}
        />

        <PlanHistory items={history} />

        <p className="text-xs text-label">
          Trouble with your plan?{" "}
          <Link href="/settings" className="text-accentBlue hover:text-accentBlueHover">
            Back to settings
          </Link>
        </p>
      </div>
    </div>
  )
}
