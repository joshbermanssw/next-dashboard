# next-dashboard

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
