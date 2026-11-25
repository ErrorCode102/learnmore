import { Check, Clock3 } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { LessonSummary } from '../types/course';

export interface LessonCardProps {
  lesson: LessonSummary;
  completed: boolean;
}

export function LessonCard({ lesson, completed }: LessonCardProps) {
  return (
    <li className="relative pl-12 sm:pl-14">
      <span
        aria-hidden="true"
        className={`absolute left-0 top-6 z-10 flex h-10 w-10 items-center justify-center rounded-full border-4 border-canvas font-mono text-xs font-semibold shadow-sm sm:h-11 sm:w-11 ${
          completed
            ? 'bg-brand text-white'
            : 'bg-surface text-brand'
        }`}
      >
        {completed ? <Check className="h-4 w-4" strokeWidth={2.5} /> : String(lesson.order).padStart(2, '0')}
      </span>

      <Link
        to={`/lesson/${lesson.id}`}
        className="group block rounded-2xl border border-line bg-surface p-5 shadow-[0_12px_35px_-30px_rgba(23,34,59,0.55)] transition-[border-color,transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:border-brand/35 hover:shadow-[0_18px_40px_-30px_rgba(79,70,229,0.45)] sm:p-6"
      >
        <article>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="font-mono text-[11px] font-semibold tracking-[0.12em] text-brand">
              บทที่ {String(lesson.order).padStart(2, '0')}
            </p>
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                completed ? 'bg-soft-brand text-brand' : 'bg-canvas text-muted'
              }`}
            >
              {completed && <Check aria-hidden="true" className="h-3.5 w-3.5" />}
              {completed ? 'เสร็จแล้ว' : 'ยังไม่เริ่ม'}
            </span>
          </div>

          <h3 className="mt-3 text-base font-semibold leading-7 tracking-[-0.015em] text-ink group-hover:text-brand sm:text-lg">
            {lesson.title}
          </h3>
          <p className="mt-2 text-sm leading-7 text-muted">{lesson.description}</p>

          <div className="mt-5 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-canvas px-2.5 py-1.5 text-xs font-medium text-muted">
              <Clock3 aria-hidden="true" className="h-3.5 w-3.5" />
              {lesson.durationMinutes} นาที
            </span>
            {lesson.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-lg border border-line px-2.5 py-1.5 font-mono text-[11px] font-medium text-muted"
              >
                {tag}
              </span>
            ))}
          </div>
        </article>
      </Link>
    </li>
  );
}
