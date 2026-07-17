import { useState } from 'preact/hooks';
import { generateIPv6Problem } from '../../../lib/networking';
import { addXp } from '../../../lib/xp';

export interface IPv6ShrinkerProps {
  difficulty: 'easy' | 'medium' | 'hard';
}

export default function IPv6Shrinker({ difficulty }: IPv6ShrinkerProps) {
  const [problem, setProblem] = useState(() => generateIPv6Problem(difficulty));
  const [guess, setGuess] = useState('');
  const [checked, setChecked] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [streak, setStreak] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [correctAttempts, setCorrectAttempts] = useState(0);

  const correct = guess.trim().toLowerCase() === problem.compressed.toLowerCase();
  const showFeedback = checked || revealed;
  const accuracy = attempts === 0 ? null : Math.round((correctAttempts / attempts) * 100);

  function submit() {
    if (showFeedback) return;
    setChecked(true);
    setAttempts((a) => a + 1);
    if (correct) {
      setCorrectAttempts((c) => c + 1);
      setStreak((s) => s + 1);
      addXp(15);
    } else {
      setStreak(0);
    }
  }

  function reveal() {
    if (showFeedback) return;
    setRevealed(true);
    setAttempts((a) => a + 1);
    setStreak(0);
  }

  function nextProblem() {
    setProblem(generateIPv6Problem(difficulty));
    setGuess('');
    setChecked(false);
    setRevealed(false);
  }

  return (
    <div class="flex flex-col gap-4">
      <div class="flex gap-2">
        <span class="font-display flex-1 rounded-2xl bg-gold/15 px-4 py-2 text-center text-sm font-bold text-gold-shade dark:text-gold">
          Streak: {streak}
        </span>
        <span class="font-display flex-1 rounded-2xl bg-accent/15 px-4 py-2 text-center text-sm font-bold text-accent">
          Accuracy: {accuracy === null ? '—' : `${accuracy}%`}
        </span>
      </div>

      <div class="flex flex-col gap-4 rounded-2xl border-2 border-border bg-surface-raised p-5 shadow-sm sm:p-6">
        <div class="flex flex-col items-center gap-2 rounded-2xl bg-accent/10 px-3 py-4">
          <span class="text-xs font-bold text-slate-500 dark:text-slate-400">Full address</span>
          <p class="flex flex-wrap items-baseline justify-center gap-x-1 gap-y-1 px-2 text-center font-mono text-base font-bold tracking-widest text-accent sm:text-xl">
            {problem.full.split(':').map((group, i) => (
              <span key={i} class="whitespace-nowrap">
                {group}
                {i < 7 ? ':' : ''}
              </span>
            ))}
          </p>
        </div>

        <label class="flex flex-col gap-1 text-sm">
          Compressed form
          <input
            value={guess}
            onInput={(e) => setGuess((e.target as HTMLInputElement).value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') submit();
            }}
            disabled={showFeedback}
            placeholder="::1"
            autocapitalize="off"
            autocorrect="off"
            spellcheck={false}
            class={`min-h-11 rounded-lg border-2 px-3 font-mono text-base disabled:opacity-90 ${
              showFeedback
                ? correct
                  ? 'border-success bg-success/10 text-success'
                  : 'border-danger bg-danger/10 text-danger'
                : 'border-border'
            }`}
          />
        </label>

        {!showFeedback ? (
          <div class="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={submit}
              class="btn-duo btn-duo-primary min-h-11 flex-1 rounded-2xl px-4"
            >
              Submit
            </button>
            <button
              type="button"
              onClick={reveal}
              class="btn-duo btn-duo-outline min-h-11 flex-1 rounded-2xl px-4"
            >
              Reveal Answer
            </button>
          </div>
        ) : (
          <>
            <p class={`animate-pop font-display font-bold ${correct ? 'text-success' : 'text-danger'}`}>
              {correct ? 'Correct!' : `Answer: ${problem.compressed}`}
            </p>
            <button
              type="button"
              onClick={nextProblem}
              class="btn-duo btn-duo-primary min-h-11 self-end rounded-2xl px-6"
            >
              Next Question →
            </button>
          </>
        )}
      </div>

      <div class="rounded-2xl border-2 border-border bg-surface-overlay p-4 text-xs text-slate-500 dark:text-slate-400">
        <p class="font-display mb-1 font-bold text-slate-700 dark:text-slate-300">Quick reference</p>
        <p>1. Drop leading zeros in each group: 0db8 → db8</p>
        <p>2. Replace the longest run of consecutive all-zero groups with :: — only once, and only if 2+ groups</p>
        <p>3. If two runs of zero groups tie for longest, compress the first one</p>
      </div>
    </div>
  );
}
