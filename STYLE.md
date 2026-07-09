# Style Guide

Design-system reference for `study-kit/` components and layout. This is the source of truth for visual decisions — when restyling anything, pull values from here rather than picking new ones ad hoc. Cert-agnostic: nothing here references A+ specifically, so it carries forward unchanged to future cert guides.

Tokens are defined once in `src/styles/global.css` via Tailwind v4's `@theme`, then consumed as normal Tailwind utility classes (e.g. `bg-surface`, `text-accent`).

Visual direction: playful, welcoming "learning app" aesthetic (Duolingo-inspired) — bright green primary accent, bold rounded display type, and chunky pressable buttons instead of flat/muted enterprise UI.

## Color tokens

Three surface levels give the app depth instead of one flat background:

| Token | Light | Dark | Use |
|---|---|---|---|
| `--color-surface` | `#f7f7f5` | `#131f24` | Page background |
| `--color-surface-raised` | `#ffffff` | `#1f2c34` | Cards, the tab bar |
| `--color-surface-overlay` | `#f7f7f5` | `#29343b` | Modals, active/selected card state |
| `--color-border` | `#e5e5e5` | `#37464f` | Card/input borders — use this instead of hand-picked `slate-200`/`slate-800` |
| `--color-accent` | `#58cc02` (Duolingo green) | `#58cc02` | Primary actions, active nav tab, links |
| `--color-accent-shade` | `#4aab00` | `#4aab00` | Bottom "keycap" edge of chunky accent buttons |
| `--color-accent-contrast` | `#ffffff` | `#0f172a` | Text/icons on top of `accent` |
| `--color-success` | `#58cc02` | `#58cc02` | "Got it" / correct answer states |
| `--color-success-shade` | `#4aab00` | `#4aab00` | Bottom edge for success-colored chunky elements |
| `--color-danger` | `#ff4b4b` | `#ff4b4b` | "Still learning" / wrong answer states |
| `--color-danger-shade` | `#ea2b2b` | `#ea2b2b` | Bottom edge for danger-colored chunky buttons |
| `--color-gold` | `#ffc800` | `#ffc800` | Streaks, timers, celebratory/XP-flavored badges |
| `--color-gold-shade` | `#e6b000` | `#e6b000` | Bottom edge for gold chunky elements |

`--color-accent` is the one token meant to be swapped per future cert guide (e.g. a different hue for Network+ vs Security+) — everything else should stay put so the engine reads consistently. Unlike the old indigo palette, `accent`/`success`/`danger`/`gold` intentionally use the **same hex in light and dark mode** (Duolingo's brand colors read fine on both), only the neutral surfaces/border shift between themes.

## Typography

- Display font (`font-display`, mapped to `Baloo 2`): headings (`h1`–`h3`), nav labels, and all `.btn-duo` buttons. Loaded via Google Fonts `@import` in `global.css` — no npm dependency.
- Body font (`font-sans`, mapped to `Nunito`): paragraph text, card copy, form labels. This is Tailwind's default `font-sans` now, so no class is needed for body text.
- Base body text: `text-base` (16px) minimum. Never go below 16px on form inputs — iOS Safari auto-zooms on focus for inputs under 16px, which is jarring in a PWA.
- Question/flashcard text: `text-lg` on mobile, can step to `text-xl` on `sm:` and up.
- Card labels / eyebrow text ("Question 3 of 10"): `text-sm text-slate-500 dark:text-slate-400`.
- Nav tab labels: `text-xs font-bold font-display`.

## Buttons — the "chunky" pressable style

This is the signature visual element of the redesign: primary actions look like a physical keycap and compress when tapped, instead of a flat filled rectangle.

Use the `.btn-duo` base class (defined in `global.css`) plus one color variant:

- `.btn-duo-primary` — filled `accent` green, for the main CTA on a screen (Check, Continue, Shuffle-primary-actions).
- `.btn-duo-danger` — filled `danger` red, for destructive/"wrong"-flavored actions (e.g. "Still learning").
- `.btn-duo-outline` — `surface-raised` background with a `border` edge and `accent`-colored text, for secondary actions (Prev, Next-neutral, Shuffle).

```html
<button class="btn-duo btn-duo-primary min-h-11 rounded-2xl px-4">Check</button>
```

`.btn-duo` handles the border, the bottom "shade" edge, and the press animation (`:active` collapses the bottom edge and nudges the button down 2px) — always pair it with `rounded-2xl` and a `min-h-11` (or taller) sizing utility; don't reimplement the press effect with ad hoc `box-shadow` or `translate-y` per component.

## Topic selection

Never use a native `<select>` for topic/category pickers — the browser renders both the closed box and the open dropdown popup with OS chrome that can't be fully restyled, so it always looks visually foreign next to the chunky button system (Duolingo avoids native selects for the same reason, using horizontal chip rows or full-screen list pickers instead).

Use the shared `TopicPicker` component (`study-kit/TopicPicker.tsx`): a horizontally scrollable row of `.btn-duo` chips (`.no-scrollbar` hides the scrollbar cross-browser), selected chip filled `btn-duo-primary`, others `btn-duo-outline`, plus a pinned Shuffle chip. Reuse this anywhere a flat list of topics/categories needs picking — don't reintroduce `<select>` for that use case.

Plain buttons without the chunky treatment (e.g. inline text links) should NOT use `.btn-duo` — reserve it for primary tap targets so it doesn't lose impact from overuse.

## Elevation

Three levels, applied consistently instead of every surface using the same flat `border`:

1. **Page** — `bg-surface`, no shadow.
2. **Card** — `bg-surface-raised` + `shadow-sm` + `border border-border`. Used for flashcards, MCQ cards, dashboard tiles.
3. **Raised/active** — `bg-surface-overlay` + `shadow-md`. Used for the selected answer choice, the active bottom-tab indicator, and anything meant to visually "lift" above its card.

Don't stack more than 3 levels — if something needs a 4th, it's a sign the layout has too much nesting.

## Spacing & radius

- Card corners: `rounded-2xl` everywhere (flashcards, MCQ cards, dashboard tiles, minigame cards) — rounder than the old `rounded-xl` to match the softer, friendlier direction.
- Small controls (buttons, chips, nav icons): `rounded-lg`; chunky `.btn-duo` buttons: `rounded-2xl`.
- Card padding: `p-5` on mobile, `p-6` from `sm:` up — `p-6` alone wastes space on narrow phones.
- Standard gap between stacked elements: `gap-3`; between unrelated sections: `gap-6`–`gap-8`.

## Touch targets

Every interactive element (buttons, checkboxes, nav tabs, MCQ choices) must have a minimum **44×44px** hit area — this is the Apple/Android baseline for comfortable one-handed tapping.

- Buttons/choices: `min-h-11` (44px) combined with `px-4`. `.btn-duo` elements need this too even though the border adds visual height.
- Checkboxes: never leave a raw `<input type="checkbox">` un-wrapped — wrap it with its label in a `flex min-h-11 items-center gap-3 px-2` row so the whole row is tappable, not just the tiny box.
- Bottom nav tabs: `min-h-14` to comfortably clear 44px plus label text.

## Celebratory / gamified touches

Visual-only — no new scoring or progress logic, just feedback treatment:

- Correct MCQ/flashcard answers: brief scale "pop" via the `.animate-pop` utility (defined alongside the rest of the theme) on the selected/correct choice, plus a checkmark icon.
- Incorrect answers: a small shake is intentionally avoided (feels punishing) — a colored border/fill + an X icon is enough.
- Timers/streak-flavored badges (e.g. Rapid Fire's countdown): use `gold`/`gold-shade`, not `accent`, so they read as a distinct "status" chip rather than a primary action.

## Safe-area handling

Any fixed-position element anchored to the bottom of the screen (the bottom tab bar) must account for the iOS home-indicator inset when installed as a standalone PWA:

```css
padding-bottom: max(0.5rem, env(safe-area-inset-bottom));
```

The scrollable page content (`<main>`) must reserve space for the fixed tab bar's height plus that same inset so content never sits underneath it.

## Dark mode

Every token above has a light/dark pair — use Tailwind's `dark:` variant driven by the token, not hand-picked colors per component. If a new component needs a color not covered above, add it to this table first, then use it — don't introduce a one-off `slate-700`/`indigo-500` inline.
