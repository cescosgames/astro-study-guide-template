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
      <div class="flex items-center justify-between text-sm text-slate-500">
        <span>{section}</span>
        <span>
          {completedCount} / {itemIds.length}
        </span>
      </div>
      <div class="h-2 w-full rounded-full bg-slate-200 dark:bg-slate-800">
        <div class="h-2 rounded-full bg-slate-900 dark:bg-white" style={{ width: `${percent}%` }} />
      </div>
      <ul class="flex flex-col gap-1">
        {itemIds.map((id) => (
          <li key={id} class="flex items-center gap-2">
            <input type="checkbox" checked={isComplete(id)} onChange={() => toggle(id)} />
            <span>{id}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
