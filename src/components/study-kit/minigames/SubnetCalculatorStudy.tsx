import { useMemo, useState } from 'preact/hooks';
import SubnetCalculator from './SubnetCalculator';
import DifficultyPicker, { type Difficulty } from '../DifficultyPicker';

export interface SubnetCalculatorStudyProps {
  configs: { difficulty: Difficulty; domain: string }[];
}

export default function SubnetCalculatorStudy({ configs }: SubnetCalculatorStudyProps) {
  const difficulties = useMemo(() => [...new Set(configs.map((c) => c.difficulty))], [configs]);
  const [selected, setSelected] = useState<Difficulty>(difficulties[0] ?? 'easy');

  if (difficulties.length === 0) {
    return <p class="text-slate-500 dark:text-slate-400">No subnet calculator config yet.</p>;
  }

  return (
    <div class="flex flex-col gap-4">
      <DifficultyPicker difficulties={difficulties} selected={selected} onSelect={setSelected} />
      <SubnetCalculator key={selected} difficulty={selected} />
    </div>
  );
}
