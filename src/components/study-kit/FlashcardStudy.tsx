import { useMemo, useState } from 'preact/hooks';
import Flashcard from './Flashcard';
import TopicPicker from './TopicPicker';
import { useContentFilter, ALL_TOPICS } from '../../lib/useContentFilter';
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
  const {
    domains,
    selectedDomain,
    setSelectedDomain,
    domainItems,
    topics,
    selectedTopic,
    setSelectedTopic,
    filteredItems,
    shuffleSeed,
    reshuffle,
  } = useContentFilter(cards);

  const [index, setIndex] = useState(0);

  const topicCards = useMemo(() => shuffle(filteredItems), [filteredItems, shuffleSeed]);
  const current = topicCards[index];

  // Always keyed by domain (never by topic) so "All Topics" and any single
  // topic within that domain share one bucket — otherwise switching between
  // them looks like known-status resets, since they'd be writing to two
  // different localStorage keys for the same underlying cards.
  const { completedIds, setItemComplete } = useProgress(cert, slugify(selectedDomain));
  const knownInView = topicCards.filter((card) => completedIds.has(card.id)).length;

  function selectDomain(domain: string) {
    setSelectedDomain(domain);
    setIndex(0);
  }

  function selectTopic(topic: string) {
    setSelectedTopic(topic);
    setIndex(0);
  }

  function reshuffleAndReset() {
    reshuffle();
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

  if (domains.length === 0) {
    return <p class="text-slate-500 dark:text-slate-400">No flashcards yet.</p>;
  }

  const percent = topicCards.length === 0 ? 0 : Math.round((knownInView / topicCards.length) * 100);

  return (
    <div class="flex flex-col gap-3">
      {domains.length > 1 && (
        <TopicPicker
          topics={domains.map((d) => ({ topic: d.domain, count: d.count }))}
          selectedTopic={selectedDomain}
          onSelect={selectDomain}
        />
      )}
      <TopicPicker
        topics={topics}
        selectedTopic={selectedTopic}
        onSelect={selectTopic}
        onShuffle={reshuffleAndReset}
        allOption={{ value: ALL_TOPICS, label: 'All Topics', count: domainItems.length }}
      />

      {current ? (
        <>
          <div class="flex flex-col gap-2 rounded-2xl border-2 border-border bg-surface-raised p-3 shadow-sm">
            <div class="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
              <span>
                Card {index + 1} of {topicCards.length}
              </span>
              <span>{knownInView} known</span>
            </div>
            <div class="h-3 w-full rounded-full bg-surface-overlay">
              <div class="h-3 rounded-full bg-accent transition-all" style={{ width: `${percent}%` }} />
            </div>
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
