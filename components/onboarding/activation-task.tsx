import Link from "next/link"
import {
  MdArrowBack,
  MdBadge,
  MdCreditCard,
  MdDirectionsCar,
  MdHome,
  MdPhoneIphone,
} from "react-icons/md"
import HeadingTag from "@/components/util/heading-tag"
import { Badge } from "@/components/ui/badge"
import type { ActivationTaskId } from "@/lib/activation"

type Requirement = {
  icon: React.ReactNode
  title: string
  detail: string
  necessity: "Required" | "May be required"
}

const IDENTITY_DOCUMENTS: Requirement[] = [
  {
    icon: <MdBadge className="size-5" />,
    title: "Passport",
    detail: "Valid or recently expired",
    necessity: "Required",
  },
  {
    icon: <MdDirectionsCar className="size-5" />,
    title: "Driver's licence",
    detail: "Front and back photo required",
    necessity: "Required",
  },
  {
    icon: <MdCreditCard className="size-5" />,
    title: "National ID card",
    detail: "Medicare, birth certificate or national ID",
    necessity: "Required",
  },
]

const ADDRESS_DOCUMENTS: Requirement[] = [
  {
    icon: <MdHome className="size-5" />,
    title: "Proof of address",
    detail: "Bank statement or utility bill from the last 3 months",
    necessity: "May be required",
  },
  {
    icon: <MdPhoneIphone className="size-5" />,
    title: "Mobile number",
    detail: "For SMS verification",
    necessity: "Required",
  },
]

const COPY: Record<ActivationTaskId, { title: string; subtitle: string }> = {
  identity: {
    title: "What you'll need",
    subtitle:
      "Have these ready before we start. It keeps your account secure and compliant.",
  },
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

export function ActivationTask({ task }: { task: ActivationTaskId }) {
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

      {task === "identity" ? (
        <>
          <RequirementGroup
            legend="Identity — pick one"
            requirements={IDENTITY_DOCUMENTS}
          />
          <RequirementGroup
            legend="Address verification"
            requirements={ADDRESS_DOCUMENTS}
          />
        </>
      ) : null}

      <NotAvailableYet task={task} />
    </div>
  )
}

function RequirementGroup({
  legend,
  requirements,
}: {
  legend: string
  requirements: Requirement[]
}) {
  return (
    <section className="flex flex-col gap-3">
      <h3 className="text-xs font-medium uppercase tracking-wider text-blueLight/60">
        {legend}
      </h3>
      {requirements.map((requirement) => (
        <div
          key={requirement.title}
          className="flex items-center gap-4 rounded-xl border border-panel-border bg-white/5 p-4"
        >
          <span
            aria-hidden
            className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-white/5 text-blueLight"
          >
            {requirement.icon}
          </span>
          <span className="flex flex-1 flex-col gap-0.5">
            <span className="font-medium text-blueLightest">
              {requirement.title}
            </span>
            <span className="text-sm text-blueLight">{requirement.detail}</span>
          </span>
          <Badge variant={requirement.necessity === "Required" ? "default" : "secondary"}>
            {requirement.necessity}
          </Badge>
        </div>
      ))}
    </section>
  )
}

/**
 * These four journeys are not built for web yet — identity capture, biometric
 * enrolment, the preferences workflow and payment methods each need their own
 * flow. Saying so plainly beats a button that goes nowhere.
 */
function NotAvailableYet({ task }: { task: ActivationTaskId }) {
  const detail =
    task === "identity"
      ? "Document capture isn't available on web yet."
      : "This step isn't available on web yet."

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-warning/30 bg-warning/10 p-4">
      <p className="text-sm text-blueLightest">
        {detail} Complete it in the DosshPay mobile app, and it will show as done
        here.
      </p>
      <Link
        href="/activate"
        className="text-sm font-medium text-accentBlue hover:text-accentBlueHover"
      >
        Back to activation steps
      </Link>
    </div>
  )
}
