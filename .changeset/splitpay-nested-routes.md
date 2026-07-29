---
"next-dashboard": minor
---

Nest the SplitPay manage page under its session

- Move `/splitpay/{sessionId}` to `/sp/{sessionId}/manage`. The manage page is the same session as the pay page, but sat at its own root under a second name for one concept — while the receipt was already nested at `/sp/{sessionId}/receipt/{txId}`. One session now means one path, with the receipt and manage page as siblings
- **Breaking for existing links:** `/splitpay/{sessionId}` no longer resolves. Anything already shared — invite emails, forwarded links — needs repointing at `/sp/{sessionId}/manage`, keeping any `?c={token}`
- Leaves one open public prefix in the proxy (`/sp/`) where there were two
