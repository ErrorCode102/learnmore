import {
  ArrowLeft,
  ArrowRight,
  BookOpenCheck,
  Check,
  CheckCircle2,
  Clock3,
  ListChecks,
} from 'lucide-react';
import { useEffect } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { useClassroomProgress } from '../context/ProgressContext';
import { getLessonsForLevel, getLessonSummary } from '../data/course';
import type { LessonId } from '../types/course';

export function LessonPage() {
  const { lessonId } = useParams();
  const { level, progress, toggleLesson, visitLesson } = useClassroomProgress();
  const lessons = getLessonsForLevel(level);
  const lesson = getLessonSummary(level, lessonId as LessonId);

  useEffect(() => {
    if (lesson) {
      visitLesson(lesson.id);
    }
  }, [lesson, visitLesson]);

  if (!lesson) {
    return <Navigate to="/" replace />;
  }

  const currentIndex = lessons.findIndex((candidate) => candidate.id === lesson.id);
  const previousLesson = lessons[currentIndex - 1];
  const nextLesson = lessons[currentIndex + 1];
  const completed = progress.completed[level].includes(lesson.id);
  const levelLabel = level === 'diploma' ? 'หลักสูตรปวส.' : 'หลักสูตรปวช.';

  return (
    <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 sm:py-12">
      <nav aria-label="เส้นทางนำทาง" className="text-sm">
        <ol className="flex flex-wrap items-center gap-2 text-muted">
          <li>
            <Link
              to="/#course-map"
              className="inline-flex min-h-10 items-center gap-2 rounded-lg font-medium hover:text-brand"
            >
              <ArrowLeft aria-hidden="true" className="h-4 w-4" />
              กลับไปยังแผนภูมิหลักสูตร
            </Link>
          </li>
          <li aria-hidden="true" className="text-line">
            /
          </li>
          <li aria-current="page" className="font-medium text-ink">
            {lesson.shortTitle}
          </li>
        </ol>
      </nav>

      <header className="mt-7 rounded-[1.75rem] border border-line bg-surface p-6 shadow-[0_20px_55px_-42px_rgba(23,34,59,0.55)] sm:p-8">
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="rounded-full bg-soft-brand px-3 py-1.5 text-xs font-semibold text-brand">
            {levelLabel}
          </span>
          <span className="rounded-full border border-line bg-canvas px-3 py-1.5 font-mono text-xs font-semibold text-muted">
            บทที่ {lesson.order}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-canvas px-3 py-1.5 text-xs font-medium text-muted">
            <Clock3 aria-hidden="true" className="h-3.5 w-3.5" />
            <span>{lesson.durationMinutes} นาที</span>
          </span>
        </div>

        <h1 className="mt-6 max-w-4xl text-3xl font-semibold leading-tight tracking-[-0.035em] sm:text-4xl">
          {lesson.title}
        </h1>
        <p className="mt-5 max-w-3xl text-base leading-8 text-muted">
          {lesson.description}
        </p>
        <div className="mt-6 flex flex-wrap gap-2">
          {lesson.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-lg border border-line bg-canvas px-2.5 py-1.5 font-mono text-[11px] font-medium text-muted"
            >
              {tag}
            </span>
          ))}
        </div>
      </header>

      <div className="mt-8 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <aside className="order-first rounded-2xl border border-line bg-surface p-5 lg:order-last lg:sticky lg:top-28">
          <div className="flex items-center gap-2">
            <ListChecks aria-hidden="true" className="h-4 w-4 text-brand" />
            <h2 className="text-sm font-semibold">ลำดับบทเรียน</h2>
          </div>
          <nav aria-label="ลำดับบทเรียน" className="mt-4">
            <ol className="space-y-1">
              {lessons.map((outlineLesson) => {
                const isCurrent = outlineLesson.id === lesson.id;
                const isCompleted = progress.completed[level].includes(outlineLesson.id);

                return (
                  <li key={outlineLesson.id}>
                    <Link
                      to={`/lesson/${outlineLesson.id}`}
                      aria-current={isCurrent ? 'page' : undefined}
                      className={`flex min-h-11 items-center gap-3 rounded-xl px-3 py-2 text-sm transition-colors ${
                        isCurrent
                          ? 'bg-soft-brand font-semibold text-brand'
                          : 'text-muted hover:bg-canvas hover:text-ink'
                      }`}
                    >
                      <span className="w-5 shrink-0 font-mono text-[11px]">
                        {String(outlineLesson.order).padStart(2, '0')}.
                      </span>
                      <span className="min-w-0 flex-1">{outlineLesson.shortTitle}</span>
                      {isCompleted && (
                        <Check
                          aria-hidden="true"
                          className="h-4 w-4 shrink-0 text-brand"
                        />
                      )}
                    </Link>
                  </li>
                );
              })}
            </ol>
          </nav>
        </aside>

        <div className="order-last min-w-0 space-y-6 lg:order-first">
          <section
            aria-labelledby="outcomes-title"
            className="rounded-2xl border border-line bg-surface p-6 sm:p-7"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-soft-brand text-brand">
                <BookOpenCheck aria-hidden="true" className="h-5 w-5" strokeWidth={1.8} />
              </span>
              <div>
                <p className="text-[10px] font-semibold tracking-[0.18em] text-muted">
                  LEARNING OUTCOMES
                </p>
                <h2 id="outcomes-title" className="mt-1 text-lg font-semibold">
                  ผลลัพธ์การเรียนรู้
                </h2>
              </div>
            </div>
            <ul aria-label="ผลลัพธ์การเรียนรู้" className="mt-6 space-y-3">
              {lesson.outcomes.map((outcome) => (
                <li key={outcome} className="flex items-start gap-3 text-sm leading-7 text-ink">
                  <CheckCircle2
                    aria-hidden="true"
                    className="mt-1 h-4 w-4 shrink-0 text-brand"
                  />
                  {outcome}
                </li>
              ))}
            </ul>
          </section>

          <section
            id="lesson-content"
            aria-labelledby="lesson-content-title"
            className="scroll-mt-28 rounded-2xl border border-line bg-surface p-6 sm:p-8"
          >
            <p className="text-[10px] font-semibold tracking-[0.18em] text-brand">
              LESSON CONTENT
            </p>
            <h2 id="lesson-content-title" className="mt-2 text-2xl font-semibold tracking-[-0.025em]">
              เนื้อหาบทเรียน
            </h2>
            <div className="mt-5 rounded-2xl border border-dashed border-brand/25 bg-soft-brand/45 p-5">
              <p className="text-sm leading-7 text-muted">
                กำลังเตรียมเนื้อหาอธิบายและตัวอย่างสำหรับบทเรียนนี้
                เพื่อเชื่อมโยงแนวคิดเข้ากับขั้นตอนการปฏิบัติและจุดตรวจความเข้าใจ
              </p>
            </div>
          </section>

          <section
            id="lesson-checkpoint"
            aria-labelledby="lesson-checkpoint-title"
            className="scroll-mt-28 rounded-2xl border border-line bg-surface p-6 sm:p-8"
          >
            <p className="text-[10px] font-semibold tracking-[0.18em] text-coral">
              CHECKPOINT
            </p>
            <h2 id="lesson-checkpoint-title" className="mt-2 text-2xl font-semibold tracking-[-0.025em]">
              จุดตรวจความเข้าใจ
            </h2>
            <p className="mt-4 text-sm leading-7 text-muted">
              บทเรียนนี้จะเชื่อมต่อกับแบบฝึกหัดและคำถามสรุป เพื่อช่วยตรวจสอบว่าคุณเข้าใจแนวคิดสำคัญก่อนไปต่อบทถัดไป
            </p>
          </section>

          <section
            aria-labelledby="completion-title"
            className="rounded-2xl border border-line bg-surface p-6"
          >
            <h2 id="completion-title" className="text-base font-semibold">
              บันทึกความคืบหน้า
            </h2>
            <p className="mt-2 text-sm leading-7 text-muted">
              {completed
                ? 'คุณทำเครื่องหมายบทเรียนนี้ว่าเสร็จแล้ว'
                : 'ทำเครื่องหมายเมื่อเข้าใจเนื้อหาและพร้อมไปต่อบทถัดไป'}
            </p>
            <button
              type="button"
              aria-pressed={completed}
              onClick={() => toggleLesson(lesson.id, level)}
              className={`mt-5 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition-colors sm:w-auto ${
                completed
                  ? 'border border-line bg-surface text-ink hover:bg-canvas'
                  : 'bg-brand text-white hover:bg-brand-deep'
              }`}
            >
              {completed ? (
                <Check aria-hidden="true" className="h-4 w-4" />
              ) : (
                <CheckCircle2 aria-hidden="true" className="h-4 w-4" />
              )}
              {completed ? 'ยกเลิกเครื่องหมายความคืบหน้า' : 'ทำเครื่องหมายว่าครบแล้ว'}
            </button>
          </section>

          <nav
            aria-label="การนำทางระหว่างบทเรียน"
            className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
          >
            {previousLesson ? (
              <Link
                to={`/lesson/${previousLesson.id}`}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-line bg-surface px-5 py-3 text-sm font-semibold text-ink transition-colors hover:border-brand/30 hover:text-brand"
              >
                <ArrowLeft aria-hidden="true" className="h-4 w-4" />
                บทก่อนหน้า: {previousLesson.shortTitle}
              </Link>
            ) : (
              <Link
                to="/#course-map"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-line bg-surface px-5 py-3 text-sm font-semibold text-ink transition-colors hover:border-brand/30 hover:text-brand"
              >
                <ArrowLeft aria-hidden="true" className="h-4 w-4" />
                กลับไปยังแผนภูมิหลักสูตร
              </Link>
            )}

            {nextLesson ? (
              <Link
                to={`/lesson/${nextLesson.id}`}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-ink px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-deep"
              >
                บทถัดไป: {nextLesson.shortTitle}
                <ArrowRight aria-hidden="true" className="h-4 w-4" />
              </Link>
            ) : (
              <Link
                to="/practice"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-ink px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-deep"
              >
                ไปยังฝึกท้ายบท
                <ArrowRight aria-hidden="true" className="h-4 w-4" />
              </Link>
            )}
          </nav>
        </div>
      </div>
    </div>
  );
}
