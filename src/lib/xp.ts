import { useEffect, useState } from 'preact/hooks';

const STORAGE_KEY = 'study-progress:a-plus:xp';
const XP_EVENT = 'xp-updated';
const LEVEL_UP_EVENT = 'xp-level-up';

function readXp(): number {
  if (typeof localStorage === 'undefined') return 0;
  const raw = localStorage.getItem(STORAGE_KEY);
  const n = raw ? parseInt(raw, 10) : 0;
  return Number.isFinite(n) && n >= 0 ? n : 0;
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

export const XP_LEVEL_UP_EVENT = LEVEL_UP_EVENT;
