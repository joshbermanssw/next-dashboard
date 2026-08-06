---
"next-dashboard": minor
---

Let a SplitPay contributor authorise spending from their own manage link

- Adds an **Authorise Start Spend** card to `/sp/{sessionId}/manage`, directly under the session's target/collected strip — the number the sign-off speaks to. A contributor says their share is good to go themselves, instead of waiting on the creator to grant it on their behalf
- The sign-off is withdrawable while the pool is still funding, and the roster reflects it either way: the contributor's row moves between "Pending authorisation" and "Authorised to spend"
- Self-authorisation is its own action, deliberately taking no contributor id. The manage-link token names the actor and the actor is the only row that can move, so a contributor cannot authorise — or un-authorise — anyone else by editing the payload. The creator's roster control is unchanged
- The creator sees no card of their own: their authority is what everyone else's is granted from, and the store already refuses to revoke it, so there is no decision to offer them
