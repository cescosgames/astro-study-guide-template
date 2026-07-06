import { useState } from 'preact/hooks';
import { generateIPv6Problem } from '../../../lib/networking';

export interface IPv6ShrinkerProps {
  difficulty: 'easy' | 'medium' | 'hard';
}

export default function IPv6Shrinker({ difficulty }: IPv6ShrinkerProps) {
  const [problem, setProblem] = useState(() => generateIPv6Problem(difficulty));
  const [guess, setGuess] = useState('');
  const [checked, setChecked] = useState(false);

  const correct = checked && guess.toLowerCase() === problem.compressed.toLowerCase();

  function nextProblem() {
    setProblem(generateIPv6Problem(difficulty));
    setGuess('');
    setChecked(false);
  }

  return (
    <div class="flex flex-col gap-4 rounded-xl border border-slate-300 p-6 dark:border-slate-700">
      <p class="break-all text-lg font-medium">{problem.full}</p>
      <label class="flex flex-col gap-1 text-sm">
        Compressed form
        <input
          value={guess}
          onInput={(e) => setGuess((e.target as HTMLInputElement).value)}
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
          {correct ? 'Correct!' : `Answer: ${problem.compressed}`}
        </p>
      )}
    </div>
  );
}
