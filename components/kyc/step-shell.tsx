"use client"

import Link from "next/link"
import { MdArrowBack, MdClose } from "react-icons/md"
import HeadingTag from "@/components/util/heading-tag"
import { Button } from "@/components/ui/button"

type StepShellProps = {
  title: string
  subtitle?: string
  /** Omitted on a section's first step, where there is nothing to go back to. */
  onBack?: () => void
  /** Where the ✕ leads — the section list, or the activation hub. */
  closeHref: string
  /** The step's answer is valid and the customer may move on. */
  canContinue: boolean
  continueLabel?: string
  pending?: boolean
  error?: string | null
  onContinue: () => void
  children: React.ReactNode
}

/**
 * Chrome shared by every step of the identity flow: back/close, the question,
 * and the action. Wrapping the body in a form means Enter submits, which is the
 * expected behaviour on the text steps and harmless on the choice ones.
 */
export function StepShell({
  title,
  subtitle,
  onBack,
  closeHref,
  canContinue,
  continueLabel = "Continue",
  pending = false,
  error,
  onContinue,
  children,
}: StepShellProps) {
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        if (canContinue && !pending) onContinue()
      }}
      className="flex min-h-[34rem] flex-col gap-7 rounded-2xl border border-panel-border bg-blueDarkest/80 px-6 py-8 shadow-2xl backdrop-blur-sm sm:px-10 sm:py-10"
    >
      <header className="space-y-2">
        <div className="mb-2 flex items-center justify-between">
          {onBack ? (
            <button
              type="button"
              onClick={onBack}
              disabled={pending}
              aria-label="Back to the previous step"
              className="inline-flex size-9 items-center justify-center rounded-full border border-surfaceCardDark text-blueLight transition-colors hover:bg-white/10 hover:text-blueLightest disabled:opacity-50"
            >
              <MdArrowBack className="size-5" />
            </button>
          ) : (
            <span />
          )}
          <Link
            href={closeHref}
            aria-label="Close and return to your setup steps"
            className="inline-flex size-9 items-center justify-center rounded-full border border-surfaceCardDark text-blueLight transition-colors hover:bg-white/10 hover:text-blueLightest"
          >
            <MdClose className="size-5" />
          </Link>
        </div>
        <HeadingTag level={5} className="font-semibold perspective-distant">
          {title}
        </HeadingTag>
        {subtitle ? <p className="text-sm text-blueLight">{subtitle}</p> : null}
      </header>

      <div className="flex-1">{children}</div>

      {error ? (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      ) : null}

      <Button
        type="submit"
        variant="primary"
        className="w-full"
        disabled={!canContinue || pending}
      >
        {pending ? "Saving…" : continueLabel}
      </Button>
    </form>
  )
}
