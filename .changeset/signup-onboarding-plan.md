---
"next-dashboard": minor
---

Post sign-up onboarding

- Add `/onboarding`: choose account type (everyday; corporate shown as coming-soon), plan, and optional add-ons, then confirm
- Add a monthly/annual billing step where annual saves 10% on the base plan (add-ons excluded), with the pricing derived client-side from the monthly catalogue
- Carry plan add-ons (SplitPay, per the provisioning enum) through the catalogue model and commit the selection through the soft-provisioning BFF client
