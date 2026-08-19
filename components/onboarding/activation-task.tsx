import Link from "next/link"
import { MdArrowBack } from "react-icons/md"
import HeadingTag from "@/components/util/heading-tag"
import type { ActivationTaskId } from "@/lib/activation"

/**
 * Identity verification has a real flow at `/activate/identity`. These three
 * journeys — biometric enrolment, the preferences workflow and payment methods
 * — are still mobile-only, so the web rows explain that rather than opening a
 * form that can't be finished.
 */
export type PlaceholderTaskId = Exclude<ActivationTaskId, "identity">

const COPY: Record<PlaceholderTaskId, { title: string; subtitle: string }> = {
  security: {
    title: "Secure your account",
    subtitle: "Biometrics, PIN and trusted devices.",
  },
  preferences: {
    title: "Set your preferences",
    subtitle: "Notifications, limits and display.",
  },
  billing: {
    title: "Complete billing setup",
    subtitle: "Add a payment method to your plan.",
  },
}

export function ActivationTask({ task }: { task: PlaceholderTaskId }) {
  const { title, subtitle } = COPY[task]

  return (
    <div className="flex flex-col gap-7 rounded-2xl border border-panel-border bg-blueDarkest/80 px-6 py-8 shadow-2xl backdrop-blur-sm sm:px-10 sm:py-10">
      <header className="space-y-2">
        <Link
          href="/activate"
          aria-label="Back to activation steps"
          className="mb-2 inline-flex size-9 items-center justify-center rounded-full border border-surfaceCardDark text-blueLight transition-colors hover:bg-white/10 hover:text-blueLightest"
        >
          <MdArrowBack className="size-5" />
        </Link>
        <HeadingTag level={5} className="font-semibold perspective-distant">
          {title}
        </HeadingTag>
        <p className="text-sm text-blueLight">{subtitle}</p>
      </header>

      <div className="flex flex-col gap-3 rounded-xl border border-warning/30 bg-warning/10 p-4">
        <p className="text-sm text-blueLightest">
          This step isn&apos;t available on web yet. Complete it in the DosshPay
          mobile app, and it will show as done here.
        </p>
        <Link
          href="/activate"
          className="text-sm font-medium text-accentBlue hover:text-accentBlueHover"
        >
          Back to activation steps
        </Link>
      </div>
    </div>
  )
}
