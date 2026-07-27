---
"next-dashboard": minor
---

SplitPay hub — working target, top-up, invite and contributor controls

- Wire up the hub's four actions, which previously did nothing: a target breakdown, a creator top-up, an invite form that hands back the join link, the access code and that person's manage link ready to copy, and the contributor roster
- Add per-contributor authorisation: the creator is marked Owner and can authorise the others, from the hub or from their own emailed link
- Read the funding pool from the server on the dashboard, so the account tile and the hub agree after someone contributes from an invite email — the client seed knows nothing about payments that arrive through `/sp`
- Hold the countdown at its server-rendered value until the first client tick, so the time left doesn't flicker on load
