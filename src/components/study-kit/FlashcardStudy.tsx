import { useMemo, useState } from 'preact/hooks';
import Flashcard from './Flashcard';
import TopicPicker from './TopicPicker';
import { useProgress } from '../../lib/progress';
import { shuffle } from '../../lib/shuffle';

export interface FlashcardStudyCard {
  id: string;
  domain: string;
  topic: string;
  front: string;
  back: string;
}

export interface FlashcardStudyProps {
  cert: string;
  cards: FlashcardStudyCard[];
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export default function FlashcardStudy({ cert, cards }: FlashcardStudyProps) {
  const topics = useMemo(() => {
    const seen = new Map<string, { domain: string; topic: string; count: number }>();
    for (const card of cards) {
      const existing = seen.get(card.topic);
      if (existing) existing.count += 1;
      else seen.set(card.topic, { domain: card.domain, topic: card.topic, count: 1 });
    }
    return [...seen.values()];
  }, [cards]);

  const [selectedTopic, setSelectedTopic] = useState(topics[0]?.topic ?? '');
  const [shuffleSeed, setShuffleSeed] = useState(0);
  const [index, setIndex] = useState(0);

  const topicCards = useMemo(
    () => shuffle(cards.filter((card) => card.topic === selectedTopic)),
    [cards, selectedTopic, shuffleSeed]
  );
  const current = topicCards[index];

  const { setItemComplete, completedCount } = useProgress(cert, slugify(selectedTopic));

  function selectTopic(topic: string) {
    setSelectedTopic(topic);
    setIndex(0);
  }

  function reshuffle() {
    setShuffleSeed((s) => s + 1);
    setIndex(0);
  }

  function goPrev() {
    setIndex((i) => Math.max(0, i - 1));
  }

  function goNext() {
    setIndex((i) => Math.min(topicCards.length - 1, i + 1));
  }

  function markKnown(known: boolean) {
    if (current) setItemComplete(current.id, known);
    if (index < topicCards.length - 1) setIndex((i) => i + 1);
  }

  if (topics.length === 0) {
    return <p class="text-slate-500 dark:text-slate-400">No flashcards yet.</p>;
  }

  const percent = topicCards.length === 0 ? 0 : Math.round((completedCount / topicCards.length) * 100);

  return (
    <div class="flex flex-col gap-4">
      <TopicPicker topics={topics} selectedTopic={selectedTopic} onSelect={selectTopic} onShuffle={reshuffle} />

      {current ? (
        <>
          <div class="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
            <span>
              Card {index + 1} of {topicCards.length}
            </span>
            <span>{completedCount} known</span>
          </div>
          <div class="h-3 w-full rounded-full bg-surface-overlay">
            <div class="h-3 rounded-full bg-accent transition-all" style={{ width: `${percent}%` }} />
          </div>

          <Flashcard
            key={current.id}
            domain={current.domain}
            topic={current.topic}
            front={current.front}
            back={current.back}
            onKnown={markKnown}
          />

          <div class="flex gap-2">
            <button
              type="button"
              onClick={goPrev}
              disabled={index === 0}
              class="btn-duo btn-duo-outline min-h-11 flex-1 rounded-2xl px-4 disabled:opacity-40"
            >
              Prev
            </button>
            <button
              type="button"
              onClick={goNext}
              disabled={index === topicCards.length - 1}
              class="btn-duo btn-duo-outline min-h-11 flex-1 rounded-2xl px-4 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </>
      ) : (
        <p class="text-slate-500 dark:text-slate-400">This topic has no cards.</p>
      )}
    </div>
  );
}
