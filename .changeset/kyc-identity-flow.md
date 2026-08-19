---
"next-dashboard": minor
---

Build out identity verification (KYC) on web

`/activate/identity` is now a real flow rather than a "not available on web"
notice. It opens on a "Finish setting up" checklist of six sections that unlock
in order — Personal Details, Contact Details, Source of Funds, Primary Document,
Secondary Document and Biometrics — each of which is a short step-by-step form
with its own Zod schema.

Answers are validated in the browser as the customer moves between steps and
again in the Server Action, then submitted one section at a time (matching the
backend's `PUT /kyc/applications/{id}/sections/{sectionKey}` shape). Submissions
land in an in-memory store for now; the document scans and face check stand in
for the Entrust SDK handoff and say so on screen.
