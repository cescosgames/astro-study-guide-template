import { useEffect, useMemo, useState } from 'preact/hooks';
import type { MCQQuestion } from './MCQDeck';
import { shuffle } from '../../lib/shuffle';

export interface RapidFireQuizProps {
  questions: MCQQuestion[];
  secondsPerQuestion?: number;
}

export default function RapidFireQuiz({ questions, secondsPerQuestion = 15 }: RapidFireQuizProps) {
  const [restartSeed, setRestartSeed] = useState(0);
  const shuffled = useMemo(() => shuffle(questions), [questions, restartSeed]);
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(secondsPerQuestion);

  const current = shuffled[index];
  const done = index >= shuffled.length;

  useEffect(() => {
    if (done) return;
    setTimeLeft(secondsPerQuestion);
    const interval = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          setIndex((i) => i + 1);
          return secondsPerQuestion;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [index, done, secondsPerQuestion]);

  function answer(choiceIndex: number) {
    if (choiceIndex === current.correctIndex) setScore((s) => s + 1);
    setIndex((i) => i + 1);
  }

  function restart() {
    setRestartSeed((s) => s + 1);
    setScore(0);
    setIndex(0);
  }

  if (done) {
    return (
      <div class="flex flex-col items-center gap-4 rounded-2xl border-2 border-border bg-surface-raised p-6 text-center shadow-sm">
        <p class="font-display text-lg font-bold">
          Score: {score} / {shuffled.length}
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
        <div class="flex items-center gap-3">
          <span class="font-display rounded-full bg-gold/15 px-3 py-1 font-bold text-gold-shade dark:text-gold">
            {timeLeft}s
          </span>
          <button type="button" onClick={restart} class="font-bold text-accent">
            Restart
          </button>
        </div>
      </div>
      <p class="text-lg font-medium">{current.question}</p>
      <div class="flex flex-col gap-2">
        {current.choices.map((choice, i) => (
          <button
            key={choice}
            type="button"
            onClick={() => answer(i)}
            class="min-h-11 rounded-2xl border-2 border-border px-4 text-left transition-colors active:bg-surface-overlay"
          >
            {choice}
          </button>
        ))}
      </div>
    </div>
  );
}
