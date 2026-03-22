@AGENTS.md

# CLAUDE.md — Project Guidelines

## Project Overview

**DosshPay Dashboard** — customer banking hub. "Banking Without Borders."

- **Framework:** Next.js 16 (App Router, React 19, RSC by default)
- **Language:** TypeScript (strict mode)
- **Styling:** Tailwind CSS v4 + shadcn/ui
- **Font:** Inter (loaded via `next/font/google`, variable `--font-inter`)
- **Package manager:** npm
- **Session management:** Jose (HS256 JWT), httpOnly cookies

## Commands

```bash
npm run dev          # Start dev server
npm run build        # Production build
npm run lint         # ESLint
npm run start        # Start production server
```

## Project Structure

```
src/
├── proxy.ts                          # Optimistic auth check (cookie existence only)
├── actions/
│   └── auth.ts                       # Server Actions: login(), logout()
├── app/
│   ├── (auth)/                       # Public — no sidebar, no auth required
│   │   ├── layout.tsx                # Centered card layout, DosshPay branding
│   │   └── login/
│   │       └── page.tsx              # Login form using useActionState
│   │
│   ├── (dashboard)/                  # Protected — sidebar layout, auth required
│   │   ├── layout.tsx                # SidebarProvider + AppSidebar + SiteHeader
│   │   ├── page.tsx                  # Main dashboard (calls verifySession())
│   │   └── data.json                 # Dashboard table data
│   │
│   ├── api/
│   │   └── bff/
│   │       └── auth/
│   │           ├── login/route.ts    # POST — proxy login to backend, set cookie
│   │           ├── logout/route.ts   # POST — clear cookie, call backend logout
│   │           └── refresh/route.ts  # POST — refresh session token
│   │
│   ├── layout.tsx                    # Root layout (Inter font, metadata)
│   └── globals.css                   # DosshPay theme tokens
│
├── components/
│   ├── app-sidebar.tsx               # Main sidebar navigation
│   ├── site-header.tsx               # Top header bar
│   ├── section-cards.tsx             # KPI stat cards
│   ├── chart-area-interactive.tsx    # Area chart component
│   ├── data-table.tsx                # Data table component
│   ├── nav-main.tsx                  # Primary nav items
│   ├── nav-documents.tsx             # Document nav items
│   ├── nav-secondary.tsx             # Secondary nav items
│   ├── nav-user.tsx                  # User profile menu
│   └── ui/                           # shadcn/ui primitives
│
├── hooks/
│   └── use-mobile.ts                 # Mobile breakpoint hook
│
└── lib/
    ├── session.ts                    # Encrypt/decrypt session cookie (Jose HS256)
    ├── dal.ts                        # Data Access Layer — verifySession(), getSession()
    ├── definitions.ts                # Zod schemas, TypeScript types
    └── utils.ts                      # cn() — clsx + tailwind-merge
```

## Authentication Architecture

### Session Flow

```
Browser → Server Action → Backend Auth API → Session Cookie → Dashboard
```

1. User submits login form → `login()` Server Action
2. Server Action validates with Zod → proxies to backend `MS_AUTH_BASE_URL/auth/login`
3. Backend returns userId/role → `createSession()` encrypts with Jose → sets httpOnly cookie
4. User is redirected to `/` → `verifySession()` decrypts cookie → renders dashboard

### Two-Tier Auth

**`proxy.ts` (optimistic):**
- Checks if session cookie **exists** — no decryption
- Unauthenticated → redirect to `/login`
- Authenticated on `/login` → redirect to `/`
- Do NOT rely on proxy alone for auth — it's a UX optimization only

**`dal.ts` (secure):**
- `verifySession()` — decrypts cookie, validates expiry, redirects to `/login` if invalid. Use in pages and Server Actions.
- `getSession()` — same but returns `null` instead of redirecting. Use in Route Handlers (because `redirect()` throws `NEXT_REDIRECT` which gets caught by try/catch).
- Both wrapped in React `cache()` for per-request memoization.

### Rules

- **Always call `verifySession()` in every `(dashboard)` page component and Server Action**
- **Always call `getSession()` in Route Handlers** (not `verifySession()`)
- **Never do auth checks in layouts** — layouts don't re-render on navigation (Partial Rendering)
- **Never store tokens in localStorage/sessionStorage** — httpOnly cookies only

## Design System

See `design.md` for the full color, typography, and component reference.

### Key Rules

- **Dark-first:** Page background is `#000000` (neutralBlack). No light mode toggle for v1.
- **Color tokens:** Use named Tailwind tokens from `globals.css`. Never introduce new hex values without adding them to the theme.
- **Cards:** `surfaceCardPrimary` (`#E8E8E8`) on dark backgrounds → use `bg-card`
- **Primary accent:** `#74BBF2` (accentBlue) → use `bg-primary`
- **Sidebar:** `#00032E` (blueDarker) background, `#E2E6FF` (blueLight) text
- **Borders:** `rgba(116,187,242,0.15)` — subtle blue tint
- **Font:** Inter only. No other typefaces.
- **Body text tokens:** `large-medium`, `medium-regular`, `regular-medium`, `small-normal`, `tiny-normal`
- **Buttons:** Primary is accentBlue bg with blue text, font-weight 700

## Coding Conventions

- **RSC by default.** Only add `"use client"` when using hooks, state, or browser APIs.
- **Import aliases:** `@/*` → `./src/*`
- **Validation:** Zod for all input (forms, API requests)
- **BFF pattern:** Frontend calls `/api/bff/*` routes. Never call microservices from client components.
- **Response envelope:** `{ success: boolean, payload: any }` for all BFF routes
- **Styling:** Use `cn()` from `@/lib/utils` for conditional class merging. Prefer Tailwind classes over inline styles.
- **Components:** Use shadcn/ui primitives from `components/ui/`. Props use TypeScript types, not interfaces.

## Security Rules

- Never expose backend URLs to client (no `NEXT_PUBLIC_` for microservice URLs)
- All input validated with Zod before forwarding to backend
- httpOnly cookies only — no localStorage/sessionStorage for auth tokens
- No PII in session payload (only userId, role, expiresAt)
- No sensitive data in error responses
- Rate limiting on auth endpoints
- `server-only` package on session/DAL modules to prevent client-side import

## Environment Variables

| Variable | Purpose | Server-only |
|---|---|---|
| `SESSION_SECRET` | Jose HS256 signing key | Yes |
| `MS_AUTH_BASE_URL` | Auth microservice base URL | Yes |
| `MS_API_BASE_URL` | API microservice base URL (future) | Yes |

Generate `SESSION_SECRET` with: `openssl rand -base64 32`

## Things to Avoid

- Don't do auth checks in layouts (Partial Rendering caveat)
- Don't call `proxy.ts` "middleware" — it's Proxy in Next.js 16
- Don't introduce new colors without adding to the theme in `globals.css`
- Don't use localStorage for auth tokens
- Don't skip `verifySession()` in any server-side code path
- Don't expose microservice URLs in `NEXT_PUBLIC_*` vars
- Don't use `verifySession()` in Route Handlers — use `getSession()` instead
- Don't add fonts other than Inter
