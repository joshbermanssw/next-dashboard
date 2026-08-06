---
"next-dashboard": minor
---

Open the picked account on the dashboard from the Accounts page

- Choosing an account on `/accounts` now selects it and returns you to the dashboard, instead of dropping into that account's settings hub. The dashboard is where an account's body lives — balance, cards, activity, money flow — so picking one lands you on it; the hub stays a step further on, behind Manage in the quick actions
- The account you're currently on is marked **Current** in the list, so the page reads as a switcher rather than a set of links that all look alike
- Lists from the accounts context rather than the seed directly. The context layers live pool state and moved balances over that seed, so a SplitPay pool funded from an invite email, or an account opened from the dashboard switcher, now appears here — reading the seed skipped both
