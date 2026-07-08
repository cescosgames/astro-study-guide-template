import { useState } from 'preact/hooks';

export interface FlashcardProps {
  domain: string;
  topic: string;
  front: string;
  back: string;
  onKnown?: (known: boolean) => void;
}

export default function Flashcard({ domain, topic, front, back, onKnown }: FlashcardProps) {
  const [revealed, setRevealed] = useState(false);

  return (
    <div class="flex flex-col gap-3">
      <div class="flex min-h-40 w-full flex-col gap-4 rounded-2xl border-2 border-border bg-surface-raised p-5 text-lg shadow-sm sm:p-6">
        <div class="flex flex-wrap items-center gap-2 text-xs font-bold">
          <span class="rounded-full bg-accent/15 px-2.5 py-1 text-accent">{domain}</span>
          <span class="text-slate-500 dark:text-slate-400">{topic}</span>
        </div>

        <p>{front}</p>

        {revealed && (
          <p class="animate-pop border-t-2 border-border pt-4 text-accent">{back}</p>
        )}

        {!revealed && (
          <button
            type="button"
            onClick={() => setRevealed(true)}
            class="btn-duo btn-duo-primary mt-auto min-h-11 self-center rounded-2xl px-6 text-sm"
          >
            Reveal
          </button>
        )}
      </div>
      {revealed && onKnown && (
        <div class="flex gap-2">
          <button
            type="button"
            onClick={() => onKnown(false)}
            class="btn-duo btn-duo-danger min-h-11 flex-1 rounded-2xl px-4"
          >
            Still learning
          </button>
          <button
            type="button"
            onClick={() => onKnown(true)}
            class="btn-duo btn-duo-primary min-h-11 flex-1 rounded-2xl px-4"
          >
            Got it
          </button>
        </div>
      )}
    </div>
  );
}
