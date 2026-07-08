export interface TopicPickerOption {
  topic: string;
  count: number;
}

export interface TopicPickerProps {
  topics: TopicPickerOption[];
  selectedTopic: string;
  onSelect: (topic: string) => void;
  onShuffle: () => void;
}

export default function TopicPicker({ topics, selectedTopic, onSelect, onShuffle }: TopicPickerProps) {
  return (
    <div class="flex items-center gap-2">
      <div class="no-scrollbar flex flex-1 gap-2 overflow-x-auto">
        {topics.map((t) => {
          const active = t.topic === selectedTopic;
          return (
            <button
              key={t.topic}
              type="button"
              onClick={() => onSelect(t.topic)}
              class={`btn-duo min-h-11 shrink-0 whitespace-nowrap rounded-2xl px-4 text-sm ${
                active ? 'btn-duo-primary' : 'btn-duo-outline'
              }`}
            >
              {t.topic} ({t.count})
            </button>
          );
        })}
      </div>
      <button
        type="button"
        onClick={onShuffle}
        class="btn-duo btn-duo-outline min-h-11 shrink-0 rounded-2xl px-4 text-sm"
      >
        Shuffle
      </button>
    </div>
  );
}
