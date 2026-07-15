# Study Guide Template (With CompTIA A+ Content)

Hey, this is a content-driven study guide template built on Astro where you drop in JSON (flashcards, MCQs, CLI drills, minigame configs) and the study guide autoloads the content, no touching component code every time I want to add a new topic. Vibe coded with Claude. Content's based off my own personal study notes for the A+.

![flashcards](https://img.shields.io/badge/flashcards-103-58cc02) ![mcqs](https://img.shields.io/badge/mcqs-81-58cc02) ![cli drills](https://img.shields.io/badge/cli%20drills-22-58cc02) ![minigames](https://img.shields.io/badge/minigames-9-ffc800) ![domains covered](https://img.shields.io/badge/domains%20covered-9%20of%209-58cc02) ![status](https://img.shields.io/badge/content-AI--seeded%20starter%20notes-ffc800)

Heads up on that last badge: this content covers all 9 Core 1/Core 2 domains, but it's seeded from AI-generated starter notes (`notes/claude recommended A+ notes/`) rather than deep personal study notes yet — enough to actually study from and put the PWA through its paces, but worth a real accuracy pass against the official 220-1201/1202 objectives over time.

## Stack

Astro (static output → Cloudflare Pages), Tailwind v4, Preact for the interactive bits (flashcards, quizzes, the CLI terminal, minigames), Zod for content schemas. No backend, progress lives in `localStorage`.

## Docs

- [ARCHITECTURE.md](./ARCHITECTURE.md): how content loading actually works, the exact JSON shape for each content type, and how to drop in new stuff without touching components
- [STYLE.md](./STYLE.md): the design system (colors, buttons, spacing, the whole Duolingo-ish vibe)

## Quick start

```
npm install
astro dev --background
```

Then poke around `/dev/flashcards`, `/dev/mcq`, `/dev/cli-practice`, `/practice` (subnet, IPv6, and port-matching drills), and `/resources` (printable cheat sheets). If you want to add your own content, ARCHITECTURE.md has the copy-paste JSON shapes.

Heads up on the port list specifically: the port data (`src/lib/ports.ts`, backing both the Port Match minigame and the `/resources/ports-chart` cheat sheet) hasn't been checked against the current official CompTIA 220-1201 exam objectives — it's a reasonable working set, not a verified-complete one. Known gap: NetBIOS (137–139) isn't in there yet.
