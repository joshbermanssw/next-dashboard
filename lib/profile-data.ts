/**
 * Stubbed user profile + settings menu.
 *
 * Ported from the Android app's SampleUserProfile fixture and Profile screen
 * so web and mobile show the same person and menu structure. Swap for real
 * BFF calls once the profile endpoints are wired; keep the types stable.
 */
import type { LucideIcon } from "lucide-react"
import {
  UserPlusIcon,
  CircleUserIcon,
  FileTextIcon,
  BellIcon,
  FingerprintIcon,
  HeartIcon,
  LogOutIcon,
  ArrowDownLeftIcon,
  CreditCardIcon,
  ShieldCheckIcon,
} from "lucide-react"

export type UserProfile = {
  firstName: string
  lastName: string
  username: string
  email: string
  emailVerified: boolean
  phone: string
  phoneVerified: boolean
  userNumber: string
  plan: string
  slug: string
  memberSince: string
  avatarUrl: string | null
  kycVerified: boolean
  digiWalletBalance: number
  rewardPoints: number
  address: {
    street: string
    city: string
    state: string
    postalCode: string
    country: string
  }
  employment: {
    occupation: string
    industry: string
    annualIncome: string
  }
}

export const userProfile: UserProfile = {
  firstName: "Stella",
  lastName: "Dontoh",
  username: "Stella Dontoh",
  email: "stella.dontoh@example.com",
  emailVerified: false,
  phone: "+61 412 345 678",
  phoneVerified: false,
  userNumber: "7645123",
  plan: "Premium",
  slug: "stelladontoh",
  memberSince: "2030-02-12",
  avatarUrl: null,
  kycVerified: true,
  digiWalletBalance: 1_001_200, // cents
  rewardPoints: 10_123,
  address: {
    street: "123 Pilgrim Way",
    city: "Sydney",
    state: "NSW",
    postalCode: "2000",
    country: "Australia",
  },
  employment: {
    occupation: "Software Engineer",
    industry: "Technology",
    annualIncome: "$75,000 - $99,999",
  },
}

export const fullName = `${userProfile.firstName} ${userProfile.lastName}`
export const initials = `${userProfile.firstName[0]}${userProfile.lastName[0]}`
export const formattedAddress = `${userProfile.address.street}, ${userProfile.address.city}, ${userProfile.address.state} ${userProfile.address.postalCode}, ${userProfile.address.country}`

export type ProfileMenuItem = {
  id: string
  label: string
  icon: LucideIcon
  subtitle?: string
  kind: "nav" | "toggle" | "action"
  href?: string
  tone?: "default" | "danger"
  /** default state for toggle items */
  defaultOn?: boolean
}

export type ProfileMenuSection = {
  id: string
  title: string
  items: ProfileMenuItem[]
}

export const profileMenu: ProfileMenuSection[] = [
  {
    id: "promotion",
    title: "Promotion",
    items: [
      { id: "invite", label: "Invite a friend", icon: UserPlusIcon, kind: "nav", href: "#" },
    ],
  },
  {
    id: "profile",
    title: "Profile",
    items: [
      { id: "plan", label: "Your Plan", icon: CreditCardIcon, kind: "nav", href: "/settings/plan" },
      { id: "personal", label: "Personal details", icon: CircleUserIcon, kind: "nav", href: "#" },
      { id: "statements", label: "Statements", icon: FileTextIcon, kind: "nav", href: "#" },
    ],
  },
  {
    id: "settings",
    title: "Settings",
    items: [
      { id: "notifications", label: "Notifications", icon: BellIcon, kind: "nav", href: "#" },
      {
        id: "biometrics",
        label: "Log in with biometrics",
        icon: FingerprintIcon,
        kind: "toggle",
        defaultOn: false,
      },
      { id: "about", label: "About DosshPay", icon: HeartIcon, kind: "nav", href: "#" },
      { id: "documents", label: "Important documents", icon: FileTextIcon, kind: "nav", href: "#" },
    ],
  },
  {
    id: "danger",
    title: "Account",
    items: [
      { id: "logout", label: "Log out", icon: LogOutIcon, kind: "action", tone: "danger" },
    ],
  },
]

export type NotificationPref = {
  id: string
  label: string
  subtitle: string
  defaultOn: boolean
}

export const notificationPrefs: NotificationPref[] = [
  { id: "transactions", label: "Transactions", subtitle: "Purchases and transfers", defaultOn: true },
  { id: "insights", label: "Insights", subtitle: "Updates on your account usage", defaultOn: true },
  { id: "hints", label: "Hints & tips", subtitle: "Learn how to get the most out of DosshPay", defaultOn: true },
]

export const appVersion = "1.0.0"

export type Notification = {
  id: string
  title: string
  body: string
  time: string
  unread: boolean
  icon: LucideIcon
  tone?: "default" | "positive"
}

export const recentNotifications: Notification[] = [
  {
    id: "n1",
    title: "Payment received",
    body: "You received $250.00 from Nana K.",
    time: "2m ago",
    unread: true,
    icon: ArrowDownLeftIcon,
    tone: "positive",
  },
  {
    id: "n2",
    title: "Card transaction",
    body: "$28.00 at City Dry Cleaning",
    time: "1h ago",
    unread: true,
    icon: CreditCardIcon,
  },
  {
    id: "n3",
    title: "New login",
    body: "Sign in from Sydney, AU on a new device",
    time: "3h ago",
    unread: false,
    icon: ShieldCheckIcon,
  },
  {
    id: "n4",
    title: "Statement ready",
    body: "Your November statement is available",
    time: "2d ago",
    unread: false,
    icon: FileTextIcon,
  },
]

export const unreadNotificationCount = recentNotifications.filter(
  (n) => n.unread
).length
