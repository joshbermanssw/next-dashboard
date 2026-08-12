---
"next-dashboard": patch
---

Size the card number in proportion to the card face

`CardFace` is shared by the small dashboard tile and the full-width Card
Settings hero, but the `•••• last4` overlay was a fixed `text-lg`/`sm:text-xl`
at both. One absolute size can't suit both widths, so the number read oversized
on the home grid and undersized on the hero.

It's now sized in `cqw` against the card itself, the way the artwork baked into
the SVG already scales — 20px → ~12px on the desktop dashboard tile, and
20px → ~28px on the hero.
