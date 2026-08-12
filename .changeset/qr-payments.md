---
"next-dashboard": minor
---

Pay and get paid by QR code, from the dashboard's More menu

- Adds `/qr` with **Pay** and **Receive** tabs. Pay is a live rear-camera scanner that decodes on-device with `jsqr` — no frame leaves the phone. Receive shows a QR for the account you choose, with an optional amount that re-renders the code as you type it
- The code encodes an ordinary https link to `/qr/pay/{accountId}`, so the same payload works two ways: the in-app scanner parses it locally and routes straight to the confirm screen, and a stranger's camera app opens that screen in a browser. One confirm screen, two entry points, no duplicated flow
- Confirming moves real money through the existing balances ledger (`debit` + `credit`), the same seam SplitPay funding uses — so the payer's balance drops on the dashboard rather than the success screen being cosmetic
- The flow is **mobile-only**: scanning needs a camera and showing a code needs a screen you can hand over. Device class is decided server-side from `Sec-CH-UA-Mobile` (falling back to a UA check for Safari, which sends no hints), so the gate is settled before first paint. The More sheet hides the entry on desktop, and `/qr` itself explains itself with app-download links rather than 404ing
- `parsePaymentUrl` is strict about identity and lenient about amount: anything off this origin or off the `/qr/pay/` path is ignored, so the scanner passes over wifi codes and product barcodes without navigating anywhere; a malformed amount degrades to "payer names it" rather than failing an otherwise good scan
