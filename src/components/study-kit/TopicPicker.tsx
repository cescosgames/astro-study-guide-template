export interface TopicPickerOption {
  topic: string;
  count: number;
}

export interface TopicPickerAllOption {
  value: string;
  label: string;
  count: number;
}

export interface TopicPickerProps {
  topics: TopicPickerOption[];
  selectedTopic: string;
  onSelect: (topic: string) => void;
  onShuffle?: () => void;
  /** Pins a leading "All Topics"-style chip before the per-topic ones. */
  allOption?: TopicPickerAllOption;
}

export default function TopicPicker({ topics, selectedTopic, onSelect, onShuffle, allOption }: TopicPickerProps) {
  return (
    <div class="flex items-center gap-2">
      <div class="no-scrollbar flex flex-1 gap-2 overflow-x-auto">
        {allOption && (
          <button
            type="button"
            onClick={() => onSelect(allOption.value)}
            class={`btn-duo min-h-11 shrink-0 whitespace-nowrap rounded-2xl px-4 text-sm ${
              selectedTopic === allOption.value ? 'btn-duo-primary' : 'btn-duo-outline'
            }`}
          >
            {allOption.label} ({allOption.count})
          </button>
        )}
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
      {onShuffle && (
        <button
          type="button"
          onClick={onShuffle}
          class="btn-duo btn-duo-outline min-h-11 shrink-0 rounded-2xl px-4 text-sm"
        >
          Shuffle
        </button>
      )}
    </div>
  );
}
