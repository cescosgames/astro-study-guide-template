import { useState } from 'preact/hooks';

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
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);

  const current = questions[index];
  const isLast = index === questions.length - 1;

  function selectChoice(choiceIndex: number) {
    if (selected !== null) return;
    setSelected(choiceIndex);
    if (choiceIndex === current.correctIndex) setScore((s) => s + 1);
  }

  function next() {
    setSelected(null);
    setIndex((i) => i + 1);
  }

  if (index >= questions.length) {
    return (
      <div class="rounded-xl border border-slate-300 p-6 text-center dark:border-slate-700">
        <p class="text-lg font-semibold">
          Score: {score} / {questions.length}
        </p>
      </div>
    );
  }

  return (
    <div class="flex flex-col gap-4 rounded-xl border border-slate-300 p-6 dark:border-slate-700">
      <p class="text-sm text-slate-500">
        Question {index + 1} of {questions.length}
      </p>
      <p class="text-lg font-medium">{current.question}</p>
      <div class="flex flex-col gap-2">
        {current.choices.map((choice, i) => {
          const isSelected = selected === i;
          const isCorrect = i === current.correctIndex;
          const showState = selected !== null;
          return (
            <button
              key={choice}
              type="button"
              onClick={() => selectChoice(i)}
              class={`rounded-lg border px-4 py-2 text-left ${
                showState && isCorrect
                  ? 'border-green-500 bg-green-50 dark:bg-green-900/30'
                  : showState && isSelected
                    ? 'border-red-500 bg-red-50 dark:bg-red-900/30'
                    : 'border-slate-300 dark:border-slate-700'
              }`}
            >
              {choice}
            </button>
          );
        })}
      </div>
      {selected !== null && current.explanation && (
        <p class="text-sm text-slate-600 dark:text-slate-400">{current.explanation}</p>
      )}
      {selected !== null && (
        <button
          type="button"
          onClick={next}
          class="self-end rounded-lg bg-slate-900 px-4 py-2 text-white dark:bg-white dark:text-slate-900"
        >
          {isLast ? 'Finish' : 'Next'}
        </button>
      )}
    </div>
  );
}

export const STUB_MCQ_QUESTIONS: MCQQuestion[] = [
  {
    question: 'Stub question — which connector is used for SATA power?',
    choices: ['Molex', 'SATA power connector', 'Berg', '4-pin floppy'],
    correctIndex: 1,
    explanation: 'Stub explanation — SATA drives use a 15-pin SATA power connector.',
  },
];
