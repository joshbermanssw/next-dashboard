"use client"

import * as React from "react"
import { useTransition } from "react"
import { logoutAction } from "@/app/actions/auth"
import { Panel, PanelTitle } from "@/components/ui/panel"
import { Switch } from "@/components/ui/switch"
import { SettingsRow } from "@/components/ui/settings-row"
import { profileMenu } from "@/lib/profile-data"

export function SettingsMenu() {
  const [toggles, setToggles] = React.useState<Record<string, boolean>>({})
  const [pending, startTransition] = useTransition()

  function handleLogout() {
    startTransition(async () => {
      await logoutAction()
    })
  }

  return (
    <div className="flex flex-col gap-4">
      {profileMenu.map((section) => (
        <Panel key={section.id} className="flex flex-col gap-1 p-3 sm:p-4">
          <PanelTitle className="px-2 pb-1 text-xs font-semibold uppercase tracking-[0.14em] text-label">
            {section.title}
          </PanelTitle>

          {section.items.map((item) => {
            if (item.kind === "toggle") {
              const checked = toggles[item.id] ?? item.defaultOn ?? false
              return (
                <SettingsRow
                  key={item.id}
                  icon={item.icon}
                  label={item.label}
                  subtitle={item.subtitle}
                  trailing={
                    <Switch
                      checked={checked}
                      onCheckedChange={(value) =>
                        setToggles((prev) => ({ ...prev, [item.id]: value }))
                      }
                    />
                  }
                />
              )
            }

            return (
              <SettingsRow
                key={item.id}
                icon={item.icon}
                label={item.label}
                subtitle={item.subtitle}
                tone={item.tone}
                onClick={
                  item.id === "logout" ? handleLogout : () => {}
                }
                trailing={
                  item.id === "logout" && pending ? (
                    <span className="text-xs text-label">Signing out…</span>
                  ) : undefined
                }
              />
            )
          })}
        </Panel>
      ))}
    </div>
  )
}
