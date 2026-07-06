import { useState } from 'preact/hooks';

export interface FlashcardProps {
  front: string;
  back: string;
  onKnown?: (known: boolean) => void;
}

export default function Flashcard({ front, back, onKnown }: FlashcardProps) {
  const [flipped, setFlipped] = useState(false);

  return (
    <div class="flex flex-col gap-3">
      <button
        type="button"
        onClick={() => setFlipped((f) => !f)}
        class="min-h-40 w-full rounded-xl border border-slate-300 bg-white p-6 text-left text-lg shadow-sm dark:border-slate-700 dark:bg-slate-900"
      >
        {flipped ? back : front}
      </button>
      {flipped && onKnown && (
        <div class="flex gap-2">
          <button
            type="button"
            onClick={() => onKnown(false)}
            class="flex-1 rounded-lg bg-red-100 px-4 py-2 text-red-700 dark:bg-red-900/40 dark:text-red-300"
          >
            Still learning
          </button>
          <button
            type="button"
            onClick={() => onKnown(true)}
            class="flex-1 rounded-lg bg-green-100 px-4 py-2 text-green-700 dark:bg-green-900/40 dark:text-green-300"
          >
            Got it
          </button>
        </div>
      )}
    </div>
  );
}

export const STUB_FLASHCARD: FlashcardProps = {
  front: 'Stub front — what does RAM stand for?',
  back: 'Stub back — Random Access Memory',
};
