---
"next-dashboard": minor
---

Choose amount, rail, and reference when paying a scanned QR code

Scanning a code used to land on a single confirm screen. It now opens the full
send flow:

- **Amount** — how much (prefilled when the code carried an amount), which
  account it comes out of, a **Save payee** toggle, and an optional reference
- **Hyper Switch** — the rail picker. Crypto, FAST PAYMENT (NPP), Visa, Eftpos,
  and SWIFT, each showing its fee, reward points, and settlement speed, with the
  cheapest badged **BEST**. Landing on something dearer offers a one-tap switch
  to the cheapest instead of quietly charging the difference
- **Review** — to, account number, from, amount, via, fee, reference, when —
  then send

Fees scale with the amount (`lib/payment-rails.ts`) rather than being fixed, so
the quote moves as the payer types; SWIFT stays flat, being a wire fee. The
payer is charged amount + fee in one debit — so a balance that covers the amount
but not the fee is refused up front rather than going overdrawn by the fee — and
the payee is credited the amount they asked for, which is what makes a cheaper
rail worth choosing.

Supporting changes: accounts carry an `accountNumber` (quoted on the review
screen), saved payees persist through a new `lib/data/payees.ts` seam, and
"Always use cheapest method" is remembered per device.
