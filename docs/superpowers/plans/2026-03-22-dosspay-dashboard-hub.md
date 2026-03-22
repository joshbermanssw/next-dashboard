# DosshPay Dashboard Hub Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform the shadcn dashboard-01 template into the DosshPay customer banking hub with brand identity, auth architecture, and project documentation.

**Architecture:** Next.js 16 App Router with route groups (`(auth)` public, `(dashboard)` protected), `proxy.ts` for optimistic auth redirects, Data Access Layer for secure session verification, BFF routes proxying to backend auth microservice. Dark-first DosshPay brand identity replaces the shadcn neutral theme.

**Tech Stack:** Next.js 16, React 19, TypeScript, Tailwind v4, shadcn/ui, Jose (JWT), Zod, Inter font

**Spec:** `docs/superpowers/specs/2026-03-22-dosspay-dashboard-hub-design.md`

---

## File Structure

### New Files

| File | Responsibility |
|---|---|
| `src/proxy.ts` | Optimistic auth check — cookie exists? redirect if not |
| `src/app/(auth)/layout.tsx` | Public layout — centered card, no sidebar |
| `src/app/(auth)/login/page.tsx` | Login form with Server Action |
| `src/app/(dashboard)/layout.tsx` | Protected layout — sidebar + header shell |
| `src/app/(dashboard)/page.tsx` | Main dashboard (moved from `src/app/page.tsx`) |
| `src/app/api/bff/auth/login/route.ts` | POST — proxy login to backend, set session cookie |
| `src/app/api/bff/auth/logout/route.ts` | POST — clear cookie, call backend logout |
| `src/app/api/bff/auth/refresh/route.ts` | POST — refresh session token |
| `src/lib/session.ts` | Encrypt/decrypt session cookie with Jose |
| `src/lib/dal.ts` | Data Access Layer — `verifySession()` |
| `src/lib/definitions.ts` | Zod schemas, TypeScript types |
| `src/actions/auth.ts` | Server Actions for login/logout forms |
| `design.md` | DosshPay design system reference (copied from marketing site) |
| `.env.example` | Template for required environment variables |

### Modified Files

| File | Changes |
|---|---|
| `src/app/globals.css` | Replace oklch variables with DosshPay hex tokens, remove `.dark` block |
| `src/app/layout.tsx` | Swap Geist → Inter font, update metadata, remove theme-provider |
| `src/components/app-sidebar.tsx` | Update company name "Acme Inc." → "DosshPay" |
| `package.json` | Add `jose`, `server-only`; remove `next-themes` |
| `CLAUDE.md` | Complete project guidelines |

### Deleted Files

| File | Reason |
|---|---|
| `src/app/page.tsx` | Consolidated into `(dashboard)` route group |
| `src/app/dashboard/page.tsx` | Consolidated into `(dashboard)` route group |
| `src/app/dashboard/data.json` | Moved to `src/app/(dashboard)/data.json` |

---

## Task 1: Install Dependencies and Clean Up

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install jose and server-only**

```bash
npm install jose server-only
```

- [ ] **Step 2: Remove next-themes**

```bash
npm uninstall next-themes
```

- [ ] **Step 3: Create .env.example**

Create `.env.example` at project root:

```bash
# Session encryption key — generate with: openssl rand -base64 32
SESSION_SECRET=

# Backend auth microservice
MS_AUTH_BASE_URL=

# Backend API microservice (future)
MS_API_BASE_URL=
```

- [ ] **Step 4: Create .env.local with a dev SESSION_SECRET**

```bash
# Generate a secret and write to .env.local
echo "SESSION_SECRET=$(openssl rand -base64 32)" > .env.local
echo "MS_AUTH_BASE_URL=http://localhost:4000" >> .env.local
echo "MS_API_BASE_URL=http://localhost:4000" >> .env.local
```

- [ ] **Step 5: Ensure .env.example is not gitignored**

The existing `.gitignore` has `.env*` which matches `.env.example`. Add an exclusion:

```bash
echo '!.env.example' >> .gitignore
```

- [ ] **Step 6: Verify .env.local is gitignored**

The existing `.gitignore` already has `.env*`. Confirm `.env.local` is ignored but `.env.example` is not:

```bash
git check-ignore .env.local    # should show .env.local
git check-ignore .env.example  # should show nothing (not ignored)
```

- [ ] **Step 7: Commit**

```bash
git add package.json package-lock.json .env.example .gitignore
git commit -m "chore: add jose, server-only; remove next-themes; add env template"
```

---

## Task 2: Brand Identity — Replace CSS Theme

**Files:**
- Modify: `src/app/globals.css`

- [ ] **Step 1: Replace globals.css with DosshPay theme**

Replace the entire contents of `src/app/globals.css` with:

```css
@import "tailwindcss";
@import "tw-animate-css";
@import "shadcn/tailwind.css";

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --font-sans: var(--font-inter);
  --font-heading: var(--font-inter);
  --color-sidebar-ring: var(--sidebar-ring);
  --color-sidebar-border: var(--sidebar-border);
  --color-sidebar-accent-foreground: var(--sidebar-accent-foreground);
  --color-sidebar-accent: var(--sidebar-accent);
  --color-sidebar-primary-foreground: var(--sidebar-primary-foreground);
  --color-sidebar-primary: var(--sidebar-primary);
  --color-sidebar-foreground: var(--sidebar-foreground);
  --color-sidebar: var(--sidebar);
  --color-chart-5: var(--chart-5);
  --color-chart-4: var(--chart-4);
  --color-chart-3: var(--chart-3);
  --color-chart-2: var(--chart-2);
  --color-chart-1: var(--chart-1);
  --color-ring: var(--ring);
  --color-input: var(--input);
  --color-border: var(--border);
  --color-destructive: var(--destructive);
  --color-accent-foreground: var(--accent-foreground);
  --color-accent: var(--accent);
  --color-muted-foreground: var(--muted-foreground);
  --color-muted: var(--muted);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-secondary: var(--secondary);
  --color-primary-foreground: var(--primary-foreground);
  --color-primary: var(--primary);
  --color-popover-foreground: var(--popover-foreground);
  --color-popover: var(--popover);
  --color-card-foreground: var(--card-foreground);
  --color-card: var(--card);
  --radius-sm: calc(var(--radius) * 0.6);
  --radius-md: calc(var(--radius) * 0.8);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) * 1.4);
  --radius-2xl: calc(var(--radius) * 1.8);
  --radius-3xl: calc(var(--radius) * 2.2);
  --radius-4xl: calc(var(--radius) * 2.6);

  /* DosshPay named color tokens */
  --color-neutralBlack: #000000;
  --color-neutralWhite: #F2F2F2;
  --color-neutralLight: #AAAAAA;
  --color-grey: #CCCCCC;
  --color-neutral: #666666;
  --color-neutralDark: #444444;
  --color-neutralDarker: #222222;
  --color-blueDarker: #00032E;
  --color-blueDark: #111C3A;
  --color-blue: #2A355A;
  --color-surfaceCardBlue: #404476;
  --color-accentBlue: #74BBF2;
  --color-accentBlueHover: #5EA2D8;
  --color-blueLight: #E2E6FF;
  --color-blueLightest: #F5F7FF;
  --color-surfaceCardPrimary: #E8E8E8;
  --color-surfaceCardSecondary: #D8D8D8;
  --color-surfaceCardTertiary: #E7EBF2;

  /* DosshPay body text size tokens */
  --text-large-medium: 1.125rem;
  --text-medium-regular: 1.125rem;
  --text-regular-medium: 1rem;
  --text-small-normal: 1rem;
  --text-tiny-normal: 0.875rem;
}

:root {
  /* DosshPay dark-first theme */
  --background: #000000;
  --foreground: #F5F7FF;
  --card: #E8E8E8;
  --card-foreground: #111C3A;
  --popover: #E8E8E8;
  --popover-foreground: #111C3A;
  --primary: #74BBF2;
  --primary-foreground: #2A355A;
  --secondary: #00032E;
  --secondary-foreground: #F5F7FF;
  --muted: #111C3A;
  --muted-foreground: #E2E6FF;
  --accent: #00032E;
  --accent-foreground: #74BBF2;
  --destructive: oklch(0.577 0.245 27.325);
  --border: rgba(116, 187, 242, 0.15);
  --input: rgba(116, 187, 242, 0.2);
  --ring: #74BBF2;
  --chart-1: #74BBF2;
  --chart-2: #5EA2D8;
  --chart-3: #404476;
  --chart-4: #E2E6FF;
  --chart-5: #56CADB;
  --radius: 0.625rem;
  --sidebar: #00032E;
  --sidebar-foreground: #E2E6FF;
  --sidebar-primary: #74BBF2;
  --sidebar-primary-foreground: #2A355A;
  --sidebar-accent: #111C3A;
  --sidebar-accent-foreground: #F5F7FF;
  --sidebar-border: rgba(116, 187, 242, 0.15);
  --sidebar-ring: #74BBF2;
}

@layer base {
  * {
    @apply border-border outline-ring/50;
  }
  body {
    @apply bg-background text-foreground;
  }
  html {
    @apply font-sans;
  }
}
```

Key changes from original:
- Removed `--font-geist-mono` reference, now uses `--font-inter`
- Removed entire `.dark` block (dark-first is the only mode)
- Removed `@custom-variant dark` (not needed)
- All oklch values replaced with DosshPay hex tokens
- Added named DosshPay color tokens for utility classes
- Added body text size tokens

- [ ] **Step 2: Verify the build succeeds**

```bash
npm run build
```

Expected: Build completes. There may be warnings about unused font variables — that's fine, we fix that in Task 3.

- [ ] **Step 3: Commit**

```bash
git add src/app/globals.css
git commit -m "feat: replace oklch theme with DosshPay dark-first brand identity"
```

---

## Task 3: Brand Identity — Swap Font to Inter

**Files:**
- Modify: `src/app/layout.tsx`

- [ ] **Step 1: Replace root layout with Inter font and updated metadata**

Replace the entire contents of `src/app/layout.tsx` with:

```tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { TooltipProvider } from "@/components/ui/tooltip";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DosshPay Dashboard",
  description: "DosshPay — Banking Without Borders",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <TooltipProvider>{children}</TooltipProvider>
      </body>
    </html>
  );
}
```

Key changes:
- `Geist` and `Geist_Mono` → `Inter`
- Font variable `--font-geist-sans` → `--font-inter`
- Metadata updated to DosshPay branding
- Removed Geist Mono entirely (not needed)

- [ ] **Step 2: Update sidebar company name**

In `src/components/app-sidebar.tsx`, change:

```tsx
<CommandIcon className="size-5!" />
<span className="text-base font-semibold">Acme Inc.</span>
```

to:

```tsx
<CommandIcon className="size-5!" />
<span className="text-base font-semibold">DosshPay</span>
```

- [ ] **Step 3: Verify the dev server renders correctly**

```bash
npm run dev
```

Open http://localhost:3000 and confirm:
- Inter font is applied (no Geist)
- Dark background (#000000) with light text
- Sidebar is dark blue (#00032E)
- Cards are light (#E8E8E8) on dark background
- Accent blue (#74BBF2) is used for primary elements

- [ ] **Step 4: Verify build succeeds**

```bash
npm run build
```

Expected: Clean build, no errors.

- [ ] **Step 5: Commit**

```bash
git add src/app/layout.tsx src/components/app-sidebar.tsx
git commit -m "feat: swap Geist to Inter font, update branding to DosshPay"
```

---

## Task 4: Session Management — Types and Session Library

**Files:**
- Create: `src/lib/definitions.ts`
- Create: `src/lib/session.ts`

- [ ] **Step 1: Create type definitions and Zod schemas**

Create `src/lib/definitions.ts`:

```ts
import * as z from "zod"

export const LoginFormSchema = z.object({
  email: z.email({ error: "Please enter a valid email." }).trim(),
  password: z
    .string()
    .min(1, { error: "Password is required." })
    .trim(),
})

export type LoginFormState =
  | {
      errors?: {
        email?: string[]
        password?: string[]
      }
      message?: string
    }
  | undefined

export type SessionPayload = {
  userId: string
  role: string
  expiresAt: Date
}
```

- [ ] **Step 2: Create session management library**

Create `src/lib/session.ts`:

```ts
import "server-only"
import { SignJWT, jwtVerify } from "jose"
import { cookies } from "next/headers"
import type { SessionPayload } from "@/lib/definitions"

const secretKey = process.env.SESSION_SECRET
if (!secretKey) {
  throw new Error("SESSION_SECRET environment variable is required")
}
const encodedKey = new TextEncoder().encode(secretKey)

export async function encrypt(payload: SessionPayload): Promise<string> {
  return new SignJWT({ ...payload, expiresAt: payload.expiresAt.toISOString() })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(encodedKey)
}

export async function decrypt(
  session: string | undefined = ""
): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(session, encodedKey, {
      algorithms: ["HS256"],
    })
    return {
      userId: payload.userId as string,
      role: payload.role as string,
      expiresAt: new Date(payload.expiresAt as string),
    }
  } catch {
    return null
  }
}

export async function createSession(
  userId: string,
  role: string
): Promise<void> {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  const session = await encrypt({ userId, role, expiresAt })
  const cookieStore = await cookies()

  cookieStore.set("session", session, {
    httpOnly: true,
    secure: true,
    expires: expiresAt,
    sameSite: "lax",
    path: "/",
  })
}

export async function updateSession(): Promise<void> {
  const cookieStore = await cookies()
  const session = cookieStore.get("session")?.value
  const payload = await decrypt(session)

  if (!session || !payload) {
    return
  }

  const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

  cookieStore.set("session", session, {
    httpOnly: true,
    secure: true,
    expires,
    sameSite: "lax",
    path: "/",
  })
}

export async function deleteSession(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete("session")
}
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: No type errors in the new files.

- [ ] **Step 4: Commit**

```bash
git add src/lib/definitions.ts src/lib/session.ts
git commit -m "feat: add session management with Jose encryption"
```

---

## Task 5: Data Access Layer

**Files:**
- Create: `src/lib/dal.ts`

- [ ] **Step 1: Create the Data Access Layer**

Create `src/lib/dal.ts`:

```ts
import "server-only"
import { cache } from "react"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { decrypt } from "@/lib/session"

export const verifySession = cache(async () => {
  const cookieStore = await cookies()
  const cookie = cookieStore.get("session")?.value
  const session = await decrypt(cookie)

  if (!session?.userId) {
    redirect("/login")
  }

  return { isAuth: true as const, userId: session.userId, role: session.role }
})

/**
 * Non-redirecting version for use in Route Handlers where redirect()
 * would be caught by try/catch (redirect throws NEXT_REDIRECT).
 * Returns null instead of redirecting on invalid session.
 */
export const getSession = cache(async () => {
  const cookieStore = await cookies()
  const cookie = cookieStore.get("session")?.value
  const session = await decrypt(cookie)

  if (!session?.userId) {
    return null
  }

  return { userId: session.userId, role: session.role }
})
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: No type errors.

- [ ] **Step 3: Commit**

```bash
git add src/lib/dal.ts
git commit -m "feat: add Data Access Layer with verifySession()"
```

---

## Task 6: Proxy — Optimistic Auth Check

**Files:**
- Create: `src/proxy.ts`

- [ ] **Step 1: Create proxy.ts**

Create `src/proxy.ts`:

```ts
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const publicRoutes = ["/login"]

export function proxy(req: NextRequest) {
  const path = req.nextUrl.pathname
  const isPublicRoute = publicRoutes.some((route) => path.startsWith(route))
  const sessionCookie = req.cookies.get("session")?.value

  // Unauthenticated user trying to access protected route → redirect to login
  if (!isPublicRoute && !sessionCookie) {
    return NextResponse.redirect(new URL("/login", req.nextUrl))
  }

  // Authenticated user trying to access login → redirect to dashboard
  if (isPublicRoute && sessionCookie) {
    return NextResponse.redirect(new URL("/", req.nextUrl))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$).*)"],
}
```

Key points:
- **Optimistic only** — checks cookie existence, not validity
- Does NOT decrypt the cookie (that's the DAL's job)
- Excludes API routes, static assets, images from matching
- Redirects authenticated users away from `/login`

- [ ] **Step 2: Verify build succeeds**

```bash
npm run build
```

Expected: Build succeeds. Proxy is recognized by Next.js 16.

- [ ] **Step 3: Commit**

```bash
git add src/proxy.ts
git commit -m "feat: add proxy.ts for optimistic auth redirects"
```

---

## Task 7: Route Groups — Restructure App

**Files:**
- Create: `src/app/(auth)/layout.tsx`
- Create: `src/app/(auth)/login/page.tsx`
- Create: `src/app/(dashboard)/layout.tsx`
- Create: `src/app/(dashboard)/page.tsx`
- Move: `src/app/dashboard/data.json` → `src/app/(dashboard)/data.json`
- Delete: `src/app/page.tsx`
- Delete: `src/app/dashboard/page.tsx`
- Delete: `src/app/dashboard/` (directory)

- [ ] **Step 1: Create the (auth) layout**

Create `src/app/(auth)/layout.tsx`:

```tsx
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      {children}
    </div>
  )
}
```

- [ ] **Step 2: Create the login page**

Create `src/app/(auth)/login/page.tsx`:

```tsx
import { login } from "@/actions/auth"

export default function LoginPage() {
  return (
    <div className="w-full max-w-sm space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-semibold text-foreground">DosshPay</h1>
        <p className="text-sm text-muted-foreground">
          Sign in to your account
        </p>
      </div>
      <div className="rounded-lg bg-card p-6 shadow-xl">
        <form action={login} className="space-y-4">
          <div className="space-y-2">
            <label
              htmlFor="email"
              className="text-sm font-medium text-card-foreground"
            >
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="you@example.com"
            />
          </div>
          <div className="space-y-2">
            <label
              htmlFor="password"
              className="text-sm font-medium text-card-foreground"
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-lg bg-primary px-5 py-2 text-sm font-bold text-primary-foreground shadow-md transition-all duration-300 hover:bg-accentBlueHover"
          >
            Sign In
          </button>
        </form>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Create the login Server Action**

Create `src/actions/auth.ts`:

```ts
"use server"

import { redirect } from "next/navigation"
import { LoginFormSchema } from "@/lib/definitions"
import { createSession, deleteSession } from "@/lib/session"

export async function login(formData: FormData) {
  // 1. Validate input
  const validatedFields = LoginFormSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  })

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    }
  }

  // 2. Proxy to backend auth microservice
  const { email, password } = validatedFields.data

  try {
    const response = await fetch(
      `${process.env.MS_AUTH_BASE_URL}/auth/login`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      }
    )

    if (!response.ok) {
      return { message: "Invalid email or password." }
    }

    const data = await response.json()

    // 3. Create session cookie
    await createSession(data.userId, data.role)
  } catch {
    // Stubbed: if backend is unavailable, create a dev session
    // TODO: Remove this block when backend is available
    console.warn("[auth] Backend unavailable — creating dev session")
    await createSession("dev-user-id", "user")
  }

  // 4. Redirect to dashboard
  redirect("/")
}

export async function logout() {
  await deleteSession()
  redirect("/login")
}
```

Note: The `catch` block creates a dev session when the backend is unavailable. This allows development to proceed while the backend is being built. **Remove this when the backend is ready.**

- [ ] **Step 4: Create the (dashboard) layout**

Create `src/app/(dashboard)/layout.tsx`:

```tsx
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            {children}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
```

- [ ] **Step 5: Create the (dashboard) page with auth check**

Move `src/app/dashboard/data.json` → `src/app/(dashboard)/data.json`, then create `src/app/(dashboard)/page.tsx`:

```tsx
import { verifySession } from "@/lib/dal"
import { ChartAreaInteractive } from "@/components/chart-area-interactive"
import { DataTable } from "@/components/data-table"
import { SectionCards } from "@/components/section-cards"

import data from "./data.json"

export default async function DashboardPage() {
  // Secure auth check — decrypts and validates session
  await verifySession()

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <SectionCards />
      <div className="px-4 lg:px-6">
        <ChartAreaInteractive />
      </div>
      <DataTable data={data} />
    </div>
  )
}
```

Key changes from original `page.tsx`:
- `async` function (Server Component with await)
- Calls `verifySession()` before rendering (secure auth check)
- Sidebar/header layout moved to `(dashboard)/layout.tsx`
- Imports `data.json` from local directory

- [ ] **Step 6: Delete old files**

```bash
rm src/app/page.tsx
rm src/app/dashboard/page.tsx
rm src/app/dashboard/data.json
rmdir src/app/dashboard
```

- [ ] **Step 7: Verify build succeeds**

```bash
npm run build
```

Expected: Build succeeds. Routes:
- `/login` → (auth) group → login page
- `/` → (dashboard) group → dashboard page with auth check

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: restructure into (auth) and (dashboard) route groups with login page"
```

---

## Task 8: BFF Auth Route Handlers

**Files:**
- Create: `src/app/api/bff/auth/login/route.ts`
- Create: `src/app/api/bff/auth/logout/route.ts`
- Create: `src/app/api/bff/auth/refresh/route.ts`

- [ ] **Step 1: Create login BFF route**

Create `src/app/api/bff/auth/login/route.ts`:

```ts
import { NextResponse } from "next/server"
import { LoginFormSchema } from "@/lib/definitions"
import { createSession } from "@/lib/session"

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Validate input
    const validatedFields = LoginFormSchema.safeParse(body)
    if (!validatedFields.success) {
      return NextResponse.json(
        { success: false, payload: { errors: validatedFields.error.flatten().fieldErrors } },
        { status: 400 }
      )
    }

    // Proxy to backend
    const response = await fetch(
      `${process.env.MS_AUTH_BASE_URL}/auth/login`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validatedFields.data),
      }
    )

    if (!response.ok) {
      return NextResponse.json(
        { success: false, payload: { message: "Invalid credentials" } },
        { status: 401 }
      )
    }

    const data = await response.json()
    await createSession(data.userId, data.role)

    return NextResponse.json({ success: true, payload: null })
  } catch {
    return NextResponse.json(
      { success: false, payload: { message: "An error occurred" } },
      { status: 500 }
    )
  }
}
```

- [ ] **Step 2: Create logout BFF route**

Create `src/app/api/bff/auth/logout/route.ts`:

```ts
import { NextResponse } from "next/server"
import { deleteSession } from "@/lib/session"
import { getSession } from "@/lib/dal"

export async function POST() {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json(
        { success: false, payload: { message: "Not authenticated" } },
        { status: 401 }
      )
    }

    // Optionally notify backend of logout
    try {
      await fetch(`${process.env.MS_AUTH_BASE_URL}/auth/logout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: session.userId }),
      })
    } catch {
      // Backend logout is best-effort — don't fail the client logout
    }

    await deleteSession()

    return NextResponse.json({ success: true, payload: null })
  } catch {
    return NextResponse.json(
      { success: false, payload: { message: "An error occurred" } },
      { status: 500 }
    )
  }
}
```

- [ ] **Step 3: Create refresh BFF route**

Create `src/app/api/bff/auth/refresh/route.ts`:

```ts
import { NextResponse } from "next/server"
import { updateSession } from "@/lib/session"
import { getSession } from "@/lib/dal"

export async function POST() {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json(
        { success: false, payload: { message: "Not authenticated" } },
        { status: 401 }
      )
    }

    await updateSession()

    return NextResponse.json({ success: true, payload: null })
  } catch {
    return NextResponse.json(
      { success: false, payload: { message: "An error occurred" } },
      { status: 500 }
    )
  }
}
```

- [ ] **Step 4: Verify build succeeds**

```bash
npm run build
```

Expected: Build succeeds with new API routes.

- [ ] **Step 5: Commit**

```bash
git add src/app/api/bff/auth/
git commit -m "feat: add BFF auth route handlers (login, logout, refresh)"
```

---

## Task 9: Write CLAUDE.md

**Files:**
- Modify: `CLAUDE.md`

- [ ] **Step 1: Write the complete CLAUDE.md**

Replace `CLAUDE.md` with comprehensive project guidelines. This should include:

- Project overview: DosshPay Dashboard — customer banking hub
- Stack: Next.js 16, React 19, TypeScript strict, Tailwind v4, shadcn/ui, Inter font
- Package manager: npm
- Commands: `npm run dev`, `npm run build`, `npm run lint`, `npm run start`
- Full project structure tree (matching the actual file structure after all tasks)
- Authentication architecture section:
  - Session flow: Browser → Server Action → BFF → Backend → Cookie
  - `proxy.ts` — optimistic checks only (cookie existence)
  - DAL `verifySession()` — secure checks (decrypt + validate)
  - Rule: auth checks in pages and Server Actions, NEVER in layouts
- Design system rules (from spec Section 4):
  - Dark-first, DosshPay color tokens
  - Inter font, body text tokens
  - surfaceCardPrimary cards on dark backgrounds
  - accentBlue primary buttons
- Coding conventions:
  - RSC by default, `"use client"` only when needed
  - Import aliases (`@/*` → `./src/*`)
  - Always call `verifySession()` in pages, Server Actions, Route Handlers
  - BFF pattern: never call microservices from client components
  - Zod validation for all input
- Security rules:
  - Never expose backend URLs to client
  - httpOnly cookies only — no localStorage for tokens
  - No PII in session payload
  - No sensitive data in error responses
  - Rate limiting on auth endpoints
- Environment variables table
- Things to avoid list

Reference the spec at `docs/superpowers/specs/2026-03-22-dosspay-dashboard-hub-design.md` for exact wording.

Keep `@AGENTS.md` reference at the top (it already exists).

- [ ] **Step 2: Copy design.md from marketing site context**

Create `design.md` at project root with the DosshPay Design System content (the full design.md provided by the user during brainstorming). This is the canonical design system reference.

- [ ] **Step 3: Verify lint passes**

```bash
npm run lint
```

Expected: No lint errors.

- [ ] **Step 4: Commit**

```bash
git add CLAUDE.md design.md
git commit -m "docs: add comprehensive CLAUDE.md and DosshPay design system reference"
```

---

## Task 10: Final Verification

- [ ] **Step 1: Clean build**

```bash
rm -rf .next && npm run build
```

Expected: Clean build with no errors or warnings.

- [ ] **Step 2: Test the auth flow manually**

```bash
npm run dev
```

1. Open http://localhost:3000 — should redirect to `/login` (no session cookie)
2. The login page should show DosshPay branding, dark background, light card
3. Submit the login form — should create a session cookie and redirect to `/`
4. The dashboard should render with DosshPay brand identity
5. Refresh the page — should stay on dashboard (cookie exists, session valid)

- [ ] **Step 3: Verify proxy behavior**

1. Clear cookies and visit http://localhost:3000 — redirects to `/login`
2. Visit http://localhost:3000/login with a session cookie — redirects to `/`

- [ ] **Step 4: Verify lint**

```bash
npm run lint
```

Expected: Clean lint.

- [ ] **Step 5: Final commit if any fixes were needed**

```bash
git add -A
git commit -m "fix: address issues found during final verification"
```

Only commit if there were actual fixes. Skip if everything passed clean.
