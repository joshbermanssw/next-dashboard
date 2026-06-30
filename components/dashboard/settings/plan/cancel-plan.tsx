"use client"

import { useState, useTransition } from "react"
import { toast } from "sonner"
import { LoaderCircle } from "lucide-react"
import { cancelPlanAction } from "@/app/actions/plan"
import { Button } from "@/components/ui/button"
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
} from "@/components/ui/drawer"

export function CancelPlan({ subscriptionId }: { subscriptionId: string }) {
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState("")
  const [pending, startTransition] = useTransition()

  function confirmCancel() {
    startTransition(async () => {
      const res = await cancelPlanAction(subscriptionId, reason)
      if (res.success) {
        toast.success(res.message)
        setOpen(false)
        setReason("")
      } else {
        toast.error(res.message)
      }
    })
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="self-start text-sm font-medium text-negative hover:underline"
      >
        Cancel plan
      </button>

      <DrawerContent className="border-surfaceCardDark bg-blueDarkest text-blueLightest">
        <div className="mx-auto flex w-full max-w-md flex-col">
          <DrawerHeader>
            <DrawerTitle className="text-blueLightest">Cancel your plan?</DrawerTitle>
            <DrawerDescription className="text-blueLight">
              You&apos;ll lose access to your plan&apos;s features. You can resubscribe
              anytime.
            </DrawerDescription>
          </DrawerHeader>

          <div className="px-4">
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
          </div>

          <DrawerFooter>
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
            <Button
              type="button"
              variant="secondary"
              onClick={() => setOpen(false)}
              disabled={pending}
            >
              Keep plan
            </Button>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
