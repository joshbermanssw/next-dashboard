"use client"

import { useRef, useState, useTransition } from "react"
import { toast } from "sonner"
import { LoaderCircle } from "lucide-react"
import { cancelPlanAction } from "@/app/actions/plan"
import { Button } from "@/components/ui/button"

export function CancelPlan({ subscriptionId }: { subscriptionId: string }) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const [reason, setReason] = useState("")
  const [pending, startTransition] = useTransition()

  function confirmCancel() {
    startTransition(async () => {
      const res = await cancelPlanAction(subscriptionId, reason)
      if (res.success) {
        toast.success(res.message)
        dialogRef.current?.close()
        setReason("")
      } else {
        toast.error(res.message)
      }
    })
  }

  return (
    <>
      <button
        type="button"
        onClick={() => dialogRef.current?.showModal()}
        className="self-start text-sm font-medium text-negative hover:underline"
      >
        Cancel plan
      </button>

      <dialog
        ref={dialogRef}
        className="m-auto w-full max-w-sm rounded-2xl border border-surfaceCardDark bg-blueDarkest p-0 text-blueLightest shadow-2xl backdrop:bg-black/70 backdrop:backdrop-blur-sm"
      >
        <div className="flex flex-col gap-4 px-6 py-6">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold">Cancel your plan?</h2>
            <p className="text-sm text-blueLight">
              You&apos;ll lose access to your plan&apos;s features. You can resubscribe
              anytime.
            </p>
          </div>

          <label className="flex flex-col gap-1.5 text-sm">
            <span className="text-blueLight">Reason (optional)</span>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              placeholder="Tell us why you're cancelling…"
              className="resize-none rounded-lg border border-surfaceCardDark bg-black/30 px-3 py-2 text-blueLightest outline-none placeholder:text-label focus-visible:border-accentBlue"
            />
          </label>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => dialogRef.current?.close()}
              disabled={pending}
            >
              Keep plan
            </Button>
            <Button
              type="button"
              variant="primary"
              onClick={confirmCancel}
              disabled={pending}
            >
              {pending ? (
                <>
                  <LoaderCircle className="animate-spin" /> Cancelling…
                </>
              ) : (
                "Cancel plan"
              )}
            </Button>
          </div>
        </div>
      </dialog>
    </>
  )
}
