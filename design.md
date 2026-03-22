# DosshPay Design System

## Brand Identity

DosshPay is a fintech product — "Banking Without Borders." The visual language is **dark-first, blue-accented, and clean**. The aesthetic communicates trust, modernity, and financial sophistication without being sterile. Atmospheric backgrounds, generous whitespace, and bold typography create a premium feel.

---

## Color Palette

### Core Neutrals

| Token               | Hex       | Usage                                       |
| -------------------- | --------- | ------------------------------------------- |
| `neutralBlack`       | `#000000` | Default page background, dark sections      |
| `neutralWhite`       | `#F2F2F2` | Light section backgrounds                   |
| `neutralLight`       | `#AAAAAA` | Muted/secondary text on dark                |
| `grey`               | `#CCCCCC` | Borders, dividers                            |
| `neutral`            | `#666666` | Tertiary text                                |
| `neutralDark`        | `#444444` | Secondary text on light backgrounds          |
| `neutralDarker`      | `#222222` | Primary text on light backgrounds            |

### Blue Scale (Primary)

| Token               | Hex       | Usage                                       |
| -------------------- | --------- | ------------------------------------------- |
| `blueDarker`         | `#00032E` | Deep blue backgrounds, hero overlays         |
| `blueDark`           | `#111C3A` | Heading text on light backgrounds            |
| `blue`               | `#2A355A` | Body text on light backgrounds               |
| `surfaceCardBlue`    | `#404476` | Card backgrounds on dark sections            |
| `accentBlue`         | `#74BBF2` | **Primary accent** — CTAs, highlights        |
| `accentBlueHover`    | `#5EA2D8` | Hover state for accent blue buttons          |
| `blueLight`          | `#E2E6FF` | Body text on dark backgrounds                |
| `blueLightest`       | `#F5F7FF` | Heading text on dark backgrounds             |

### Surface Cards

| Token                    | Hex       | Usage                                   |
| ------------------------- | --------- | --------------------------------------- |
| `surfaceCardPrimary`      | `#E8E8E8` | Card backgrounds on `black` sections    |
| `surfaceCardSecondary`    | `#D8D8D8` | Card backgrounds on `white` sections    |
| `surfaceCardTertiarty`    | `#E7EBF2` | Card backgrounds on `blueDarker` pages  |
| `surfaceCardBlue`         | `#404476` | Card backgrounds on dark blue sections  |

### Accent Colors

| Color      | Hex/Value   | Usage                                |
| ---------- | ----------- | ------------------------------------ |
| Cyan       | `#56CADB`   | Radial gradient highlights           |
| Destructive | HSL-based  | Error states (via CSS variable)      |

---

## Typography

### Font Stack

**Inter** is the sole typeface, loaded via `next/font/google` with variable `--font-inter`.

```
font-family: var(--font-inter), Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif
```

### Heading Scale

All headings use `font-weight: 600`. Sizes are responsive — mobile-first with `sm:` breakpoint (640px) for desktop sizes.

| Level | Mobile (default) | Desktop (`sm:`) | Line Height |
| ----- | ---------------- | --------------- | ----------- |
| h1    | `2.5rem` (40px)  | `4rem` (64px)   | 1.2         |
| h2    | `2.5rem` (40px)  | `3.5rem` (56px) | 1.2         |
| h3    | `2.25rem` (36px) | `3rem` (48px)   | 1.2         |
| h4    | `2rem` (32px)    | `2.5rem` (40px) | 1.3         |
| h5    | `1.5rem` (24px)  | `2rem` (32px)   | 1.4         |
| h6    | `1.25rem` (20px) | `1.5rem` (24px) | 1.4         |

### Body Text Tokens (Tailwind)

| Token            | Size      | Line Height | Weight |
| ---------------- | --------- | ----------- | ------ |
| `large-medium`   | 1.125rem  | 150%        | 700    |
| `medium-regular` | 1.125rem  | 150%        | 500    |
| `regular-medium` | 1rem      | 150%        | 500    |
| `small-normal`   | 1rem      | 150%        | 400    |
| `tiny-normal`    | 0.875rem  | 150%        | 400    |

### Text Color by Background

| Background   | Heading Color          | Body Text Color      |
| ------------ | ---------------------- | -------------------- |
| `black`      | `text-blueLightest`    | `text-blueLight`     |
| `white`      | `text-blueDark`        | `text-blue`          |
| `blueDarker` | `text-blueLightest`    | `text-blueLight`     |

---

## Spacing

### Container

- Max width: `max-w-7xl` (80rem / 1280px)
- Centered: `mx-auto`

### Common Section Spacing

| Pattern            | Value     |
| ------------------ | --------- |
| Section vertical   | `py-20`   |
| Section gap        | `gap-12`  |
| Content gap        | `gap-8`   |
| Element gap        | `gap-4` to `gap-6` |
| Micro gap          | `gap-2`   |

---

## Border Radius

| Token         | Value                          | Usage                |
| ------------- | ------------------------------ | -------------------- |
| `--radius`    | `0.625rem`                     | Base unit            |
| `rounded-lg`  | `var(--radius)` (0.625rem)     | Buttons, forms, cards |
| `rounded-md`  | `calc(var(--radius) - 2px)`    | Nav links, small cards |
| `rounded-xl`  | Tailwind default (0.75rem)     | Inputs               |

---

## Button System

### Variants

| Variant          | Background          | Text              | Hover                      |
| ---------------- | -------------------- | ----------------- | -------------------------- |
| `primary`        | `bg-accentBlue`      | `text-blue`       | `hover:bg-accentBlueHover` |
| `secondary`      | `bg-white/10`        | `text-accentBlue` | —                          |
| `darkOutline`    | `bg-white`           | `text-blue`       | `hover:bg-gray-100`        |
| `darkBackground` | `bg-blueDark`        | `text-accentBlue` | `hover:bg-blueDark/80`     |

### Primary CTA Pattern

Primary CTA: accentBlue background with blue text, font-weight 700. Used for all "Sign In", "Get Started", "Submit" actions.

---

## Component Theming

| Element          | Theme                                              |
| ---------------- | -------------------------------------------------- |
| Page background  | `#000000` neutralBlack (dark-first default)         |
| Sidebar          | `#00032E` blueDarker bg, `#E2E6FF` blueLight text  |
| KPI cards        | `#E8E8E8` surfaceCardPrimary bg, `#111C3A` text     |
| Chart area       | `#404476` surfaceCardBlue bg, `#74BBF2` data lines  |
| Primary buttons  | `#74BBF2` accentBlue bg, `#2A355A` blue text        |
| Borders          | `rgba(116,187,242,0.15)` — subtle blue tint         |
| Focus rings      | `#74BBF2` accentBlue                                 |
| Login card       | surfaceCardPrimary on neutralBlack background        |

---

## Responsive Breakpoints

| Prefix   | Width   | Usage                              |
| -------- | ------- | ---------------------------------- |
| `sm`     | 640px   | Basic layout shifts                |
| `md`     | 768px   | Navigation visible, grid columns   |
| `lg`     | 1024px  | Full desktop layout                |

### Common Responsive Patterns

- `flex-col md:flex-row` — stack on mobile, row on desktop
- `grid-cols-1 md:grid-cols-2` — single column to two columns
- `hidden md:flex` — hide on mobile, show on desktop

---

## Glassmorphism

Used on navigation and mobile menus:

```
bg-black/50 backdrop-blur-md
```

---

## Icon Libraries

- **Lucide React** — primary icon set
