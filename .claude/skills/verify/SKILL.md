---
name: verify
description: How to run and drive the DosshPay dashboard for end-to-end verification — forge a local session cookie to bypass the remote auth backend, then drive with Playwright.
---

# Verifying the DosshPay dashboard

## Run

Dev server: `npm run dev` (Turbopack, port 3000). Check first — Josh usually
already has it running (`curl -s -o /dev/null -w "%{http_code}" localhost:3000`
→ 307 means it's up and redirecting to /login).

## Auth without the backend

The auth backend (`MS_AUTH_BASE_URL`) is a remote dev API — you can't log in
headlessly. But sessions are minted locally: an HS256 JWT signed with
`SESSION_SECRET` from `.env`, stored in the `dosshpay_session` cookie. Forge one:

- Shape: `Session` in `server/auth/session-token.ts` — `{ customer: { id,
  email, firstName, lastName, phone, isActive }, upstreamJwt, accessTokenExpiresAt,
  expiresAt, rememberMe }`.
- **Omit `refreshToken`** — otherwise the proxy calls the real
  `/auth/refresh` endpoint when the token nears expiry. Set both expiries
  ~24h out.
- Sign with the project's own `jose`: symlink `node_modules` into a scratch
  dir (`ln -s <repo>/node_modules <scratch>/node_modules`) so a standalone
  `.mjs` script can `import { SignJWT } from "jose"`.
- `new SignJWT({...session}).setProtectedHeader({alg:"HS256"}).setIssuedAt()
  .setExpirationTime(new Date(expiresAt)).sign(new TextEncoder().encode(SESSION_SECRET))`

Dashboard pages render fine with a fake `upstreamJwt`; backend-data widgets
fall back gracefully.

## Drive

Playwright isn't a project dep. Chromium builds are cached at
`~/Library/Caches/ms-playwright/` (chromium-1181 ↔ playwright 1.54). In a
scratch dir: `PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1 npm i playwright@1.54.0`,
then `chromium.launch()` finds the cache automatically.

Set the cookie before navigating:

```js
await ctx.addCookies([{ name: "dosshpay_session", value: token, url: "http://localhost:3000" }])
```

Use `waitUntil: "domcontentloaded"` (never `networkidle` — the dev HMR
websocket keeps the network busy).

## Gotchas

- `npm run lint` (`next lint`) is broken under Next 16, and `npx eslint`
  crashes on the legacy config — `npx tsc --noEmit` is the working static check.
- Vitest is node-env only (`lib/`, `server/`) — no component tests; UI changes
  are verified in the browser only.
