import type { Level } from '../types/course';

export interface LevelSwitcherProps {
  level: Level;
  onChange: (level: Level) => void;
}

const levels: { value: Level; label: string }[] = [
  { value: 'certificate', label: 'ปวช.' },
  { value: 'diploma', label: 'ปวส.' },
];

export function LevelSwitcher({ level, onChange }: LevelSwitcherProps) {
  return (
    <div
      role="group"
      aria-label="เลือกระดับการศึกษา"
      className="inline-flex rounded-xl border border-line bg-canvas p-1"
    >
      {levels.map((option) => {
        const isSelected = option.value === level;

        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={isSelected}
            onClick={() => onChange(option.value)}
            className={`min-h-10 rounded-lg px-4 text-sm font-semibold transition-colors ${
              isSelected
                ? 'bg-ink text-surface shadow-sm'
                : 'text-muted hover:bg-surface hover:text-ink'
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
