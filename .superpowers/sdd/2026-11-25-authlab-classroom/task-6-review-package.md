dacb646 1.1.2
ecdd3f7 1.1.1
 .../sdd/2026-11-25-authlab-classroom/ledger.md     |  13 +-
 .../2026-11-25-authlab-classroom/task-6-brief.md   | 120 ++++++++
 src/App.tsx                                        |  50 +---
 src/data/quizzes.ts                                | 136 +++++++++
 src/lib/quiz.test.ts                               |  93 ++++++
 src/lib/quiz.ts                                    |  24 ++
 src/pages/Dashboard.test.tsx                       |  85 ++++++
 src/pages/Dashboard.tsx                            |  34 ++-
 src/pages/PracticePage.test.tsx                    | 289 +++++++++++++++++++
 src/pages/PracticePage.tsx                         | 318 +++++++++++++++++++++
 10 files changed, 1111 insertions(+), 51 deletions(-)
diff --git a/.superpowers/sdd/2026-11-25-authlab-classroom/ledger.md b/.superpowers/sdd/2026-11-25-authlab-classroom/ledger.md
index 90e45b1..7b9beae 100644
--- a/.superpowers/sdd/2026-11-25-authlab-classroom/ledger.md
+++ b/.superpowers/sdd/2026-11-25-authlab-classroom/ledger.md
@@ -39,16 +39,23 @@
 - Task 5 review fix round 1: fixed Important findings for validation/error contrast, storage-removal failures, and concurrent cross-tab registration; regression coverage added with RED→GREEN evidence.
 - Task 5 repair verification: focused 31/31; full suite 120/120 across 12 files; typecheck and build passed. Fresh production preview confirmed #b42318 on #fff1ec at 5.96:1 contrast, Register → Logout → wrong-password → Login, 32-hex salt/64-hex hash, no plaintext password, and honest logout/reset errors under simulated blocked storage; no current console errors.
 - Task 5 scoped independent re-review: Spec PASS / Quality PASS; reviewer reran 120/120 tests, typecheck and build; all three Important repairs verified and no new/unresolved Critical or Important findings.
 - Task 5: minor (deferred): password checklist can show 5/5 while UTF-8 byte-length enforcement rejects a long Unicode password.
 - Task 5: minor (deferred): pending Demo operations lack an explicit busy/live announcement.
 - Task 5: minor (deferred): PBKDF2 tests do not independently pin SHA-256/120,000 iterations with a known-answer vector.
 - Task 5: minor (deferred): unavailable Web Crypto can surface a raw misleading error instead of the browser-support message.
 - Task 5: complete after independent repair re-review (no Git commits; Spec PASS / Quality PASS; 120/120 tests, typecheck, build and production-browser flows passed).
 - Task 12: implemented user-requested Light/Dark/System theme with pre-React bootstrap, `auth-classroom:theme:v1` persistence, live system-theme updates, browser/theme-color updates and semantic light/dark tokens. Fixed-dark code panes, inverse panels and solid action colors remain stable; theme-aware validation/success colors use dedicated tokens.
 - Task 12 regression coverage: RED→GREEN theme/bootstrap/toggle/token tests plus semantic-class checks across Dashboard, Demo, Lesson, AppShell, CodeExplorer, Callout and ContinueCard; temporarily restoring old fixed classes made the targeted assertions fail, then restoring semantic classes made them pass.
-- Task 12 verification: full suite 140/140 across 15 files passed in 81.66s; `npm run typecheck` passed; `npm run build` passed (1,628 modules; JS 621.33 kB / gzip 176.50 kB; CSS 45.62 kB / gzip 8.76 kB; non-blocking chunk-size warning).
-- Task 12 production-browser verification: default System, System→Light→Dark→System, saved preference after reload, and controlled OS dark/light changes all passed. Current production assets `index-Cy8A7h7D.js` and `index-BaKkPIri.css` loaded with no failed requests or console errors/warnings.
+- Task 12 verification: full suite 140/140 across 15 files passed in 81.66s; `npm run typecheck` passed; `npm run build` passed (1,628 modules; JS 621.33 kB / gzip 176.50 kB; non-blocking chunk-size warning).
+- Task 12 production-browser verification: default System, System→Light→Dark→System, saved preference after reload, and controlled OS dark/light changes all passed. Latest hashed JS/CSS assets loaded with no failed requests or console errors/warnings.
 - Task 12 responsive browser verification: same-origin iframes at 360/768/1440px showed no horizontal overflow or header-control overlap; 360px kept icon controls, 768px showed labels, 1440px kept the fixed 288px sidebar and hid the mobile start action.
 - Task 12 computed contrast: dark/light body 16.74/14.25:1, muted 9.13/5.06:1, code detail 15.29/15.67:1, inverse next link 15.81/15.81:1, brand button 6.29/6.29:1, success Callout 12.21/14.45:1, coral CTA 5.76/5.76:1 and inverse Continue panel 15.81/15.81:1. Focus outline remained 3px and reduced-motion CSS was present.
 - Task 12 limitation: screenshot capture was unavailable because the in-app browser exposed no visible viewport; visual/layout evidence came from DOM snapshots, computed styles, metrics and scripted interaction, not screenshots.
-- Task 12: independent read-only review pending; task is not yet marked complete and no Git commits or Vercel publication were created.
+- Task 12 independent read-only review: Spec PASS / Quality PASS; no Critical or Important findings. Reviewer independently ran focused theme tests 31/31, full suite 140/140 and typecheck successfully; production-browser checks confirmed saved Dark, 360px header fit, 1024/1280px sidebar-header fit and lowest checked text contrast 4.66:1.
+- Task 12: minor (deferred): explicit-choice test changes the simulated OS to the same theme and would not catch an implementation that always follows OS theme at src/components/ThemeToggle.test.tsx:74-91.
+- Task 12: minor (deferred): bootstrap tests omit saved Dark against a light OS, the key first-paint regression case at src/lib/theme.test.ts:88-121.
+- Task 12: minor (deferred): AppShell test asserts classes/visibility but jsdom cannot prove responsive geometry at 360/1024/1280px at src/components/AppShell.test.tsx:81-92; real-browser metrics were checked separately.
+- Task 12: complete after independent review (no Git commits; Spec PASS / Quality PASS; 140/140 tests, typecheck, build and production-browser flows passed). Vercel publication still requires explicit approval.
+- Task 6 preflight: `ProgressState.quizScores`, `recordQuiz`, Dashboard score display and the `/practice` placeholder already satisfy the required storage/route interfaces; no conflict with earlier tasks. Implement five-question track data, pure scoring, one-question UI, result/retry/review and course-map CTA.
+- Task 6: Ruling: External checkpoint commits `dc07d75` and `bceedea` appeared during Task 12 and advanced local/origin main; preserve them unchanged and use `bceedea` as Task 6 BASE — the assistant did not create or push commits, and rewriting external checkpoints would risk unrelated work — cost if wrong: Task 6 review diff may include checkpoint noise.
+- Current: Task 6 ready; manual brief/review workflow remains necessary because the installed subagent-driven-development skill contains only SKILL.md and no helper scripts/templates.
diff --git a/.superpowers/sdd/2026-11-25-authlab-classroom/task-6-brief.md b/.superpowers/sdd/2026-11-25-authlab-classroom/task-6-brief.md
new file mode 100644
index 0000000..8a3eed9
--- /dev/null
+++ b/.superpowers/sdd/2026-11-25-authlab-classroom/task-6-brief.md
@@ -0,0 +1,120 @@
+# Task 6 brief — Quiz, results และ progress completion
+
+Plan: `C:/Users/PTC/Documents/Qoder/2026-11-25/7643741e/docs/superpowers/plans/2026-11-25-authlab-classroom.md`
+Spec: approved short design in conversation (no separate design file): Thai classroom + Demo; separate certificate/diploma tracks; line explanations, quiz, localStorage progress and auth demo.
+
+## Global constraints (verbatim)
+
+- ภาษา UI และเนื้อหาหลักเป็นไทย; คำเทคนิคเก็บเป็นภาษาอังกฤษตามมาตรฐาน
+- เว็บ responsive บน desktop/tablet/mobile; รองรับ keyboard navigation และ focus state
+- บทเรียนปวช. มี 8 บท และปวส. มี 10 บท โดยสองบทสุดท้ายของปวส. เป็น Advanced
+- โค้ดตัวอย่างต้องมีคำอธิบายครบทุกบรรทัด รวมบรรทัดว่าง
+- ห้ามเก็บ plaintext password ใน Demo; ใช้ PBKDF2 + salt และแจ้งข้อจำกัดชัดเจน
+- Progress เก็บใน localStorage; session ของ Demo เก็บใน sessionStorage
+- โปรเจกต์ไม่มี git repository; ไม่สร้าง commit หรือ branch
+- ใช้ Node.js ที่มีในเครื่อง (v24.22.1) และไม่ติดตั้งซอฟต์แวร์ระบบ
+
+Ruling from existing ledger: the workspace is now a Git repository, but the approved plan still forbids new commits/branches; use the current working tree and baseline `bceedea843ae11760bf237bcf2120192eafaf9e2` for review packaging. External checkpoint commits `dc07d75` and `bceedea` appeared during Task 12; do not amend, reset or push them.
+
+## Required files
+
+- Create: `src/data/quizzes.ts`
+- Create: `src/lib/quiz.ts`
+- Create: `src/pages/PracticePage.tsx`
+- Create: `src/lib/quiz.test.ts`
+- Create: `src/pages/PracticePage.test.tsx`
+- Modify: `src/App.tsx`
+- Modify: `src/pages/Dashboard.tsx`
+- Modify/test as needed: `src/pages/Dashboard.test.tsx`
+
+## Existing interfaces to preserve
+
+- `Level = 'certificate' | 'diploma'`
+- `ProgressState.quizScores: Partial<Record<Level, number>>`
+- `useClassroomProgress()` returns `{ progress, level, setLevel, toggleLesson, visitLesson, recordQuiz, reset }`
+- `recordQuiz(level, score)` already updates shared progress, switches the active level, clamps to 0–5, and persists through `useProgress`.
+- Dashboard already renders `progress.quizScores[level]` when present.
+- `/practice` is currently a ComingNext placeholder inside `AppShell`.
+- Use existing semantic Tailwind tokens/classes, including dark-mode-safe `bg-brand-solid`, `text-on-inverse`, `bg-inverse`, `bg-soft-success`, `text-success`, `border-line`, `bg-surface`, `text-ink`, `text-muted`, `text-danger`, `bg-soft-coral`.
+
+## Task 6 interface decisions (implement exactly)
+
+```ts
+export interface QuizQuestion {
+  id: string;
+  prompt: string;
+  options: string[];
+  answer: number; // zero-based correct option index
+  explanation: string;
+}
+
+export const passingScore = 4;
+
+export function getQuizQuestions(level: Level): QuizQuestion[];
+export function scoreQuiz(level: Level, answers: readonly number[]): number;
+export function hasPassed(score: number): boolean;
+```
+
+- `quizzes` is exported as `Record<Level, QuizQuestion[]>`, with exactly 5 questions per level.
+- Every question has exactly 4 options, a unique ID within its track, a correct index in `0..3`, a Thai prompt and a useful Thai explanation.
+- Questions collectively cover HTTP status/method semantics, SQL safety/constraints, password hashing or JWT verification, server-side validation, and a track-specific concept. Diploma must include JWT middleware and Docker/CI/CD secrets/testing; certificate must include bcrypt and beginner flow/testing.
+- `scoreQuiz` throws `Error('คำตอบยังไม่ครบ')` when `answers.length !== 5`; otherwise it returns the number of answers equal to the corresponding question's correct index. Do not silently score incomplete input.
+- `hasPassed(score)` returns `score >= passingScore`.
+
+## PracticePage behavior
+
+- Replace the `/practice` placeholder with `PracticePage`; remove `ComingNext` and unused imports if no longer used.
+- Show a Thai page heading, active track name, five-question/pass-4-of-5 instructions, and the latest stored score for the active track when one exists.
+- One question at a time. Render a real `fieldset` + `legend` and radio inputs with visible labels. Show question progress such as `คำถามที่ 1 จาก 5`.
+- Selecting an answer locks the current options, immediately shows correct/incorrect feedback plus the question explanation, and enables a Next button. The final action says `ดูผลลัพธ์`.
+- On final submission, call `recordQuiz(level, score)` exactly once, then show score, pass/fail, and a review list containing every prompt, the user's answer, the correct answer and explanation. Passing means 4/5 or 5/5.
+- Result actions: `ทำแบบฝึกหัดใหม่` resets only the in-memory attempt, and `กลับไปยังแผนภูมิหลักสูตร` links to `/#course-map`.
+- Retry starts again at question 1 with no options selected; it must not erase the stored score before a new result is submitted.
+- Switching certificate/diploma while on `/practice` resets the visible attempt to the correct new track and never carries selected answers between tracks.
+- Move keyboard focus to the question heading after Next and to the result heading after final submission. Use a polite live region for answer feedback. Do not submit incomplete answers.
+- Use semantic theme-safe classes and responsive spacing consistent with existing pages.
+
+## Dashboard/course-map integration
+
+- In the course-map header/action area, add a visible link to `/practice` whose label/status reflects the active track:
+  - no stored score: `เริ่มแบบฝึกหัด`
+  - score below 4: `ทำแบบฝึกหัดใหม่` and show `คะแนน x/5`
+  - score at least 4: show a success-styled `ผ่านแล้ว x/5` status and keep a link to review/retry.
+- Keep the existing lesson count, progress calculations, track switching and dark-mode classes intact.
+- Do not change the meaning of lesson-completion percentage; quiz score remains separate.
+
+## TDD steps and required evidence
+
+1. Write `src/lib/quiz.test.ts` first. Cover: 5 questions per level; 4 options each; unique IDs; valid answer indices; Thai content; `scoreQuiz` all-correct = 5, mixed answers = expected exact score, all-wrong = 0; incomplete answers throw `คำตอบยังไม่ครบ`; `hasPassed(3) === false`, `hasPassed(4) === true`, `hasPassed(5) === true`.
+2. Write `src/pages/PracticePage.test.tsx` first. Use `renderApp()` with hash `#/practice` and real shared progress/localStorage. Cover:
+   - starts certificate at question 1 with no result and no score saved;
+   - correct answer locks radio options and shows explanation + Next;
+   - incorrect answer shows correct/incorrect feedback without advancing automatically;
+   - incomplete quiz cannot be submitted because no result action exists before all five answers;
+   - complete five answers, result shows exact score/pass state/review, and `readProgress().quizScores.certificate` is persisted;
+   - retry returns to question 1 and preserves the stored score;
+   - reload/remount restores the latest score;
+   - switching to diploma on `/practice` shows diploma question 1 and does not carry certificate answers/scores into diploma;
+   - final submit cannot record twice through repeated activation;
+   - result focus and question focus behavior;
+   - course-map link returns to dashboard.
+3. Add Dashboard tests for no-score CTA, failing score CTA/status, passing score success status, and preservation when switching tracks.
+4. Run the new tests before production implementation and capture the expected RED failure caused by missing modules/route behavior (not syntax/typo errors).
+5. Implement quiz data/helpers, PracticePage, route and Dashboard integration minimally.
+6. Run focused tests until GREEN; then run the full `npm test`, `npm run typecheck`, and `npm run build`. Read and report exact counts/results and any warnings.
+7. Exercise both tracks in a browser if a usable browser surface is available: answer all five, pass one track, fail/retry the other, verify persisted score on dashboard after navigation/reload, check mobile layout at 360px, console and network. If the browser surface is unavailable, state that limitation rather than claiming browser success.
+
+## Review focus carried from the plan
+
+- Repeated quiz submission must not record multiple results or cause repeated screen-reader announcements.
+- Track switching/refresh must preserve each track's stored score and never leak answers between tracks.
+- Incomplete answers must not submit.
+- Long Thai prompts/options must not overflow 360px.
+- Dark mode must remain readable for correct/incorrect/result states.
+
+## Report contract
+
+Write the full implementation report to:
+`C:/Users/PTC/Documents/Qoder/2026-11-25/7643741e/.superpowers/sdd/2026-11-25-authlab-classroom/task-6-report.md`
+
+Include: files changed, interface/behavior decisions, exact RED command/output summary, exact GREEN/full-suite/typecheck/build commands and results, browser evidence or limitation, self-review findings/fixes, and concerns. Do not create Git commits or branches. Do not dispatch subagents. Return only DONE / DONE_WITH_CONCERNS / NEEDS_CONTEXT / BLOCKED, no commit hash (none authorized), a one-line test summary, and concerns.
diff --git a/src/App.tsx b/src/App.tsx
index f1ecf8b..fbcdf82 100644
--- a/src/App.tsx
+++ b/src/App.tsx
@@ -1,71 +1,27 @@
-import { ArrowLeft, Construction } from 'lucide-react';
-import { HashRouter, Link, Navigate, Route, Routes } from 'react-router-dom';
+import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
 import { AppShell } from './components/AppShell';
 import { ProgressProvider } from './context/ProgressContext';
 import { Dashboard } from './pages/Dashboard';
 import { DemoPage } from './pages/DemoPage';
 import { LessonPage } from './pages/LessonPage';
-
-interface ComingNextProps {
-  title: string;
-  description: string;
-}
-
-function ComingNext({ title, description }: ComingNextProps) {
-  return (
-    <section className="mx-auto flex min-h-[70vh] max-w-3xl items-center px-5 py-16 sm:px-8">
-      <div className="w-full rounded-[1.75rem] border border-line bg-surface p-7 text-center shadow-[0_24px_70px_-45px_rgba(23,34,59,0.55)] sm:p-10">
-        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-soft-coral text-coral">
-          <Construction aria-hidden="true" className="h-6 w-6" strokeWidth={1.8} />
-        </span>
-        <p className="mt-6 text-[10px] font-semibold tracking-[0.2em] text-brand">
-          COMING NEXT
-        </p>
-        <h1 className="mt-3 text-3xl font-semibold tracking-[-0.035em] sm:text-4xl">
-          {title}
-        </h1>
-        <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-muted sm:text-base">
-          {description}
-        </p>
-        <p className="mt-4 text-sm leading-7 text-muted">
-          กำลังเตรียมพื้นที่ทดลองเพื่อเชื่อมต่อกับหลักสูตรในขั้นถัดไป
-        </p>
-        <Link
-          to="/#course-map"
-          className="mt-7 inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-line bg-canvas px-5 py-3 text-sm font-semibold text-ink transition-colors hover:border-brand/30 hover:text-brand"
-        >
-          <ArrowLeft aria-hidden="true" className="h-4 w-4" />
-          กลับไปยังแผนภูมิหลักสูตร
-        </Link>
-      </div>
-    </section>
-  );
-}
+import { PracticePage } from './pages/PracticePage';
 
 export function renderApp() {
   return (
     <HashRouter>
       <ProgressProvider>
         <Routes>
           <Route element={<AppShell />}>
             <Route index element={<Dashboard />} />
             <Route path="/lesson/:lessonId" element={<LessonPage />} />
-            <Route
-              path="/practice"
-              element={
-                <ComingNext
-                  title="ฝึกท้ายบทAuthentication"
-                  description="พื้นที่สำหรับแบบฝึกหัดและคำถามสรุปหลังเรียน เพื่อตรวจสอบความเข้าใจก่อนพัฒนาระบบ Authentication ของคุณ"
-                />
-              }
-            />
+            <Route path="/practice" element={<PracticePage />} />
             <Route path="/demo" element={<DemoPage />} />
             <Route path="*" element={<Navigate to="/" replace />} />
           </Route>
         </Routes>
       </ProgressProvider>
     </HashRouter>
   );
 }
 
 export default function App() {
diff --git a/src/data/quizzes.ts b/src/data/quizzes.ts
new file mode 100644
index 0000000..a7e44ef
--- /dev/null
+++ b/src/data/quizzes.ts
@@ -0,0 +1,136 @@
+import type { Level } from '../types/course';
+
+export interface QuizQuestion {
+  id: string;
+  prompt: string;
+  options: string[];
+  answer: number;
+  explanation: string;
+}
+
+export const quizzes: Record<Level, QuizQuestion[]> = {
+  certificate: [
+    {
+      id: 'cert-http-semantics',
+      prompt: 'คำขอ GET /api/users ที่อ่านข้อมูลผู้ใช้สำเร็จโดยไม่สร้างข้อมูลใหม่ ควรตอบ HTTP status code ใด?',
+      options: ['200 OK', '201 Created', '204 No Content', '404 Not Found'],
+      answer: 0,
+      explanation:
+        'GET ใช้เพื่ออ่านข้อมูลโดยไม่ควรเปลี่ยน state ของ server และคำขอที่สำเร็จสามารถตอบ 200 OK ส่วน 201 Created ใช้เมื่อสร้างทรัพยากรใหม่สำเร็จ',
+    },
+    {
+      id: 'cert-sql-safety',
+      prompt: 'วิธีใดป้องกัน SQL injection และไม่อนุญาตให้อีเมลผู้ใช้ซ้ำในตาราง users พร้อมกัน?',
+      options: [
+        'ต่อ string จาก input เข้า SQL และตรวจอีเมลเฉพาะที่ Frontend',
+        'ใช้ parameterized query และกำหนด UNIQUE constraint บนคอลัมน์ email',
+        'เข้ารหัสอีเมลด้วย Base64 แล้วนำไปใส่ใน SQL โดยไม่ตรวจซ้ำ',
+        'เก็บอีเมลทั้งหมดใน plaintext และลบข้อมูลซ้ำหลังจากบันทึก',
+      ],
+      answer: 1,
+      explanation:
+        'Parameterized query แยกค่าจากคำสั่ง SQL จึงป้องกัน SQL injection ส่วน UNIQUE constraint บังคับที่ระดับ database ให้อีเมลไม่ซ้ำแม้การตรวจจาก Frontend ถูกข้าม',
+    },
+    {
+      id: 'cert-bcrypt-password',
+      prompt: 'การเก็บและตรวจสอบ password สำหรับ Register และ Login ด้วย bcrypt ควรทำอย่างไร?',
+      options: [
+        'Hash password ด้วย salt ก่อนบันทึก และใช้ bcrypt.compare เมื่อ Login',
+        'เข้ารหัส password ด้วย Base64 แล้วเก็บไว้เป็น plaintext',
+        'เก็บ password เดิมเพื่อให้ Admin เปิดดูได้เมื่อผู้ใช้ลืม',
+        'ใช้ MD5 โดยไม่มี salt เพราะสร้าง hash ได้เร็วและสั้น',
+      ],
+      answer: 0,
+      explanation:
+        'bcrypt.hash สร้าง hash พร้อม salt และ bcrypt.compare ตรวจ password กับ hash ได้โดยไม่ต้องกู้คืนข้อความเดิม จึงห้ามเก็บ plaintext password',
+    },
+    {
+      id: 'cert-server-validation',
+      prompt: 'ทำไม Backend ต้องตรวจสอบข้อมูล (validation) อีกครั้ง ทั้งที่ Frontend ตรวจฟอร์มแล้ว?',
+      options: [
+        'เพื่อให้ Frontend ไม่ต้องแสดงข้อความ error ให้ผู้ใช้',
+        'เพราะข้อมูลจาก Frontend เป็นข้อมูลที่เชื่อถือได้เสมอ',
+        'เพราะ client-side validation สามารถถูกข้ามและ server ต้องเป็นแนวรบสุดท้าย',
+        'เพื่อเลี่ยงการกำหนด constraint ใน database',
+      ],
+      answer: 2,
+      explanation:
+        'ผู้ใช้สามารถข้าม Frontend หรือเรียก API โดยตรงได้ ดังนั้น server ต้องตรวจ input และ business rules ก่อนประมวลผล พร้อมคืน error ที่ปลอดภัยเมื่อข้อมูลไม่ถูกต้อง',
+    },
+    {
+      id: 'cert-flow-testing',
+      prompt: 'แบบฝึกหัดใดช่วยค้นหา bug ใน flow Register → Login ได้ดีที่สุดสำหรับผู้เริ่มต้น?',
+      options: [
+        'ทดสอบเฉพาะกรณีที่กรอกข้อมูลถูกต้องและสมัครสำเร็จครั้งเดียว',
+        'ทดสอบด้วยบัญชี production เพื่อให้ผลลัพธ์เหมือนผู้ใช้จริง',
+        'ทดสอบ happy path และ invalid inputs รวมถึง error handling ของ API',
+        'ข้ามการทดสอบ เพราะ validation ที่ Frontend รองรับทุกกรณีแล้ว',
+      ],
+      answer: 2,
+      explanation:
+        'Manual test cases ควรครอบคลุมทั้ง happy path และ invalid inputs เช่น อีเมลซ้ำ รหัสผ่านสั้น หรือข้อมูลไม่ครบ เพื่อยืนยันว่า flow และ error handling ทำงานตามคาด',
+    },
+  ],
+  diploma: [
+    {
+      id: 'dip-http-semantics',
+      prompt: 'คำขอ DELETE /api/users/:id ลบผู้ใช้สำเร็จและ server ไม่ส่ง response body ควรใช้ HTTP status code ใด?',
+      options: ['201 Created', '200 OK', '204 No Content', '401 Unauthorized'],
+      answer: 2,
+      explanation:
+        'DELETE ใช้เพื่อลบทรัพยากร และ 204 No Content เหมาะกับคำขอที่สำเร็จโดยไม่ต้องส่ง body กลับ ส่วน 201 Created บ่งชี้การสร้างทรัพยากรใหม่',
+    },
+    {
+      id: 'dip-sql-safety',
+      prompt: 'การ query ผู้ใช้จากอีเมลที่ผู้ใช้กรอกอย่างปลอดภัยและป้องกันข้อมูลซ้ำควรออกแบบอย่างไร?',
+      options: [
+        'นำ email มาต่อใน SQL string และปล่อยให้ database จัดการ error เอง',
+        'ใช้ parameterized query พร้อม UNIQUE constraint และจัดการ duplicate error',
+        'เข้ารหัส SQL string ทั้งหมดด้วย Base64 ก่อนส่งไปยัง MySQL',
+        'ใช้ SELECT * โดยไม่ตรวจ email เพื่อลดการทำงานของ server',
+      ],
+      answer: 1,
+      explanation:
+        'Parameterized query ป้องกัน SQL injection ส่วน UNIQUE constraint ป้องกันอีเมลซ้ำที่ระดับข้อมูล การจัดการ duplicate error อย่างชัดเจนช่วยให้ API ตอบกลับได้สม่ำเสมอ',
+    },
+    {
+      id: 'dip-jwt-middleware',
+      prompt: 'JWT middleware ควรตรวจสอบอะไรก่อนอนุญาตให้ request เข้า protected route?',
+      options: [
+        'ถอดรหัส JWT เพียงเพื่ออ่าน payload โดยไม่ตรวจ signature หรือ expiration',
+        'ตรวจ signature, expiration และสิทธิ์ จาก validated claims ก่อนส่งต่อไป controller',
+        'เชื่อว่า JWT ที่มี payload ผู้ใช้มาถึงแล้วมาจาก client ที่น่าเชื่อถือ',
+        'เก็บ JWT secret ไว้ใน repository เพื่อให้ทุก environment ใช้คีย์เดียวกัน',
+      ],
+      answer: 1,
+      explanation:
+        'JWT middleware ต้องตรวจ signature ด้วย secret ที่ปลอดภัยและตรวจ expiration พร้อม claims ที่จำเป็นก่อนใช้ข้อมูลผู้ใช้ การถอดรหัสอย่างเดียวไม่ยืนยันว่า token ถูกต้องหรือยังไม่หมดอายุ',
+    },
+    {
+      id: 'dip-server-validation',
+      prompt: 'เมื่อ API รับ JSON ที่รูปแบบถูกต้องแต่ email ว่างหรือ password ไม่ผ่าน policy ควรทำอย่างไร?',
+      options: [
+        'ยอมรับข้อมูลเพราะ JSON parse สำเร็จและบันทึกผู้ใช้ตามนั้น',
+        'ปล่อยให้ database ตัดตัวอักษรและแก้ค่าเองโดยไม่แจ้งผู้ใช้',
+        'ตรวจ validation ที่ server และคืน error เช่น 422 โดยไม่เปิดเผยรายละเอียดภายใน',
+        'เปลี่ยน error เป็น success เพื่อไม่ให้ client แสดง popup',
+      ],
+      answer: 2,
+      explanation:
+        'การ parse JSON ไม่ได้พิสูจน์ว่าข้อมูลผ่าน business rules server ต้องตรวจสอบ email, password และ fields ที่จำเป็น แล้วคืน error response ที่มีประโยชน์แต่ไม่รั่วข้อมูลภายใน',
+    },
+    {
+      id: 'dip-devops-security',
+      prompt: 'แบบ Docker และ CI/CD ที่ปลอดภัยสำหรับ Authentication ควรกำหนด pipeline อย่างไร?',
+      options: [
+        'Commit secrets ไว้ใน Dockerfile เพื่อให้ image ใช้งานได้ทุก environment',
+        'Deploy โดยตรงจากทุก commit โดยไม่รัน tests หรือตรวจสอบ build',
+        'รัน tests และตรวจสอบ build ก่อน deploy โดยฉีด secrets จากการจัดการ secrets แยกตาม environment',
+        'แยก secret แต่ log ค่าเต็มใน pipeline เพื่อให้ตรวจสอบปัญหาได้ง่าย',
+      ],
+      answer: 2,
+      explanation:
+        'CI/CD ควรรัน tests และตรวจสอบ build ก่อน deploy ส่วน secrets ต้องไม่ถูก commit หรือฝังใน Docker image และควรฉีดจากระบบจัดการ secrets แยกตาม environment โดยไม่ log ค่าจริง',
+    },
+  ],
+};
diff --git a/src/lib/quiz.test.ts b/src/lib/quiz.test.ts
new file mode 100644
index 0000000..733e03e
--- /dev/null
+++ b/src/lib/quiz.test.ts
@@ -0,0 +1,93 @@
+import { describe, expect, it } from 'vitest';
+import { quizzes } from '../data/quizzes';
+import type { Level } from '../types/course';
+import { getQuizQuestions, hasPassed, passingScore, scoreQuiz } from './quiz';
+
+const levels: Level[] = ['certificate', 'diploma'];
+const thaiCharacter = /[\u0E00-\u0E7F]/;
+
+describe('quiz data and helpers', () => {
+  it.each(levels)('provides five valid Thai questions for %s', (level) => {
+    const questions = quizzes[level];
+
+    expect(questions).toHaveLength(5);
+    expect(getQuizQuestions(level)).toEqual(questions);
+    expect(new Set(questions.map((question) => question.id)).size).toBe(5);
+
+    for (const question of questions) {
+      expect(question.id.trim()).not.toBe('');
+      expect(question.prompt).toMatch(thaiCharacter);
+      expect(question.explanation).toMatch(thaiCharacter);
+      expect(question.options).toHaveLength(4);
+      expect(Number.isInteger(question.answer)).toBe(true);
+      expect(question.answer).toBeGreaterThanOrEqual(0);
+      expect(question.answer).toBeLessThanOrEqual(3);
+
+      for (const option of question.options) {
+        expect(option.trim()).not.toBe('');
+      }
+    }
+  });
+
+  it('covers the required shared and track-specific concepts', () => {
+    const certificateText = quizzes.certificate
+      .flatMap((question) => [question.prompt, ...question.options, question.explanation])
+      .join(' ');
+    const diplomaText = quizzes.diploma
+      .flatMap((question) => [question.prompt, ...question.options, question.explanation])
+      .join(' ');
+
+    for (const content of [certificateText, diplomaText]) {
+      expect(content).toMatch(/HTTP/);
+      expect(content).toMatch(/GET|POST|PUT|DELETE/);
+      expect(content).toMatch(/200|201|204|404/);
+      expect(content).toMatch(/SQL|MySQL/);
+      expect(content).toMatch(/parameterized|UNIQUE/i);
+      expect(content).toMatch(/validation|ตรวจสอบข้อมูล/i);
+    }
+
+    expect(certificateText).toMatch(/bcrypt/);
+    expect(certificateText).toMatch(/Register|Login|flow|test|ทดสอบ/i);
+    expect(diplomaText).toMatch(/JWT middleware/);
+    expect(diplomaText).toMatch(/Docker/);
+    expect(diplomaText).toMatch(/CI\/CD/);
+    expect(diplomaText).toMatch(/secrets?/i);
+    expect(diplomaText).toMatch(/tests?|ทดสอบ/i);
+  });
+
+  it.each(levels)('scores all correct answers as five for %s', (level) => {
+    const answers = getQuizQuestions(level).map((question) => question.answer);
+
+    expect(scoreQuiz(level, answers)).toBe(5);
+  });
+
+  it('scores mixed certificate answers with the exact expected total', () => {
+    const correctAnswers = quizzes.certificate.map((question) => question.answer);
+    const mixedAnswers = correctAnswers.map((answer, index) =>
+      index === 0 || index === 3 ? (answer + 1) % 4 : answer,
+    );
+
+    expect(scoreQuiz('certificate', mixedAnswers)).toBe(3);
+  });
+
+  it.each(levels)('scores all wrong answers as zero for %s', (level) => {
+    const answers = getQuizQuestions(level).map((question) => (question.answer + 1) % 4);
+
+    expect(scoreQuiz(level, answers)).toBe(0);
+  });
+
+  it.each([
+    { answers: [] },
+    { answers: [0, 1, 2, 3] },
+    { answers: [0, 1, 2, 3, 4, 0] },
+  ])('rejects incomplete or oversized answer input %#', ({ answers }) => {
+    expect(() => scoreQuiz('certificate', answers)).toThrowError('คำตอบยังไม่ครบ');
+  });
+
+  it('uses four out of five as the passing score', () => {
+    expect(passingScore).toBe(4);
+    expect(hasPassed(3)).toBe(false);
+    expect(hasPassed(4)).toBe(true);
+    expect(hasPassed(5)).toBe(true);
+  });
+});
diff --git a/src/lib/quiz.ts b/src/lib/quiz.ts
new file mode 100644
index 0000000..b49e5a6
--- /dev/null
+++ b/src/lib/quiz.ts
@@ -0,0 +1,24 @@
+import { quizzes } from '../data/quizzes';
+import type { Level } from '../types/course';
+
+export const passingScore = 4;
+
+export function getQuizQuestions(level: Level) {
+  return quizzes[level];
+}
+
+export function scoreQuiz(level: Level, answers: readonly number[]): number {
+  if (answers.length !== 5) {
+    throw new Error('คำตอบยังไม่ครบ');
+  }
+
+  const questions = getQuizQuestions(level);
+  return answers.reduce(
+    (score, answer, index) => score + (answer === questions[index].answer ? 1 : 0),
+    0,
+  );
+}
+
+export function hasPassed(score: number): boolean {
+  return score >= passingScore;
+}
diff --git a/src/pages/Dashboard.test.tsx b/src/pages/Dashboard.test.tsx
index 96b0a4b..15a49cd 100644
--- a/src/pages/Dashboard.test.tsx
+++ b/src/pages/Dashboard.test.tsx
@@ -263,20 +263,105 @@ describe('Dashboard', () => {
   it('cites the supplied foundations without presenting invented sub-scores', () => {
     renderAt();
 
     expect(screen.getByText(/ACFROG\s*57/i)).toBeVisible();
     expect(screen.getByText(/competition list\s*58/i)).toBeVisible();
     expect(
       screen.getByText(/เน้น Authentication และไม่แทนที่ระบบการแข่งขันทั้งหมด/i),
     ).toBeVisible();
   });
 
+  it('shows a course-map quiz CTA for a track with no stored score', () => {
+    renderAt();
+    const map = screen.getByRole('region', { name: 'แผนภูมิหลักสูตร' });
+
+    expect(within(map).getByText('ประกาศนียบัตรวิชาชีพ (ปวช.)')).toBeVisible();
+    const link = within(map).getByRole('link', { name: 'เริ่มแบบฝึกหัด' });
+    expect(link).toHaveAttribute('href', '#/practice');
+    expect(link).toHaveClass('bg-brand-solid', 'text-on-inverse');
+    expect(within(map).queryByText(/คะแนน \d\/5/)).not.toBeInTheDocument();
+    expect(within(map).queryByText(/ผ่านแล้ว \d\/5/)).not.toBeInTheDocument();
+  });
+
+  it('shows a failing course-map quiz status and retry link', () => {
+    saveProgress({
+      version: 1,
+      level: 'certificate',
+      completed: { certificate: ['overview'], diploma: [] },
+      quizScores: { certificate: 2 },
+    });
+    renderAt();
+    const map = screen.getByRole('region', { name: 'แผนภูมิหลักสูตร' });
+
+    expect(within(map).getByText('คะแนน 2/5')).toBeVisible();
+    expect(within(map).getByRole('link', { name: 'ทำแบบฝึกหัดใหม่' })).toHaveAttribute(
+      'href',
+      '#/practice',
+    );
+    expect(within(map).queryByText('ผ่านแล้ว 2/5')).not.toBeInTheDocument();
+    expect(screen.getByRole('progressbar', { name: 'ความคืบหน้า' })).toHaveAttribute(
+      'aria-valuenow',
+      '13',
+    );
+  });
+
+  it('shows a success-styled course-map status and review link for a passing score', () => {
+    saveProgress({
+      version: 1,
+      level: 'certificate',
+      completed: { certificate: [], diploma: [] },
+      quizScores: { certificate: 5 },
+    });
+    renderAt();
+    const map = screen.getByRole('region', { name: 'แผนภูมิหลักสูตร' });
+
+    expect(within(map).getByText('ผ่านแล้ว 5/5')).toHaveClass('bg-soft-success', 'text-success');
+    expect(within(map).getByRole('link', { name: 'ทบทวนแบบฝึกหัด' })).toHaveAttribute(
+      'href',
+      '#/practice',
+    );
+  });
+
+  it('preserves course-map quiz status and scores when switching tracks', () => {
+    saveProgress({
+      version: 1,
+      level: 'certificate',
+      completed: { certificate: ['overview'], diploma: ['security'] },
+      quizScores: { certificate: 2, diploma: 4 },
+    });
+    renderAt();
+    let map = screen.getByRole('region', { name: 'แผนภูมิหลักสูตร' });
+    expect(within(map).getByText('คะแนน 2/5')).toBeVisible();
+
+    fireEvent.click(screen.getByRole('button', { name: 'ปวส.' }));
+
+    map = screen.getByRole('region', { name: 'แผนภูมิหลักสูตร' });
+    expect(within(map).getByText('ประกาศนียบัตรวิชาชีพชั้นสูง (ปวส.)')).toBeVisible();
+    expect(within(map).getByText('ผ่านแล้ว 4/5')).toHaveClass('bg-soft-success', 'text-success');
+    expect(within(map).getByRole('link', { name: 'ทบทวนแบบฝึกหัด' })).toBeVisible();
+    expect(screen.getByRole('progressbar', { name: 'ความคืบหน้า' })).toHaveAttribute(
+      'aria-valuenow',
+      '10',
+    );
+    expect(readProgress().quizScores).toEqual({ certificate: 2, diploma: 4 });
+    expect(readProgress().completed).toEqual({
+      certificate: ['overview'],
+      diploma: ['security'],
+    });
+
+    fireEvent.click(screen.getByRole('button', { name: 'ปวช.' }));
+
+    map = screen.getByRole('region', { name: 'แผนภูมิหลักสูตร' });
+    expect(within(map).getByText('คะแนน 2/5')).toBeVisible();
+    expect(within(map).getByRole('link', { name: 'ทำแบบฝึกหัดใหม่' })).toBeVisible();
+  });
+
   it('redirects an unknown route to the dashboard', async () => {
     renderAt('/not-a-route');
 
     await waitFor(() => {
       expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
         'Login และ Register',
       );
     });
     expect(window.location.hash).toBe('#/');
   });
diff --git a/src/pages/Dashboard.tsx b/src/pages/Dashboard.tsx
index 8a1191b..1ff8a68 100644
--- a/src/pages/Dashboard.tsx
+++ b/src/pages/Dashboard.tsx
@@ -1,28 +1,30 @@
 import {
   ArrowRight,
   BookMarked,
   Braces,
   Check,
+  ClipboardCheck,
   Code2,
   Database,
   Layers3,
   ShieldCheck,
   Terminal,
 } from 'lucide-react';
 import { Link } from 'react-router-dom';
 import { ContinueCard, getContinueSelection } from '../components/ContinueCard';
 import { LessonCard } from '../components/LessonCard';
 import { LevelSwitcher } from '../components/LevelSwitcher';
 import { ProgressBar } from '../components/ProgressBar';
 import { useClassroomProgress } from '../context/ProgressContext';
 import { getLessonsForLevel } from '../data/course';
+import { passingScore } from '../lib/quiz';
 
 const learningSteps = [
   { title: 'เข้าใจ Flow', detail: 'Login, Register และ Session' },
   { title: 'สร้าง Backend', detail: 'Express, API และ MySQL' },
   { title: 'เชื่อม Frontend', detail: 'หน้าจอและ Authentication ด้วย Vue 3' },
   { title: 'ตรวจสอบความปลอดภัย', detail: 'Validation, Password และ JWT' },
 ] as const;
 
 const overviewCards = [
   {
@@ -348,21 +350,51 @@ export function Dashboard() {
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
-            <p className="font-mono text-xs text-muted">{lessons.length} lessons</p>
+            <div className="flex flex-col items-start gap-3 sm:items-end">
+              <div className="flex flex-wrap items-center gap-3">
+                {quizScore !== undefined && (
+                  <p
+                    role="status"
+                    className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
+                      quizScore >= passingScore
+                        ? 'bg-soft-success text-success'
+                        : 'bg-soft-coral text-danger'
+                    }`}
+                  >
+                    {quizScore >= passingScore
+                      ? `ผ่านแล้ว ${quizScore}/5`
+                      : `คะแนน ${quizScore}/5`}
+                  </p>
+                )}
+                <Link
+                  to="/practice"
+                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-brand-solid px-4 py-2.5 text-sm font-semibold text-on-inverse transition-colors hover:bg-brand-solid-hover"
+                >
+                  <ClipboardCheck aria-hidden="true" className="h-4 w-4" />
+                  {quizScore === undefined
+                    ? 'เริ่มแบบฝึกหัด'
+                    : quizScore < passingScore
+                      ? 'ทำแบบฝึกหัดใหม่'
+                      : 'ทบทวนแบบฝึกหัด'}
+                </Link>
+              </div>
+              <p className="font-mono text-xs text-muted">{lessons.length} lessons</p>
+              <p className="text-xs text-muted">{trackNames[level]}</p>
+            </div>
           </div>
 
           <ol
             id="course-map"
             tabIndex={-1}
             aria-label="ลำดับบทเรียนในหลักสูตร"
             className="relative mt-9 scroll-mt-28 space-y-4 before:absolute before:bottom-6 before:left-[19px] before:top-6 before:w-px before:bg-line focus:outline-none sm:before:left-[21px]"
           >
             {lessons.map((lesson) => (
               <LessonCard
diff --git a/src/pages/PracticePage.test.tsx b/src/pages/PracticePage.test.tsx
new file mode 100644
index 0000000..1d343aa
--- /dev/null
+++ b/src/pages/PracticePage.test.tsx
@@ -0,0 +1,289 @@
+import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
+import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
+import { renderApp } from '../App';
+import { quizzes } from '../data/quizzes';
+import { readProgress, saveProgress } from '../lib/progress';
+import type { Level } from '../types/course';
+
+const PROGRESS_KEY = 'auth-classroom:progress:v1';
+const scrollIntoView = vi.fn();
+
+function renderPractice() {
+  window.location.hash = '#/practice';
+  return render(renderApp());
+}
+
+function selectAnswer(level: Level, questionIndex: number, optionIndex: number) {
+  const question = quizzes[level][questionIndex];
+  fireEvent.click(screen.getByRole('radio', { name: question.options[optionIndex] }));
+}
+
+function finishQuiz(level: Level, incorrectAt?: number) {
+  const questions = quizzes[level];
+  let finalAction: HTMLElement | undefined;
+
+  for (let index = 0; index < questions.length; index += 1) {
+    const question = questions[index];
+    const optionIndex = index === incorrectAt ? (question.answer + 1) % 4 : question.answer;
+    selectAnswer(level, index, optionIndex);
+    const action = screen.getByRole('button', {
+      name: index === questions.length - 1 ? 'ดูผลลัพธ์' : 'คำถามถัดไป',
+    });
+
+    if (index === questions.length - 1) {
+      finalAction = action;
+      break;
+    }
+
+    fireEvent.click(action);
+  }
+
+  if (!finalAction) {
+    throw new Error('The final quiz action was not rendered.');
+  }
+
+  return finalAction;
+}
+
+function resultRegion() {
+  const heading = screen.getByRole('heading', { name: 'ผลแบบฝึกหัด' });
+  const section = heading.closest('section');
+  if (!section) {
+    throw new Error('The quiz result section was not rendered.');
+  }
+  return within(section);
+}
+
+beforeEach(() => {
+  localStorage.clear();
+  window.location.hash = '#/practice';
+  scrollIntoView.mockClear();
+  Object.defineProperty(Element.prototype, 'scrollIntoView', {
+    configurable: true,
+    value: scrollIntoView,
+  });
+});
+
+afterEach(() => {
+  window.location.hash = '#/';
+  localStorage.clear();
+  scrollIntoView.mockClear();
+});
+
+describe('PracticePage', () => {
+  it('starts certificate at question one without a result or saved score', () => {
+    renderPractice();
+
+    expect(screen.getByRole('heading', { level: 1, name: 'ฝึกท้ายบทAuthentication' })).toBeVisible();
+    expect(screen.getByText('หลักสูตรปวช.')).toBeVisible();
+    expect(screen.getByText('คำถามที่ 1 จาก 5')).toBeVisible();
+    expect(screen.getByText(/ผ่านเมื่อคะแนนอย่างน้อย 4 จาก 5/)).toBeVisible();
+    expect(screen.getByRole('group', { name: 'ตัวเลือกคำตอบ' })).toBeVisible();
+    expect(screen.getAllByRole('radio')).toHaveLength(4);
+    for (const radio of screen.getAllByRole('radio')) {
+      expect(radio).not.toBeChecked();
+      expect(radio).toBeEnabled();
+    }
+    expect(screen.queryByRole('button', { name: 'คำถามถัดไป' })).not.toBeInTheDocument();
+    expect(screen.queryByRole('button', { name: 'ดูผลลัพธ์' })).not.toBeInTheDocument();
+    expect(screen.queryByRole('heading', { name: 'ผลแบบฝึกหัด' })).not.toBeInTheDocument();
+    expect(screen.queryByText(/คะแนนล่าสุด:/)).not.toBeInTheDocument();
+    expect(readProgress().quizScores.certificate).toBeUndefined();
+  });
+
+  it('locks a correct answer and immediately shows its explanation and Next action', () => {
+    renderPractice();
+    const question = quizzes.certificate[0];
+
+    selectAnswer('certificate', 0, question.answer);
+
+    expect(screen.getByRole('radio', { name: question.options[question.answer] })).toBeChecked();
+    for (const radio of screen.getAllByRole('radio')) {
+      expect(radio).toBeDisabled();
+    }
+    expect(screen.getByText('ตอบถูกต้อง')).toBeVisible();
+    expect(screen.getByText('ตอบถูกต้อง').closest('[aria-live="polite"]')).not.toBeNull();
+    expect(screen.getByText(question.explanation)).toBeVisible();
+    expect(screen.getByRole('button', { name: 'คำถามถัดไป' })).toBeEnabled();
+    expect(screen.getByText('คำถามที่ 1 จาก 5')).toBeVisible();
+  });
+
+  it('shows incorrect feedback without advancing automatically', () => {
+    renderPractice();
+    const question = quizzes.certificate[0];
+    const wrongAnswer = (question.answer + 1) % 4;
+
+    selectAnswer('certificate', 0, wrongAnswer);
+
+    expect(screen.getByText('ตอบยังไม่ถูกต้อง')).toBeVisible();
+    expect(screen.getByText(question.explanation)).toBeVisible();
+    expect(screen.getByText('คำถามที่ 1 จาก 5')).toBeVisible();
+    expect(screen.getByRole('button', { name: 'คำถามถัดไป' })).toBeEnabled();
+    expect(screen.queryByRole('heading', { name: quizzes.certificate[1].prompt })).not.toBeInTheDocument();
+  });
+
+  it('does not expose a result action before all five questions are answered', () => {
+    renderPractice();
+
+    for (let index = 0; index < 4; index += 1) {
+      selectAnswer('certificate', index, quizzes.certificate[index].answer);
+      fireEvent.click(screen.getByRole('button', { name: 'คำถามถัดไป' }));
+    }
+
+    expect(screen.getByText('คำถามที่ 5 จาก 5')).toBeVisible();
+    expect(screen.queryByRole('button', { name: 'ดูผลลัพธ์' })).not.toBeInTheDocument();
+    expect(screen.queryByRole('heading', { name: 'ผลแบบฝึกหัด' })).not.toBeInTheDocument();
+    expect(readProgress().quizScores.certificate).toBeUndefined();
+  });
+
+  it('shows the exact score, pass state and full review, then persists the score', async () => {
+    renderPractice();
+    const questions = quizzes.certificate;
+
+    fireEvent.click(finishQuiz('certificate', 0));
+
+    const result = resultRegion();
+    expect(result.getByText('4/5')).toBeVisible();
+    expect(result.getByText('ผ่านแล้ว')).toBeVisible();
+    const review = result.getByRole('list', { name: 'สรุปคำตอบและคำอธิบาย' });
+    const reviewItems = within(review).getAllByRole('listitem');
+    expect(reviewItems).toHaveLength(5);
+
+    questions.forEach((question, index) => {
+      const userAnswer = index === 0 ? (question.answer + 1) % 4 : question.answer;
+      expect(reviewItems[index]).toHaveTextContent(question.prompt);
+      expect(reviewItems[index]).toHaveTextContent(question.options[userAnswer]);
+      expect(reviewItems[index]).toHaveTextContent(question.options[question.answer]);
+      expect(reviewItems[index]).toHaveTextContent(question.explanation);
+    });
+
+    await waitFor(() => {
+      expect(readProgress().quizScores.certificate).toBe(4);
+    });
+  });
+
+  it('resets only the in-memory attempt on retry and preserves the stored score', async () => {
+    renderPractice();
+    fireEvent.click(finishQuiz('certificate'));
+    await waitFor(() => expect(readProgress().quizScores.certificate).toBe(5));
+
+    fireEvent.click(screen.getByRole('button', { name: 'ทำแบบฝึกหัดใหม่' }));
+
+    expect(screen.getByText('คำถามที่ 1 จาก 5')).toBeVisible();
+    expect(screen.queryByRole('heading', { name: 'ผลแบบฝึกหัด' })).not.toBeInTheDocument();
+    expect(screen.getByText('คะแนนล่าสุด: 5/5')).toBeVisible();
+    for (const radio of screen.getAllByRole('radio')) {
+      expect(radio).not.toBeChecked();
+      expect(radio).toBeEnabled();
+    }
+    expect(readProgress().quizScores.certificate).toBe(5);
+  });
+
+  it('restores the latest stored score after reload or remount', () => {
+    saveProgress({
+      version: 1,
+      level: 'certificate',
+      completed: { certificate: [], diploma: [] },
+      quizScores: { certificate: 4 },
+    });
+    const first = renderPractice();
+
+    expect(screen.getByText('คะแนนล่าสุด: 4/5')).toBeVisible();
+    first.unmount();
+    renderPractice();
+
+    expect(screen.getByText('คะแนนล่าสุด: 4/5')).toBeVisible();
+    expect(screen.getByText('คำถามที่ 1 จาก 5')).toBeVisible();
+    expect(screen.queryByRole('heading', { name: 'ผลแบบฝึกหัด' })).not.toBeInTheDocument();
+  });
+
+  it('resets the visible attempt when switching tracks without leaking answers or scores', () => {
+    saveProgress({
+      version: 1,
+      level: 'certificate',
+      completed: { certificate: ['overview'], diploma: ['security'] },
+      quizScores: { certificate: 4, diploma: 2 },
+    });
+    renderPractice();
+    selectAnswer('certificate', 0, quizzes.certificate[0].answer);
+    fireEvent.click(screen.getByRole('button', { name: 'คำถามถัดไป' }));
+    expect(screen.getByText('คำถามที่ 2 จาก 5')).toBeVisible();
+
+    fireEvent.click(screen.getByRole('button', { name: 'ปวส.' }));
+
+    expect(screen.getByText('หลักสูตรปวส.')).toBeVisible();
+    expect(screen.getByText('คำถามที่ 1 จาก 5')).toBeVisible();
+    expect(
+      screen.getByRole('heading', { level: 2, name: quizzes.diploma[0].prompt }),
+    ).toBeVisible();
+    expect(screen.getByText('คะแนนล่าสุด: 2/5')).toBeVisible();
+    for (const radio of screen.getAllByRole('radio')) {
+      expect(radio).not.toBeChecked();
+    }
+    expect(readProgress().quizScores).toEqual({ certificate: 4, diploma: 2 });
+
+    fireEvent.click(screen.getByRole('button', { name: 'ปวช.' }));
+
+    expect(screen.getByText('คำถามที่ 1 จาก 5')).toBeVisible();
+    expect(screen.getByText('คะแนนล่าสุด: 4/5')).toBeVisible();
+    for (const radio of screen.getAllByRole('radio')) {
+      expect(radio).not.toBeChecked();
+    }
+    expect(readProgress().quizScores).toEqual({ certificate: 4, diploma: 2 });
+  });
+
+  it('records only once when the final action is activated repeatedly', async () => {
+    renderPractice();
+    const finalAction = finishQuiz('certificate');
+    const setItem = vi.spyOn(Storage.prototype, 'setItem');
+    const progressWrites = () =>
+      setItem.mock.calls.filter(([key]) => key === PROGRESS_KEY);
+    const writesBefore = progressWrites().length;
+
+    act(() => {
+      fireEvent.click(finalAction);
+      fireEvent.click(finalAction);
+    });
+
+    await waitFor(() => expect(readProgress().quizScores.certificate).toBe(5));
+    expect(resultRegion().getByText('5/5')).toBeVisible();
+    expect(progressWrites()).toHaveLength(writesBefore + 1);
+  });
+
+  it('moves focus to each new question heading after Next', async () => {
+    renderPractice();
+    selectAnswer('certificate', 0, quizzes.certificate[0].answer);
+
+    fireEvent.click(screen.getByRole('button', { name: 'คำถามถัดไป' }));
+
+    await waitFor(() => {
+      expect(
+        screen.getByRole('heading', { level: 2, name: quizzes.certificate[1].prompt }),
+      ).toHaveFocus();
+    });
+  });
+
+  it('moves focus to the result heading after final submission', async () => {
+    renderPractice();
+
+    fireEvent.click(finishQuiz('certificate'));
+
+    await waitFor(() => {
+      expect(screen.getByRole('heading', { name: 'ผลแบบฝึกหัด' })).toHaveFocus();
+    });
+    expect(screen.queryByText('ตอบถูกต้อง')).not.toBeInTheDocument();
+  });
+
+  it('returns to the course map from the result actions', async () => {
+    renderPractice();
+    fireEvent.click(finishQuiz('certificate'));
+
+    fireEvent.click(screen.getByRole('link', { name: 'กลับไปยังแผนภูมิหลักสูตร' }));
+
+    await waitFor(() => {
+      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Login และ Register');
+      expect(document.getElementById('course-map')).toHaveFocus();
+    });
+    expect(window.location.hash).toBe('#/#course-map');
+  });
+});
diff --git a/src/pages/PracticePage.tsx b/src/pages/PracticePage.tsx
new file mode 100644
index 0000000..1003386
--- /dev/null
+++ b/src/pages/PracticePage.tsx
@@ -0,0 +1,318 @@
+import { ArrowLeft, ArrowRight, RotateCcw } from 'lucide-react';
+import { useEffect, useRef, useState } from 'react';
+import { Link } from 'react-router-dom';
+import { LevelSwitcher } from '../components/LevelSwitcher';
+import { useClassroomProgress } from '../context/ProgressContext';
+import { getQuizQuestions, hasPassed, scoreQuiz } from '../lib/quiz';
+import type { Level } from '../types/course';
+
+const trackNames: Record<Level, string> = {
+  certificate: 'หลักสูตรปวช.',
+  diploma: 'หลักสูตรปวส.',
+};
+
+interface PracticeAttemptProps {
+  level: Level;
+  recordQuiz: (level: Level, score: number) => void;
+}
+
+function PracticeAttempt({ level, recordQuiz }: PracticeAttemptProps) {
+  const questions = getQuizQuestions(level);
+  const [questionIndex, setQuestionIndex] = useState(0);
+  const [answers, setAnswers] = useState<number[]>([]);
+  const [result, setResult] = useState<number | null>(null);
+  const questionHeadingRef = useRef<HTMLHeadingElement>(null);
+  const resultHeadingRef = useRef<HTMLHeadingElement>(null);
+  const focusTargetRef = useRef<'question' | 'result' | null>(null);
+  const submittedRef = useRef(false);
+  const question = questions[questionIndex];
+  const selectedAnswer = answers[questionIndex];
+  const isLastQuestion = questionIndex === questions.length - 1;
+  const answered = selectedAnswer !== undefined;
+  const isCorrect = selectedAnswer === question.answer;
+
+  useEffect(() => {
+    if (focusTargetRef.current === 'question') {
+      questionHeadingRef.current?.focus();
+      focusTargetRef.current = null;
+    } else if (focusTargetRef.current === 'result' && result !== null) {
+      resultHeadingRef.current?.focus();
+      focusTargetRef.current = null;
+    }
+  }, [questionIndex, result]);
+
+  function selectAnswer(optionIndex: number) {
+    if (answered || submittedRef.current) return;
+
+    const nextAnswers = [...answers];
+    nextAnswers[questionIndex] = optionIndex;
+    setAnswers(nextAnswers);
+  }
+
+  function submitQuiz() {
+    if (
+      submittedRef.current ||
+      answers.length !== questions.length ||
+      answers.some((answer) => answer === undefined)
+    ) {
+      return;
+    }
+
+    const score = scoreQuiz(level, answers);
+    submittedRef.current = true;
+    focusTargetRef.current = 'result';
+    setResult(score);
+    recordQuiz(level, score);
+  }
+
+  function advance() {
+    if (!answered) return;
+
+    if (isLastQuestion) {
+      submitQuiz();
+      return;
+    }
+
+    focusTargetRef.current = 'question';
+    setQuestionIndex((current) => current + 1);
+  }
+
+  function retry() {
+    submittedRef.current = false;
+    focusTargetRef.current = 'question';
+    setAnswers([]);
+    setQuestionIndex(0);
+    setResult(null);
+  }
+
+  if (result !== null) {
+    const passed = hasPassed(result);
+
+    return (
+      <section
+        aria-labelledby="quiz-result-title"
+        className="mt-8 rounded-[1.75rem] border border-line bg-surface p-6 shadow-[0_20px_55px_-42px_rgba(23,34,59,0.55)] sm:p-8"
+      >
+        <div
+          className={`rounded-2xl border p-6 text-center sm:p-8 ${
+            passed
+              ? 'border-success-border bg-soft-success text-success'
+              : 'border-danger/30 bg-soft-coral text-danger'
+          }`}
+        >
+          <h2
+            id="quiz-result-title"
+            ref={resultHeadingRef}
+            tabIndex={-1}
+            className="text-2xl font-semibold tracking-[-0.03em] focus:outline-none sm:text-3xl"
+          >
+            ผลแบบฝึกหัด
+          </h2>
+          <p className="mt-5 text-sm font-medium">คะแนนของคุณ</p>
+          <p className="mt-1 text-5xl font-semibold tracking-[-0.05em]">{result}/5</p>
+          <p className="mt-4 text-lg font-semibold">{passed ? 'ผ่านแล้ว' : 'ยังไม่ผ่าน'}</p>
+          <p className="mt-2 text-sm leading-7">เกณฑ์ผ่านคือ 4 จาก 5 คะแนน</p>
+        </div>
+
+        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
+          <button
+            type="button"
+            onClick={retry}
+            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-brand-solid px-5 py-3 text-sm font-semibold text-on-inverse transition-colors hover:bg-brand-solid-hover"
+          >
+            <RotateCcw aria-hidden="true" className="h-4 w-4" />
+            ทำแบบฝึกหัดใหม่
+          </button>
+          <Link
+            to="/#course-map"
+            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-line bg-canvas px-5 py-3 text-sm font-semibold text-ink transition-colors hover:border-brand/30 hover:text-brand"
+          >
+            <ArrowLeft aria-hidden="true" className="h-4 w-4" />
+            กลับไปยังแผนภูมิหลักสูตร
+          </Link>
+        </div>
+
+        <div className="mt-9 border-t border-line pt-7">
+          <h2 className="text-xl font-semibold tracking-[-0.025em]">ทบทวนคำตอบ</h2>
+          <ol
+            aria-label="สรุปคำตอบและคำอธิบาย"
+            className="mt-5 space-y-4"
+          >
+            {questions.map((reviewQuestion, index) => {
+              const userAnswer = answers[index];
+
+              return (
+                <li
+                  key={reviewQuestion.id}
+                  className="min-w-0 rounded-2xl border border-line bg-canvas p-5"
+                >
+                  <h3 className="break-words text-base font-semibold leading-7">
+                    {index + 1}. {reviewQuestion.prompt}
+                  </h3>
+                  <p className="mt-4 break-words text-sm leading-7 text-muted">
+                    คำตอบของคุณ:{' '}
+                    <span className="font-medium text-ink">
+                      {reviewQuestion.options[userAnswer]}
+                    </span>
+                  </p>
+                  <p className="mt-1 break-words text-sm leading-7 text-muted">
+                    คำตอบที่ถูกต้อง:{' '}
+                    <span className="font-medium text-success">
+                      {reviewQuestion.options[reviewQuestion.answer]}
+                    </span>
+                  </p>
+                  <p className="mt-3 break-words text-sm leading-7 text-muted">
+                    คำอธิบาย: {reviewQuestion.explanation}
+                  </p>
+                </li>
+              );
+            })}
+          </ol>
+        </div>
+      </section>
+    );
+  }
+
+  return (
+    <section
+      aria-labelledby="quiz-question-title"
+      className="mt-8 rounded-[1.75rem] border border-line bg-surface p-6 shadow-[0_20px_55px_-42px_rgba(23,34,59,0.55)] sm:p-8"
+    >
+      <div className="flex flex-wrap items-center justify-between gap-3">
+        <p className="text-sm font-semibold text-brand">
+          คำถามที่ {questionIndex + 1} จาก {questions.length}
+        </p>
+        <p className="text-xs text-muted">{answered ? 'ตอบแล้ว' : 'เลือกคำตอบหนึ่งข้อ'}</p>
+      </div>
+      <div
+        aria-hidden="true"
+        className="mt-4 h-1.5 overflow-hidden rounded-full bg-line"
+      >
+        <div
+          className="h-full rounded-full bg-brand transition-[width]"
+          style={{ width: `${((questionIndex + 1) / questions.length) * 100}%` }}
+        />
+      </div>
+
+      <h2
+        id="quiz-question-title"
+        ref={questionHeadingRef}
+        tabIndex={-1}
+        className="mt-7 break-words text-xl font-semibold leading-8 tracking-[-0.025em] focus:outline-none sm:text-2xl"
+      >
+        {question.prompt}
+      </h2>
+
+      <fieldset
+        aria-describedby={answered ? 'quiz-answer-feedback' : undefined}
+        className="mt-6 min-w-0"
+      >
+        <legend className="sr-only">ตัวเลือกคำตอบ</legend>
+        <div className="grid gap-3">
+          {question.options.map((option, optionIndex) => {
+            const isSelected = selectedAnswer === optionIndex;
+            const showCorrect = answered && optionIndex === question.answer;
+            const showIncorrect = isSelected && !isCorrect;
+
+            return (
+              <label
+                key={option}
+                htmlFor={`${level}-${question.id}-${optionIndex}`}
+                className={`flex min-w-0 cursor-pointer items-start gap-3 rounded-xl border p-4 transition-colors ${
+                  showCorrect
+                    ? 'border-success-border bg-soft-success'
+                    : showIncorrect
+                      ? 'border-danger/40 bg-soft-coral'
+                      : 'border-line bg-canvas hover:border-brand/40'
+                } ${answered ? 'cursor-default' : ''}`}
+              >
+                <input
+                  id={`${level}-${question.id}-${optionIndex}`}
+                  type="radio"
+                  name={question.id}
+                  value={optionIndex}
+                  checked={isSelected}
+                  disabled={answered}
+                  onChange={() => selectAnswer(optionIndex)}
+                  className="mt-0.5 h-4 w-4 shrink-0 accent-brand"
+                />
+                <span className="min-w-0 break-words text-sm leading-7 text-ink">
+                  {option}
+                </span>
+              </label>
+            );
+          })}
+        </div>
+      </fieldset>
+
+      <div
+        id="quiz-answer-feedback"
+        aria-live="polite"
+        aria-atomic="true"
+        className="mt-5"
+      >
+        {answered && (
+          <div
+            className={`rounded-xl border p-4 ${
+              isCorrect
+                ? 'border-success-border bg-soft-success text-success'
+                : 'border-danger/30 bg-soft-coral text-danger'
+            }`}
+          >
+            <p className="text-sm font-semibold">
+              {isCorrect ? 'ตอบถูกต้อง' : 'ตอบยังไม่ถูกต้อง'}
+            </p>
+            <p className="mt-2 break-words text-sm leading-7 text-ink">
+              {question.explanation}
+            </p>
+          </div>
+        )}
+      </div>
+
+      {answered && (
+        <div className="mt-6 flex justify-end">
+          <button
+            type="button"
+            onClick={advance}
+            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-brand-solid px-5 py-3 text-sm font-semibold text-on-inverse transition-colors hover:bg-brand-solid-hover"
+          >
+            {isLastQuestion ? 'ดูผลลัพธ์' : 'คำถามถัดไป'}
+            <ArrowRight aria-hidden="true" className="h-4 w-4" />
+          </button>
+        </div>
+      )}
+    </section>
+  );
+}
+
+export function PracticePage() {
+  const { level, progress, setLevel, recordQuiz } = useClassroomProgress();
+  const latestScore = progress.quizScores[level];
+
+  return (
+    <div className="mx-auto max-w-4xl px-5 py-10 sm:px-8 sm:py-14">
+      <header className="rounded-[1.75rem] border border-line bg-surface p-6 shadow-[0_20px_55px_-42px_rgba(23,34,59,0.55)] sm:p-8">
+        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
+          <div className="min-w-0">
+            <p className="text-[10px] font-semibold tracking-[0.2em] text-brand">
+              KNOWLEDGE CHECK
+            </p>
+            <h1 className="mt-3 text-3xl font-semibold tracking-[-0.035em] sm:text-4xl">
+              ฝึกท้ายบทAuthentication
+            </h1>
+            <p className="mt-4 max-w-2xl text-sm leading-7 text-muted sm:text-base">
+              แบบฝึกหัดมี 5 คำถาม ต้องตอบให้ครบ และผ่านเมื่อคะแนนอย่างน้อย 4 จาก 5
+            </p>
+            <p className="mt-3 text-sm font-semibold text-ink">{trackNames[level]}</p>
+            {latestScore !== undefined && (
+              <p className="mt-2 text-sm text-muted">คะแนนล่าสุด: {latestScore}/5</p>
+            )}
+          </div>
+          <LevelSwitcher level={level} onChange={setLevel} />
+        </div>
+      </header>
+
+      <PracticeAttempt key={level} level={level} recordQuiz={recordQuiz} />
+    </div>
+  );
+}
