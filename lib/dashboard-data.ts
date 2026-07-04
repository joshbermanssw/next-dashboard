/**
 * Stubbed dashboard data.
 *
 * All values here are placeholders for the design phase. Once the backend
 * contract is finalised, swap these exports for BFF aggregator calls — the
 * component-facing types should stay stable so the UI doesn't change.
 */
import type { LucideIcon } from "lucide-react"
import {
  ArrowLeftRightIcon,
  ArrowUpRightIcon,
  ReceiptTextIcon,
  PlusIcon,
  BitcoinIcon,
  WalletIcon,
  GlobeIcon,
  ShoppingBagIcon,
  ShoppingCartIcon,
  CarIcon,
} from "lucide-react"

export type AccountTab = {
  id: string
  label: string
  icon: LucideIcon
}

export type BankCard = {
  id: string
  /** Tailwind background-image token: `bg-bank-gradient-1` | `bg-bank-gradient-2` */
  gradient: "bg-bank-gradient-1" | "bg-bank-gradient-2"
  last4: string
}

export type QuickAction = {
  id: string
  label: string
  icon: LucideIcon
}

export const TIME_RANGES = ["1M", "3M", "6M", "1Y"] as const
export type TimeRange = (typeof TIME_RANGES)[number]

export type SeriesPoint = {
  label: string
  value: number
}

export type Transaction = {
  id: string
  name: string
  /** Secondary line — merchant detail, payer, or location. */
  detail: string
  icon: LucideIcon
  /** Signed AUD amount — negative for debits, positive for credits. */
  amount: number
}

export type SpendingCategoryId =
  | "crypto"
  | "travel"
  | "shopping"
  | "groceries"
  | "other"

export type SpendingCategory = {
  id: SpendingCategoryId
  label: string
  value: number
}

export const totalBalance = 42_000

export const accountTabs: AccountTab[] = [
  { id: "crypto", label: "Crypto", icon: BitcoinIcon },
  { id: "everyday", label: "Everyday", icon: WalletIcon },
  { id: "global", label: "Global", icon: GlobeIcon },
]

export const bankCards: BankCard[] = [
  { id: "card-1", gradient: "bg-bank-gradient-1", last4: "4291" },
  { id: "card-2", gradient: "bg-bank-gradient-2", last4: "8830" },
]

export const quickActions: QuickAction[] = [
  { id: "transfer", label: "Transfer", icon: ArrowLeftRightIcon },
  { id: "send", label: "Send", icon: ArrowUpRightIcon },
  { id: "pay-bills", label: "Pay Bills", icon: ReceiptTextIcon },
  { id: "deposit", label: "Deposit", icon: PlusIcon },
]

/** Money Flow — total balance over each selectable window. Every series ends
 * at the current balance so the chart always agrees with the Total Balance
 * card; the trend % is computed from first → last point. */
export const moneyFlowByRange: Record<TimeRange, SeriesPoint[]> = {
  "1M": [
    { label: "Nov 14", value: 39_800 },
    { label: "Nov 17", value: 40_600 },
    { label: "Nov 20", value: 39_900 },
    { label: "Nov 23", value: 41_200 },
    { label: "Nov 26", value: 40_400 },
    { label: "Nov 29", value: 41_500 },
    { label: "Dec 2", value: 40_900 },
    { label: "Dec 5", value: 41_800 },
    { label: "Dec 8", value: 41_300 },
    { label: "Dec 12", value: 42_000 },
  ],
  "3M": [
    { label: "Sep 12", value: 37_400 },
    { label: "Sep 19", value: 38_100 },
    { label: "Sep 26", value: 37_200 },
    { label: "Oct 3", value: 38_600 },
    { label: "Oct 10", value: 39_300 },
    { label: "Oct 17", value: 38_500 },
    { label: "Oct 24", value: 39_800 },
    { label: "Oct 31", value: 39_100 },
    { label: "Nov 7", value: 40_200 },
    { label: "Nov 14", value: 39_600 },
    { label: "Nov 21", value: 40_800 },
    { label: "Nov 28", value: 41_300 },
    { label: "Dec 5", value: 40_700 },
    { label: "Dec 12", value: 42_000 },
  ],
  "6M": [
    { label: "Jun 12", value: 36_800 },
    { label: "Jun 26", value: 37_600 },
    { label: "Jul 10", value: 36_900 },
    { label: "Jul 24", value: 38_200 },
    { label: "Aug 7", value: 37_500 },
    { label: "Aug 21", value: 38_900 },
    { label: "Sep 4", value: 38_200 },
    { label: "Sep 18", value: 39_500 },
    { label: "Oct 2", value: 38_800 },
    { label: "Oct 16", value: 40_100 },
    { label: "Oct 30", value: 39_400 },
    { label: "Nov 13", value: 40_900 },
    { label: "Nov 27", value: 41_100 },
    { label: "Dec 12", value: 42_000 },
  ],
  "1Y": [
    { label: "Jan", value: 28_400 },
    { label: "Feb", value: 29_800 },
    { label: "Mar", value: 29_100 },
    { label: "Apr", value: 31_000 },
    { label: "May", value: 32_400 },
    { label: "Jun", value: 31_600 },
    { label: "Jul", value: 33_900 },
    { label: "Aug", value: 35_200 },
    { label: "Sep", value: 34_400 },
    { label: "Oct", value: 37_100 },
    { label: "Nov", value: 39_600 },
    { label: "Dec", value: 42_000 },
  ],
}

export const recentActivity: Transaction[] = [
  {
    id: "tx-1",
    name: "Apple Store",
    detail: "AirPods Pro",
    icon: ShoppingBagIcon,
    amount: -249.99,
  },
  {
    id: "tx-2",
    name: "Salary Deposit",
    detail: "Dosshpay Pty Ltd",
    icon: PlusIcon,
    amount: 4_850.0,
  },
  {
    id: "tx-3",
    name: "Uber",
    detail: "Sydney CBD",
    icon: CarIcon,
    amount: -34.6,
  },
  {
    id: "tx-4",
    name: "Woolworths",
    detail: "Town Hall Metro",
    icon: ShoppingCartIcon,
    amount: -86.2,
  },
]

/** Spending Overview — spend by category per selectable window (each set sums
 * to the donut's centre total). Ordered largest-first; the donut renders in
 * this order and every window keeps the same category → colour mapping. */
export const spendingByRange: Record<TimeRange, SpendingCategory[]> = {
  "1M": [
    { id: "crypto", label: "Crypto", value: 1_207 },
    { id: "travel", label: "Travel", value: 687 },
    { id: "shopping", label: "Shopping", value: 284 },
    { id: "groceries", label: "Groceries", value: 118 },
    { id: "other", label: "Other", value: 71 },
  ],
  "3M": [
    { id: "crypto", label: "Crypto", value: 2_870 },
    { id: "travel", label: "Travel", value: 2_140 },
    { id: "shopping", label: "Shopping", value: 1_030 },
    { id: "groceries", label: "Groceries", value: 620 },
    { id: "other", label: "Other", value: 280 },
  ],
  "6M": [
    { id: "crypto", label: "Crypto", value: 5_260 },
    { id: "travel", label: "Travel", value: 4_410 },
    { id: "shopping", label: "Shopping", value: 2_270 },
    { id: "groceries", label: "Groceries", value: 1_560 },
    { id: "other", label: "Other", value: 710 },
  ],
  "1Y": [
    { id: "crypto", label: "Crypto", value: 8_910 },
    { id: "travel", label: "Travel", value: 8_350 },
    { id: "shopping", label: "Shopping", value: 5_010 },
    { id: "groceries", label: "Groceries", value: 3_900 },
    { id: "other", label: "Other", value: 1_660 },
  ],
}
