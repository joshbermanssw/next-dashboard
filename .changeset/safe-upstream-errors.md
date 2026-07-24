---
"next-dashboard": patch
---

Keep raw backend errors out of the UI

- Filter upstream error messages that look like stack traces or ORM/DB internals (e.g. leaked Prisma errors) so sign-up shows a clean message instead
