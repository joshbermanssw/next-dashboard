"use client"

import Link from "next/link"
import { ChevronRightIcon, QrCodeIcon } from "lucide-react"

import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"

/**
 * Actions that don't earn a slot in the four-up quick-actions row.
 *
 * QR is the only live one today; the sheet is what gives the next one somewhere
 * to land without growing that row to five.
 */
const MORE_ACTIONS = [
  {
    id: "qr",
    href: "/qr",
    label: "QR Code",
    description: "Scan a code to pay, or show yours to get paid",
    icon: QrCodeIcon,
  },
] as const

/**
 * The "More" bottom sheet. Rendered only on mobile — its one entry is the QR
 * flow, which is itself mobile-only (see `server/device.ts`).
 */
export function MoreSheet({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="border-panel-border bg-blueDarker text-blueLightest">
        <DrawerHeader className="text-left">
          <DrawerTitle className="text-xl font-semibold text-blueLightest">
            More
          </DrawerTitle>
          <DrawerDescription className="sr-only">
            Further actions for this account.
          </DrawerDescription>
        </DrawerHeader>

        <div className="px-4 pb-2">
          {MORE_ACTIONS.map((action) => (
            <Link
              key={action.id}
              href={action.href}
              onClick={() => onOpenChange(false)}
              className="flex items-center gap-4 rounded-2xl px-2 py-4 transition-colors hover:bg-white/5"
            >
              <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-accentBlue/15 text-accentBlue">
                <action.icon className="size-5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-base font-semibold text-blueLightest">
                  {action.label}
                </span>
                <span className="block text-sm text-blueLight/60">
                  {action.description}
                </span>
              </span>
              <ChevronRightIcon className="size-5 shrink-0 text-blueLight/50" />
            </Link>
          ))}
        </div>
      </DrawerContent>
    </Drawer>
  )
}
