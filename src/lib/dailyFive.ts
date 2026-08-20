export type DailyFiveType = 'flashcards' | 'mcq' | 'cli';

export interface DailyFiveItemDef {
  type: DailyFiveType;
  label: string;
  count: number;
  href: string;
}

// Fixed composition, no weighting/selection logic — the point of Daily 5 is
// zero decisions, just "open app, do these, done."
export const DAILY_FIVE_ITEMS: DailyFiveItemDef[] = [
  { type: 'flashcards', label: 'Flashcards', count: 2, href: '/dev/flashcards' },
  { type: 'mcq', label: 'MCQ', count: 2, href: '/dev/mcq' },
  { type: 'cli', label: 'CLI Practice', count: 1, href: '/dev/cli-practice' },
];

const STORAGE_KEY = 'study-progress:a-plus:daily-five';

interface DailyFiveState {
  date: string;
  done: Partial<Record<DailyFiveType, boolean>>;
}

function todayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

function readState(): DailyFiveState {
  if (typeof localStorage === 'undefined') return { date: todayKey(), done: {} };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.date === todayKey() && parsed.done) return parsed;
    }
  } catch {
    // fall through to a fresh state below
  }
  return { date: todayKey(), done: {} };
}

export function getDailyFiveDone(): Partial<Record<DailyFiveType, boolean>> {
  return readState().done;
}

export function markDailyFiveItemDone(type: DailyFiveType): void {
  if (typeof localStorage === 'undefined') return;
  const state = readState();
  state.done[type] = true;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function isDailyModeActive(): boolean {
  if (typeof window === 'undefined') return false;
  return new URLSearchParams(window.location.search).get('daily') === '1';
}
