---
"next-dashboard": minor
---

Account creation flow: currency selection + SplitPay wizard

- Add a create-account dialog opened from the "Add account" menu. Crypto/Global pick a settlement currency (stablecoin / fiat catalogues) then review; everyday/splitpay/asset use their fixed AUD
- Store the chosen currency on the account and surface it on the Manage screen, replacing the per-kind stub
- Add the SplitPay creation wizard: a "What is SplitPay?" explainer, then a 3-step flow (target name with quick-select, target amount, funding time limit) that creates the pool
- Flag the future BFF ownership check at the `lib/data/accounts.ts` seam
