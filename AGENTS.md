## Development

When starting the dev server, use background mode:

```
astro dev --background
```

Manage the background server with `astro dev stop`, `astro dev status`, and `astro dev logs`.

## Keeping this file current

This file (and `ARCHITECTURE.md`) are living docs, not a one-time build log —
update them as part of the work, not as an afterthought:

- **After any bulk content drop** (a batch of flashcards/MCQs/CLI drills from
  a real `notes/*.md` extraction pass, not a one-off test file): update the
  content counts in `README.md`'s badges, note which domain(s) just got
  covered in this file's Status section, and bump `package.json`'s
  `"version"` field so the version badge in the top-right corner of the app
  actually reflects that a real content update shipped.
- **After any notable engine/plumbing change** (new component, new content
  schema, a bug fix worth remembering, a design decision that isn't obvious
  from reading the code) — add a bullet under the current phase in Status,
  or open a new phase section if the prior one was already marked COMPLETE.
  Follow the existing tone: what changed, *why* (the non-obvious reasoning,
  not just a restatement of the diff), and what it unblocks or still leaves
  open.
- **ARCHITECTURE.md vs this file**: ARCHITECTURE.md is the reference doc
  (how the pipeline works right now, the repo map, the JSON shapes) — keep
  it in sync with reality. This file is the decision log (what happened,
  when, why) — keep it append-only per phase rather than rewriting history.
- Don't wait to be asked. If a change is big enough that a future session
  would be confused without context on it, write the context down before
  moving to the next thing.

## Documentation

Full documentation: https://docs.astro.build

Consult these guides before working on related tasks:

- [Adding pages, dynamic routes, or middleware](https://docs.astro.build/en/guides/routing/)
- [Working with Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Using React, Vue, Svelte, or other framework components](https://docs.astro.build/en/guides/framework-components/)
- [Adding or managing content](https://docs.astro.build/en/guides/content-collections/)
- [Adding styles or using Tailwind](https://docs.astro.build/en/guides/styling/)
- [Supporting multiple languages](https://docs.astro.build/en/guides/internationalization/)

# CompTIA A+ Study Guide — Build Plan

## Context
This is the second guide in a reusable study-guide system (first was the Google IT Support cert guide, currently vanilla HTML/CSS/JS at google-it-cert-study-guide.pages.dev). This build should establish the *reusable engine* properly so future certs (Network+, Security+) are mostly content additions, not component rebuilds.

## Content source
Real content will NOT be hand-authored directly as JSON. Source material is a set of personal study notes in `notes/*.md` at the project root (raw notes taken while studying A+ domains — may be messy, non-uniform in structure, mix of prose/bullet points/half-thoughts). Notes files are split by topic, following the Professor Messer A+ course breakdown (e.g. `laptop-hardware.md`, `mobile-devices.md`, `wireless-technologies.md`) rather than one file per official exam domain — expect the Phase 2 domain inventory to map several topic files into each Core 1/Core 2 domain. Claude's job in Phase 2 is to:
1. Read through `notes/*.md`.
2. Identify discrete, testable facts/concepts and convert them into flashcard pairs (front/back).
3. Generate multiple-choice questions from concepts that have clear right/wrong distinctions (with plausible wrong-answer distractors, not just "none of the above" filler).
4. Flag anything in the notes that's ambiguous, incomplete, or seems like an error, rather than guessing — ask before generating content from it.
5. Output valid JSON matching the schemas in `content.config.ts`, one file per topic/domain, into the appropriate `src/content/a-plus/{flashcards,mcq}/` folder.
6. Do NOT invent A+ content that isn't grounded in the notes — the notes are the source of truth. If domain coverage looks thin for a topic, say so instead of padding with generated trivia.

## Stack
- Astro (static output, deployed to Cloudflare Pages)
- Tailwind CSS
- Preact via `@astrojs/preact` for interactive islands
- Astro Content Collections with Zod schemas for all study content
- No backend — localStorage for progress, wrapped in a hook for future swap-out

## Repo structure

See **ARCHITECTURE.md** for the live, up-to-date repo map, the full content
pipeline diagram, and the exact JSON shape for every content type — don't
duplicate that here, it'll just drift out of sync. This file is the build
plan / decision log; ARCHITECTURE.md is the reference doc.

## Phase 1 — Schema + Engine Skeleton (stub-first, no real content yet)
1. Set up Astro project with Preact + Tailwind integrations.
2. Define Zod schemas in `content/config.ts` for: `flashcard`, `mcqQuestion`, `minigameConfig` (discriminated union on `type: "subnet-calc" | "ipv6-shrink"`).
3. Build `lib/networking.ts` with pure, unit-testable functions:
   - CIDR → subnet mask, host count, network/broadcast address
   - IPv6 full ↔ compressed notation conversion
   - Random valid subnet/IPv6 problem generator (for minigame variety)
4. Stub out each `study-kit` component with hardcoded placeholder data — get the *shape* right before wiring real content. Confirm props/schema match.
5. Build `useProgress()` hook (localStorage-backed, matches existing site's per-section checkbox behavior).

**Stop here and check in before Phase 2** — confirm schema shapes feel right for the content you're about to write.

## Phase 2 — Extract A+ Content from Notes
6. Read all files in `notes/*.md`. Give a quick inventory first: which A+ domains (Core 1: mobile devices, networking, hardware, virtualization/cloud, troubleshooting; Core 2: OS, security, software troubleshooting, operational procedures) are well-covered vs. thin, before generating anything.
7. Per domain, extract flashcards and MCQs per the content-source rules above, writing JSON into `content/a-plus/flashcards/` and `content/a-plus/mcq/`, one file per domain/topic (not one giant file).
8. Wire real content into `study-kit` components, remove stubs.
9. Build the minigame configs (e.g. subnet calculator challenges scaled by difficulty, IPv6 shrink drills) — these come from `lib/networking.ts` logic, not from notes extraction, since they're procedurally generated.
10. After generating each domain's content, give a short summary (card count, question count, any flagged gaps) rather than silently moving to the next domain — this is a checkpoint, not a batch job.

## Phase 3 — Pages + Polish
11. Course pages via `pages/courses/[...slug].astro` reading from content collections.
12. Rapid Fire quiz page pulling from all domains, shuffled per session (matches existing site behavior).
13. Nav/progress UI parity with the current Google IT guide's look, restyled for A+ branding.

## Division of labor
- Claude Code: schema design, `lib/networking.ts` logic, component logic/wiring, content collection queries, AND notes-to-JSON content extraction.
- User: writing/organizing the raw notes, reviewing generated content for accuracy, visual polish/Tailwind styling passes, scene-level UX calls.

## Constraints
- Keep components in `study-kit/` free of any cert-specific strings — if something A+-specific leaks into a component, that's a signal it belongs in content/config instead.
- Stub-first: don't write real content until the component shape is confirmed.
- No new dependencies beyond Astro/Preact/Tailwind/Zod without flagging first.
- Content extraction is checkpoint-based, not one giant pass — process one domain, summarize, wait for a go-ahead before the next, so misreadings of notes can be caught early.
- Never fabricate A+ facts to fill gaps — thin notes coverage gets flagged, not padded.
- Visual design decisions pull from `STYLE.md` (the design-system source of truth), not ad hoc per-component choices. See "Visual redesign" below for the current direction.

## Status

**Phase 1 (engine skeleton) and Phase 3 (pages) are functionally done**, still running on the `test-laptop-hardware.json` placeholder content set — real Phase 2 content extraction from `notes/*.md` has not happened yet.

**Visual redesign — complete.** The engine moved from a flat indigo/slate "enterprise" look to a Duolingo-inspired theme: bright green (`#58cc02`) primary accent, warm neutral surfaces, `Baloo 2`/`Nunito` display+body fonts, and a signature `.btn-duo` chunky pressable-button system (solid bottom "shade" edge that compresses on `:active`). Full token table, button variants, and conventions are documented in `STYLE.md` — read it before any future styling work rather than re-deriving values. Key non-obvious pieces:
- `TopicPicker.tsx` (shared `study-kit/` component): horizontal scrollable chip row replacing native `<select>` for topic pickers — native selects can't be restyled to match the chunky system (browser-rendered dropdown chrome), so don't reintroduce one.
- `Flashcard.tsx`: single "Reveal" toggle shows the answer inline below the question on the same card (no flip animation) — chosen over a flip-card metaphor for a more "see everything at once" study flow.
- `MCQDeck.tsx`: correct/incorrect answer explanation renders as a callout box (💡), but only when the content's optional `explanation` field is populated — the placeholder JSON has it filled for about half the entries.
- `SubnetCalculator.tsx` / `IPv6Shrinker.tsx`: rebuilt with streak/accuracy tracking, Submit vs. Reveal Answer (reveal breaks streak, counts as an attempt but not a correct one), per-field correct/incorrect highlighting, and a "Quick reference" cheatsheet card — modeled on the equivalent practice tool in the Google IT guide (`google-it-cert-study-guide.pages.dev/subnet-practice.html`).
- `lib/networking.ts` — `generateIPv6Problem()` was fixed twice this session: it originally always placed the zero-group run at a fixed leading position, then was rewritten to seed a random-length, random-position zero run (with an occasional second shorter run to exercise the "compress only the longest run" rule) so generated addresses resemble realistic ones (loopback/link-local/manually-assigned host suffixes) rather than a mechanically fixed pattern.

## Phase 4 — Resources Hub + CLI Practice — COMPLETE

- **CLI Practice**: new `cli` content collection/schema (`domain`, `topic`, `os`, `prompt`, `accepted[]`, `hint`), validated by pure functions in `lib/cliValidate.ts` (`normalizeCommand`, `isCommandAccepted` — case/whitespace-insensitive, multiple accepted answers). `CLIPractice.tsx` is the terminal drill itself; `CLIStudy.tsx` wraps it with `TopicPicker` (same pattern as `FlashcardStudy`/`MCQStudy`). Styled per `STYLE.md` — Duolingo-toned terminal chrome (accent/gold/success dots instead of literal red/yellow/green), not a black-on-green hacker terminal. Lives at `/dev/cli-practice`, linked from `/practice`. Content is currently one placeholder topic (`test-cli-commands.json`, 5 commands) — same "test data, not real extraction" caveat as flashcards/mcq.
- **Mobile fix**: the terminal originally relied on the input's own `onKeyDown` for both submit and advance, but disabling the input after judging (for the dimmed look) means disabled elements stop receiving keyboard events at all — broke "press Enter to advance" on desktop after judging, and broke progression entirely on mobile (no physical Enter key, virtual keyboard's Enter/Go isn't reliably caught, and there was no tap target). Fixed by adding an explicit **Check** / **Continue**-**Finish** button row (matching `MCQDeck`'s pattern) as the primary interaction, with a `document`-level keydown listener as a desktop convenience layered on top.
- **Resources Hub** (`/resources`): a cert-agnostic category-grid page (same array-of-cards pattern as `index.astro`/`practice.astro`, no new shared component needed) linking to three **hand-authored, non-content-collection** printable reference sheets, copied verbatim (restyled to this app's tokens) from the companion Google IT guide: Common Ports & Protocols, Subnet Cheat Sheet, CLI Commands Cheat Sheet. Each sheet uses a `.print-sheet` wrapper class (`global.css`) that forces black-on-white on `@media print` regardless of light/dark theme, and the `BottomTabBar` is `print:hidden`. **These are NOT drag-and-drop JSON content** — see ARCHITECTURE.md's "Known gaps" for why, if that's ever worth changing.
- **Minigames actually wired to content.** Previously `SubnetCalculator`/`IPv6Shrinker` took a hardcoded `difficulty="easy"` prop — the `minigames` collection existed but nothing read it. Added `DifficultyPicker.tsx` (shared chip-row, same idea as `TopicPicker` but for easy/medium/hard) plus `SubnetCalculatorStudy.tsx` / `IPv6ShrinkerStudy.tsx` wrappers that read available difficulties from `src/content/a-plus/minigames/*.json` and let you switch between them. 6 config files now exist (3 difficulties × 2 minigame types).
- **`PageHeader.astro`** (new shared `layout/` component): every page's title+subtitle now renders inside a `bg-surface-raised` card instead of sitting bare on the page's dotted background — the dots were bleeding through and clashing with text on dense pages (the reference sheets especially). Applied everywhere: home, quiz, practice, resources, all `dev/*` pages, and the three reference sheets. Also fixed the same bug in `FlashcardStudy.tsx`'s "Card X of Y" progress row, which had the identical bare-text-on-dots problem.
- **Homepage**: `ProgressTracker` stays commented out (still no real per-domain data to show); a "Resources" card was added to the mode grid instead, and to the bottom tab bar, replacing the dead "Progress" tab link.
- **Docs**: added `ARCHITECTURE.md` (content pipeline diagram, full repo map, copy-paste JSON shape per content type, the "new files in an empty collection need a dev-server restart" gotcha, known gaps). Renamed `style.md` → `STYLE.md` for consistency with the other all-caps docs (safe rename — nothing loads it programmatically). Rewrote `README.md` in the user's own casual voice with shields.io badges (content counts, themed with the app's own accent/gold/danger colors) and an explicit "test data only" status flag.

**Known gap — homepage progress tracker is still disabled.** Same root cause as before: no real per-domain completion data exists yet since real content hasn't been extracted. This is now purely a content-volume problem, not a plumbing one — the domain/topic filtering + per-card progress tracking underneath it is done (see Phase 5).

## Phase 5 — Domain-level grouping — COMPLETE

- **Domain → topic filtering**, built as one shared hook, `lib/useContentFilter.ts`, rather than three separate implementations. Given a flat list of `{domain, topic, ...}` items it derives available domains, derives topics scoped to whichever domain is selected, and exposes a `filteredItems` result. Selecting a domain resets to "All Topics" for that domain (not an arbitrary first topic).
- **Three filter levels, consistently, everywhere**: a specific topic, "All Topics" (pools every topic within the currently selected domain), or switch domains via a picker row. Wired into `FlashcardStudy`, `MCQStudy`, and `CLIStudy` identically. `RapidFireQuiz` deliberately keeps pooling every MCQ regardless of domain/topic — that's its whole point, untouched.
- **`TopicPicker.tsx` got a backward-compatible upgrade** instead of a parallel `DomainPicker` component: `onShuffle` is now optional (so the domain-tier row doesn't render a redundant second Shuffle button), and a new optional `allOption` prop pins an "All Topics"-style chip before the per-topic chips. The same component now serves both the domain row and the topic row.
- **The domain row only renders when there's more than one domain** in the content set. With today's single-domain placeholder content it stays completely invisible — zero added UI clutter until Phase 2 content actually spans multiple domains. This was a deliberate constraint, not an accident: the whole point was to build this without disrupting anything until it's actually needed.
- **No "pool everything across all domains" mode for Flashcards/CLI Practice** — you always pick one domain, then optionally narrow to a topic. MCQ has that "everything, unfiltered" mode already, but via the separate Rapid Fire page, not MCQ Study itself. Flagged to the user as a possible future addition, deliberately not built speculatively — decide once real multi-domain content makes it obvious whether it's wanted.
- **Bug found + fixed in the same pass**: `FlashcardStudy`'s "known" count was keyed to `localStorage` by whatever was currently selected (topic string vs. domain string), so switching between "All Topics" and a specific topic looked like known-status was resetting — they were actually just two different storage buckets for the same cards. Fixed by always keying storage by `domain` (never by topic) and computing the displayed "known" count as the intersection of stored completed-ids with whatever cards are currently in view, rather than the raw bucket size. Worth double-checking `MCQStudy`/`CLIStudy` don't need the equivalent fix if per-topic completion tracking ever gets added there (they don't currently track completion at all, so the bug was Flashcard-specific).

## Session wrap-up polish

- **Global `cursor: pointer` fix.** Browsers don't apply a pointer cursor to `<button>` by default (only `<a>` gets that for free) — added one rule (`button:not(:disabled) { cursor: pointer; }`) to `global.css` instead of patching it per-component. This is why MCQ choices (and every other button in the app) weren't showing a pointer on hover.
- **Confetti**, `lib/confetti.ts`: dependency-free, Web Animations API, no canvas, no npm package — small colored rectangles in the app's own accent/gold/danger palette, respects `prefers-reduced-motion`. Deliberately reserved for genuine "you did well" moments (a perfect score) rather than every correct answer, which would get old fast — wired into `MCQDeck` and `CLIPractice`'s finish screens, firing once via a `useEffect` keyed on a `perfect` boolean flipping to `true`.
- **Verified the actual production build**, not just `astro dev`. Ran `astro build` + served `dist/` locally and curled every route (with and without trailing slash), `manifest.json`, `sw.js`, and both icon files. All 14 pages resolve correctly, icons are real correctly-sized PNGs, and the service worker's fetch strategy (network-first for navigations, cache-first for assets, falls back to cached `/` if a page was never visited offline) is sound. This was a real gap worth closing — the whole session up to this point had only been tested against the dev server, which has different routing behavior than a static host.
- **Known gap surfaced by that build check**: there's no `src/pages/404.astro`, so a broken/typo'd URL shows Cloudflare's generic 404 page instead of one in this app's own styling. Not a routing bug, just unstyled — cheap to add whenever.
- **Still needs on-device verification**: the user reported prior PWA routing trouble (unclear if from this project or the earlier Google IT guide one) and hasn't tested "Add to Home Screen" / offline behavior on an actual phone against this build yet. Nothing found in this session's build check points to a real problem, but curl can't verify iOS's actual standalone-launch behavior — that's the one thing that still needs a real device.
- **On-device PWA pass, mobile fixes**: tested live as an installed PWA on a newer iPhone and fixed four real issues. (1) `apple-mobile-web-app-status-bar-style: black-translucent` draws content edge-to-edge under the status bar/Dynamic Island in standalone mode, but `Layout.astro`'s `<main>` only ever padded for the bottom safe area — added a `.safe-top` utility (`global.css`, mirrors the existing `.safe-bottom` one) using `env(safe-area-inset-top)`, applied to `<main>`. Resolves to `0` in normal browser tabs, so it only affects standalone PWA on notched/island devices. (2) `SubnetCalculator`/`IPv6Shrinker` rendered the IP/address string with `break-all`, which let narrow screens cut mid-octet or split a prefix number (e.g. "28" → "2" / "8") — replaced with the value split into its natural atomic chunks (octets, or `/prefix` as its own unit; IPv6 hex groups) each wrapped in its own `whitespace-nowrap` span inside a `flex flex-wrap` container, so wraps can only happen *between* chunks. (3) `TopicPicker`'s horizontal scroll row cut off hard mid-chip at the edges — added a `mask-image`/`-webkit-mask-image` linear-gradient fade on the scroll container itself (not an overlay div), so it fades correctly regardless of what's behind it. (4) iOS Safari/PWA rubber-band overscroll showed a flat surface color instead of the dotted background texture — the dots were only declared on `body`, and iOS doesn't reliably propagate a `background-attachment: fixed` image layer up to `html` for canvas painting during bounce (only the solid color propagates reliably) — duplicated the same background declaration onto `html` directly in `global.css`.

## Phase 6 — Open items (next session)

1. **`content.config.ts` hardcodes the `a-plus` folder path** in every collection's glob pattern. The schemas themselves are cert-agnostic, but reusing this engine for Network+/Security+ means editing `content.config.ts` directly (new collections or repointed paths), not just adding a new content folder. Not urgent for the current guide, but worth a decision before this becomes "the reusable engine" in practice rather than just in name.
2. **Phase 2 itself** — real content extraction from `notes/*.md` still hasn't happened. Everything built so far (Phases 1, 3, 4, 5) has been engine/plumbing work proven out against one placeholder topic. **This is the actual next milestone** — the pipeline end of this project is done; what's left is content.
3. **Optional: a styled `404.astro`** — cosmetic, whenever it's convenient.

## Phase 7 — Port Match minigame

- **Third minigame added**: `port-match`, a tap-to-pair matching grid (port
  numbers on one side, service names on the other — tap a port, then tap the
  service you think it belongs to; correct pairs lock green, wrong pairs
  shake red). Chosen over a drag-and-drop two-column matcher specifically for
  mobile: native drag is unreliable on touch (imprecise targets, inconsistent
  browser support), while tap-to-select is the same interaction Duolingo's
  own matching exercises use, so it fits this app's visual language for
  free. Same `*Study.tsx` + `DifficultyPicker` + `minigames` collection
  pattern as Subnet Calculator / IPv6 Shrinker — difficulty controls pair
  count (easy 3 / medium 5 / hard 8) rather than a value range, since there's
  no natural "harder problem" axis for port memorization the way there is
  for CIDR ranges or IPv6 zero-run lengths.
- **New shared data module, `src/lib/ports.ts`**: the port/service dataset
  that used to live inline in `resources/ports-chart.astro` was extracted so
  both the reference sheet and the new minigame read from one source instead
  of drifting independently. `ports-chart.astro` now imports `portSections`
  from it with no visual change; the minigame consumes a flattened
  `portEntries` export (multi-port cells like "465 / 587" get split into
  individual port→service pairs for tile generation).
- **Known content gap, called out explicitly rather than silently padded**:
  this port dataset (24 ports) was never checked against the actual current
  CompTIA 220-1201 exam objectives — it's the `notes/*.md` "classic
  high-yield set" (12 ports, which the notes themselves flagged as possibly
  incomplete) extended with reasonable real-world additions when the
  reference sheet was first built. NetBIOS (137–139) is a specific likely
  gap. Deliberately not guessing further additions — the user will paste in
  the real objectives list in a future session and that should be the
  trigger to reconcile `lib/ports.ts` against it, not more AI guessing.
- **Added `.animate-shake` to `global.css`** (paired with the existing
  `.animate-pop`) for the wrong-match feedback — small enough to not warrant
  its own doc entry beyond this note.
- Verified end-to-end with a throwaway Playwright script (no project
  dependency added — installed via `npx` into `/tmp`, not `package.json`)
  since no browser tool was available in-session: difficulty scaling, wrong-
  match shake + streak reset, correct-match lock-in + accuracy math, round
  completion/regeneration, and the `ports-chart.astro` visual regression
  check all passed on a 390px mobile viewport.
- Bumped `package.json` version to `0.2.0` and the service worker
  `CACHE_NAME` to `a-plus-study-guide-v2` (`public/sw.js`) so an already-
  installed PWA actually picks up this change on next launch instead of
  serving the stale cached shell.

**Ports dataset reconciled against real exam objectives.** The user supplied
the actual CompTIA A+ 220-1201 objectives text (section 2.1). `lib/ports.ts`
was rewritten to exactly the 14 official line items (16 ports) — no padding.
This **removed** several ports that were in the placeholder set but aren't
on the objectives (465/587, 993, 995, 8080, 123, 161/162, 636) and **added**
137-139 NetBIOS/NetBT, which the Phase 7 note had already flagged as a
likely gap and turned out to be exactly right. Also added a `purpose` field
per port (the objectives' own "ports, protocols, and their purposes"
framing) — shown as a new Purpose column on the reference sheet, and in Port
Match as a transient 💡 hint that appears for ~3s after a correct match (not
a new matching mode — port↔service-name pairing stays the game's core loop,
purpose is a teaching moment layered on top, per user's explicit choice over
a purpose-matching variant). `portEntries`' split logic changed from
`/`-delimited (for combined cells like "465 / 587") to `-`-delimited (for
ranges like "20-21", "67-68", "137-139") since every remaining multi-port
row is a real range, not a slash-separated pair. Verified with a throwaway
Playwright script (same install-to-`/tmp` pattern as the original Port
Match verification) that a correct match on port 23 surfaces the right hint
text end-to-end. Bumped to `0.3.0` / `a-plus-study-guide-v3`.
