import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import { shuffle } from '../../lib/shuffle';
import { burstConfetti } from '../../lib/confetti';
import { addXp } from '../../lib/xp';

export interface MCQQuestion {
  question: string;
  choices: string[];
  correctIndex: number;
  explanation?: string;
}

export interface MCQDeckProps {
  questions: MCQQuestion[];
}

export default function MCQDeck({ questions }: MCQDeckProps) {
  const [shuffleSeed, setShuffleSeed] = useState(0);
  const shuffled = useMemo(() => shuffle(questions), [questions, shuffleSeed]);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);

  const current = shuffled[index];
  const isLast = index === shuffled.length - 1;

  const finished = index >= shuffled.length;
  const perfect = finished && shuffled.length > 0 && score === shuffled.length;
  const finishCardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (perfect) burstConfetti(finishCardRef.current);
  }, [perfect]);

  function selectChoice(choiceIndex: number) {
    if (selected !== null) return;
    setSelected(choiceIndex);
    if (choiceIndex === current.correctIndex) {
      setScore((s) => s + 1);
      addXp(10);
    }
  }

  function next() {
    setSelected(null);
    setIndex((i) => i + 1);
  }

  function restart() {
    setSelected(null);
    setScore(0);
    setIndex(0);
    setShuffleSeed((s) => s + 1);
  }

  if (finished) {
    return (
      <div
        ref={finishCardRef}
        class="flex flex-col items-center gap-4 rounded-2xl border-2 border-border bg-surface-raised p-6 text-center shadow-sm"
      >
        <p class="font-display text-lg font-bold">
          Score: {score} / {shuffled.length}
          {perfect && ' 🎉'}
        </p>
        <button
          type="button"
          onClick={restart}
          class="btn-duo btn-duo-primary min-h-11 rounded-2xl px-6"
        >
          Restart
        </button>
      </div>
    );
  }

  return (
    <div class="flex flex-col gap-4 rounded-2xl border-2 border-border bg-surface-raised p-5 shadow-sm sm:p-6">
      <div class="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
        <span>
          Question {index + 1} of {shuffled.length}
        </span>
        <button type="button" onClick={restart} class="font-bold text-accent">
          Restart
        </button>
      </div>
      <p class="text-lg font-medium">{current.question}</p>
      <div class="flex flex-col gap-2">
        {current.choices.map((choice, i) => {
          const isSelected = selected === i;
          const isCorrect = i === current.correctIndex;
          const showState = selected !== null;
          const revealCorrect = showState && isCorrect;
          const revealWrong = showState && isSelected && !isCorrect;
          return (
            <button
              key={choice}
              type="button"
              onClick={() => selectChoice(i)}
              class={`flex min-h-11 items-center justify-between gap-2 rounded-2xl border-2 px-4 py-2 text-left transition-colors ${
                revealCorrect
                  ? 'animate-pop border-success bg-success/10 text-success'
                  : revealWrong
                    ? 'border-danger bg-danger/10 text-danger'
                    : 'border-border'
              }`}
            >
              <span>{choice}</span>
              {revealCorrect && <span aria-hidden="true">✓</span>}
              {revealWrong && <span aria-hidden="true">✕</span>}
            </button>
          );
        })}
      </div>
      {selected !== null && current.explanation && (
        <div class="animate-pop flex gap-2 rounded-2xl border-2 border-accent/30 bg-accent/10 p-4 text-sm text-slate-700 dark:text-slate-200">
          <span aria-hidden="true">💡</span>
          <p>{current.explanation}</p>
        </div>
      )}
      {selected !== null && (
        <button
          type="button"
          onClick={next}
          class="btn-duo btn-duo-primary min-h-11 self-end rounded-2xl px-6"
        >
          {isLast ? 'Finish' : 'Next'}
        </button>
      )}
    </div>
  );
}
