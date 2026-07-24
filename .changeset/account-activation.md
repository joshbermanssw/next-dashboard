---
"next-dashboard": minor
---

Account activation hub + profile badge

- Add `/activate`: a checklist of the remaining steps (identity, security, preferences, billing) derived from the customer's KYC and preferences state, with per-step pages and a "skip for now" into the hub
- Show an amber "needs attention" ring and "!" on the profile avatar, plus a "Finish setting up" menu entry, while any step is outstanding — streamed behind Suspense so the header never blocks on it
