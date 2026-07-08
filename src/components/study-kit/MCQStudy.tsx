import { useMemo, useState } from 'preact/hooks';
import MCQDeck, { type MCQQuestion } from './MCQDeck';
import TopicPicker from './TopicPicker';
import { shuffle } from '../../lib/shuffle';

export interface MCQStudyQuestion extends MCQQuestion {
  domain: string;
  topic: string;
}

export interface MCQStudyProps {
  questions: MCQStudyQuestion[];
}

export default function MCQStudy({ questions }: MCQStudyProps) {
  const topics = useMemo(() => {
    const seen = new Map<string, { domain: string; topic: string; count: number }>();
    for (const q of questions) {
      const existing = seen.get(q.topic);
      if (existing) existing.count += 1;
      else seen.set(q.topic, { domain: q.domain, topic: q.topic, count: 1 });
    }
    return [...seen.values()];
  }, [questions]);

  const [selectedTopic, setSelectedTopic] = useState(topics[0]?.topic ?? '');
  const [shuffleSeed, setShuffleSeed] = useState(0);
  const topicQuestions = useMemo(
    () => shuffle(questions.filter((q) => q.topic === selectedTopic)),
    [questions, selectedTopic, shuffleSeed]
  );

  if (topics.length === 0) {
    return <p class="text-slate-500 dark:text-slate-400">No MCQ questions yet.</p>;
  }

  return (
    <div class="flex flex-col gap-4">
      <TopicPicker
        topics={topics}
        selectedTopic={selectedTopic}
        onSelect={setSelectedTopic}
        onShuffle={() => setShuffleSeed((s) => s + 1)}
      />

      <MCQDeck key={`${selectedTopic}-${shuffleSeed}`} questions={topicQuestions} />
    </div>
  );
}
