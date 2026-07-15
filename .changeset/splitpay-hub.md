---
"next-dashboard": minor
---

SplitPay funding view + hub

- Branch the dashboard to a SplitPay funding view (pooled balance, live countdown, funding progress, contributors, "View Splitpay Hub") when a SplitPay account is selected
- Add the SplitPay Hub route (`/account/[accountId]/splitpay`): funding / spending / closed status, collected-vs-target progress, my-contribution summary, top-up, and Start Spending
- Add a live `useCountdown` hook driving the pool countdowns
