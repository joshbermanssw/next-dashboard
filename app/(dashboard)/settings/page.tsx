import { verifySession } from "@/server/auth/dal"

export default async function SettingsPage() {
  await verifySession()
  return (
    <div className="flex flex-1 flex-col gap-4 px-4 py-6 lg:px-6">
      <h1 className="text-2xl font-semibold">Settings</h1>
    </div>
  )
}
