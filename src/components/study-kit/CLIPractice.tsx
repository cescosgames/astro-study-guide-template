import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import { shuffle } from '../../lib/shuffle';
import { isCommandAccepted } from '../../lib/cliValidate';
import { burstConfetti } from '../../lib/confetti';

export interface CLICommandQuestion {
  os: 'windows' | 'linux';
  prompt: string;
  accepted: string[];
  hint: string;
}

export interface CLIPracticeProps {
  commands: CLICommandQuestion[];
  roundSize?: number;
}

interface OutputLine {
  text: string;
  variant: 'cmd' | 'ok' | 'err' | 'hint';
}

export default function CLIPractice({ commands, roundSize = 5 }: CLIPracticeProps) {
  const [shuffleSeed, setShuffleSeed] = useState(0);
  const round = useMemo(
    () => shuffle(commands).slice(0, Math.min(roundSize, commands.length)),
    [commands, roundSize, shuffleSeed]
  );

  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [input, setInput] = useState('');
  const [lines, setLines] = useState<OutputLine[]>([]);
  const [judged, setJudged] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const current = round[index];
  const done = index >= round.length;
  const perfect = done && round.length > 0 && score === round.length;
  const finishCardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (perfect) burstConfetti(finishCardRef.current);
  }, [perfect]);

  function judge() {
    if (judged || !current || input.trim() === '') return;
    const correct = isCommandAccepted(input, current.accepted);
    const newLines: OutputLine[] = [{ text: `$ ${input}`, variant: 'cmd' }];
    if (correct) {
      newLines.push({ text: '✓ Correct!', variant: 'ok' });
      setScore((s) => s + 1);
    } else {
      newLines.push({ text: '✕ Not quite.', variant: 'err' });
      newLines.push({ text: `Answer: ${current.hint}`, variant: 'hint' });
    }
    setLines(newLines);
    setJudged(true);
  }

  function advance() {
    setIndex((i) => i + 1);
    setInput('');
    setLines([]);
    setJudged(false);
    inputRef.current?.focus();
  }

  // The input is disabled right after judging (so it visually dims), and
  // disabled inputs stop receiving keyboard events — so "press Enter to
  // advance" has to be caught at the document level, not on the input.
  // The listener is attached once on mount, so it reads through a ref to
  // always see the latest judge/advance closures instead of stale ones.
  const latest = useRef({ judged, judge, advance });
  latest.current = { judged, judge, advance };

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key !== 'Enter') return;
      e.preventDefault();
      if (latest.current.judged) latest.current.advance();
      else latest.current.judge();
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, []);

  function restart() {
    setShuffleSeed((s) => s + 1);
    setIndex(0);
    setScore(0);
    setInput('');
    setLines([]);
    setJudged(false);
  }

  if (round.length === 0) {
    return <p class="text-slate-500 dark:text-slate-400">No CLI questions yet.</p>;
  }

  if (done) {
    const pct = score / round.length;
    const message =
      pct === 1
        ? `Perfect — ${score} for ${round.length}!`
        : pct >= 0.8
          ? 'Great work!'
          : pct >= 0.6
            ? 'Getting there — review the ones you missed.'
            : 'Keep at it — repetition is how these stick.';
    return (
      <div
        ref={finishCardRef}
        class="flex flex-col items-center gap-2 rounded-2xl border-2 border-border bg-surface-raised p-6 text-center shadow-sm"
      >
        <p class="font-display text-4xl font-extrabold text-accent">
          {score}
          <span class="text-2xl text-slate-400 dark:text-slate-500"> / {round.length}</span>
          {perfect && ' 🎉'}
        </p>
        <p class="text-slate-600 dark:text-slate-400">{message}</p>
        <button type="button" onClick={restart} class="btn-duo btn-duo-primary mt-3 min-h-11 rounded-2xl px-6">
          Try Again — new shuffle
        </button>
      </div>
    );
  }

  return (
    <div class="flex flex-col gap-3">
      <div class="flex items-start gap-3 rounded-2xl border-2 border-border bg-surface-raised p-4 shadow-sm">
        <span class="mt-0.5 shrink-0 rounded-lg bg-accent/15 px-2 py-0.5 text-xs font-bold tracking-wide text-accent uppercase">
          Prompt
        </span>
        <p class="flex-1 text-base text-slate-700 dark:text-slate-200">{current.prompt}</p>
        <span class="shrink-0 text-sm text-slate-500 dark:text-slate-400">
          {index + 1} / {round.length}
        </span>
      </div>

      <div class="overflow-hidden rounded-2xl border-2 border-border bg-surface-raised shadow-sm">
        <div class="flex items-center gap-2 border-b-2 border-border bg-surface-overlay px-4 py-2">
          <span class="h-2.5 w-2.5 rounded-full bg-danger" />
          <span class="h-2.5 w-2.5 rounded-full bg-gold" />
          <span class="h-2.5 w-2.5 rounded-full bg-success" />
          <span class="ml-auto font-mono text-xs text-slate-500 dark:text-slate-400">
            {current.os}
          </span>
        </div>
        <div class="min-h-12 px-4 py-3 font-mono text-sm">
          {lines.map((line, i) => (
            <span
              key={i}
              class={`block ${
                line.variant === 'ok'
                  ? 'text-success'
                  : line.variant === 'err'
                    ? 'text-danger'
                    : line.variant === 'hint'
                      ? 'text-gold-shade dark:text-gold'
                      : 'text-slate-700 dark:text-slate-200'
              }`}
            >
              {line.text}
            </span>
          ))}
        </div>
        <div class="flex items-center gap-2 border-t-2 border-border px-4 py-3">
          <span class="font-mono font-bold text-accent select-none">$</span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onInput={(e) => setInput((e.target as HTMLInputElement).value)}
            disabled={judged}
            autocomplete="off"
            autocorrect="off"
            autocapitalize="none"
            spellcheck={false}
            enterkeyhint={judged ? 'done' : 'go'}
            placeholder="type command here…"
            class="min-h-11 flex-1 border-none bg-transparent font-mono text-base text-slate-900 outline-none disabled:opacity-0 dark:text-slate-100"
          />
        </div>
      </div>

      <p class="text-xs text-slate-500 dark:text-slate-400">
        Spelling &amp; flags must match exactly — case ignored, extra spaces ignored
      </p>

      <div class="flex items-center justify-between gap-3">
        <span class="text-sm text-slate-500 dark:text-slate-400">
          Score {score} / {round.length}
        </span>
        {judged ? (
          <button type="button" onClick={advance} class="btn-duo btn-duo-primary min-h-11 rounded-2xl px-6">
            {index + 1 >= round.length ? 'Finish' : 'Continue'}
          </button>
        ) : (
          <button
            type="button"
            onClick={judge}
            disabled={input.trim() === ''}
            class="btn-duo btn-duo-primary min-h-11 rounded-2xl px-6"
          >
            Check
          </button>
        )}
      </div>
    </div>
  );
}
