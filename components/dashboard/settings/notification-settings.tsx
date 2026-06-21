"use client"

import * as React from "react"
import { Panel, PanelHeader, PanelTitle } from "@/components/ui/panel"
import { Switch } from "@/components/ui/switch"
import { notificationPrefs } from "@/lib/profile-data"

export function NotificationSettings() {
  const [prefs, setPrefs] = React.useState<Record<string, boolean>>(() =>
    Object.fromEntries(notificationPrefs.map((p) => [p.id, p.defaultOn]))
  )

  return (
    <Panel className="flex flex-col gap-2">
      <PanelHeader>
        <PanelTitle>Notifications</PanelTitle>
      </PanelHeader>

      <ul className="mt-2 flex flex-col gap-1">
        {notificationPrefs.map((pref) => (
          <li
            key={pref.id}
            className="flex items-center justify-between gap-4 py-2"
          >
            <div className="flex min-w-0 flex-col">
              <span className="text-sm font-medium text-blueLightest">
                {pref.label}
              </span>
              <span className="truncate text-xs text-label">
                {pref.subtitle}
              </span>
            </div>
            <Switch
              checked={prefs[pref.id]}
              onCheckedChange={(value) =>
                setPrefs((prev) => ({ ...prev, [pref.id]: value }))
              }
            />
          </li>
        ))}
      </ul>
    </Panel>
  )
}
