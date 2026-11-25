import { ArrowLeft, Construction } from 'lucide-react';
import { HashRouter, Link, Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from './components/AppShell';
import { ProgressProvider } from './context/ProgressContext';
import { Dashboard } from './pages/Dashboard';
import { LessonPage } from './pages/LessonPage';

interface ComingNextProps {
  title: string;
  description: string;
}

function ComingNext({ title, description }: ComingNextProps) {
  return (
    <section className="mx-auto flex min-h-[70vh] max-w-3xl items-center px-5 py-16 sm:px-8">
      <div className="w-full rounded-[1.75rem] border border-line bg-surface p-7 text-center shadow-[0_24px_70px_-45px_rgba(23,34,59,0.55)] sm:p-10">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-soft-coral text-coral">
          <Construction aria-hidden="true" className="h-6 w-6" strokeWidth={1.8} />
        </span>
        <p className="mt-6 text-[10px] font-semibold tracking-[0.2em] text-brand">
          COMING NEXT
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-[-0.035em] sm:text-4xl">
          {title}
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-muted sm:text-base">
          {description}
        </p>
        <p className="mt-4 text-sm leading-7 text-muted">
          กำลังเตรียมพื้นที่ทดลองเพื่อเชื่อมต่อกับหลักสูตรในขั้นถัดไป
        </p>
        <Link
          to="/#course-map"
          className="mt-7 inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-line bg-canvas px-5 py-3 text-sm font-semibold text-ink transition-colors hover:border-brand/30 hover:text-brand"
        >
          <ArrowLeft aria-hidden="true" className="h-4 w-4" />
          กลับไปยังแผนภูมิหลักสูตร
        </Link>
      </div>
    </section>
  );
}

export function renderApp() {
  return (
    <HashRouter>
      <ProgressProvider>
        <Routes>
          <Route element={<AppShell />}>
            <Route index element={<Dashboard />} />
            <Route path="/lesson/:lessonId" element={<LessonPage />} />
            <Route
              path="/practice"
              element={
                <ComingNext
                  title="ฝึกท้ายบทAuthentication"
                  description="พื้นที่สำหรับแบบฝึกหัดและคำถามสรุปหลังเรียน เพื่อตรวจสอบความเข้าใจก่อนพัฒนาระบบ Authentication ของคุณ"
                />
              }
            />
            <Route
              path="/demo"
              element={
                <ComingNext
                  title="Authentication Demo"
                  description="พื้นที่สำหรับทดลองการสมัครสมาชิก เข้าสู่ระบบ และดู flow ของ Authentication ในเบราว์เซอร์"
                />
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </ProgressProvider>
    </HashRouter>
  );
}

export default function App() {
  return renderApp();
}
