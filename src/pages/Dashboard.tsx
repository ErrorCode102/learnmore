import {
  ArrowRight,
  BookMarked,
  Braces,
  Check,
  Code2,
  Database,
  Layers3,
  ShieldCheck,
  Terminal,
} from 'lucide-react';
import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ContinueCard, getContinueSelection } from '../components/ContinueCard';
import { LessonCard } from '../components/LessonCard';
import { LevelSwitcher } from '../components/LevelSwitcher';
import { ProgressBar } from '../components/ProgressBar';
import { useClassroomProgress } from '../context/ProgressContext';
import { getLessonsForLevel } from '../data/course';

const learningSteps = [
  { title: 'เข้าใจ Flow', detail: 'Login, Register และ Session' },
  { title: 'สร้าง Backend', detail: 'Express, API และ MySQL' },
  { title: 'เชื่อม Frontend', detail: 'หน้าจอและ Authentication ด้วย Vue 3' },
  { title: 'ตรวจสอบความปลอดภัย', detail: 'Validation, Password และ JWT' },
] as const;

const overviewCards = [
  {
    icon: Braces,
    title: 'Frontend ที่เข้าใจผู้ใช้',
    description:
      'ออกแบบหน้า Login และ Register ที่ใช้งานง่าย เชื่อมข้อมูลกับ API และจัดการสถานะการเข้าสู่ระบบ',
    tag: 'Vue 3',
    tone: 'bg-soft-brand text-brand',
  },
  {
    icon: Database,
    title: 'Backend ที่มีโครงสร้าง',
    description:
      'เรียนรู้การจัดเก็บผู้ใช้ การตรวจสอบข้อมูล และการสร้าง API ด้วย Node.js, Express และ MySQL',
    tag: 'Node.js + Express',
    tone: 'bg-soft-coral text-coral',
  },
  {
    icon: ShieldCheck,
    title: 'Authentication ที่เป็นระบบ',
    description:
      'เข้าใจ Session และ JWT จากแนวคิดจนถึงการป้องกันข้อผิดพลาดทางความปลอดภัยพื้นฐาน',
    tag: 'Security',
    tone: 'bg-[#edf7f3] text-[#287a5b]',
  },
] as const;

const trackNames = {
  certificate: 'ประกาศนียบัตรวิชาชีพ (ปวช.)',
  diploma: 'ประกาศนียบัตรวิชาชีพชั้นสูง (ปวส.)',
} as const;

export function Dashboard() {
  const { level, setLevel, progress } = useClassroomProgress();
  const location = useLocation();
  const lessons = getLessonsForLevel(level);
  const completed = progress.completed[level];
  const completedIds = new Set(completed);
  const completedCount = lessons.filter((lesson) => completedIds.has(lesson.id)).length;
  const percentage = Math.round((completedCount / lessons.length) * 100);
  const totalMinutes = lessons.reduce((total, lesson) => total + lesson.durationMinutes, 0);
  const remainingMinutes = lessons.reduce(
    (total, lesson) =>
      completedIds.has(lesson.id) ? total : total + lesson.durationMinutes,
    0,
  );
  const quizScore = progress.quizScores[level];
  const continueSelection = getContinueSelection(lessons, completed);

  useEffect(() => {
    if (location.hash === '#course-map') {
      document.getElementById('course-map')?.scrollIntoView?.({ block: 'start' });
    }
  }, [location.hash]);

  return (
    <>
      <section
        aria-labelledby="hero-title"
        className="mx-auto grid max-w-7xl items-center gap-14 px-5 py-14 sm:px-8 sm:py-20 lg:grid-cols-[1.12fr_0.88fr] lg:gap-16 lg:py-24"
      >
        <div>
          <div className="inline-flex items-center gap-2.5 rounded-full border border-line bg-surface px-3.5 py-2 text-xs font-medium text-muted shadow-sm">
            <span aria-hidden="true" className="h-2 w-2 rounded-full bg-coral" />
            ห้องเรียน Authentication สำหรับนักศึกษา
          </div>

          <h1
            id="hero-title"
            className="mt-7 max-w-3xl text-4xl font-semibold leading-[1.2] tracking-[-0.04em] sm:text-5xl lg:text-[3.65rem]"
          >
            เข้าใจ <span className="text-brand">Login</span> และ{' '}
            <span className="text-brand">Register</span>
            <br className="hidden sm:block" /> จากพื้นฐานจนสู่ระบบที่ใช้งานจริง
          </h1>

          <p className="mt-6 max-w-2xl text-base leading-8 text-muted sm:text-lg">
            เรียนรู้การสร้างระบบเข้าสู่ระบบแบบเป็นขั้นตอน ตั้งแต่โครงสร้าง Frontend,
            Backend และฐานข้อมูล ไปจนถึงความปลอดภัย พร้อมคำอธิบายโค้ดทุกบรรทัด
          </p>

          <div className="mt-9 flex flex-col items-start gap-5 sm:flex-row sm:items-center">
            <Link
              to={`/lesson/${continueSelection?.lesson.id ?? 'overview'}`}
              className="group inline-flex min-h-12 items-center justify-center gap-3 rounded-xl bg-brand px-6 py-3 text-sm font-semibold text-white shadow-[0_14px_32px_-14px_rgba(79,70,229,0.8)] transition-colors hover:bg-brand-deep"
            >
              เริ่มเรียน
              <ArrowRight
                aria-hidden="true"
                className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
              />
            </Link>

            <Link
              to="/demo"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-line bg-surface px-5 py-3 text-sm font-semibold text-ink transition-colors hover:border-brand/30 hover:text-brand"
            >
              <ShieldCheck aria-hidden="true" className="h-4 w-4 text-[#287a5b]" />
              ดู Demo Authentication
            </Link>
          </div>

          <dl className="mt-11 grid gap-5 border-t border-line pt-7 sm:grid-cols-3">
            <div className="flex items-start gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-soft-brand text-brand">
                <Layers3 aria-hidden="true" className="h-4 w-4" />
              </span>
              <div>
                <dt className="text-sm font-semibold">แยก ปวช. / ปวส.</dt>
                <dd className="mt-1 text-xs leading-5 text-muted">เลือกเส้นทางที่เหมาะ</dd>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-soft-coral text-coral">
                <Code2 aria-hidden="true" className="h-4 w-4" />
              </span>
              <div>
                <dt className="text-sm font-semibold">อธิบายทุกบรรทัด</dt>
                <dd className="mt-1 text-xs leading-5 text-muted">เข้าใจโค้ดที่อ่าน</dd>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#edf7f3] text-[#287a5b]">
                <Check aria-hidden="true" className="h-4 w-4" />
              </span>
              <div>
                <dt className="text-sm font-semibold">ฝึกทำและทดลอง</dt>
                <dd className="mt-1 text-xs leading-5 text-muted">เรียนรู้จากการลงมือ</dd>
              </div>
            </div>
          </dl>
        </div>

        <aside
          aria-labelledby="learning-path-title"
          className="preview-shadow relative overflow-hidden rounded-[1.75rem] border border-white bg-surface p-6 sm:p-8"
        >
          <div
            aria-hidden="true"
            className="absolute -right-12 -top-12 h-36 w-36 rounded-full bg-coral/10 blur-2xl"
          />
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-ink text-surface">
                <Terminal aria-hidden="true" className="h-5 w-5" />
              </span>
              <div>
                <p className="text-[10px] font-semibold tracking-[0.18em] text-muted">
                  LEARNING PATH
                </p>
                <p className="mt-1 text-sm font-semibold">เส้นทางเรียนรู้</p>
              </div>
            </div>
            <span className="font-mono text-xs text-muted">
              01—{String(lessons.length).padStart(2, '0')}
            </span>
          </div>

          <h2
            id="learning-path-title"
            className="relative mt-8 text-2xl font-semibold leading-snug tracking-[-0.025em]"
          >
            จากหน้าจอ Login
            <br />
            สู่ระบบ Authentication
          </h2>

          <ol className="relative mt-8 space-y-6">
            {learningSteps.map((step, index) => (
              <li key={step.title} className="relative flex gap-4">
                {index < learningSteps.length - 1 && (
                  <span
                    aria-hidden="true"
                    className="absolute left-[17px] top-9 h-[calc(100%+0.25rem)] w-px bg-line"
                  />
                )}
                <span className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-line bg-canvas font-mono text-xs font-semibold text-brand">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <div className="pt-0.5">
                  <h3 className="text-sm font-semibold">{step.title}</h3>
                  <p className="mt-1 text-xs leading-5 text-muted">{step.detail}</p>
                </div>
              </li>
            ))}
          </ol>

          <div
            aria-hidden="true"
            className="mt-8 flex items-center justify-between rounded-xl bg-ink px-4 py-3.5 font-mono text-[11px] text-white/85"
          >
            <span>POST /api/register</span>
            <span className="flex items-center gap-1.5 text-emerald-300">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
              200 OK
            </span>
          </div>
        </aside>
      </section>

      <section
        aria-labelledby="overview-title"
        className="border-t border-line/80 bg-surface/60"
      >
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-[10px] font-semibold tracking-[0.2em] text-brand">
                COURSE OVERVIEW
              </p>
              <h2
                id="overview-title"
                className="mt-3 text-2xl font-semibold tracking-[-0.03em] sm:text-3xl"
              >
                เรียนรู้เป็นขั้นเรียน แล้วจึงลงมือสร้าง
              </h2>
            </div>
            <p className="font-mono text-xs text-muted">Concept → Practice → Demo</p>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {overviewCards.map((card) => {
              const Icon = card.icon;

              return (
                <article
                  key={card.title}
                  className="rounded-2xl border border-line bg-surface p-6 shadow-[0_10px_35px_-28px_rgba(23,34,59,0.45)] transition-transform duration-200 hover:-translate-y-1"
                >
                  <span
                    className={`flex h-11 w-11 items-center justify-center rounded-2xl ${card.tone}`}
                  >
                    <Icon aria-hidden="true" className="h-5 w-5" strokeWidth={1.8} />
                  </span>
                  <h3 className="mt-6 text-base font-semibold">{card.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-muted">{card.description}</p>
                  <span className="mt-6 inline-flex rounded-lg border border-line bg-canvas px-2.5 py-1.5 font-mono text-[11px] font-medium text-muted">
                    {card.tag}
                  </span>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section
        aria-labelledby="classroom-title"
        className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20"
      >
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="text-[10px] font-semibold tracking-[0.2em] text-brand">
              YOUR CLASSROOM
            </p>
            <h2
              id="classroom-title"
              className="mt-3 text-2xl font-semibold tracking-[-0.03em] sm:text-3xl"
            >
              ความคืบหน้าและเส้นทางของคุณ
            </h2>
            <p className="mt-2 text-sm text-muted">{trackNames[level]}</p>
          </div>
          <LevelSwitcher level={level} onChange={setLevel} />
        </div>

        <div className="mt-8 grid items-stretch gap-5 lg:grid-cols-[1.15fr_0.85fr]">
          <section
            aria-labelledby="progress-summary-title"
            className="rounded-[1.75rem] border border-line bg-surface p-6 shadow-[0_18px_50px_-38px_rgba(23,34,59,0.5)] sm:p-7"
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-[10px] font-semibold tracking-[0.18em] text-muted">
                  PROGRESS SUMMARY
                </p>
                <h3
                  id="progress-summary-title"
                  className="mt-2 text-xl font-semibold tracking-[-0.02em]"
                >
                  สรุปความคืบหน้า
                </h3>
              </div>
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-soft-brand text-brand">
                <BookMarked aria-hidden="true" className="h-5 w-5" strokeWidth={1.8} />
              </span>
            </div>

            <div className="mt-7">
              <ProgressBar lessons={lessons} completed={completed} />
            </div>

            <dl className="mt-7 grid grid-cols-2 gap-x-5 gap-y-6 border-t border-line pt-6 sm:grid-cols-4">
              <div>
                <dt className="text-xs text-muted">บทที่เสร็จแล้ว</dt>
                <dd className="mt-2 text-lg font-semibold text-ink">
                  {completedCount}/{lessons.length} บท
                </dd>
              </div>
              <div>
                <dt className="text-xs text-muted">ร้อยละของหลักสูตร</dt>
                <dd className="mt-2 text-lg font-semibold text-brand">{percentage}%</dd>
              </div>
              <div>
                <dt className="text-xs text-muted">เวลาที่เหลือโดยประมาณ</dt>
                <dd className="mt-2 text-lg font-semibold text-ink">
                  {remainingMinutes} นาที
                </dd>
                <p className="mt-1 text-[11px] text-muted">จากทั้งหมด {totalMinutes} นาที</p>
              </div>
              {quizScore !== undefined && (
                <div>
                  <dt className="text-xs text-muted">คะแนนแบบฝึกหัด</dt>
                  <dd className="mt-2 text-lg font-semibold text-ink">{quizScore}/5</dd>
                </div>
              )}
            </dl>
          </section>

          <ContinueCard lessons={lessons} />
        </div>

        <section aria-labelledby="course-map-title" className="mt-16 sm:mt-20">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <p className="text-[10px] font-semibold tracking-[0.2em] text-brand">
                COURSE MAP
              </p>
              <h2
                id="course-map-title"
                className="mt-3 text-2xl font-semibold tracking-[-0.03em] sm:text-3xl"
              >
                แผนภูมิหลักสูตร
              </h2>
              <p className="mt-2 text-sm leading-7 text-muted">
                เปิดบทเรียนตามลำดับ และทำเครื่องหมายความคืบหน้าเมื่อพร้อมไปต่อ
              </p>
            </div>
            <p className="font-mono text-xs text-muted">{lessons.length} lessons</p>
          </div>

          <ol
            id="course-map"
            tabIndex={-1}
            aria-label="ลำดับบทเรียนในหลักสูตร"
            className="relative mt-9 scroll-mt-28 space-y-4 before:absolute before:bottom-6 before:left-[19px] before:top-6 before:w-px before:bg-line focus:outline-none sm:before:left-[21px]"
          >
            {lessons.map((lesson) => (
              <LessonCard
                key={lesson.id}
                lesson={lesson}
                completed={completedIds.has(lesson.id)}
              />
            ))}
          </ol>
        </section>

        <aside
          aria-labelledby="reference-title"
          className="mt-12 rounded-2xl border border-line bg-surface/80 p-5 sm:flex sm:items-start sm:gap-4 sm:p-6"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-soft-coral text-coral">
            <BookMarked aria-hidden="true" className="h-5 w-5" strokeWidth={1.8} />
          </span>
          <div className="mt-4 sm:mt-0">
            <h2 id="reference-title" className="text-sm font-semibold text-ink">
              รากฐานการเรียนรู้และการแข่งขัน
            </h2>
            <p className="mt-2 text-sm leading-7 text-muted">
              อ้างอิง ACFROG 57 และ competition list 58 เป็นพื้นฐานสำหรับจัดรูปแบบการเรียนรู้และเลือกทักษะที่ควรฝึก
            </p>
            <p className="mt-1 text-sm leading-7 text-muted">
              หลักสูตรนี้เน้น Authentication และไม่แทนที่ระบบการแข่งขันทั้งหมด
            </p>
          </div>
        </aside>
      </section>
    </>
  );
}
