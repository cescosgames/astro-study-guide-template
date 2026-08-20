import { useEffect, useMemo, useState } from 'preact/hooks';
import MCQDeck, { type MCQQuestion } from './MCQDeck';
import TopicPicker from './TopicPicker';
import { useContentFilter, ALL_TOPICS } from '../../lib/useContentFilter';
import { shuffle } from '../../lib/shuffle';
import { DAILY_FIVE_ITEMS, isDailyModeActive, markDailyFiveItemDone } from '../../lib/dailyFive';

const DAILY_COUNT = DAILY_FIVE_ITEMS.find((item) => item.type === 'mcq')!.count;

export interface MCQStudyQuestion extends MCQQuestion {
  domain: string;
  topic: string;
}

export interface MCQStudyProps {
  questions: MCQStudyQuestion[];
}

export default function MCQStudy({ questions }: MCQStudyProps) {
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
  } = useContentFilter(questions);

  const [isDaily, setIsDaily] = useState(false);
  useEffect(() => setIsDaily(isDailyModeActive()), []);

  const topicQuestions = useMemo(() => {
    const shuffled = shuffle(filteredItems);
    return isDaily ? shuffled.slice(0, DAILY_COUNT) : shuffled;
  }, [filteredItems, shuffleSeed, isDaily]);

  if (domains.length === 0) {
    return <p class="text-slate-500 dark:text-slate-400">No MCQ questions yet.</p>;
  }

  return (
    <div class="flex flex-col gap-3">
      {isDaily && (
        <p class="rounded-2xl bg-accent/10 px-4 py-2 text-center text-sm font-bold text-accent">
          Daily 5 · {DAILY_COUNT} questions
        </p>
      )}
      {!isDaily && domains.length > 1 && (
        <TopicPicker
          topics={domains.map((d) => ({ topic: d.domain, count: d.count }))}
          selectedTopic={selectedDomain}
          onSelect={setSelectedDomain}
        />
      )}
      {!isDaily && (
        <TopicPicker
          topics={topics}
          selectedTopic={selectedTopic}
          onSelect={setSelectedTopic}
          onShuffle={reshuffle}
          allOption={{ value: ALL_TOPICS, label: 'All Topics', count: domainItems.length }}
        />
      )}

      <MCQDeck
        key={`${selectedDomain}-${selectedTopic}-${shuffleSeed}-${isDaily}`}
        questions={topicQuestions}
        onFinish={isDaily ? () => markDailyFiveItemDone('mcq') : undefined}
      />
    </div>
  );
}
