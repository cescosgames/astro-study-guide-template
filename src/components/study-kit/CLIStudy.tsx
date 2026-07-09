import CLIPractice, { type CLICommandQuestion } from './CLIPractice';
import TopicPicker from './TopicPicker';
import { useContentFilter, ALL_TOPICS } from '../../lib/useContentFilter';

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

  if (domains.length === 0) {
    return <p class="text-slate-500 dark:text-slate-400">No CLI questions yet.</p>;
  }

  return (
    <div class="flex flex-col gap-4">
      {domains.length > 1 && (
        <TopicPicker
          topics={domains.map((d) => ({ topic: d.domain, count: d.count }))}
          selectedTopic={selectedDomain}
          onSelect={setSelectedDomain}
        />
      )}
      <TopicPicker
        topics={topics}
        selectedTopic={selectedTopic}
        onSelect={setSelectedTopic}
        onShuffle={reshuffle}
        allOption={{ value: ALL_TOPICS, label: 'All Topics', count: domainItems.length }}
      />
      <CLIPractice key={`${selectedDomain}-${selectedTopic}-${shuffleSeed}`} commands={filteredItems} />
    </div>
  );
}
