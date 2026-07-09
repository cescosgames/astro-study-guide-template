# Architecture

This is a content-driven study guide engine. The goal: drop JSON files into
`src/content/a-plus/`, and the site adapts — new topics, new difficulty tiers,
new questions all show up without touching component code. This document is
the map for how that works and how to extend it. Visual/design conventions
live separately in `STYLE.md` — read that before touching any styling.

## Stack

- **Astro** (static output) — pages and routing
- **Preact** via `@astrojs/preact` — the interactive bits (flashcard flipping,
  quiz state, the CLI terminal, minigames)
- **Tailwind CSS v4** — styling, tokens defined in `src/styles/global.css`
- **Zod**, via Astro Content Collections — schema validation for all content
- **No backend.** Progress is `localStorage`, wrapped in `lib/progress.ts`.

## The content pipeline, end to end

```
notes/*.md                 (raw study notes, source of truth for facts)
      │
      │  extraction pass (manual/Claude-assisted, not automated)
      ▼
src/content/a-plus/{flashcards,mcq,cli,minigames}/*.json
      │
      │  read + validated by src/content.config.ts (Zod schemas)
      ▼
Astro content collections  ("flashcards", "mcq", "cli", "minigames")
      │
      │  queried with getCollection() in a page's frontmatter
      ▼
src/pages/**/*.astro       (fetches content, passes it as props)
      │
      │  client:load hydrates the interactive island
      ▼
src/components/study-kit/*.tsx  (renders it, holds UI state)
```

The one exception: the three printable reference sheets under
`/resources/*` (ports chart, subnet cheat sheet, CLI commands cheat sheet)
are **hand-authored static Astro pages**, not content-collection-driven. They
were copied verbatim from a companion study guide and don't come from
`notes/*.md`. If you want those to become drag-and-drop too, that's a
follow-up, not something already wired up.

## Repo map

```
notes/*.md                       Raw study notes, split by topic (source of truth for facts)

src/
  content.config.ts              Zod schemas + collection definitions — the contract
  content/a-plus/
    flashcards/*.json            One file per topic, each an ARRAY of flashcards
    mcq/*.json                   One file per topic, each an ARRAY of MCQs
    cli/*.json                   One file per topic, each an ARRAY of CLI drills
    minigames/*.json             One file per (type, difficulty), each a SINGLE config object

  components/
    study-kit/                   Cert-agnostic. No A+-specific strings allowed here.
      Flashcard.tsx              One flashcard: front, reveal, known/still-learning
      FlashcardStudy.tsx         Domain/topic filtering + progress bar + Flashcard, wraps a deck
      MCQDeck.tsx                One MCQ question flow: pick → reveal → next → score
      MCQStudy.tsx                Domain/topic filtering + MCQDeck
      RapidFireQuiz.tsx          Timed shuffle across ALL mcq content, no domain/topic filter
      CLIPractice.tsx            The terminal: one round of N CLI questions
      CLIStudy.tsx               Domain/topic filtering + CLIPractice
      TopicPicker.tsx            Horizontal chip row. Reused for BOTH the domain row and the
                                  topic row (see useContentFilter below); optional `allOption`
                                  pins an "All Topics" chip, optional `onShuffle` hides the
                                  Shuffle button when omitted (used on the domain-tier row)
      DifficultyPicker.tsx       Same chip-row idea, for easy/medium/hard
      ProgressTracker.tsx        Exists, but NOT wired to real data — see Known Gaps
      minigames/
        SubnetCalculator.tsx     The drill itself, takes a `difficulty` prop
        SubnetCalculatorStudy.tsx  DifficultyPicker + SubnetCalculator, reads `minigames` collection
        IPv6Shrinker.tsx / IPv6ShrinkerStudy.tsx   same pattern
    layout/
      BottomTabBar.astro         Fixed nav, cert-agnostic

  layout/
    Layout.astro                 Page shell: fonts, safe-area, PWA service worker
    PageHeader.astro             Badge + title + subtitle, always a bg-surface-raised card
                                  (fixes text sitting directly on the dotted page background)

  lib/                           Pure functions, no framework dependencies
    networking.ts                CIDR/subnet math, IPv6 compress/expand, problem generators
    cliValidate.ts                normalizeCommand() / isCommandAccepted() for CLI Practice
    shuffle.ts                    Fisher-Yates shuffle
    progress.ts                   useProgress() hook — localStorage-backed completion tracking
    useContentFilter.ts            Shared domain → topic filtering hook — used by FlashcardStudy,
                                    MCQStudy, and CLIStudy so this logic lives in exactly one place

  pages/
    index.astro                  Home — mode cards (Flashcards/Quiz/Practice/Resources)
    quiz.astro, practice.astro   Sub-navigation to the actual study/practice pages
    resources.astro              Static hub for the 3 printable reference sheets
    resources/*.astro            The reference sheets themselves (hand-authored, see above)
    dev/*.astro                  The actual content-collection-driven study pages
                                  (named "dev/" from Phase-1 scaffolding; they're the real routes)
```

## How to add content (the drag-and-drop part)

### Flashcards
Create `src/content/a-plus/flashcards/<topic-slug>.json`:

```json
[
  { "domain": "Core 1: Mobile Devices", "topic": "Laptop Hardware", "front": "...", "back": "..." }
]
```

- One file = one array of flashcards. `topic` groups cards for the topic
  picker on `/dev/flashcards` — every card with the same `topic` string ends
  up in the same picker chip, even across multiple files.
- `domain` does two things: it's the colored chip shown on the card itself,
  and it drives the domain-level picker row (see "Where topics/domains are
  used" below). Keep `domain` strings consistent across files that should be
  grouped together — a typo'd domain silently creates its own group.

### MCQ
Same shape, `src/content/a-plus/mcq/<topic-slug>.json`:

```json
[
  {
    "domain": "Core 1: Mobile Devices",
    "topic": "Laptop Hardware",
    "question": "...",
    "choices": ["...", "...", "...", "..."],
    "correctIndex": 0,
    "explanation": "optional — only renders a callout if present"
  }
]
```

Feeds both `/dev/mcq` (topic-filtered) and `/dev/rapid-fire` (all MCQ content
pooled and shuffled, no topic picker there by design).

### CLI Practice
`src/content/a-plus/cli/<topic-slug>.json`:

```json
[
  {
    "domain": "Core 2: Operating Systems",
    "topic": "Linux CLI",
    "os": "linux",
    "prompt": "List all running processes with full details",
    "accepted": ["ps -ef", "ps -fe"],
    "hint": "ps -ef"
  }
]
```

`accepted` can list multiple valid answers (whitespace/case-insensitive match,
see `lib/cliValidate.ts`). `os` is `"windows"` or `"linux"`.

### Minigames
These aren't extracted from notes — they're procedurally generated by
`lib/networking.ts`. Content files just declare which difficulty tiers exist:

`src/content/a-plus/minigames/subnet-calc-easy.json`:
```json
{ "type": "subnet-calc", "domain": "Core 1: Networking", "difficulty": "easy" }
```

`type` is `"subnet-calc"` or `"ipv6-shrink"`. Adding a `subnet-calc-hard.json`
makes a "hard" chip appear in the `DifficultyPicker` on `/dev/subnet-calculator`
— nothing else to wire up.

### The one gotcha

Astro's content loader watches existing files for edits automatically, but
**does not** notice new files landing in what was previously an empty
collection folder. If a collection currently has zero files and you add the
first one, restart the dev server (`astro dev stop && astro dev --background`).
Once a collection has at least one file, adding siblings hot-reloads fine.

## Where topics/domains are actually used today

Flashcards, MCQ, and CLI Practice all filter the same way, via the shared
`useContentFilter` hook — three levels:

1. **A specific topic** — narrows to just that topic's items.
2. **"All Topics"** — pools every topic within whichever domain is currently
   selected. This is the "study the whole domain" mode, and it's the default
   when you land on a page or switch domains.
3. **Domain picker** — switches which single domain you're browsing.
   Switching domains resets you to "All Topics" for the new domain.

The domain picker row **only renders when more than one domain exists** in
that content type's collection. With today's single-domain placeholder
content it's invisible — the moment Phase 2 content spans multiple domains,
it appears automatically, no code changes needed.

There is currently **no "pool everything across every domain" mode** for
Flashcards or CLI Practice — you always pick one domain first. MCQ has that
"everything, unfiltered" mode already, but via the separate Rapid Fire page,
not MCQ Study itself. If an "All Domains" super-mode ever becomes wanted for
Flashcards/CLI too, `useContentFilter` would need a nullable "no domain
selected" state — a small addition, deliberately not built speculatively.

Progress tracking (the "X known" counter in `FlashcardStudy`) is keyed by
**domain, never by topic** — "All Topics" and any specific topic within that
domain share one `localStorage` bucket. This was a real bug that shipped and
got fixed: it was originally keyed by whatever was currently selected
(topic-or-domain), so switching between "All Topics" and a specific topic
looked like known-status was resetting, when really it was just reading a
different storage bucket for the same cards. If you add per-topic completion
tracking to MCQ or CLI Practice later, use the same domain-keyed pattern.

## Known gaps (as of this writing)

- **Progress tracker is unwired.** `ProgressTracker.tsx` exists and
  `useProgress()` works (it's what powers the "X known" counter in
  FlashcardStudy), but there's no page that shows aggregate progress across
  topics/domains. It's commented out on the homepage. This is now a
  content-volume problem more than a plumbing one — the underlying
  domain/topic filtering and per-card completion tracking are both done.
- **Resources hub isn't content-collection-driven.** The three reference
  sheets are hand-coded Astro pages with the content inlined as page-local
  data, not `src/content/a-plus/*` JSON.
- **`content.config.ts` hardcodes the `a-plus` folder path** in each
  collection's glob pattern. Reusing this engine for a different cert means
  editing `content.config.ts` (new collections or repointed paths), not just
  adding a new content folder — the schemas themselves are generic, but the
  wiring isn't parameterized by cert yet.

## Quick reference: which page reads which collection

| Page | Collection(s) | Component |
|---|---|---|
| `/dev/flashcards` | `flashcards` | `FlashcardStudy` |
| `/dev/mcq` | `mcq` | `MCQStudy` |
| `/dev/rapid-fire` | `mcq` (all, unfiltered) | `RapidFireQuiz` |
| `/dev/cli-practice` | `cli` | `CLIStudy` |
| `/dev/subnet-calculator` | `minigames` (`type: "subnet-calc"`) | `SubnetCalculatorStudy` |
| `/dev/ipv6-shrinker` | `minigames` (`type: "ipv6-shrink"`) | `IPv6ShrinkerStudy` |
| `/resources/*` | none — static | plain `.astro` pages |
