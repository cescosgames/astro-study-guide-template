import { useEffect, useState } from 'preact/hooks';

const STORAGE_KEY = 'study-progress:a-plus:xp';
const STREAK_KEY = 'study-progress:a-plus:streak';
const XP_EVENT = 'xp-updated';
const LEVEL_UP_EVENT = 'xp-level-up';
const STREAK_EVENT = 'streak-updated';

interface StreakState {
  count: number;
  lastActiveDate: string | null; // local YYYY-MM-DD
}

function todayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

function readXp(): number {
  if (typeof localStorage === 'undefined') return 0;
  const raw = localStorage.getItem(STORAGE_KEY);
  const n = raw ? parseInt(raw, 10) : 0;
  return Number.isFinite(n) && n >= 0 ? n : 0;
}

function readStreak(): StreakState {
  if (typeof localStorage === 'undefined') return { count: 0, lastActiveDate: null };
  try {
    const raw = localStorage.getItem(STREAK_KEY);
    if (!raw) return { count: 0, lastActiveDate: null };
    const parsed = JSON.parse(raw);
    if (typeof parsed.count === 'number' && (typeof parsed.lastActiveDate === 'string' || parsed.lastActiveDate === null)) {
      return parsed;
    }
  } catch {
    // fall through to default below
  }
  return { count: 0, lastActiveDate: null };
}

// Advances the streak by one calendar day's worth of activity, at most once
// per local day — a rolling 24h window would break on things like "studied
// at 11pm, then again at 10am the next day," which Duolingo's day-based
// streak doesn't penalize.
function bumpStreak(): void {
  if (typeof localStorage === 'undefined') return;
  const today = todayKey();
  const prev = readStreak();
  if (prev.lastActiveDate === today) return; // already counted today

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const wasYesterday = prev.lastActiveDate === `${yesterday.getFullYear()}-${yesterday.getMonth()}-${yesterday.getDate()}`;

  const next: StreakState = {
    count: wasYesterday ? prev.count + 1 : 1,
    lastActiveDate: today,
  };
  localStorage.setItem(STREAK_KEY, JSON.stringify(next));
  window.dispatchEvent(new CustomEvent(STREAK_EVENT, { detail: next.count }));
}

// Quadratic curve: level N starts at 50*(N-1)^2 XP. Endless by construction —
// there's no "max level" data, level is just recomputed from the one XP
// number, so the curve can be retuned later without any migration.
export function levelForXp(xp: number): number {
  return Math.floor(Math.sqrt(xp / 50)) + 1;
}

export function xpForLevel(level: number): number {
  return 50 * (level - 1) ** 2;
}

export function addXp(amount: number): void {
  if (typeof localStorage === 'undefined' || amount <= 0) return;
  const before = readXp();
  const after = before + amount;
  localStorage.setItem(STORAGE_KEY, String(after));
  window.dispatchEvent(new CustomEvent(XP_EVENT, { detail: after }));
  bumpStreak();

  const levelBefore = levelForXp(before);
  const levelAfter = levelForXp(after);
  if (levelAfter > levelBefore) {
    window.dispatchEvent(new CustomEvent(LEVEL_UP_EVENT, { detail: levelAfter }));
  }
}

export function useXp() {
  const [xp, setXp] = useState(() => readXp());

  useEffect(() => {
    setXp(readXp());
    function onUpdate(e: Event) {
      setXp((e as CustomEvent<number>).detail);
    }
    window.addEventListener(XP_EVENT, onUpdate);
    return () => window.removeEventListener(XP_EVENT, onUpdate);
  }, []);

  const level = levelForXp(xp);
  const currentLevelXp = xpForLevel(level);
  const nextLevelXp = xpForLevel(level + 1);
  const progress = (xp - currentLevelXp) / (nextLevelXp - currentLevelXp);

  return { xp, level, progress, currentLevelXp, nextLevelXp };
}

export function useStreak() {
  const [streak, setStreak] = useState(() => readStreak().count);

  useEffect(() => {
    setStreak(readStreak().count);
    function onUpdate(e: Event) {
      setStreak((e as CustomEvent<number>).detail);
    }
    window.addEventListener(STREAK_EVENT, onUpdate);
    return () => window.removeEventListener(STREAK_EVENT, onUpdate);
  }, []);

  return { streak };
}

export const XP_LEVEL_UP_EVENT = LEVEL_UP_EVENT;
