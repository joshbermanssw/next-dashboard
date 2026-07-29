---
"next-dashboard": minor
---

SplitPay: separate the DosshPay-user and non-user contributor journeys

- Contributors are now either an existing DosshPay customer or someone with no account, and each gets the step that suits them. A signed-out visitor names themselves, gives an email, enters the code and pays by card; a signed-in one is identified from their session and funds the pool from an account balance — no name to type, no card to key in
- Ask for an email address on joining, so a receipt has somewhere to go and a contributor has a way back. Name and email are taken at face value: the emailed code is the only thing checked, because the link is meant to be shared
- Stop matching a payer to a roster row by the name they typed. Typing an existing contributor's name no longer lands a payment on their row; a repeat payer is recognised by email instead, so one person stays one line on the roster
- Let the creator choose the verification code when they create a pool, instead of generating one they never see
- Add "SplitPay sessions you're in" to the dashboard for pools a customer joined but doesn't own, so they never need the invite email again
- Debit the funding account when a customer pays from a balance, refusing anything the account can't cover, and reflect it on the dashboard tile
