"use client"

import { CheckCircle2Icon, AlertCircleIcon } from "lucide-react"
import { Panel, PanelHeader, PanelTitle } from "@/components/ui/panel"
import { useUser } from "@/contexts/user-context"
import { formattedAddress, userProfile } from "@/lib/profile-data"
import { cn } from "@/lib/utils"

type Field = {
  label: string
  value: string
  verified?: boolean
}

export function PersonalDetails() {
  const { customer } = useUser()

  // Name, email, and phone come from the live session; the rest of the
  // profile (address, verification flags) is still design-phase stub data.
  const fields: Field[] = [
    { label: "Name", value: `${customer.firstName} ${customer.lastName}` },
    { label: "Email", value: customer.email, verified: userProfile.emailVerified },
    { label: "Phone", value: customer.phone, verified: userProfile.phoneVerified },
    { label: "Address", value: formattedAddress },
  ]

  return (
    <Panel className="flex flex-col gap-2">
      <PanelHeader>
        <PanelTitle>Personal details</PanelTitle>
        <button
          type="button"
          className="text-sm font-medium text-accentBlue transition-colors hover:text-accentBlueHover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Edit
        </button>
      </PanelHeader>

      <dl className="mt-2 divide-y divide-panel-border">
        {fields.map((field) => (
          <div
            key={field.label}
            className="flex items-center justify-between gap-4 py-3"
          >
            <dt className="text-sm text-label">{field.label}</dt>
            <dd className="flex min-w-0 items-center gap-2">
              <span className="truncate text-sm font-medium text-blueLightest">
                {field.value}
              </span>
              {field.verified !== undefined && (
                <VerifiedPill verified={field.verified} />
              )}
            </dd>
          </div>
        ))}
      </dl>
    </Panel>
  )
}

function VerifiedPill({ verified }: { verified: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
        verified
          ? "bg-positive/15 text-positive"
          : "bg-white/5 text-label"
      )}
    >
      {verified ? (
        <CheckCircle2Icon className="size-3" />
      ) : (
        <AlertCircleIcon className="size-3" />
      )}
      {verified ? "Verified" : "Unverified"}
    </span>
  )
}
