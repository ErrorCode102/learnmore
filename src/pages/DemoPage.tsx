import { useState, type FormEvent } from 'react';
import {
  ArrowRight,
  CircleAlert,
  Database,
  KeyRound,
  LogOut,
  RotateCcw,
  ShieldCheck,
  Trash2,
  UserRound,
} from 'lucide-react';
import { PasswordChecklist } from '../components/PasswordChecklist';
import {
  loginUser,
  logout,
  readSession,
  registerUser,
  resetDemoData,
  type DemoSession,
} from '../lib/authDemo';

type DemoMode = 'register' | 'login';

const inputClassName =
  'mt-2 min-h-12 w-full rounded-xl border border-line bg-surface px-4 text-sm text-ink outline-none transition-colors placeholder:text-muted focus:border-brand';

export function DemoPage() {
  const [mode, setMode] = useState<DemoMode>('register');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [session, setSession] = useState<DemoSession | null>(() => readSession());

  function switchMode(nextMode: DemoMode) {
    setMode(nextMode);
    setPassword('');
    setError('');
    setSuccess('');
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) {
      return;
    }

    setBusy(true);
    setError('');
    setSuccess('');

    try {
      const nextSession =
        mode === 'register'
          ? await registerUser({ name, email, password })
          : await loginUser({ email, password });
      setSession(nextSession);
      setPassword('');
      setSuccess(mode === 'register' ? 'สร้างบัญชีและเข้าใช้งาน Demo สำเร็จ' : 'เข้าสู่ระบบสำเร็จ');
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'ไม่สามารถดำเนินการได้');
    } finally {
      setBusy(false);
    }
  }

  function handleLogout() {
    setError('');
    try {
      logout();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'ไม่สามารถออกจากระบบได้');
      return;
    }

    setSession(null);
    setPassword('');
    switchMode('login');
    setSuccess('ออกจากระบบแล้ว ผู้ใช้ Demo ยังคงอยู่สำหรับการเข้าสู่ระบบครั้งถัดไป');
  }

  function handleReset() {
    const confirmed = window.confirm(
      'ลบผู้ใช้ทดสอบทั้งหมดและ session ปัจจุบันจากเบราว์เซอร์นี้หรือไม่?',
    );
    if (!confirmed) {
      return;
    }

    try {
      resetDemoData();
    } catch (caught) {
      setSession(readSession());
      setError(caught instanceof Error ? caught.message : 'ไม่สามารถล้างข้อมูล Demo ได้');
      return;
    }

    setSession(null);
    setName('');
    setEmail('');
    setPassword('');
    setError('');
    setMode('register');
    setSuccess('ล้างข้อมูล Demo แล้ว พร้อมเริ่มทดลองใหม่');
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-10 sm:px-8 sm:py-14">
      <header className="max-w-3xl">
        <span className="inline-flex items-center gap-2 rounded-full border border-brand/15 bg-soft-brand px-3 py-1.5 text-xs font-semibold text-brand">
          <ShieldCheck aria-hidden="true" className="h-4 w-4" />
          LAB 04 · AUTHENTICATION
        </span>
        <h1 className="mt-5 text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">
          Authentication Demo
        </h1>
        <p className="mt-4 text-base leading-8 text-muted">
          สมัครสมาชิก ออกจากระบบ และเข้าสู่ระบบซ้ำ เพื่อดูว่า state ของหน้าเว็บเปลี่ยนอย่างไร
          โดยข้อมูลจะอยู่เฉพาะในเบราว์เซอร์เครื่องนี้
        </p>
      </header>

      <aside className="mt-8 rounded-2xl border border-coral/25 bg-soft-coral p-5 sm:flex sm:items-start sm:gap-4">
        <CircleAlert aria-hidden="true" className="h-6 w-6 shrink-0 text-coral" />
        <div>
          <h2 className="text-sm font-semibold text-ink">สำหรับการเรียนรู้ ไม่ใช่ระบบจริง</h2>
          <p className="mt-1.5 text-sm leading-7 text-muted">
            Demo นี้ไม่ใช่ production authentication รหัสผ่านถูก hash ด้วย PBKDF2 ในเบราว์เซอร์
            แต่ระบบจริงต้องตรวจสอบอีกครั้งบน server และ Demo นี้ไม่มี JWT จริงหรือการป้องกัน server
          </p>
        </div>
      </aside>

      {session ? (
        <section className="mt-8 overflow-hidden rounded-[1.75rem] border border-line bg-surface shadow-[0_24px_70px_-45px_rgba(23,34,59,0.55)]">
          <div className="border-b border-line bg-soft-brand/60 p-6 sm:p-8">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-solid text-on-inverse">
              <UserRound aria-hidden="true" className="h-6 w-6" />
            </span>
            <p className="mt-5 text-xs font-semibold tracking-[0.16em] text-brand">SESSION ACTIVE</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] sm:text-3xl">
              ทดลองใช้งานสำเร็จ
            </h2>
            <p className="mt-2 text-sm leading-7 text-muted">
              หน้านี้ถือว่าคุณเข้าสู่ระบบแล้ว เพราะ sessionStorage ยังมี session ที่อ่านได้
            </p>
          </div>

          <div className="grid gap-6 p-6 sm:p-8 lg:grid-cols-[1fr_auto] lg:items-end">
            <dl className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-line bg-canvas/60 p-4">
                <dt className="text-xs text-muted">ชื่อที่แสดง</dt>
                <dd className="mt-1.5 text-sm font-semibold text-ink">{session.name}</dd>
              </div>
              <div className="rounded-2xl border border-line bg-canvas/60 p-4">
                <dt className="text-xs text-muted">อีเมล</dt>
                <dd className="mt-1.5 break-all text-sm font-semibold text-ink">{session.email}</dd>
              </div>
            </dl>
            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-inverse px-5 py-3 text-sm font-semibold text-on-inverse transition-colors hover:bg-brand-solid-hover"
              >
                <LogOut aria-hidden="true" className="h-4 w-4" />
                ออกจากระบบ
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-line bg-surface px-5 py-3 text-sm font-semibold text-ink transition-colors hover:border-coral/40 hover:text-coral"
              >
                <Trash2 aria-hidden="true" className="h-4 w-4" />
                ล้างข้อมูล Demo
              </button>
            </div>
          </div>
          {error && (
            <div role="alert" className="flex items-start gap-2 border-t border-coral/25 bg-soft-coral px-6 py-4 text-sm text-danger sm:px-8">
              <CircleAlert aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
          {success && (
            <p role="status" className="border-t border-line bg-canvas/60 px-6 py-4 text-sm text-brand sm:px-8">
              {success}
            </p>
          )}
        </section>
      ) : (
        <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
          <section className="rounded-[1.75rem] border border-line bg-surface p-6 shadow-[0_24px_70px_-45px_rgba(23,34,59,0.55)] sm:p-8">
            <div className="grid grid-cols-2 rounded-xl border border-line bg-canvas p-1" aria-label="เลือกโหมด">
              <button
                type="button"
                onClick={() => switchMode('register')}
                aria-pressed={mode === 'register'}
                className={`min-h-11 rounded-lg px-3 text-sm font-semibold transition-colors ${
                  mode === 'register' ? 'bg-brand-solid text-on-inverse' : 'text-muted hover:text-ink'
                }`}
              >
                สมัครสมาชิก
              </button>
              <button
                type="button"
                onClick={() => switchMode('login')}
                aria-pressed={mode === 'login'}
                className={`min-h-11 rounded-lg px-3 text-sm font-semibold transition-colors ${
                  mode === 'login' ? 'bg-brand-solid text-on-inverse' : 'text-muted hover:text-ink'
                }`}
              >
                เข้าสู่ระบบ
              </button>
            </div>

            <div className="mt-6">
              <h2 className="text-2xl font-semibold tracking-[-0.03em]">
                {mode === 'register' ? 'สร้างบัญชีทดลอง' : 'กลับมาทดลองต่อ'}
              </h2>
              <p className="mt-2 text-sm leading-7 text-muted">
                {mode === 'register'
                  ? 'ใช้ข้อมูลสมมติได้ ไม่ควรใช้รหัสผ่านจริงที่คุณใช้อยู่ที่อื่น'
                  : 'ใช้อีเมลและรหัสผ่านที่สมัครไว้ใน Demo นี้'}
              </p>
            </div>

            <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
              {mode === 'register' && (
                <label className="block text-sm font-medium text-ink">
                  ชื่อที่แสดง
                  <input
                    className={inputClassName}
                    type="text"
                    autoComplete="name"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    minLength={2}
                    maxLength={80}
                    required
                    disabled={busy}
                  />
                </label>
              )}
              <label className="block text-sm font-medium text-ink">
                อีเมล
                <input
                  className={inputClassName}
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  maxLength={255}
                  required
                  disabled={busy}
                />
              </label>
              <label className="block text-sm font-medium text-ink">
                รหัสผ่าน
                <input
                  className={inputClassName}
                  type="password"
                  autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  minLength={8}
                  maxLength={72}
                  required
                  disabled={busy}
                />
              </label>

              {mode === 'register' && <PasswordChecklist password={password} />}

              {error && (
                <div role="alert" className="flex items-start gap-2 rounded-xl border border-coral/25 bg-soft-coral p-4 text-sm text-danger">
                  <CircleAlert aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}
              {success && (
                <p role="status" className="rounded-xl border border-brand/20 bg-soft-brand p-4 text-sm text-brand">
                  {success}
                </p>
              )}

              <button
                type="submit"
                disabled={busy}
                className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-brand-solid px-5 py-3 text-sm font-semibold text-on-inverse transition-colors hover:bg-brand-solid-hover disabled:cursor-wait disabled:opacity-60"
              >
                {busy ? (
                  <RotateCcw aria-hidden="true" className="h-4 w-4 animate-spin" />
                ) : (
                  <ArrowRight aria-hidden="true" className="h-4 w-4" />
                )}
                {busy
                  ? 'กำลังดำเนินการ...'
                  : mode === 'register'
                    ? 'สร้างบัญชี Demo'
                    : 'เข้าสู่ระบบเพื่อทดลอง'}
              </button>
            </form>
          </section>

          <aside className="space-y-5">
            <section className="rounded-[1.75rem] border border-line bg-inverse p-6 text-on-inverse sm:p-7">
              <KeyRound aria-hidden="true" className="h-6 w-6 text-accent" />
              <h2 className="mt-5 text-xl font-semibold">เกิดอะไรขึ้นเบื้องหลัง?</h2>
              <ol className="mt-5 space-y-5">
                {[
                  ['01', 'ตรวจสอบข้อมูล', 'ชื่อ อีเมล และนโยบายรหัสผ่านถูกตรวจก่อนบันทึก'],
                  ['02', 'Hash ด้วย salt', 'PBKDF2-SHA256 120,000 รอบ และ salt สุ่มต่อผู้ใช้'],
                  ['03', 'เก็บ demo users', 'localStorage เก็บ salt และ hash ไม่เก็บรหัสผ่านตรง'],
                  ['04', 'เปิด session', 'sessionStorage เก็บข้อมูลผู้ใช้ที่จำเป็นต่อ tab นี้'],
                ].map(([number, title, description]) => (
                  <li key={number} className="flex gap-4">
                    <span className="text-xs font-semibold text-accent">{number}</span>
                    <div>
                      <p className="text-sm font-semibold">{title}</p>
                      <p className="mt-1 text-xs leading-6 text-on-inverse/65">{description}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </section>
            <section className="rounded-2xl border border-line bg-surface p-5">
              <div className="flex items-start gap-3">
                <Database aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-brand" />
                <div>
                  <h2 className="text-sm font-semibold">ข้อมูลจะอยู่ที่ไหน?</h2>
                  <p className="mt-1.5 text-xs leading-6 text-muted">
                    ผู้ใช้ Demo อยู่ใน localStorage จึงกลับมาเข้าสู่ระบบได้ ส่วน session อยู่ใน
                    sessionStorage ดังนั้นการปิด tab จะออกจากระบบ แต่ผู้ใช้ยังอยู่
                  </p>
                </div>
              </div>
            </section>
          </aside>
        </div>
      )}
    </div>
  );
}
