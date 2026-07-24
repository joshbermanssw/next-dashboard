import "server-only"
import { bffFetch } from "@/server/bff/http"
import { services } from "@/server/config/services"
import {
  deriveActivationStatus,
  EMPTY_ACTIVATION_SNAPSHOT,
  type ActivationStatus,
} from "@/lib/activation"

/**
 * The KYC application has no documented response schema, and the status has
 * moved around as the backend evolved. Read the plausible locations rather than
 * binding to one path — an unrecognised shape degrades to "not verified", which
 * is the safe direction (prompt the user rather than hide a gap).
 */
function readKycStatus(body: unknown): string | null {
  if (!body || typeof body !== "object") return null
  const data = (body as { data?: unknown }).data
  const source = (data && typeof data === "object" ? data : body) as Record<
    string,
    unknown
  >
  for (const key of ["status", "applicationStatus", "state", "overallStatus"]) {
    const v = source[key]
    if (typeof v === "string" && v.length > 0) return v
  }
  return null
}

function readPreferencesStatus(body: unknown): string | null {
  if (!body || typeof body !== "object") return null
  const data = (body as { data?: { workflowStatus?: unknown } }).data
  const v = data?.workflowStatus
  return typeof v === "string" && v.length > 0 ? v : null
}

/**
 * Gathers the activation checklist for a customer.
 *
 * Both reads are independent and best-effort: a failing KYC service must not
 * blank the preferences row, and neither should ever throw into a page render.
 * `security` and `billing` are reported as outstanding because no endpoint
 * backs them yet — see `ActivationSnapshot`.
 */
export async function getActivationStatus(
  bearer: string,
  customerId: string,
): Promise<ActivationStatus> {
  const [kyc, preferences] = await Promise.all([
    bffFetch<unknown>(`${services.accounts.baseUrl}/kyc/application`, {
      method: "GET",
      bearer,
    }).catch(() => null),
    bffFetch<unknown>(
      `${services.accounts.baseUrl}/customers/${customerId}/preferences-workflow`,
      { method: "GET", bearer },
    ).catch(() => null),
  ])

  return deriveActivationStatus({
    ...EMPTY_ACTIVATION_SNAPSHOT,
    kycStatus: readKycStatus(kyc),
    preferencesStatus: readPreferencesStatus(preferences),
  })
}
