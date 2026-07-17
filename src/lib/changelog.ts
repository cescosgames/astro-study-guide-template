export interface ChangelogEntry {
  date: string; // YYYY-MM-DD
  items: string[];
}

// Newest first. User-facing wording, not raw commit messages.
export const changelog: ChangelogEntry[] = [
  {
    date: '2026-07-17',
    items: [
      'Added a daily streak tracker next to your level',
      'Fixed the header clipping under the notch/Dynamic Island on iPhone',
    ],
  },
  {
    date: '2026-07-16',
    items: ['Added an XP and leveling system'],
  },
  {
    date: '2026-07-15',
    items: ['Added the Port Match mini-game, reconciled against the real exam objectives'],
  },
  {
    date: '2026-07-14',
    items: ['Added placeholder study content for PWA testing'],
  },
  {
    date: '2026-07-09',
    items: ['Fixed mobile PWA install/offline issues'],
  },
  {
    date: '2026-07-08',
    items: ['Added Resources hub, CLI Practice, and a full visual redesign'],
  },
];
