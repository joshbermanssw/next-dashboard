import Link from "next/link"
import {
  MdCheckCircle,
  MdChevronRight,
  MdClose,
  MdCreditCard,
  MdLock,
  MdPersonSearch,
  MdTune,
} from "react-icons/md"
import HeadingTag from "@/components/util/heading-tag"
import { cn } from "@/lib/utils"
import type { ActivationStatus, ActivationTaskId } from "@/lib/activation"

const ICONS: Record<ActivationTaskId, React.ReactNode> = {
  identity: <MdPersonSearch className="size-5" />,
  security: <MdLock className="size-5" />,
  preferences: <MdTune className="size-5" />,
  billing: <MdCreditCard className="size-5" />,
}

export function ActivationHub({ status }: { status: ActivationStatus }) {
  const { tasks, completedCount, totalCount, complete } = status

  return (
    <div className="flex flex-col gap-8">
      <div className="flex justify-end">
        <Link
          href="/"
          aria-label="Close and go to your dashboard"
          className="inline-flex size-10 items-center justify-center rounded-full border border-surfaceCardDark text-blueLight transition-colors hover:bg-white/10 hover:text-blueLightest"
        >
          <MdClose className="size-5" />
        </Link>
      </div>

      <div className="flex flex-col items-center gap-6 text-center">
        <ProgressRing completed={completedCount} total={totalCount} />
        <div className="space-y-2">
          <HeadingTag level={4} className="font-semibold perspective-distant">
            {complete ? "You're all set" : "Activate your account"}
          </HeadingTag>
          <p className="text-sm text-blueLight">
            {complete
              ? "Every step is done — your DosshPay account has full access."
              : "Complete the steps below to unlock all features of your DosshPay wallet."}
          </p>
        </div>
      </div>

      <ul className="flex flex-col gap-3">
        {tasks.map((task) => (
          <li key={task.id}>
            <Link
              href={task.href}
              className={cn(
                "flex items-center gap-4 rounded-xl border p-4 transition-colors",
                task.done
                  ? "border-positive/30 bg-positive/5"
                  : "border-panel-border bg-white/5 hover:bg-white/10",
              )}
            >
              <span
                aria-hidden
                className={cn(
                  "flex size-11 shrink-0 items-center justify-center rounded-xl",
                  task.done
                    ? "bg-positive/15 text-positive"
                    : "bg-accentBlue/15 text-accentBlue",
                )}
              >
                {task.done ? <MdCheckCircle className="size-5" /> : ICONS[task.id]}
              </span>
              <span className="flex flex-1 flex-col gap-0.5">
                <span className="font-semibold text-blueLightest">
                  {task.title}
                </span>
                <span className="text-sm text-blueLight">{task.description}</span>
              </span>
              <span
                className={cn(
                  "shrink-0 rounded-full px-2.5 py-1 text-xs font-medium",
                  task.done
                    ? "bg-positive/15 text-positive"
                    : "bg-white/10 text-blueLight",
                )}
              >
                {task.done ? "Done" : "To do"}
              </span>
              <MdChevronRight aria-hidden className="size-5 shrink-0 text-blueLight/60" />
            </Link>
          </li>
        ))}
      </ul>

      {!complete ? (
        <p className="text-center text-sm text-blueLight">
          <Link
            href="/"
            className="font-medium text-accentBlue hover:text-accentBlueHover"
          >
            Skip for now
          </Link>{" "}
          — you can finish this any time from your profile menu.
        </p>
      ) : null}
    </div>
  )
}

/** The "n/4 done" dial. Drawn with SVG so the arc reflects real progress. */
function ProgressRing({
  completed,
  total,
}: {
  completed: number
  total: number
}) {
  const radius = 52
  const circumference = 2 * Math.PI * radius
  const fraction = total > 0 ? completed / total : 0

  return (
    <div className="relative flex size-32 items-center justify-center">
      <svg
        aria-hidden
        viewBox="0 0 120 120"
        className="absolute inset-0 size-full -rotate-90"
      >
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          strokeWidth="6"
          className="stroke-white/10"
        />
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - fraction)}
          className="stroke-accentBlue transition-[stroke-dashoffset] duration-500"
        />
      </svg>
      <p className="relative flex flex-col items-center">
        <span className="text-2xl font-semibold text-blueLightest">
          {completed}/{total}
        </span>
        <span className="text-xs text-blueLight">done</span>
      </p>
    </div>
  )
}
