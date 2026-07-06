import { useEffect, useMemo, useState } from 'preact/hooks';
import type { MCQQuestion } from './MCQDeck';

export interface RapidFireQuizProps {
  questions: MCQQuestion[];
  secondsPerQuestion?: number;
}

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export default function RapidFireQuiz({ questions, secondsPerQuestion = 15 }: RapidFireQuizProps) {
  const shuffled = useMemo(() => shuffle(questions), [questions]);
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

  if (done) {
    return (
      <div class="rounded-xl border border-slate-300 p-6 text-center dark:border-slate-700">
        <p class="text-lg font-semibold">
          Score: {score} / {shuffled.length}
        </p>
      </div>
    );
  }

  return (
    <div class="flex flex-col gap-4 rounded-xl border border-slate-300 p-6 dark:border-slate-700">
      <div class="flex items-center justify-between text-sm text-slate-500">
        <span>
          Question {index + 1} of {shuffled.length}
        </span>
        <span>{timeLeft}s</span>
      </div>
      <p class="text-lg font-medium">{current.question}</p>
      <div class="flex flex-col gap-2">
        {current.choices.map((choice, i) => (
          <button
            key={choice}
            type="button"
            onClick={() => answer(i)}
            class="rounded-lg border border-slate-300 px-4 py-2 text-left dark:border-slate-700"
          >
            {choice}
          </button>
        ))}
      </div>
    </div>
  );
}
