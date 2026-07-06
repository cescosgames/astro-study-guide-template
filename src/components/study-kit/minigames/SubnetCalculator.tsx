import { useMemo, useState } from 'preact/hooks';
import { generateSubnetProblem, getSubnetInfo } from '../../../lib/networking';

export interface SubnetCalculatorProps {
  difficulty: 'easy' | 'medium' | 'hard';
}

export default function SubnetCalculator({ difficulty }: SubnetCalculatorProps) {
  const [problem, setProblem] = useState(() => generateSubnetProblem(difficulty));
  const [maskGuess, setMaskGuess] = useState('');
  const [networkGuess, setNetworkGuess] = useState('');
  const [checked, setChecked] = useState(false);

  const answer = useMemo(() => getSubnetInfo(problem.ip, problem.cidr), [problem]);
  const correct = checked && maskGuess === answer.subnetMask && networkGuess === answer.networkAddress;

  function nextProblem() {
    setProblem(generateSubnetProblem(difficulty));
    setMaskGuess('');
    setNetworkGuess('');
    setChecked(false);
  }

  return (
    <div class="flex flex-col gap-4 rounded-xl border border-slate-300 p-6 dark:border-slate-700">
      <p class="text-lg font-medium">
        {problem.ip}/{problem.cidr}
      </p>
      <label class="flex flex-col gap-1 text-sm">
        Subnet mask
        <input
          value={maskGuess}
          onInput={(e) => setMaskGuess((e.target as HTMLInputElement).value)}
          class="rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-700"
        />
      </label>
      <label class="flex flex-col gap-1 text-sm">
        Network address
        <input
          value={networkGuess}
          onInput={(e) => setNetworkGuess((e.target as HTMLInputElement).value)}
          class="rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-700"
        />
      </label>
      <div class="flex gap-2">
        <button
          type="button"
          onClick={() => setChecked(true)}
          class="rounded-lg bg-slate-900 px-4 py-2 text-white dark:bg-white dark:text-slate-900"
        >
          Check
        </button>
        <button
          type="button"
          onClick={nextProblem}
          class="rounded-lg border border-slate-300 px-4 py-2 dark:border-slate-700"
        >
          Next
        </button>
      </div>
      {checked && (
        <p class={correct ? 'text-green-600' : 'text-red-600'}>
          {correct
            ? 'Correct!'
            : `Mask: ${answer.subnetMask}, Network: ${answer.networkAddress}`}
        </p>
      )}
    </div>
  );
}
