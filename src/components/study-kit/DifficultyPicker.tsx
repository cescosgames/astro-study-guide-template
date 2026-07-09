export type Difficulty = 'easy' | 'medium' | 'hard';

const ORDER: Difficulty[] = ['easy', 'medium', 'hard'];

export interface DifficultyPickerProps {
  difficulties: Difficulty[];
  selected: Difficulty;
  onSelect: (difficulty: Difficulty) => void;
}

export default function DifficultyPicker({ difficulties, selected, onSelect }: DifficultyPickerProps) {
  const ordered = ORDER.filter((d) => difficulties.includes(d));

  return (
    <div class="flex gap-2">
      {ordered.map((d) => {
        const active = d === selected;
        return (
          <button
            key={d}
            type="button"
            onClick={() => onSelect(d)}
            class={`btn-duo min-h-11 flex-1 rounded-2xl px-4 text-sm capitalize ${
              active ? 'btn-duo-primary' : 'btn-duo-outline'
            }`}
          >
            {d}
          </button>
        );
      })}
    </div>
  );
}
