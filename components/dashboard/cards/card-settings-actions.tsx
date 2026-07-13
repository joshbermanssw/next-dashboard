"use client"

import { toast } from "sonner"
import {
  CreditCardIcon,
  QrCodeIcon,
  PencilIcon,
  type LucideIcon,
} from "lucide-react"

const ACTIONS: { id: string; label: string; icon: LucideIcon }[] = [
  { id: "top-up", label: "Top up", icon: CreditCardIcon },
  { id: "qr", label: "QR code", icon: QrCodeIcon },
  { id: "edit", label: "Edit", icon: PencilIcon },
]

export function CardSettingsActions() {
  return (
    <div className="flex items-start justify-center gap-8 sm:gap-10">
      {ACTIONS.map((action) => (
        <button
          key={action.id}
          type="button"
          onClick={() => toast(`${action.label} is coming soon`)}
          className="group flex flex-col items-center gap-2 focus-visible:outline-none"
        >
          <span className="flex size-14 items-center justify-center rounded-full border border-panel-border bg-white/[0.04] text-blueLightest transition-colors group-hover:bg-white/[0.08] group-focus-visible:ring-2 group-focus-visible:ring-ring">
            <action.icon className="size-5" />
          </span>
          <span className="text-sm font-medium text-blueLight">
            {action.label}
          </span>
        </button>
      ))}
    </div>
  )
}
