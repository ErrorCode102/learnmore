import type { LessonId, LessonSummary } from '../types/course';

export interface ProgressBarProps {
  lessons: LessonSummary[];
  completed: LessonId[];
}

export function ProgressBar({ lessons, completed }: ProgressBarProps) {
  const completedIds = new Set(completed);
  const completedCount = lessons.filter((lesson) => completedIds.has(lesson.id)).length;
  const percentage =
    lessons.length === 0 ? 0 : Math.round((completedCount / lessons.length) * 100);
  const valueText = `ทำเสร็จแล้ว ${completedCount} จาก ${lessons.length} บท (${percentage}%)`;

  return (
    <div className="w-full">
      <div className="mb-2 flex items-center justify-between gap-3 text-sm">
        <span className="font-semibold text-ink">ความคืบหน้า</span>
        <span className="text-muted">
          {completedCount}/{lessons.length} บท · {percentage}%
        </span>
      </div>
      <div
        role="progressbar"
        aria-label="ความคืบหน้า"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percentage}
        aria-valuetext={valueText}
        className="h-2.5 overflow-hidden rounded-full bg-line"
      >
        <div
          className="h-full rounded-full bg-brand transition-[width] duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
