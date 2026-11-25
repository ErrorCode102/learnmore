import {
  ArrowRight,
  BookOpen,
  Braces,
  Check,
  Code2,
  Database,
  Layers3,
  ShieldCheck,
  Terminal,
} from 'lucide-react';
import type { MouseEvent } from 'react';
import { HashRouter, Link } from 'react-router-dom';

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

function scrollToSection(id: string) {
  document.getElementById(id)?.scrollIntoView({ block: 'start' });
}

function skipToContent(event: MouseEvent<HTMLAnchorElement>) {
  event.preventDefault();

  const main = document.getElementById('main-content');
  main?.focus();
  main?.scrollIntoView({ block: 'start' });
}

function HomePage() {
  return (
    <div className="relative isolate min-h-screen overflow-x-hidden bg-canvas font-sans text-ink">
      <div
        aria-hidden="true"
        className="classroom-grid pointer-events-none absolute inset-x-0 top-0 -z-10 h-[680px] opacity-55"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-32 top-28 -z-10 h-96 w-96 rounded-full bg-brand/10 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-40 top-[34rem] -z-10 h-80 w-80 rounded-full bg-coral/10 blur-3xl"
      />

      <a
        href="#main-content"
        onClick={skipToContent}
        className="fixed left-4 top-4 z-50 -translate-y-24 rounded-xl bg-ink px-4 py-3 text-sm font-semibold text-surface shadow-xl transition-transform focus:translate-y-0"
      >
        ข้ามไปยังเนื้อหา
      </a>

      <header className="relative z-10 border-b border-line/80 bg-surface/75 backdrop-blur-xl">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 sm:px-8">
          <Link
            to="/"
            className="inline-flex items-center gap-3 rounded-xl"
            aria-label="AuthLab หน้าแรก"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-ink text-surface shadow-sm">
              <BookOpen aria-hidden="true" className="h-5 w-5" strokeWidth={1.8} />
            </span>
            <span className="text-xl font-bold tracking-[-0.03em]">AuthLab</span>
            <span className="hidden rounded-full border border-line px-2.5 py-1 text-[10px] font-semibold tracking-[0.16em] text-muted sm:inline">
              CLASSROOM
            </span>
          </Link>

          <div className="hidden items-center gap-2.5 text-xs font-medium text-muted md:flex">
            <span aria-hidden="true" className="h-2 w-2 rounded-full bg-coral" />
            เรียนรู้ แล้วลงมือทำ
          </div>
        </div>
      </header>

      <main id="main-content" tabIndex={-1} className="focus:outline-none">
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
              <button
                type="button"
                onClick={() => scrollToSection('learning-path')}
                className="group inline-flex min-h-12 items-center justify-center gap-3 rounded-xl bg-brand px-6 py-3 text-sm font-semibold text-white shadow-[0_14px_32px_-14px_rgba(79,70,229,0.8)] transition-colors hover:bg-brand-deep"
              >
                เริ่มเรียน
                <ArrowRight
                  aria-hidden="true"
                  className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                />
              </button>

              <span className="inline-flex items-center gap-2 text-sm text-muted">
                <ShieldCheck aria-hidden="true" className="h-4 w-4 text-[#287a5b]" />
                เน้นความเข้าใจ ไม่ใช่แค่ทำตาม
              </span>
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
              <span className="font-mono text-xs text-muted">01—10</span>
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
          id="learning-path"
          aria-labelledby="overview-title"
          className="scroll-mt-8 border-t border-line/80 bg-surface/60"
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
      </main>

      <footer className="border-t border-line bg-surface">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-5 py-7 text-xs text-muted sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <span className="font-semibold text-ink">AuthLab Classroom</span>
          <span>ห้องเรียน Authentication สำหรับนักศึกษา ปวช. และ ปวส.</span>
        </div>
      </footer>
    </div>
  );
}

export function renderApp() {
  return (
    <HashRouter>
      <HomePage />
    </HashRouter>
  );
}

export default function App() {
  return renderApp();
}
