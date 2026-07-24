---
"next-dashboard": minor
---

Everyday sign-up flow

- Add `/signup`: a three-step wizard — your details, a password, then a 6-digit email code — backed by the registration API (device create → init → verify), with a resend-code countdown
- Check email and phone availability live as you type, so a taken identifier is caught before submitting
- Add a country calling-code picker on the mobile field that composes an E.164 number
- Point the login page's "Create an account" at `/signup`; the app QR code becomes a secondary "get the app" option
