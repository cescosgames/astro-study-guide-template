import { useXp, useStreak } from '../../lib/xp';

export default function LevelRecap() {
  const { level, currentLevelXp, nextLevelXp, xp } = useXp();
  const { streak } = useStreak();
  const inLevel = xp - currentLevelXp;
  const forLevel = nextLevelXp - currentLevelXp;

  return (
    <div class="flex items-center gap-4 rounded-2xl border-2 border-border bg-surface-raised p-5 shadow-sm">
      <span
        class="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-accent/15 font-display text-xl font-extrabold text-accent"
        aria-hidden="true"
      >
        {level}
      </span>
      <div class="flex min-w-0 flex-1 flex-col gap-1.5">
        <div class="flex items-baseline justify-between gap-2">
          <span class="font-display font-bold">Level {level}</span>
          <span class="flex items-center gap-2">
            <span class="flex items-center gap-1 text-sm font-bold text-gold-shade dark:text-gold">
              🔥 {streak} day streak
            </span>
            <span class="text-sm text-slate-500 dark:text-slate-400">
              {inLevel}/{forLevel} XP
            </span>
          </span>
        </div>
        <span class="h-2 w-full overflow-hidden rounded-full bg-border">
          <span
            class="block h-full rounded-full bg-accent transition-[width]"
            style={{ width: `${Math.max(4, Math.min(100, (inLevel / forLevel) * 100))}%` }}
          />
        </span>
      </div>
    </div>
  );
}
