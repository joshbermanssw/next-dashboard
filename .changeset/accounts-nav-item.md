---
"next-dashboard": minor
---

Add an Accounts page to the sidebar, under Products

- New `/accounts` page listing every account the customer holds — kind, currency, plan tier, card count and balance per row — each linking through to that account's hub at `/account/{accountId}`. The header switcher only ever shows the selected account's body; this is the flat inventory of what you hold
- Adds the matching sidebar entry below Products, using the fanned-cards wallet glyph rather than the plain wallet, which already stands for the Everyday account kind
- Reads through the existing `getAccountsForCustomer` seam, so it swaps to the BFF with everything else
