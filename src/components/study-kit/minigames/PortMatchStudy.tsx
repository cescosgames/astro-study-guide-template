import { useMemo, useState } from 'preact/hooks';
import PortMatch from './PortMatch';
import DifficultyPicker, { type Difficulty } from '../DifficultyPicker';

export interface PortMatchStudyProps {
  configs: { difficulty: Difficulty; domain: string }[];
}

export default function PortMatchStudy({ configs }: PortMatchStudyProps) {
  const difficulties = useMemo(() => [...new Set(configs.map((c) => c.difficulty))], [configs]);
  const [selected, setSelected] = useState<Difficulty>(difficulties[0] ?? 'easy');

  if (difficulties.length === 0) {
    return <p class="text-slate-500 dark:text-slate-400">No port match config yet.</p>;
  }

  return (
    <div class="flex flex-col gap-4">
      <DifficultyPicker difficulties={difficulties} selected={selected} onSelect={setSelected} />
      <PortMatch key={selected} difficulty={selected} />
    </div>
  );
}
