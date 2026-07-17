import { useEffect, useRef, useState } from 'preact/hooks';
import { useXp, XP_LEVEL_UP_EVENT } from '../../lib/xp';
import { burstConfetti } from '../../lib/confetti';

export default function XPBadge() {
  const { level, progress } = useXp();
  const [levelUp, setLevelUp] = useState<number | null>(null);
  const badgeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onLevelUp(e: Event) {
      const newLevel = (e as CustomEvent<number>).detail;
      setLevelUp(newLevel);
      burstConfetti(badgeRef.current);
      setTimeout(() => setLevelUp((l) => (l === newLevel ? null : l)), 2200);
    }
    window.addEventListener(XP_LEVEL_UP_EVENT, onLevelUp);
    return () => window.removeEventListener(XP_LEVEL_UP_EVENT, onLevelUp);
  }, []);

  return (
    <div ref={badgeRef} class="fixed top-2 left-2 z-30 print:hidden">
      <div class="flex items-center gap-1.5 rounded-full bg-surface-overlay px-2.5 py-1 select-none">
        <span aria-hidden="true">⭐</span>
        <span class="font-display text-xs font-bold text-slate-600 dark:text-slate-300">
          Lv {level}
        </span>
        <span class="h-1.5 w-10 overflow-hidden rounded-full bg-border">
          <span
            class="block h-full rounded-full bg-accent transition-[width]"
            style={{ width: `${Math.max(4, Math.min(100, progress * 100))}%` }}
          />
        </span>
      </div>
      {levelUp !== null && (
        <div class="animate-pop absolute top-full left-0 mt-2 rounded-2xl border-2 border-accent/30 bg-surface-raised px-3 py-2 text-xs font-bold whitespace-nowrap text-accent shadow-sm">
          🎉 Level up! Lv {levelUp}
        </div>
      )}
    </div>
  );
}
