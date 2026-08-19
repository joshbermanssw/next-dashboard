import Link from "next/link"
import {
  MdCheck,
  MdClose,
  MdDescription,
  MdFace,
  MdFolderCopy,
  MdLock,
  MdMail,
  MdPerson,
  MdPayments,
} from "react-icons/md"
import HeadingTag from "@/components/util/heading-tag"
import { resetKycApplicationAction } from "@/app/actions/kyc"
import { cn } from "@/lib/utils"
import type { KycSectionKey, KycSectionView } from "@/lib/kyc"

const ICONS: Record<KycSectionKey, React.ReactNode> = {
  personal: <MdPerson className="size-5" />,
  contact: <MdMail className="size-5" />,
  funds: <MdPayments className="size-5" />,
  "primary-document": <MdDescription className="size-5" />,
  "secondary-document": <MdFolderCopy className="size-5" />,
  biometrics: <MdFace className="size-5" />,
}

/**
 * "Finish setting up" — the section checklist inside identity verification.
 *
 * Sections unlock in order, so exactly one row is actionable at a time. Locked
 * rows stay visible rather than hidden: seeing what is still to come is what
 * makes the "less than 5 minutes" claim credible.
 */
export function KycSectionList({
  sections,
  showDevReset,
}: {
  sections: KycSectionView[]
  showDevReset: boolean
}) {
  const complete = sections.every((section) => section.state === "done")

  return (
    <div className="flex flex-col gap-7">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <HeadingTag level={4} className="font-semibold perspective-distant">
            {complete ? "Identity submitted" : "Finish setting up"}
          </HeadingTag>
          <p className="text-sm text-blueLight">
            {complete
              ? "We're reviewing your details. We'll let you know as soon as it's done."
              : "It'll take less than 5 minutes"}
          </p>
        </div>
        <Link
          href="/activate"
          aria-label="Close and return to activation steps"
          className="inline-flex size-10 shrink-0 items-center justify-center rounded-full border border-surfaceCardDark text-blueLight transition-colors hover:bg-white/10 hover:text-blueLightest"
        >
          <MdClose className="size-5" />
        </Link>
      </div>

      <ul className="flex flex-col gap-3">
        {sections.map((section) => (
          <li key={section.key}>
            <SectionRow section={section} />
          </li>
        ))}
      </ul>

      {showDevReset ? (
        <form action={resetKycApplicationAction} className="text-center">
          <button
            type="submit"
            className="text-xs text-blueLight/60 underline underline-offset-4 transition-colors hover:text-blueLight"
          >
            Reset progress (dev only — answers are stored in memory)
          </button>
        </form>
      ) : null}
    </div>
  )
}

function SectionRow({ section }: { section: KycSectionView }) {
  const { key, title, description, state } = section

  const body = (
    <>
      <span
        aria-hidden
        className={cn(
          "flex size-11 shrink-0 items-center justify-center rounded-xl",
          state === "done" && "bg-positive/15 text-positive",
          state === "current" && "bg-accentBlue/15 text-accentBlue",
          state === "locked" && "bg-white/5 text-blueLight/40",
        )}
      >
        {ICONS[key]}
      </span>

      <span className="flex flex-1 flex-col gap-0.5">
        <span
          className={cn(
            "font-semibold",
            state === "locked" ? "text-blueLight/50" : "text-blueLightest",
          )}
        >
          {title}
        </span>
        <span
          className={cn(
            "text-sm",
            state === "locked" ? "text-blueLight/40" : "text-blueLight",
          )}
        >
          {description}
        </span>
      </span>

      {state === "done" ? (
        <span
          aria-label="Complete"
          className="flex size-8 shrink-0 items-center justify-center rounded-full bg-positive/15 text-positive"
        >
          <MdCheck className="size-5" />
        </span>
      ) : null}

      {state === "current" ? (
        <span className="shrink-0 rounded-lg bg-accentBlue px-4 py-2 text-sm font-bold text-blue">
          Continue
        </span>
      ) : null}

      {state === "locked" ? (
        <span className="flex shrink-0 items-center gap-1.5 rounded-lg bg-white/5 px-3 py-2 text-sm text-blueLight/50">
          <MdLock className="size-4" />
          Locked
        </span>
      ) : null}
    </>
  )

  const className = cn(
    "flex items-center gap-4 rounded-xl border p-4 transition-colors",
    state === "done" && "border-positive/30 bg-positive/5 hover:bg-positive/10",
    state === "current" && "border-accentBlue/40 bg-white/5 hover:bg-white/10",
    state === "locked" && "border-panel-border bg-white/[0.02]",
  )

  if (state === "locked") {
    return (
      <div aria-disabled className={className}>
        {body}
      </div>
    )
  }

  return (
    <Link href={`/activate/identity/${key}`} className={className}>
      {body}
    </Link>
  )
}
