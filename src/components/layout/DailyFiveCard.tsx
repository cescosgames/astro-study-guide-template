import { useEffect, useState } from 'preact/hooks';
import { DAILY_FIVE_ITEMS, getDailyFiveDone } from '../../lib/dailyFive';

export default function DailyFiveCard() {
  // SSR-safe default (same pattern as useXp/useStreak) — read the real
  // localStorage state only after mount so hydration doesn't skip the patch.
  const [done, setDone] = useState<Partial<Record<string, boolean>>>({});

  useEffect(() => {
    setDone(getDailyFiveDone());
  }, []);

  const allDone = DAILY_FIVE_ITEMS.every((item) => done[item.type]);

  return (
    <div class="flex flex-col gap-3 rounded-2xl border-2 border-border bg-surface-raised p-5 shadow-sm">
      <div class="flex items-center justify-between">
        <span class="font-display font-bold">Daily 5</span>
        <span class="text-xs text-slate-500 dark:text-slate-400">resets at midnight</span>
      </div>

      {allDone ? (
        <p class="text-sm font-bold text-success">🎉 Daily 5 complete — nice work today.</p>
      ) : (
        <div class="flex flex-col gap-2">
          {DAILY_FIVE_ITEMS.map((item) => {
            const isDone = !!done[item.type];
            return (
              <a
                key={item.type}
                href={`${item.href}?daily=1`}
                class={`flex min-h-11 items-center justify-between rounded-2xl border-2 px-4 py-2 text-sm font-bold transition-colors ${
                  isDone ? 'border-success bg-success/10 text-success' : 'border-border hover:border-accent'
                }`}
              >
                <span>
                  {item.label} · {item.count}
                </span>
                <span aria-hidden="true">{isDone ? '✓' : '→'}</span>
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
}
