import { getSession } from "@/server/auth/session"
import { getActivationStatus } from "@/server/bff/aggregators/activation"
import { NavUser } from "@/components/nav-user"

/**
 * Resolves whether the customer still has activation steps outstanding, then
 * renders the user menu with the alert dot.
 *
 * Streamed behind Suspense so two upstream reads can never delay the header
 * shell — the menu renders immediately without a dot, and the dot appears when
 * the status resolves.
 *
 * Uses `getSession()` rather than `verifySession()`: this is a decoration, and
 * a missing session here should render the plain menu, not redirect out of a
 * page that has already authorised itself.
 */
export async function NavUserActivation() {
  const session = await getSession()
  if (!session) return <NavUser />

  const status = await getActivationStatus(
    session.upstreamJwt,
    session.customer.id,
  )

  return <NavUser activationIncomplete={!status.complete} />
}
