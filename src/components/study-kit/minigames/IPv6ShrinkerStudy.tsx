import { useMemo, useState } from 'preact/hooks';
import IPv6Shrinker from './IPv6Shrinker';
import DifficultyPicker, { type Difficulty } from '../DifficultyPicker';

export interface IPv6ShrinkerStudyProps {
  configs: { difficulty: Difficulty; domain: string }[];
}

export default function IPv6ShrinkerStudy({ configs }: IPv6ShrinkerStudyProps) {
  const difficulties = useMemo(() => [...new Set(configs.map((c) => c.difficulty))], [configs]);
  const [selected, setSelected] = useState<Difficulty>(difficulties[0] ?? 'easy');

  if (difficulties.length === 0) {
    return <p class="text-slate-500 dark:text-slate-400">No IPv6 shrinker config yet.</p>;
  }

  return (
    <div class="flex flex-col gap-4">
      <DifficultyPicker difficulties={difficulties} selected={selected} onSelect={setSelected} />
      <IPv6Shrinker key={selected} difficulty={selected} />
    </div>
  );
}
