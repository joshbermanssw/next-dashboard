---
"next-dashboard": patch
---

Fix see-through dialog/overlay backgrounds

- Define the previously-undefined `--background` theme token, so `bg-background` surfaces (dialogs, sheets, drawer, chart tooltips, header) render opaque instead of transparent
- Add a centered `Dialog` primitive (Base UI) alongside the existing Sheet/Drawer, rendered on the elevated `popover` surface
- Add a `warning` (amber) semantic colour token
