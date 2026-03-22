# DosshPay Dashboard Hub — Design Spec

**Date:** 2026-03-22
**Status:** Draft
**Scope:** Brand identity migration, authentication architecture, project documentation

## Overview

Transform the shadcn dashboard-01 template into the DosshPay customer banking hub. This spec covers three workstreams:

1. Applying the DosshPay brand identity (dark-first, blue-accented)
2. Structuring the app for backend-managed authentication with BFF pattern
3. Creating CLAUDE.md and supporting documentation

Existing dashboard features (KPI cards, area chart, data table) remain as-is. No new banking features are in scope.

## Context

- **Marketing site** exists at a separate repo with its own CLAUDE.md and design.md
- **Backend auth microservice** is in development — APIs are being built in parallel, contracts available
- **Auth model:** Same-origin login — dashboard has its own login page, backend issues session tokens
- **Framework:** Next.js 16 (App Router, React 19, `proxy.ts` replaces `middleware.ts`)

---

## 1. Route Architecture

### Route Groups

```
src/
├── proxy.ts                          # Optimistic auth check
├── app/
│   ├── (auth)/                       # Public — no sidebar, no auth required
│   │   ├── layout.tsx                # Centered card layout, DosshPay branding
│   │   └── login/
│   │       └── page.tsx              # Login form using Server Action
│   │
│   ├── (dashboard)/                  # Protected — sidebar layout, auth required
│   │   ├── layout.tsx                # SidebarProvider + AppSidebar + SiteHeader
│   │   ├── page.tsx                  # Main dashboard (existing content)
│   │   └── ...                       # Future pages
│   │
│   ├── api/
│   │   └── bff/
│   │       └── auth/
│   │           ├── login/route.ts    # POST — proxy login to backend, set cookie
│   │           ├── logout/route.ts   # POST — clear cookie, call backend logout
│   │           └── refresh/route.ts  # POST — refresh session token
│   │
│   ├── layout.tsx                    # Root layout (Inter font, theme, metadata)
│   └── globals.css                   # DosshPay theme tokens
│
├── lib/
│   ├── session.ts                    # Encrypt/decrypt session cookie (Jose)
│   ├── dal.ts                        # Data Access Layer — verifySession()
│   └── definitions.ts                # Zod schemas, shared types
```

### Auth Flow

1. User hits any `(dashboard)` route
2. `proxy.ts` checks for session cookie existence (optimistic) — no cookie → redirect `/login`
3. `(dashboard)/layout.tsx` renders sidebar shell
4. Page component calls `verifySession()` from DAL (secure check — decrypts, validates token)
5. If token is expired/invalid → DAL redirects to `/login`

### Proxy (`src/proxy.ts`)

Optimistic checks only. No decryption, no API calls.

- **Protected:** Everything except `/login`, `/api/bff/auth/*`, `/_next/*`, static assets
- **Unauthenticated → `/login`**
- **Authenticated user on `/login` → `/`**
- Uses `config.matcher` to exclude static assets

Per Next.js 16 docs: "Do not rely on proxy alone for authentication and authorization."

---

## 2. Session Management

### Cookie Specification

| Property | Value |
|---|---|
| Name | `session` |
| httpOnly | `true` — no JS access |
| secure | `true` — HTTPS only |
| sameSite | `lax` — CSRF protection |
| path | `/` |
| Encryption | Jose HS256, signed with SESSION_SECRET |

### `lib/session.ts`

Uses `jose` library + `server-only` package.

```typescript
// Functions:
encrypt(payload: SessionPayload): Promise<string>   // Sign token with HS256
decrypt(cookie: string): Promise<SessionPayload>     // Verify and return payload
createSession(backendToken: string): Promise<void>   // Encrypt + set cookie
updateSession(): Promise<void>                       // Refresh expiry
deleteSession(): Promise<void>                       // Clear cookie
```

Session payload contains minimum data: `userId`, `role`, `expiresAt`. No PII.

### `lib/dal.ts` — Data Access Layer

```typescript
// Wrapped in React cache() for per-request memoization
verifySession(): Promise<{ isAuth: true; userId: string; role: string }>
```

- Reads cookie, decrypts, validates expiry
- Invalid → `redirect('/login')`
- Called by every page component, Server Action, and Route Handler

Per Next.js docs: auth checks belong in the DAL close to data, not in layouts (layouts don't re-render on navigation due to Partial Rendering).

---

## 3. BFF Auth Routes

### Endpoints

| Route | Method | Purpose |
|---|---|---|
| `/api/bff/auth/login` | POST | Validate input (Zod) → proxy to backend → set session cookie |
| `/api/bff/auth/logout` | POST | Call backend logout → delete session cookie |
| `/api/bff/auth/refresh` | POST | Proxy refresh to backend → update cookie with new token |

### Security Measures

- All input validated with Zod before forwarding to backend
- Backend microservice URLs in server-only env vars (never exposed to client)
- Response envelope: `{ success: boolean, payload: any }`
- Rate limiting on login endpoint
- No sensitive data in error responses
- Every BFF route calls `verifySession()` before proxying (except login)

---

## 4. Brand Identity Migration

### Color System Replacement

Replace all oklch CSS variables in `globals.css` with DosshPay hex tokens.

| CSS Variable | Current (oklch) | Target (DosshPay) |
|---|---|---|
| `--background` | oklch white/near-black | `#000000` neutralBlack |
| `--foreground` | oklch neutral | `#F5F7FF` blueLightest |
| `--primary` | oklch blue | `#74BBF2` accentBlue |
| `--primary-foreground` | oklch light | `#2A355A` blue |
| `--secondary` | oklch light gray | `#00032E` blueDarker |
| `--secondary-foreground` | oklch dark | `#F5F7FF` blueLightest |
| `--muted` | oklch muted | `#111C3A` blueDark |
| `--muted-foreground` | oklch muted text | `#E2E6FF` blueLight |
| `--accent` | oklch accent | `#00032E` blueDarker |
| `--accent-foreground` | oklch accent text | `#74BBF2` accentBlue |
| `--destructive` | oklch red | Keep existing red/destructive |
| `--card` | oklch white | `#E8E8E8` surfaceCardPrimary |
| `--card-foreground` | oklch dark | `#111C3A` blueDark |
| `--border` | oklch light border | `rgba(116,187,242,0.15)` accentBlue/15% |
| `--input` | oklch input border | `rgba(116,187,242,0.2)` accentBlue/20% |
| `--ring` | oklch blue ring | `#74BBF2` accentBlue |
| `--sidebar-background` | oklch near-white | `#00032E` blueDarker |
| `--sidebar-foreground` | oklch dark | `#E2E6FF` blueLight |
| `--sidebar-primary` | oklch primary | `#74BBF2` accentBlue |
| `--sidebar-accent` | oklch accent | `#111C3A` blueDark |

### Tailwind Theme Extensions

Add DosshPay named color tokens to the Tailwind config so utility classes work:

```
neutralBlack, neutralWhite, neutralLight, grey, neutral, neutralDark, neutralDarker
blueDarker, blueDark, blue, surfaceCardBlue, accentBlue, accentBlueHover, blueLight, blueLightest
surfaceCardPrimary, surfaceCardSecondary, surfaceCardTertiarty
```

Add body text size tokens:

```
large-medium (1.125rem/700), medium-regular (1.125rem/500),
regular-medium (1rem/500), small-normal (1rem/400), tiny-normal (0.875rem/400)
```

### Font

Replace Geist Sans/Mono with Inter:
- Load via `next/font/google` with variable `--font-inter`
- Apply to root layout `<body>`
- Update `--font-sans` CSS variable to reference `--font-inter`

### Component Theming

| Element | Theme |
|---|---|
| Page background | `#000000` neutralBlack (dark-first default) |
| Sidebar | `#00032E` blueDarker bg, `#E2E6FF` blueLight text |
| KPI cards | `#E8E8E8` surfaceCardPrimary bg, `#111C3A` blueDark text |
| Chart area | `#404476` surfaceCardBlue bg, `#74BBF2` accentBlue data lines |
| Primary buttons | `#74BBF2` accentBlue bg, `#2A355A` blue text, 700 weight |
| Borders | `rgba(116,187,242,0.15)` — subtle blue tint |
| Focus rings | `#74BBF2` accentBlue |

### Login Page

- Centered card on neutralBlack background
- DosshPay logo at top
- surfaceCardPrimary card with login form
- accentBlue primary button
- Inter font throughout

---

## 5. Documentation

### CLAUDE.md

Comprehensive project guidelines covering:

**Project Overview**
- DosshPay Dashboard — customer banking hub
- Stack: Next.js 16, React 19, TypeScript strict, Tailwind v4, shadcn/ui, Inter font
- Package manager: pnpm

**Commands**
- `pnpm dev`, `pnpm build`, `pnpm lint`, `pnpm start`

**Project Structure**
- Full annotated tree matching the route architecture above

**Authentication Architecture**
- Text-based session flow diagram
- `proxy.ts` — purpose and limitations (optimistic only)
- DAL — `verifySession()` usage rules
- BFF auth routes — what they do

**Design System Rules** (inherited from marketing site)
- Color usage: dark-first, named tokens only
- Typography: Inter, HeadingTag levels if adopted, body text tokens
- Buttons: accentBlue primary, variant mapping
- Cards: surfaceCardPrimary on dark backgrounds

**Coding Conventions**
- RSC by default, `"use client"` only when needed
- Import aliases (`@/*` → `./src/*`)
- Auth: always call `verifySession()` in pages, Server Actions, Route Handlers
- BFF: never call microservices from client components
- Validation: Zod for all input

**Security Rules**
- Never expose backend URLs to client
- All input validated with Zod before forwarding
- httpOnly cookies only — no localStorage/sessionStorage for tokens
- No sensitive data in error responses
- No PII in session payload
- Rate limiting on auth endpoints

**Environment Variables**

| Variable | Purpose |
|---|---|
| `SESSION_SECRET` | Jose signing key |
| `MS_AUTH_BASE_URL` | Backend auth microservice URL |
| `MS_API_BASE_URL` | Backend API microservice URL (future) |

**Things to Avoid**
- Don't do auth checks in layouts (Partial Rendering caveat)
- Don't call `proxy.ts` "middleware" — it's Proxy in Next.js 16
- Don't introduce new colors without adding to Tailwind config
- Don't use localStorage for auth tokens
- Don't skip `verifySession()` in any server-side code path
- Don't expose microservice URLs in `NEXT_PUBLIC_*` vars

### design.md

Copy the marketing site's `design.md` into this repo as the canonical design system reference. No modifications needed — the dashboard should follow the same identity.

### AGENTS.md

Keep as-is. Already references Next.js 16 docs in `node_modules/next/dist/docs/`.

---

## Environment Variables

| Variable | Purpose | Server-only |
|---|---|---|
| `SESSION_SECRET` | Jose HS256 signing key | Yes |
| `MS_AUTH_BASE_URL` | Auth microservice base URL | Yes |
| `MS_API_BASE_URL` | API microservice base URL (future) | Yes |

Generate `SESSION_SECRET` with: `openssl rand -base64 32`

---

## Dependencies to Add

| Package | Purpose |
|---|---|
| `jose` | JWT signing/verification (Edge-compatible) |
| `server-only` | Prevent session/DAL code from running on client |
| `zod` | Already installed — input validation |

---

## Out of Scope

- New banking features (accounts, transactions, transfers, cards)
- Role-based access control beyond basic auth
- MFA / 2FA (backend responsibility)
- Real backend integration (stubbed BFF routes for now)
- Dark/light theme toggle (dark-first is the default and only mode for v1)
