import { BadgeCheckIcon } from "lucide-react"
import { Panel } from "@/components/ui/panel"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { fullName, initials, userProfile } from "@/lib/profile-data"

export function ProfileHeader() {
  return (
    <Panel className="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
      <Avatar className="size-16 text-lg">
        {userProfile.avatarUrl && (
          <AvatarImage src={userProfile.avatarUrl} alt={fullName} />
        )}
        <AvatarFallback className="bg-accentBlue/20 text-lg font-semibold text-accentBlue">
          {initials}
        </AvatarFallback>
      </Avatar>

      <div className="flex min-w-0 flex-col gap-1">
        <div className="flex items-center justify-center gap-2 sm:justify-start">
          <h1 className="truncate text-xl font-semibold text-blueLightest">
            {fullName}
          </h1>
          {userProfile.kycVerified && (
            <BadgeCheckIcon className="size-5 shrink-0 text-accentBlue" />
          )}
        </div>
        <p className="text-sm text-label">
          {userProfile.plan} · Member #{userProfile.userNumber}
        </p>
      </div>
    </Panel>
  )
}
