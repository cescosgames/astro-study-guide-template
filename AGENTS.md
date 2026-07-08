## Development

When starting the dev server, use background mode:

```
astro dev --background
```

Manage the background server with `astro dev stop`, `astro dev status`, and `astro dev logs`.

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

## Repo structure (target)
```
src/
  content/
    a-plus/
      flashcards/*.json
      mcq/*.json
      minigames/*.json
    config.ts            <- Zod schemas, shared across all certs
  components/
    study-kit/            <- CERT-AGNOSTIC, reusable across future guides
      Flashcard.tsx
      MCQDeck.tsx
      RapidFireQuiz.tsx
      ProgressTracker.tsx
      minigames/
        SubnetCalculator.tsx
        IPv6Shrinker.tsx
    layout/               <- nav, course cards, etc — mostly cert-agnostic
  lib/
    networking.ts         <- pure functions: subnet math, IPv6 compression/expansion, CIDR logic
    progress.ts           <- useProgress() hook, localStorage abstraction
  pages/
    index.astro
    courses/[...slug].astro
    quiz.astro
```

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
- Visual design decisions pull from `style.md` (the design-system source of truth), not ad hoc per-component choices. See "Visual redesign" below for the current direction.

## Status

**Phase 1 (engine skeleton) and Phase 3 (pages) are functionally done**, still running on the `test-laptop-hardware.json` placeholder content set — real Phase 2 content extraction from `notes/*.md` has not happened yet.

**Visual redesign — complete.** The engine moved from a flat indigo/slate "enterprise" look to a Duolingo-inspired theme: bright green (`#58cc02`) primary accent, warm neutral surfaces, `Baloo 2`/`Nunito` display+body fonts, and a signature `.btn-duo` chunky pressable-button system (solid bottom "shade" edge that compresses on `:active`). Full token table, button variants, and conventions are documented in `style.md` — read it before any future styling work rather than re-deriving values. Key non-obvious pieces:
- `TopicPicker.tsx` (shared `study-kit/` component): horizontal scrollable chip row replacing native `<select>` for topic pickers — native selects can't be restyled to match the chunky system (browser-rendered dropdown chrome), so don't reintroduce one.
- `Flashcard.tsx`: single "Reveal" toggle shows the answer inline below the question on the same card (no flip animation) — chosen over a flip-card metaphor for a more "see everything at once" study flow.
- `MCQDeck.tsx`: correct/incorrect answer explanation renders as a callout box (💡), but only when the content's optional `explanation` field is populated — the placeholder JSON has it filled for about half the entries.
- `SubnetCalculator.tsx` / `IPv6Shrinker.tsx`: rebuilt with streak/accuracy tracking, Submit vs. Reveal Answer (reveal breaks streak, counts as an attempt but not a correct one), per-field correct/incorrect highlighting, and a "Quick reference" cheatsheet card — modeled on the equivalent practice tool in the Google IT guide (`google-it-cert-study-guide.pages.dev/subnet-practice.html`).
- `lib/networking.ts` — `generateIPv6Problem()` was fixed twice this session: it originally always placed the zero-group run at a fixed leading position, then was rewritten to seed a random-length, random-position zero run (with an occasional second shorter run to exercise the "compress only the longest run" rule) so generated addresses resemble realistic ones (loopback/link-local/manually-assigned host suffixes) rather than a mechanically fixed pattern.

**Known gap — homepage progress tracker is disabled.** `ProgressTracker` is commented out in `src/pages/index.astro` because it was only ever wired to stub data (`itemIds={['item-1','item-2','item-3']}`), not real per-domain completion — it was never connected to actual flashcard/MCQ progress. Needs real wiring once content exists, or replacement per the Phase 4 plan below.

## Phase 4 — Resources Hub + CLI Practice (next session)

Modeled on two pages from the Google IT guide — fetch/re-check both at the start of the session since they may change:
- `google-it-cert-study-guide.pages.dev/resources.html` — a resources hub grouping downloadable/printable reference material by category (e.g. "A+ Exam", "Networking", "OS & Networking"). Each resource is a card: title, 1–2 sentence description, Preview + Download/Print actions.
- `google-it-cert-study-guide.pages.dev/resources/cli-practice.html` — an interactive terminal-emulation drill: shows a prompt describing a task, user types the exact shell command into a simulated `$` prompt, Enter submits, validation is exact-match on command/flags (case-insensitive, whitespace-insensitive), tracks progress (e.g. "1/5") and score (e.g. "0/5"), with a "Try Again — new shuffle" reset.

Rough plan (to refine at the start of next session, not to execute blind):
1. Decide whether the homepage progress tracker gets replaced by a "Resources" entry point (per the user's suggestion) or fixed separately — don't leave it in limbo.
2. Design the resources hub as cert-agnostic where possible (category grouping is generic; only the specific resource list is A+-specific) — same `study-kit/` cert-agnostic constraint applies.
3. CLI practice needs a new content schema (likely `cliCommand` — prompt/task description, expected command(s), OS/shell context) and a new `study-kit` component for the terminal-emulation UI, styled per `style.md` (chunky buttons, accent-green terminal chrome, not a literal black/green hacker terminal, to stay consistent with the rest of the app).
4. Command validation logic (exact match, case-insensitive, whitespace-insensitive, possibly multiple acceptable flag orders) should live in `lib/` as a pure function so it's unit-testable independent of the component, matching the `networking.ts` pattern.
5. Content for CLI practice must come from real Linux/Windows CLI facts grounded in the A+ notes (Core 2 OS domain) — same "don't fabricate" rule as flashcards/MCQs.
