import type { Metadata } from "next"
import Image from "next/image"

export const metadata: Metadata = {
  title: "DosshPay — SplitPay",
}

/**
 * Shell for the public SplitPay pages.
 *
 * Deliberately sidebar-less and session-less: these are opened from an invite
 * email by people who may have no DosshPay account at all, often on a phone.
 * Narrow column, dark DosshPay surface, and no navigation that would imply an
 * app they haven't signed up for.
 */
export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    // `bg-background-gradient`, not `bg-neutralBlack`: the dashboard and the
    // body both paint the DosshPay navy radial, and a flat black shell here
    // would paint over it — leaving the one page a stranger ever sees as the
    // only off-brand surface in the app.
    <div className="min-h-screen bg-background-gradient">
      <header className="flex items-center justify-center gap-2 px-4 py-5">
        <Image
          src="/logos/dosh/dosh-d-white.svg"
          alt=""
          width={18}
          height={18}
        />
        <span className="text-sm font-semibold text-blueLightest">DosshPay</span>
      </header>
      <main className="mx-auto w-full max-w-md px-4 pb-16">{children}</main>
    </div>
  )
}
