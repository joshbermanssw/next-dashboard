import "server-only"
import type { KycApplication, KycSectionData, KycSectionKey } from "@/lib/kyc"

/**
 * In-memory stand-in for the KYC application service.
 *
 * The backend owns this data (`GET /api/kyc/application`,
 * `PUT /api/kyc/applications/{applicationId}/sections/{sectionKey}`), but the
 * web flow is being built ahead of those writes being wired up, so submitted
 * sections land here instead. Swapping in the real service means replacing the
 * three function bodies below — nothing above this module knows where the data
 * lives.
 *
 * Caveat while it is a Map: state is per server process, so it survives page
 * navigation and refresh but is cleared by a restart or a dev-server rebuild.
 */
const applications = new Map<string, KycApplication>()

export function readKycApplication(customerId: string): KycApplication {
  return applications.get(customerId) ?? {}
}

/** Submits one section, replacing any previous submission of that section. */
export function writeKycSection<K extends KycSectionKey>(
  customerId: string,
  section: K,
  data: KycSectionData[K],
): KycApplication {
  const next: KycApplication = {
    ...readKycApplication(customerId),
    [section]: data,
  }
  applications.set(customerId, next)
  return next
}

/** Dev affordance: start the flow over without a new account. */
export function clearKycApplication(customerId: string): void {
  applications.delete(customerId)
}
