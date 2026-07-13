---
"next-dashboard": minor
---

Account & card settings

- Add the `/account/[accountId]` settings page and `/account/[accountId]/cards/[cardId]` routes (card details + manage), with a not-found path when a card is resolved under the wrong account
- Add a card component suite under `components/dashboard/cards` (face, brand mark, details list, menu, settings + manage screens)
- Introduce the `lib/data/accounts.ts` data-access seam (`getAccountsForCustomer`, `getAccount`, `getCardsForAccount`, `getCard`) — the single place data enters the system
- Rename the dashboard quick actions to Top Up / Pay / Manage / More and link Manage to the selected account's settings
