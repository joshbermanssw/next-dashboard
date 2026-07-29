# next-dashboard

## 0.10.0

### Minor Changes

- a4a544d: Nest the SplitPay manage page under its session

  - Move `/splitpay/{sessionId}` to `/sp/{sessionId}/manage`. The manage page is the same session as the pay page, but sat at its own root under a second name for one concept — while the receipt was already nested at `/sp/{sessionId}/receipt/{txId}`. One session now means one path, with the receipt and manage page as siblings
  - **Breaking for existing links:** `/splitpay/{sessionId}` no longer resolves. Anything already shared — invite emails, forwarded links — needs repointing at `/sp/{sessionId}/manage`, keeping any `?c={token}`
  - Leaves one open public prefix in the proxy (`/sp/`) where there were two

- a4a544d: SplitPay: separate the DosshPay-user and non-user contributor journeys

  - Contributors are now either an existing DosshPay customer or someone with no account, and each gets the step that suits them. A signed-out visitor names themselves, gives an email, enters the code and pays by card; a signed-in one is identified from their session and funds the pool from an account balance — no name to type, no card to key in
  - Ask for an email address on joining, so a receipt has somewhere to go and a contributor has a way back. Name and email are taken at face value: the emailed code is the only thing checked, because the link is meant to be shared
  - Stop matching a payer to a roster row by the name they typed. Typing an existing contributor's name no longer lands a payment on their row; a repeat payer is recognised by email instead, so one person stays one line on the roster
  - Let the creator choose the verification code when they create a pool, instead of generating one they never see
  - Add "SplitPay sessions you're in" to the dashboard for pools a customer joined but doesn't own, so they never need the invite email again
  - Debit the funding account when a customer pays from a balance, refusing anything the account can't cover, and reflect it on the dashboard tile

## 0.9.0

### Minor Changes

- 14cc852: Reshape the dashboard sidebar to Home, Subscriptions, Shopback and Products

  The left-hand nav now carries four destinations instead of five: Home (unchanged),
  Subscriptions (recurring payments), Shopback (cashback) and Products (the product
  catalogue). Each new item ships a stub page under `(dashboard)` so the links resolve
  and the active state highlights correctly.

## 0.8.0

### Minor Changes

- 3c9c87c: SplitPay contributor journey for people without a DosshPay account

  - Add `/sp/{sessionId}`: the page an invite email lands on — target, collected and time left, then name, the 6-digit access code, an amount hinted against what's left to target, and card details. Public by design; the emailed code is the gate, checked server-side
  - Add `/sp/{sessionId}/receipt/{txId}`: who the contribution was recorded under, the amount, transaction ID, date and status, closing on a DosshPay sign-up prompt. Transaction IDs are random rather than sequential, so a public receipt URL naming a payer and amount can't be walked to find the rest of the roster
  - Add `/splitpay/{sessionId}`: a returning contributor's Update and Contributors tabs — edit a pledge and target date, pay the difference, and see the roster with per-person progress against each pledge. Amount paid stays read-only; money only moves through a card payment. Reached by the token in the emailed link, with an access-code-and-name gate as the fallback
  - Track pledged separately from paid on each contributor, so a partial payment reads as partial rather than done, and derive paid/partial/pending from the two numbers so a status can't drift from the money
  - Card numbers are Luhn-checked and the expiry must be a future month; only the brand and last four are ever kept
  - Let the public routes through the proxy for signed-out _and_ signed-in visitors — invitees are often already customers, and bouncing them to the dashboard would break the link for the people most likely to click it

- 3c9c87c: SplitPay hub — working target, top-up, invite and contributor controls

  - Wire up the hub's four actions, which previously did nothing: a target breakdown, a creator top-up, an invite form that hands back the join link, the access code and that person's manage link ready to copy, and the contributor roster
  - Add per-contributor authorisation: the creator is marked Owner and can authorise the others, from the hub or from their own emailed link
  - Read the funding pool from the server on the dashboard, so the account tile and the hub agree after someone contributes from an invite email — the client seed knows nothing about payments that arrive through `/sp`
  - Hold the countdown at its server-rendered value until the first client tick, so the time left doesn't flicker on load

### Patch Changes

- 3c9c87c: Mock invite inbox for walking the SplitPay email journey

  - Add `/dev/inbox`: the invite and follow-up emails rendered against live session data with working links, plus one follow-up per contributor so the manage page can be opened as any of them
  - Development only — the route 404s in production

## 0.7.0

### Minor Changes

- cdfd109: Account activation hub + profile badge

  - Add `/activate`: a checklist of the remaining steps (identity, security, preferences, billing) derived from the customer's KYC and preferences state, with per-step pages and a "skip for now" into the hub
  - Show an amber "needs attention" ring and "!" on the profile avatar, plus a "Finish setting up" menu entry, while any step is outstanding — streamed behind Suspense so the header never blocks on it

- 2005401: Account & card settings

  - Add the `/account/[accountId]` settings page and `/account/[accountId]/cards/[cardId]` routes (card details + manage), with a not-found path when a card is resolved under the wrong account
  - Add a card component suite under `components/dashboard/cards` (face, brand mark, details list, menu, settings + manage screens)
  - Introduce the `lib/data/accounts.ts` data-access seam (`getAccountsForCustomer`, `getAccount`, `getCardsForAccount`, `getCard`) — the single place data enters the system
  - Rename the dashboard quick actions to Top Up / Pay / Manage / More and link Manage to the selected account's settings

- c9d7bc1: Account creation flow: currency selection + SplitPay wizard

  - Add a create-account dialog opened from the "Add account" menu. Crypto/Global pick a settlement currency (stablecoin / fiat catalogues) then review; everyday/splitpay/asset use their fixed AUD
  - Store the chosen currency on the account and surface it on the Manage screen, replacing the per-kind stub
  - Add the SplitPay creation wizard: a "What is SplitPay?" explainer, then a 3-step flow (target name with quick-select, target amount, funding time limit) that creates the pool
  - Flag the future BFF ownership check at the `lib/data/accounts.ts` seam

- cdfd109: Everyday sign-up flow

  - Add `/signup`: a three-step wizard — your details, a password, then a 6-digit email code — backed by the registration API (device create → init → verify), with a resend-code countdown
  - Check email and phone availability live as you type, so a taken identifier is caught before submitting
  - Add a country calling-code picker on the mobile field that composes an E.164 number
  - Point the login page's "Create an account" at `/signup`; the app QR code becomes a secondary "get the app" option

- cdfd109: Post sign-up onboarding

  - Add `/onboarding`: choose account type (everyday; corporate shown as coming-soon), plan, and optional add-ons, then confirm
  - Add a monthly/annual billing step where annual saves 10% on the base plan (add-ons excluded), with the pricing derived client-side from the monthly catalogue
  - Carry plan add-ons (SplitPay, per the provisioning enum) through the catalogue model and commit the selection through the soft-provisioning BFF client

- ead26b5: SplitPay funding view + hub

  - Branch the dashboard to a SplitPay funding view (pooled balance, live countdown, funding progress, contributors, "View Splitpay Hub") when a SplitPay account is selected
  - Add the SplitPay Hub route (`/account/[accountId]/splitpay`): funding / spending / closed status, collected-vs-target progress, my-contribution summary, top-up, and Start Spending
  - Add a live `useCountdown` hook driving the pool countdowns

### Patch Changes

- 5d3e372: Fix see-through dialog/overlay backgrounds

  - Define the previously-undefined `--background` theme token, so `bg-background` surfaces (dialogs, sheets, drawer, chart tooltips, header) render opaque instead of transparent
  - Add a centered `Dialog` primitive (Base UI) alongside the existing Sheet/Drawer, rendered on the elevated `popover` surface
  - Add a `warning` (amber) semantic colour token

- cdfd109: Dim form-field placeholders

  - Placeholders sat nearly as bright as entered text on the dark surfaces; dim them so they read as hints across the login and sign-up forms
  - Remove a stray console.log firing on every FieldLabel render

- cdfd109: Keep raw backend errors out of the UI

  - Filter upstream error messages that look like stack traces or ORM/DB internals (e.g. leaked Prisma errors) so sign-up shows a clean message instead

## 0.6.0

### Minor Changes

- Render bank cards from `public/cards` SVG faces by plan tier

### Patch Changes

- Restore pointer cursor on all interactive elements

## 0.5.0

### Minor Changes

- Scrollable per-account pills with per-account data and an add-account picker
- Money Flow and Spending Overview charts wired to the range pill; Recent Activity and Spending Overview restyled to match the iOS home screen
- Stub the Dossher assistant chat box behind the sidebar launcher

### Patch Changes

- Show the live session customer on the settings page via `useUser`
- Blend the Dossher chat scrollbar into the panel; balance header-bar padding
- Add a project `verify` skill (headless auth + browser-drive recipe)

## 0.4.1

### Patch Changes

- Cancel plan is now an Android-style bottom sheet; cancelling downgrades to the free plan
- Pin the plan card button to the bottom; resolve plan `accountId` on demand for pre-existing sessions

## 0.4.0

### Minor Changes

- Read-only "Your Plan" page backed by a current-plan BFF client, linked from the settings menu
- Capture plan `accountId` and `accountType` into the session at login
- Plan catalogue, history, and subscribe/cancel data layer with management UI
- Add Vitest for unit tests

## 0.3.1

### Patch Changes

- Add refresh-token flow and remove the ephemeral dev auth bypass
- Make "keep me logged in" actually work

## 0.3.0

### Minor Changes

- Dashboard overview UI built from Figma
- Settings/profile page built from the Android app

### Patch Changes

- Wire header actions; darken popover/dropdown surfaces; match sidebar to Figma

## 0.2.0

### Minor Changes

- Consolidated the stack on Next.js 16, removing an earlier Vite + TanStack + Hono SPA experiment
- server-only BFF shield with a service registry; root and route-group layouts
- Accounts tracer and dashboard stubs
- Login flow: forgot/reset password mock screens, mobile-only signup modal, first-visit fade animation

### Patch Changes

- Pin the Vercel framework preset to Next.js

## 0.1.2

### Patch Changes

- Login entrance animation and top-left floating logo
- User context wiring
- Sidebar colour and floating style, radial background, header collapse fix

## 0.1.1

### Patch Changes

- Login page UI: "remember me", forgot-password entry point, and a don't-have-an-account CTA
- Switch the login form to react-hook-form
- Add favicon and fix metadata; assorted type and spacing fixes

## 0.1.0

### Minor Changes

- Initial DosshPay dashboard scaffold on Next.js 16 (App Router, React 19) with the shadcn dashboard template
- DosshPay dark-first brand theme and Inter font
- Jose-encrypted httpOnly cookie sessions, Data Access Layer with `verifySession()`, and optimistic `proxy.ts` auth guard
- `(auth)` and `(dashboard)` route groups with a login form
- BFF auth route handlers (login, logout, refresh)
