import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const currencyFormatter = new Intl.NumberFormat("en-AU", {
  style: "currency",
  currency: "AUD",
  currencyDisplay: "narrowSymbol",
})

/** `42000` → `$42,000`. Pass `cents: true` to keep two decimals (`$28.00`). */
export function formatCurrency(amount: number, { cents = false } = {}): string {
  return currencyFormatter.format(amount).replace(/\.00$/, cents ? ".00" : "")
}

const compactFormatter = new Intl.NumberFormat("en-AU", {
  notation: "compact",
  compactDisplay: "short",
})

/** `40000` → `40K` for chart axes. */
export function formatCompact(amount: number): string {
  return compactFormatter.format(amount)
}
