import { verifySession } from "@/server/auth/dal"
import { ProfileHeader } from "@/components/dashboard/settings/profile-header"
import { PersonalDetails } from "@/components/dashboard/settings/personal-details"
import { NotificationSettings } from "@/components/dashboard/settings/notification-settings"
import { SettingsMenu } from "@/components/dashboard/settings/settings-menu"
import { appVersion } from "@/lib/profile-data"

export default async function SettingsPage() {
  // Auth gate per project rules. Profile data is stubbed for the design phase.
  await verifySession()

  return (
    <div className="flex flex-1 flex-col gap-6 px-4 py-6 lg:px-6">
      <h1 className="text-2xl font-semibold text-blueLightest">Settings</h1>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <div className="flex flex-col gap-6">
          <ProfileHeader />
          <PersonalDetails />
          <NotificationSettings />
        </div>

        <div className="flex flex-col gap-6">
          <SettingsMenu />
        </div>
      </div>

      <p className="pt-2 text-center text-xs text-label">
        DosshPay · Version {appVersion}
      </p>
    </div>
  )
}
