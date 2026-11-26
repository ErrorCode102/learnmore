import { ArrowRight, BookOpenCheck, Clock3 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useClassroomProgress } from '../context/ProgressContext';
import type { LessonId, LessonSummary } from '../types/course';

export interface ContinueSelection {
  lesson: LessonSummary;
  label: 'เริ่มบทแรก' | 'เรียนต่อ' | 'ทบทวนบทสุดท้าย';
}

export function getContinueSelection(
  lessons: LessonSummary[],
  completed: LessonId[],
): ContinueSelection | undefined {
  const finalLesson = lessons.at(-1);
  if (!finalLesson) {
    return undefined;
  }

  const completedIds = new Set(completed);
  const allComplete = lessons.every((lesson) => completedIds.has(lesson.id));
  const lesson =
    lessons.find((candidate) => !completedIds.has(candidate.id)) ?? finalLesson;

  if (allComplete) {
    return { lesson: finalLesson, label: 'ทบทวนบทสุดท้าย' };
  }

  return {
    lesson,
    label: completed.length === 0 ? 'เริ่มบทแรก' : 'เรียนต่อ',
  };
}

export interface ContinueCardProps {
  lessons: LessonSummary[];
}

export function ContinueCard({ lessons }: ContinueCardProps) {
  const { level, progress } = useClassroomProgress();
  const completed = progress.completed[level];
  const selection = getContinueSelection(lessons, completed);

  if (!selection) {
    return null;
  }

  return (
    <section
      aria-labelledby="continue-title"
      className="relative overflow-hidden rounded-[1.75rem] bg-inverse p-6 text-on-inverse shadow-[0_24px_60px_-32px_rgba(23,34,59,0.7)] sm:p-7"
    >
      <div
        aria-hidden="true"
        className="absolute -right-14 -top-16 h-44 w-44 rounded-full bg-brand/35 blur-3xl"
      />
      <div className="relative">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-accent">
            <BookOpenCheck aria-hidden="true" className="h-5 w-5" strokeWidth={1.8} />
          </span>
          <div>
            <p className="text-[10px] font-semibold tracking-[0.18em] text-on-inverse/55">
              YOUR NEXT STEP
            </p>
            <h2 id="continue-title" className="mt-1 text-lg font-semibold">
              เส้นทางถัดไปของคุณ
            </h2>
          </div>
        </div>

        <p className="mt-6 text-xl font-semibold leading-8 tracking-[-0.02em]">
          {selection.lesson.title}
        </p>
        <p className="mt-2 flex items-center gap-2 text-sm text-on-inverse/65">
          <Clock3 aria-hidden="true" className="h-4 w-4" />
          บทที่ {selection.lesson.order} · {selection.lesson.durationMinutes} นาที
        </p>

        <Link
          to={`/lesson/${selection.lesson.id}`}
          className="group mt-6 inline-flex min-h-12 w-full items-center justify-center gap-3 rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-on-accent transition-colors hover:bg-accent-hover focus-visible:outline-on-inverse sm:w-auto"
        >
          {selection.label}
          <ArrowRight
            aria-hidden="true"
            className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
          />
        </Link>
      </div>
    </section>
  );
}
