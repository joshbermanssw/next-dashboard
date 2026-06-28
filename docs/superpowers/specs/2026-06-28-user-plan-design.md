# User Plan (Account Settings) — Design

**Date:** 2026-06-28
**Status:** Approved (design), pending implementation plan
**Scope:** Read-only display of the logged-in user's current subscription plan.

## 1. Overview

Add a dedicated **"Your Plan"** page under account settings that displays the
authenticated user's current subscription plan, mirroring the Android app's
"Your Plan" screen. This is the first slice of plan management; subscribe /
upgrade / cancel / history are explicitly **out of scope** here.

## 2. Backend contract

All endpoints are on the same backend as auth (`MS_AUTH_BASE_URL`, ends in
`/api`) and require `Authorization: Bearer <accessToken>`. Envelope is the
project-standard `{ success, data }` (see [[auth-backend-contract]] memory).

### Used by this feature

- **`GET /customers/{customerId}`** → `{ success, data }` where `data` includes
  `accounts: { id, customerId, accountType, isKYCVerified, ... }`. **`data.accounts.id`
  is the `accountId`** the plan endpoints are keyed by. (Confirmed via the Android
  `CustomerApiService` + `CustomerResponse` + `LoginSessionOrchestrator`, which sets
  `accountId = customerData.accounts.id`.)

- **`GET /account/{accountId}/plan`** → `{ success, data }`. The OpenAPI leaves
  `data` untyped, but the Android `getCurrentPlan` parser and the sibling
  `/plan/history` schema show `data` is a **single subscription object**:
  - `planId` (int), `actualPrice`, `currency`, `billingCycle`, `status`
    (`active|cancelled|expired|trial`), `startedAt`, `renewAt`, `expiresAt`,
    `trialEndsAt`, `autoRenew`, `isTrialPeriod`
  - nested `plans`: `{ id, name, slug, planType (BASIC|STANDARD|PREMIUM), basePrice,
    currency, billingCycle, features, limits, description, ... }`
  - `404` when there is no active plan.

### Not used (out of scope, documented for context)
- `POST /account/{accountId}/plan` (subscribe), `DELETE /account/{accountId}/plan/{planSubscriptionId}`
  (cancel), `GET /account/{accountId}/plan/history`.

### Risk / to confirm during implementation
The `/customers/{id}` shape and `accounts.id` are inferred from the Android repo,
not yet verified against the live API for our usage. Confirm the exact response
(and that `{id}` is the login `customer.id`, vs a `/customers/me` variant) on first
integration. The mapping layer must tolerate missing optional fields.

## 3. Architecture

### 3.1 Capture `accountId` at login (decision: option B)

- New BFF client `server/bff/clients/customer.ts` → `getCustomer(bearer, customerId)`
  calling `GET /customers/{id}`, unwrapping the envelope, returning at least
  `{ accountId: string | undefined }` (from `data.accounts?.id`).
- `loginAction` (`app/actions/auth.ts`): after `upstreamLogin`, call `getCustomer`
  using the fresh `accessToken` + `customer.id`. Store the resulting `accountId`
  on the session.
  - **Non-blocking:** if `getCustomer` throws or `accounts.id` is absent, login
    still succeeds with `accountId` undefined. Auth must never fail because plan
    metadata couldn't be fetched.
- `Session` type (`server/auth/session-token.ts`) gains `accountId?: string`.
  It is stable per user and preserved across token refreshes by the existing
  `...session` spread in `proxy.ts` `tryRefresh`.

### 3.2 Plan client

- New BFF client `server/bff/clients/plan.ts` → `getCurrentPlan(bearer, accountId)`
  calling `GET /account/{accountId}/plan`.
  - Unwraps `{ success, data }`, validates `data` with a **Zod schema**
    (`PlanSubscriptionSchema` in `lib/definitions.ts`), and maps to a typed
    `CurrentPlan` view model:
    `{ planName, tier, status, formattedPrice (display-ready string), currency,
       billingCycle, renewAt?, expiresAt?, trialEndsAt?, features: string[] }`.
    Price source is `actualPrice` with fallback to `plans.basePrice` (per Android).
  - Treats backend `404` as "no active plan" (returns `null`), distinct from a
    transport/parse error (throws `UpstreamError` / mapping error).

### 3.3 Data flow

```
Login:   loginAction → upstreamLogin → getCustomer(customer.id) → session.accountId
Display: /settings/plan (server) → verifySession() → session.accountId
           → getCurrentPlan(upstreamJwt, accountId) → CurrentPlan view model → render
```

## 4. UI — dedicated `/settings/plan` page

- Route `app/(dashboard)/settings/plan/page.tsx`, a **server component**:
  - `await verifySession()` as the auth gate.
  - If `session.accountId` is undefined → render the **empty/error state**.
  - Else fetch the plan; `null` → **no-active-plan** empty state; object → render.
- Components under `components/dashboard/settings/plan/`:
  - `CurrentPlanCard` — plan name, **tier badge** (Basic/Standard/Premium), price +
    billing cycle, **status badge** (active/trial), and a renewal line
    ("Renews on …" / "Trial ends …" / "Expires …" by status).
  - `PlanFeatures` — icon checklist of `features` (Android "Plan Features" card).
- Settings menu: add a **"Your Plan"** nav item in the existing `Profile` section
  of `profileMenu` (`lib/profile-data.ts`) with `href: "/settings/plan"`; ensure
  `SettingsMenu` nav rows navigate via the `href` (currently `"#"` placeholders).
- Reuse existing primitives (`Panel`, `SettingsRow`, theme tokens). Dark-first,
  named tokens only — no new hex (per design system rules).

## 5. States & error handling

- **Loading:** `Suspense` boundary with a skeleton card while the plan fetches.
- **No `accountId`:** "We couldn't find your account" empty state (rare; implies the
  customer lookup never resolved).
- **No active plan (404):** "You don't have an active plan" empty state.
- **Fetch/parse error:** "Couldn't load your plan" error state with a retry affordance.
- **401:** already handled upstream by the session/refresh layer; the page renders
  behind `verifySession()`.

## 6. Testing (TDD)

- `plan.ts`: envelope unwrap + Zod validation + view-model mapping, including
  price/currency/billing formatting, status→renewal-line selection, and 404→null.
- `customer.ts` + login capture: success, missing `accounts.id`, and `getCustomer`
  failure (login still succeeds, `accountId` undefined).
- Page-level: the three render states (plan / no-plan / error) given a mocked client.

## 7. Out of scope (future slices)
- Subscribe / upgrade flow (`POST /plan`), cancel (`DELETE`), plan history (`GET /plan/history`).
- Promoting `accountId` to the client `UserProvider` context (only needed if other
  pages require it).
