import { useProgress } from '../../lib/progress';

export interface ProgressTrackerProps {
  cert: string;
  section: string;
  itemIds: string[];
}

export default function ProgressTracker({ cert, section, itemIds }: ProgressTrackerProps) {
  const { completedCount, isComplete, toggle } = useProgress(cert, section);
  const percent = itemIds.length === 0 ? 0 : Math.round((completedCount / itemIds.length) * 100);

  return (
    <div class="flex flex-col gap-3">
      <div class="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
        <span>{section}</span>
        <span>
          {completedCount} / {itemIds.length}
        </span>
      </div>
      <div class="h-3 w-full rounded-full bg-surface-overlay">
        <div class="h-3 rounded-full bg-accent transition-all" style={{ width: `${percent}%` }} />
      </div>
      <ul class="flex flex-col gap-1">
        {itemIds.map((id) => (
          <li key={id}>
            <label class="flex min-h-11 items-center gap-3 rounded-xl px-2 hover:bg-surface-overlay">
              <input
                type="checkbox"
                checked={isComplete(id)}
                onChange={() => toggle(id)}
                class="h-5 w-5 rounded accent-[var(--color-accent)]"
              />
              <span>{id}</span>
            </label>
          </li>
        ))}
      </ul>
    </div>
  );
}
