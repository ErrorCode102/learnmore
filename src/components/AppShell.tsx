import {
  ArrowRight,
  BookOpen,
  ClipboardCheck,
  LayoutDashboard,
  ShieldCheck,
} from 'lucide-react';
import { useEffect, type MouseEvent } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { getContinueSelection } from './ContinueCard';
import { useClassroomProgress } from '../context/ProgressContext';
import { getLessonsForLevel } from '../data/course';
import type { Level } from '../types/course';

const navigation = [
  { to: '/', label: 'หน้าหลัก', icon: LayoutDashboard },
  { to: '/practice', label: 'ฝึกท้ายบท', icon: ClipboardCheck },
  { to: '/demo', label: 'Authentication Demo', icon: ShieldCheck },
] as const;

const levelLabels: Record<Level, string> = {
  certificate: 'ปวช.',
  diploma: 'ปวส.',
};

function skipToContent(event: MouseEvent<HTMLAnchorElement>) {
  event.preventDefault();

  const main = document.getElementById('main-content');
  main?.focus();
  main?.scrollIntoView({ block: 'start' });
}

export function AppShell() {
  const { level, progress } = useClassroomProgress();
  const location = useLocation();
  const navigate = useNavigate();
  const lessons = getLessonsForLevel(level);
  const completedCount = progress.completed[level].length;
  const continueSelection = getContinueSelection(lessons, progress.completed[level]);

  useEffect(() => {
    const target =
      location.hash === '#course-map'
        ? document.getElementById('course-map')
        : document.getElementById('main-content');

    if (location.hash === '#course-map') {
      target?.scrollIntoView({ block: 'start' });
    } else {
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
    target?.focus({ preventScroll: true });
  }, [location.key, location.pathname, location.hash]);

  return (
    <div className="relative isolate min-h-screen overflow-x-clip bg-canvas font-sans text-ink">
      <div
        aria-hidden="true"
        className="classroom-grid pointer-events-none absolute inset-x-0 top-0 -z-10 h-[680px] opacity-55"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-32 top-28 -z-10 h-96 w-96 rounded-full bg-brand/10 blur-3xl"
      />

      <a
        href="#main-content"
        onClick={skipToContent}
        className="fixed left-4 top-4 z-50 -translate-y-24 rounded-xl bg-ink px-4 py-3 text-sm font-semibold text-surface shadow-xl transition-transform focus:translate-y-0"
      >
        ข้ามไปยังเนื้อหา
      </a>

      <aside className="sticky top-0 z-40 border-b border-line/80 bg-surface/95 backdrop-blur-xl lg:fixed lg:inset-y-0 lg:left-0 lg:flex lg:h-screen lg:w-72 lg:flex-col lg:border-b-0 lg:border-r">
        <div className="flex h-20 shrink-0 items-center justify-between gap-3 border-b border-line/80 px-5 sm:px-6">
          <Link
            to="/"
            className="inline-flex min-w-0 items-center gap-3 rounded-xl"
            aria-label="AuthLab หน้าแรก"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-ink text-surface shadow-sm">
              <BookOpen aria-hidden="true" className="h-5 w-5" strokeWidth={1.8} />
            </span>
            <span className="text-xl font-bold tracking-[-0.03em]">AuthLab</span>
            <span className="hidden rounded-full border border-line px-2.5 py-1 text-[10px] font-semibold tracking-[0.16em] text-muted sm:inline">
              CLASSROOM
            </span>
          </Link>

          {continueSelection && (
            <button
              type="button"
              onClick={() => navigate(`/lesson/${continueSelection.lesson.id}`)}
              className="inline-flex min-h-10 shrink-0 items-center gap-2 rounded-xl bg-brand px-3.5 text-xs font-semibold text-white transition-colors hover:bg-brand-deep lg:hidden"
            >
              เริ่มเรียน
              <ArrowRight aria-hidden="true" className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <nav
          aria-label="นำทางหลัก"
          className="flex gap-2 overflow-x-auto border-b border-line/80 p-3 sm:px-5 lg:shrink-0 lg:flex-col lg:overflow-visible lg:border-b-0 lg:px-4 lg:py-6"
        >
          {navigation.map((item) => {
            const Icon = item.icon;
            const active =
              item.to === '/'
                ? location.pathname === '/' || location.pathname.startsWith('/lesson/')
                : location.pathname.startsWith(item.to);

            return (
              <Link
                key={item.to}
                to={item.to}
                aria-current={active ? 'page' : undefined}
                className={`inline-flex min-h-11 shrink-0 items-center gap-3 rounded-xl px-3.5 text-sm font-medium transition-colors lg:w-full ${
                  active
                    ? 'bg-soft-brand font-semibold text-brand'
                    : 'text-muted hover:bg-canvas hover:text-ink'
                }`}
              >
                <Icon aria-hidden="true" className="h-4 w-4" strokeWidth={1.8} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden min-h-0 flex-1 flex-col lg:flex">
          <div className="mx-5 mt-2 rounded-2xl border border-line bg-canvas p-4">
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs font-semibold text-ink">เส้นทางปัจจุบัน</span>
              <span className="rounded-full bg-surface px-2.5 py-1 font-mono text-[11px] font-semibold text-brand">
                {levelLabels[level]}
              </span>
            </div>
            <p className="mt-4 text-xs leading-6 text-muted">
              เสร็จแล้ว {completedCount} จาก {lessons.length} บท
            </p>
            <div
              aria-hidden="true"
              className="mt-3 h-1.5 overflow-hidden rounded-full bg-line"
            >
              <div
                className="h-full rounded-full bg-brand"
                style={{
                  width: `${Math.round((completedCount / lessons.length) * 100)}%`,
                }}
              />
            </div>
          </div>

          <div className="mx-5 mt-auto mb-6 hidden items-center gap-2.5 text-xs font-medium text-muted lg:flex">
            <span aria-hidden="true" className="h-2 w-2 rounded-full bg-coral" />
            เรียนรู้ แล้วลงมือทำ
          </div>
        </div>
      </aside>

      <div className="lg:pl-72">
        <main id="main-content" tabIndex={-1} className="focus:outline-none">
          <Outlet />
        </main>

        <footer className="border-t border-line bg-surface">
          <div className="mx-auto flex max-w-7xl flex-col gap-2 px-5 py-7 text-xs text-muted sm:flex-row sm:items-center sm:justify-between sm:px-8">
            <span className="font-semibold text-ink">AuthLab Classroom</span>
            <span>ห้องเรียน Authentication สำหรับนักศึกษา ปวช. และ ปวส.</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
