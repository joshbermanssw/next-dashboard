---
"next-dashboard": minor
---

SplitPay contributor journey for people without a DosshPay account

- Add `/sp/{sessionId}`: the page an invite email lands on — target, collected and time left, then name, the 6-digit access code, an amount hinted against what's left to target, and card details. Public by design; the emailed code is the gate, checked server-side
- Add `/sp/{sessionId}/receipt/{txId}`: who the contribution was recorded under, the amount, transaction ID, date and status, closing on a DosshPay sign-up prompt. Transaction IDs are random rather than sequential, so a public receipt URL naming a payer and amount can't be walked to find the rest of the roster
- Add `/splitpay/{sessionId}`: a returning contributor's Update and Contributors tabs — edit a pledge and target date, pay the difference, and see the roster with per-person progress against each pledge. Amount paid stays read-only; money only moves through a card payment. Reached by the token in the emailed link, with an access-code-and-name gate as the fallback
- Track pledged separately from paid on each contributor, so a partial payment reads as partial rather than done, and derive paid/partial/pending from the two numbers so a status can't drift from the money
- Card numbers are Luhn-checked and the expiry must be a future month; only the brand and last four are ever kept
- Let the public routes through the proxy for signed-out *and* signed-in visitors — invitees are often already customers, and bouncing them to the dashboard would break the link for the people most likely to click it
