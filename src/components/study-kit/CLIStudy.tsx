import { useEffect, useState } from 'preact/hooks';
import CLIPractice, { type CLICommandQuestion } from './CLIPractice';
import TopicPicker from './TopicPicker';
import { useContentFilter, ALL_TOPICS } from '../../lib/useContentFilter';
import { DAILY_FIVE_ITEMS, isDailyModeActive, markDailyFiveItemDone } from '../../lib/dailyFive';

const DAILY_COUNT = DAILY_FIVE_ITEMS.find((item) => item.type === 'cli')!.count;

export interface CLIStudyCommand extends CLICommandQuestion {
  domain: string;
  topic: string;
}

export interface CLIStudyProps {
  commands: CLIStudyCommand[];
}

export default function CLIStudy({ commands }: CLIStudyProps) {
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
  } = useContentFilter(commands);

  const [isDaily, setIsDaily] = useState(false);
  useEffect(() => setIsDaily(isDailyModeActive()), []);

  if (domains.length === 0) {
    return <p class="text-slate-500 dark:text-slate-400">No CLI questions yet.</p>;
  }

  return (
    <div class="flex flex-col gap-4">
      {isDaily && (
        <p class="rounded-2xl bg-accent/10 px-4 py-2 text-center text-sm font-bold text-accent">
          Daily 5 · {DAILY_COUNT} command{DAILY_COUNT === 1 ? '' : 's'}
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
      <CLIPractice
        key={`${selectedDomain}-${selectedTopic}-${shuffleSeed}-${isDaily}`}
        commands={filteredItems}
        roundSize={isDaily ? DAILY_COUNT : undefined}
        onFinish={isDaily ? () => markDailyFiveItemDone('cli') : undefined}
      />
    </div>
  );
}
