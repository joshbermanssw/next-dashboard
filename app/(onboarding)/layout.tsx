import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "DosshPay — Set up your account",
}

/**
 * Full-screen shell for post-signup setup. Deliberately has no sidebar or
 * header: the customer has an account but nothing provisioned yet, so there is
 * nothing to navigate to.
 *
 * No auth check here — layouts do not re-render on navigation (Partial
 * Rendering), so every page in this group calls `verifySession()` itself.
 */
export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-10 sm:px-6">
      <main className="w-full max-w-xl">{children}</main>
    </div>
  )
}
