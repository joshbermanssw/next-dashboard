# Plan Management (Account Settings) — Design

**Date:** 2026-06-29
**Status:** Approved (design), pending implementation plan
**Builds on:** `2026-06-28-user-plan-design.md` (read-only current plan). That slice
shipped on branch `feat/user-plan`; this extends the same `/settings/plan` page.

## 1. Overview

Add full plan management to the existing `/settings/plan` page: browse the plan
catalog and subscribe / switch plans, cancel an active plan, and view subscription
history — all inline on one page (no sub-routes). Mirrors the Android "Your Plan"
experience.

## 2. Backend contract

Two hosts are involved:

- **Main API** (`MS_AUTH_BASE_URL`, ends in `/api`; reused via `services.accounts.baseUrl`),
  envelope `{ success, data }`, bearer required:
  - `GET /customers/{id}` → `data.accounts.{ id, accountType? }` (already fetched at login for `accountId`; now also read `accountType`).
  - `POST /account/{accountId}/plan` — subscribe/switch. Body `{ planId, Id, billingCycle, autoRenew?, isTrialPeriod? }`. `Id` is a **required legacy duplicate of `planId`**. `billingCycle` ∈ `monthly | annual`. Returns the new subscription object (`{ success, data: <subscription> }`), `201`.
  - `DELETE /account/{accountId}/plan/{planSubscriptionId}` — cancel. Body `{ cancelReason? }`. Returns the cancelled subscription.
  - `GET /account/{accountId}/plan/history` → `{ success, data: <subscription>[] }`.
- **Assets API** (`MS_ASSETS_BASE_URL` = `https://assets-api-dev.dossh.me/`), envelope
  `{ success, status, payload }`, **public (no bearer)**:
  - `GET /plans/{accountType}` (`accountType` ∈ `everyday | corporate`) → `payload: PlanDto[]`.
    `PlanDto = { ID:int, plan_name, month_cost:int(cents), features:string[], add_ons:[], learn_more_slug }`.

The subscription object (returned by current-plan GET, subscribe POST, cancel DELETE,
and each history item) is the shape already mapped by `toCurrentPlan` (`lib/plan.ts`):
`planId`, `actualPrice`, `currency`, `billingCycle`, `status`, `renewAt`, `expiresAt`,
`trialEndsAt`, nested `plans { name, planType, basePrice, features:{items,addOns} }`.

### accountType derivation (verified against Android)
Android sets `everyday|corporate` from the signup-time `CustomerType` selection,
persisted to the account (`PATCH /account/{id}` with `accountType`), then read back as
`accounts.accountType`. We have no signup flow, so we read `accounts.accountType` from
the customer record at login, normalize it to `everyday|corporate`, and **fall back to
`everyday`** when the backend leaves it null (the current test-account case).

### Risks / confirm during implementation
- The Assets API `{ success, payload }` envelope and `PlanDto` field names verified
  against the live `GET /plans/everyday`. The `accountType` string values on the
  account record are unverified (null on the test account) — `normalizeAccountType`
  must tolerate variants (`EVERYDAY`, `personal`, etc.) and default to `everyday`.
- Switching plans: assume `POST /plan` while a plan is active deactivates the old
  subscription (moved to history) and activates the new one. Confirm via manual test;
  if the backend requires an explicit cancel-then-subscribe, adjust the action.

## 3. Architecture

### 3.1 Config / session
- Add `MS_ASSETS_BASE_URL` to `.env`, `.env.example`, and `services` (new
  `services.assets.baseUrl`).
- `Session` (`server/auth/session-token.ts`) gains `accountType?: "everyday" | "corporate"`.
- `server/bff/clients/customer.ts`: replace `getCustomerAccountId` with
  `getCustomerAccount(bearer, customerId): Promise<{ accountId?: string; accountType?: AccountType }>`.
  `loginAction` captures both (still non-blocking).

### 3.2 Pure domain logic (unit-tested, `lib/`)
- `normalizeAccountType(raw: unknown): "everyday" | "corporate"` — case-insensitive
  match; default `everyday`.
- `toCatalogPlan(dto: unknown): CatalogPlan` — Zod-validate a `PlanDto`, map to
  `{ id:number, name:string, monthlyPriceMinor:number, formattedPrice:string, features:string[], learnMoreSlug:string }`. `month_cost` is **cents** → format to currency.
- `toPlanHistoryItem(data: unknown): PlanHistoryItem` — reuse the subscription schema;
  map to `{ id, planName, tier, status, formattedPrice, startedAt, endedAt }`.

### 3.3 BFF clients (`server-only`)
- `server/bff/clients/plan-catalog.ts`: `getPlanCatalog(accountType): Promise<CatalogPlan[]>`
  → `GET {assets}/plans/{accountType}`, unwrap `payload`, map via `toCatalogPlan`.
- `server/bff/clients/plan.ts` (extend): `getPlanHistory(bearer, accountId): Promise<PlanHistoryItem[]>`,
  `subscribePlan(bearer, accountId, planId, billingCycle)`, `cancelPlan(bearer, accountId, planSubscriptionId, reason?)`.

### 3.4 Server actions (`app/actions/plan.ts`)
- `subscribeToPlanAction(planId, billingCycle)` and `cancelPlanAction(planSubscriptionId, reason?)`:
  `verifySession()` → call the client with `session.upstreamJwt` + `session.accountId`
  → on success `revalidatePath("/settings/plan")`; return `{ success, message? }` for the
  UI to toast. Zod-validate inputs.

### 3.5 Data flow
```
Page (server): verifySession() → Promise.all([
    getCurrentPlan(jwt, accountId),
    getPlanCatalog(accountType),
    getPlanHistory(jwt, accountId),
  ]) (each independently guarded) → render
Mutation (client): action → server action → backend → revalidatePath → page re-fetch
```

## 4. UI — single `/settings/plan` page (everything inline)

Four stacked blocks; the page stays a server component passing data to client
components that trigger mutations.
1. **Current plan** — existing `CurrentPlanCard`, or a slim "not subscribed" header.
2. **Choose / change plan** — `CatalogSection` → one `PlanOptionCard` per `CatalogPlan`
   (name, price, features). Active plan marked "Current" (button disabled); others show
   **Subscribe** / **Switch to this plan** → `subscribeToPlanAction` via `useTransition`,
   pending spinner, sonner toast on result. `billingCycle` taken from the plan data.
3. **Cancel plan** — only with an active plan: "Cancel plan" → confirm `<dialog>`
   (same native-dialog pattern as the login signup modal) with optional reason →
   `cancelPlanAction`.
4. **Plan history** — `PlanHistory` list (plan name, status badge, date range, price);
   hidden when empty.

New components under `components/dashboard/settings/plan/`: `catalog-section.tsx`,
`plan-option-card.tsx`, `cancel-plan.tsx`, `plan-history.tsx`. Dark-first, named tokens
only; reuse `Panel`/existing primitives.

## 5. Error handling & states
- Each page fetch independently guarded: a catalog or history failure shows an inline
  error in that section without breaking the current-plan card.
- Subscribe/cancel failures → toast + inline message; envelopes Zod-validated.
- Pending states disable the triggering button. No optimistic UI — server action +
  `revalidatePath` re-renders authoritative state. Initial load uses existing `loading.tsx`.

## 6. Testing (TDD where pure)
- Unit (Vitest): `normalizeAccountType` (variants + default), `toCatalogPlan`
  (cents→formatted price, features, Zod throw on malformed), `toPlanHistoryItem`.
- Server actions + clients + UI: typecheck + build + manual run (subscribe → switch →
  cancel → history against the live backend).

## 7. Out of scope
- Annual billing UI (catalog exposes only monthly price; cycle stays data-driven).
- Plan add-ons / extras (`add_ons`, the `/plans` extras flow).
- Editing other profile/account settings.
