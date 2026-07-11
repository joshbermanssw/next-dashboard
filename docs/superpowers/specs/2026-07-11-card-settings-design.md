# Card Settings — Design

**Date:** 2026-07-11
**Status:** Approved pending review
**Author:** Josh + Claude

## Summary

Make each bank card on the hub dashboard clickable. On hover (desktop) a settings
cog appears in the card's top-right corner; clicking the card **or** the cog opens
a **Card Settings** experience, adapted from the iOS app's four-screen push stack:

1. **Card Settings** (hub) — large card face, `Top up / QR code / Edit` actions, and a
   menu: Card Details, Manage card, Add to Apple Wallet, Physical card.
2. **Card Details** — reveal the card number, CVC and expiry.
3. **Manage card** — read-only configuration: card info, spending & limits, payment config.

Everything is stubbed data (this dashboard has no card backend yet). Secondary
actions with no destination (Top up, QR code, Edit, Add to Apple Wallet, Physical
card, Pricing) fire a "coming soon" toast via the existing `sonner` pattern.

## Decisions (locked)

- **Surface:** dedicated **route pages** under `/cards/[cardId]`, mirroring the
  existing `/settings/plan` full-page pattern (not a sheet/modal).
- **Scope:** all iOS screens, data stubbed. Card Settings hub + Card Details +
  Manage card.
- **Click target:** the whole card is clickable and the hover cog is the visible
  affordance; both open Card Settings.

## Why routes work despite client-side card state

Cards currently live in client React context (`AccountsProvider`), which a server
route can't read. But every card that exists is a **seed** card
(`seedAccounts` in `lib/dashboard-data.ts`) — dynamically-added accounts get
`freshAccountData()` with `cards: []`, and the "Add card" button is a no-op. So
`seedAccounts` is the single canonical, server-importable source of truth for
cards. A `findSeedCard(cardId)` helper resolves a card by id server-side; unknown
ids `notFound()`.

## Architecture

### Data model — `lib/dashboard-data.ts`

Extend `BankCard` (all new fields are stub-only; the existing `BankCard`
component reads just `last4`, so this is backward-compatible):

```ts
export type CardBrand = "mastercard" | "visa"
export type MoneyType = "CRYPTO" | "FIAT"

export type BankCard = {
  id: string
  last4: string
  brand: CardBrand
  name: string          // "Crypto Mastercard", "Mastercard", "Visa"…
  expiry: string        // "08/27"
  number: string        // grouped PAN ending in last4 — reveal only
  cvc: string           // 3 digits — reveal only
  status: "active" | "frozen"
  limitPreset: string   // "Standard"
  useType: string       // "Frequent use"
  moneyType: MoneyType  // "CRYPTO" | "FIAT"
  currency: string      // "USDC", "AUD", "USD"
  currencyFlag: string  // emoji, e.g. "🇺🇸"
}

export function findSeedCard(
  cardId: string,
): { card: BankCard; account: Account } | null
```

Seed cards get sensible per-account values, e.g. crypto → `moneyType: "CRYPTO"`,
`currency: "USDC"`; everyday → `FIAT` / `AUD`; global → `FIAT` / `USD`. `expiry`
`08/27` everywhere (matches iOS). `number`/`cvc` are plausible stubs; `number`
ends in the card's `last4`.

`brandLabel(brand)` helper → `"Mastercard"` / `"Visa"` for the Manage "Card type"
row. Brand mark art: reuse Mastercard/Visa rewards SVGs. The card face SVGs in
`public/cards/` already bake the brand mark into the face; for the Card Details /
Manage rows we need small standalone brand marks — add `public/brands/mastercard.svg`
and `public/brands/visa.svg` (extracted from the existing card SVGs or minimal
recreations).

### Server helper — `server/auth/account.ts`

Extract the card-face resolution currently inlined in the overview page into a
reusable server helper, and call it from both the overview page and the three
card routes (DRY):

```ts
export async function resolveCardDesign(session: Session): Promise<CardDesign> {
  const { accountId, accountType } = await resolveAccount(session)
  const plan =
    accountType === "corporate" || !accountId
      ? null
      : await getCurrentPlan(session.upstreamJwt, accountId).catch(() => null)
  return planTierToCardDesign(plan?.tier ?? null, accountType)
}
```

`app/(dashboard)/page.tsx` is refactored to call `resolveCardDesign(session)`
instead of inlining the plan fetch.

### Routes — `app/(dashboard)/cards/[cardId]/`

All three are server components. Each: `verifySession()` →
`resolveCardDesign(session)` → `findSeedCard(cardId)` (`notFound()` if null).
Per Next.js 16, `params` is a Promise — `const { cardId } = await params` (verify
against `node_modules/next/dist/docs` per AGENTS.md before writing).

- **`page.tsx`** — Card Settings hub. Back header (compact, centered title
  "Card Settings"), large `CardFace`, `CardSettingsActions` (Top up / QR / Edit),
  and `CardMenu` (Card Details → `./details`, Manage card → `./manage`, Add to
  Apple Wallet → toast, Physical card → toast).
- **`details/page.tsx`** — Card Details. Back header + large left-aligned title
  "Card Details" + warning subtitle ("Don't share your card details with anyone.
  DosshPay will never ask for them."). Renders `CardDetailsList` for the clicked
  card.
- **`manage/page.tsx`** — Manage card. Back header + large title + subtitle
  ("Configure how your card can be used, secured and linked"). Renders three
  `Panel` sections of read-only rows.

### Components — `components/dashboard/cards/`

- **`card-face.tsx`** — `CardFace({ design, last4, className? })`. The SVG face
  `<img>` + `•••• last4` overlay, extracted from the current `BankCard`. Reused by
  the hub card and the settings-hub large face.
- **`bank-card.tsx`** (updated) — `BankCard` becomes a Next `<Link>` to
  `/cards/${card.id}` wrapping `CardFace`, with a hover cog span (top-right,
  `opacity-0 group-hover/group-focus-visible:opacity-100`, always visible below
  `md` for touch) and a focus ring. The dead, non-functional eye/reveal button is
  removed from the hub — reveal now lives on Card Details (matches iOS, where the
  hub card shows only the cog).
- **`card-page-header.tsx`** — `CardPageHeader({ backHref, title, variant })`.
  `variant="compact"` = centered title with back chevron (hub); `variant="page"` =
  back chevron above a large left-aligned title (details/manage).
- **`card-settings-actions.tsx`** (client) — three circular buttons (Top up, QR
  code, Edit), `QuickActions`-style, each firing a toast stub.
- **`card-menu.tsx`** (client) — the hub menu `Panel`. Card Details / Manage card
  are `SettingsRow`-in-`Link` nav rows; Apple Wallet / Physical card are toast
  stub rows.
- **`card-details-list.tsx`** (client) — brand mark, name, `•••• last4` + expiry,
  and an eye toggle that reveals the full `number`, `cvc`, and `expiry`.
- **`manage-card-sections.tsx`** — three `Panel` sections built from
  `SettingsRow` with trailing value text:
  - **Card information:** Card type (`brandLabel`), Card status (Active badge).
  - **Spending & limits:** Limits (`limitPreset`), Use type (`useType`).
  - **Payment configuration:** Pricing (toast stub, chevron), Money type
    (`moneyType`), Currency (`currencyFlag` + `currency`).

Reused primitives: `Panel` / `PanelTitle`, `SettingsRow`, `Badge`, `Button`,
`sonner` `toast`, existing card-face SVGs. `<Toaster />` is already mounted in
`app/(dashboard)/layout.tsx`.

## Interaction & states

- **Hover cog:** hidden until `group-hover`/`group-focus-visible` on desktop
  (`md+`), always shown below `md` (no hover on touch). Keyboard-reachable via the
  card Link's focus.
- **Card click vs. cog:** the card is a single `<Link>`; the cog is a decorative
  span inside it (no nested interactive element), so clicking anywhere — including
  the cog — follows the link. Clean a11y, one tab stop per card.
- **Reveal (Card Details):** client `useState` toggles masked ↔ revealed. No
  persistence, no network — pure stub.
- **Not-found:** unknown `cardId` → `notFound()` (Next 16 `not-found` boundary).
- **Back navigation:** back chevron links to `/` (hub) from the settings screens;
  Card Details / Manage back to the card's settings page (`/cards/[cardId]`).

## Out of scope

- Real card CRUD, freeze/unfreeze, limits editing, Apple Wallet, physical card
  ordering, QR generation — all toast stubs.
- Persisting reveal state or masking policy.
- Wiring `/cards/[id]` for dynamically-added accounts (they have no cards).

## Testing

- Unit-test `findSeedCard` (hit for each seed card id, miss returns null) and
  `resolveCardDesign` (corporate → business; everyday tiers → premium/standard/
  basic; plan-fetch failure → basic) alongside the existing `lib/plan.test.ts`
  style, using Vitest.
- Manual/verify: hub cards clickable + cog on hover, all three screens render for
  a seed card, unknown id 404s, reveal toggles, stub toasts fire. Use the `verify`
  skill (forge session cookie + Playwright).

## Files

**New:** `app/(dashboard)/cards/[cardId]/page.tsx`,
`app/(dashboard)/cards/[cardId]/details/page.tsx`,
`app/(dashboard)/cards/[cardId]/manage/page.tsx`,
`components/dashboard/cards/{card-face,card-page-header,card-settings-actions,card-menu,card-details-list,manage-card-sections}.tsx`,
`public/brands/{mastercard,visa}.svg`, tests.

**Changed:** `lib/dashboard-data.ts` (extend `BankCard`, seed values,
`findSeedCard`, `brandLabel`), `server/auth/account.ts` (`resolveCardDesign`),
`app/(dashboard)/page.tsx` (use helper), `components/dashboard/bank-card.tsx`
(Link + cog, remove dead eye), `components/dashboard/account-cards.tsx` (unchanged
API).
