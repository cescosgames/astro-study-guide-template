import { useMemo, useState } from 'preact/hooks';
import { generateSubnetProblem, getSubnetInfo } from '../../../lib/networking';
import { addXp } from '../../../lib/xp';

export interface SubnetCalculatorProps {
  difficulty: 'easy' | 'medium' | 'hard';
}

interface Guesses {
  mask: string;
  network: string;
  broadcast: string;
  firstHost: string;
  lastHost: string;
  usableHosts: string;
}

const emptyGuesses: Guesses = {
  mask: '',
  network: '',
  broadcast: '',
  firstHost: '',
  lastHost: '',
  usableHosts: '',
};

const fields: { key: keyof Guesses; label: string; placeholder: string }[] = [
  { key: 'mask', label: 'Subnet mask', placeholder: '255.255.255.0' },
  { key: 'network', label: 'Network address', placeholder: '192.168.1.0' },
  { key: 'broadcast', label: 'Broadcast address', placeholder: '192.168.1.255' },
  { key: 'firstHost', label: 'First usable host', placeholder: '192.168.1.1' },
  { key: 'lastHost', label: 'Last usable host', placeholder: '192.168.1.254' },
  { key: 'usableHosts', label: 'Usable hosts', placeholder: '254' },
];

export default function SubnetCalculator({ difficulty }: SubnetCalculatorProps) {
  const [problem, setProblem] = useState(() => generateSubnetProblem(difficulty));
  const [guesses, setGuesses] = useState<Guesses>(emptyGuesses);
  const [checked, setChecked] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [streak, setStreak] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [correctAttempts, setCorrectAttempts] = useState(0);

  const answer = useMemo(() => getSubnetInfo(problem.ip, problem.cidr), [problem]);
  const answerValues: Guesses = {
    mask: answer.subnetMask,
    network: answer.networkAddress,
    broadcast: answer.broadcastAddress,
    firstHost: answer.firstHost,
    lastHost: answer.lastHost,
    usableHosts: String(answer.usableHosts),
  };

  const allCorrect = fields.every((f) => guesses[f.key].trim() === answerValues[f.key]);
  const showFeedback = checked || revealed;
  const accuracy = attempts === 0 ? null : Math.round((correctAttempts / attempts) * 100);

  function setGuess(key: keyof Guesses, value: string) {
    setGuesses((g) => ({ ...g, [key]: value }));
  }

  function submit() {
    if (showFeedback) return;
    setChecked(true);
    setAttempts((a) => a + 1);
    if (allCorrect) {
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
    setProblem(generateSubnetProblem(difficulty));
    setGuesses(emptyGuesses);
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
        <div class="flex flex-col items-center gap-2 rounded-2xl bg-accent/10 py-4">
          <span class="text-xs font-bold text-slate-500 dark:text-slate-400">IP / Prefix</span>
          <p class="flex flex-wrap items-baseline justify-center gap-x-2 gap-y-1 px-2 text-center font-mono text-2xl font-bold tracking-widest text-accent sm:text-3xl">
            <span class="whitespace-nowrap">{problem.ip}</span>
            <span class="whitespace-nowrap text-slate-400 dark:text-slate-500">/ {problem.cidr}</span>
          </p>
        </div>

        <div class="grid gap-3 sm:grid-cols-2">
          {fields.map((f) => {
            const isCorrect = showFeedback && guesses[f.key].trim() === answerValues[f.key];
            const isWrong = showFeedback && !isCorrect;
            return (
              <label key={f.key} class="flex flex-col gap-1 text-sm">
                {f.label}
                <input
                  value={guesses[f.key]}
                  onInput={(e) => setGuess(f.key, (e.target as HTMLInputElement).value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') submit();
                  }}
                  disabled={showFeedback}
                  placeholder={f.placeholder}
                  inputmode="decimal"
                  autocapitalize="off"
                  autocorrect="off"
                  spellcheck={false}
                  class={`min-h-11 rounded-lg border-2 px-3 text-base disabled:opacity-90 ${
                    isCorrect
                      ? 'border-success bg-success/10 text-success'
                      : isWrong
                        ? 'border-danger bg-danger/10 text-danger'
                        : 'border-border'
                  }`}
                />
                {isWrong && <span class="text-xs text-danger">Answer: {answerValues[f.key]}</span>}
              </label>
            );
          })}
        </div>

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
              Reveal Answers
            </button>
          </div>
        ) : (
          <>
            <p class={`animate-pop font-display font-bold ${allCorrect ? 'text-success' : 'text-danger'}`}>
              {allCorrect ? 'All correct!' : revealed ? 'Answers revealed.' : 'Not quite — check the fields above.'}
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
        <p>Hosts = 2^(32−prefix) − 2 · Network = IP AND Mask · Broadcast = Network OR (NOT Mask)</p>
        <p>First host = Network + 1 · Last host = Broadcast − 1</p>
      </div>
    </div>
  );
}
