# Study Guide Template (With CompTIA A+ Content)

Hey, this is a content-driven study guide template built on Astro where you drop in JSON (flashcards, MCQs, CLI drills, minigame configs) and the study guide autoloads the content, no touching component code every time I want to add a new topic. Vibe coded with Claude. Content's based off my own personal study notes for the A+.

![flashcards](https://img.shields.io/badge/flashcards-16-58cc02) ![mcqs](https://img.shields.io/badge/mcqs-13-58cc02) ![cli drills](https://img.shields.io/badge/cli%20drills-5-58cc02) ![minigames](https://img.shields.io/badge/minigames-2-ffc800) ![domains covered](https://img.shields.io/badge/domains%20covered-1%20of%209-ff4b4b) ![status](https://img.shields.io/badge/content-test%20data%20only-ff4b4b)

Heads up on that last badge: right now everything's running on one placeholder topic ("Laptop Hardware") just to prove the pipeline works end to end. Real A+ content extraction from `notes/*.md` hasn't happened yet — that's the next big push.

## Stack

Astro (static output → Cloudflare Pages), Tailwind v4, Preact for the interactive bits (flashcards, quizzes, the CLI terminal, minigames), Zod for content schemas. No backend — progress lives in `localStorage`.

## Docs

- [ARCHITECTURE.md](./ARCHITECTURE.md) — how content loading actually works, the exact JSON shape for each content type, and how to drop in new stuff without touching components
- [STYLE.md](./STYLE.md) — the design system (colors, buttons, spacing, the whole Duolingo-ish vibe)

## Quick start

```
npm install
astro dev --background
```

Then poke around `/dev/flashcards`, `/dev/mcq`, `/dev/cli-practice`, `/practice` (subnet + IPv6 drills), and `/resources` (printable cheat sheets). If you want to add your own content, ARCHITECTURE.md has the copy-paste JSON shapes.
