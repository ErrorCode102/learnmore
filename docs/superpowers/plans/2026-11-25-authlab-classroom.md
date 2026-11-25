# AuthLab Classroom Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** สร้างเว็บคลาสรูมภาษาไทยสำหรับสอน Login/Register แยก ปวช. และปวส. พร้อมคำอธิบายโค้ดทุกบรรทัด แบบฝึกหัด ความคืบหน้า และ Demo ที่ใช้งานได้จริงในเบราว์เซอร์

**Architecture:** เว็บเป็น React SPA ที่แยก UI components, เนื้อหาบทเรียนแบบ data-driven, logical services และ progress storage เนื้อหาสอน Node.js/Express/MySQL/Vue 3 ตามไฟล์ประกอบ แต่ไม่ผูก runtime ของเว็บกับฐานข้อมูลจริง Demo ใช้ Web Crypto และ storage ของเบราว์เซอร์ พร้อมคำเตือนเรื่อง production

**Tech Stack:** React, TypeScript, Vite, React Router (HashRouter), Tailwind CSS, Vitest, Testing Library, jsdom, lucide-react

**Spec:** Short design ที่อนุมัติในการสนทนาเมื่อ 2026-11-25: เว็บคลาสรูม + Demo; แยกปวช./ปวส.; เน้น Node.js + Express + MySQL + Vue 3; มี line explanations, quiz, localStorage progress และ auth demo

## Global Constraints

- ภาษา UI และเนื้อหาหลักเป็นไทย; คำเทคนิคเก็บเป็นภาษาอังกฤษตามมาตรฐาน
- เว็บ responsive บน desktop/tablet/mobile; รองรับ keyboard navigation และ focus state
- บทเรียนปวช. มี 8 บท และปวส. มี 10 บท โดยสองบทสุดท้ายของปวส. เป็น Advanced
- โค้ดตัวอย่างต้องมีคำอธิบายครบทุกบรรทัด รวมบรรทัดว่าง
- ห้ามเก็บ plaintext password ใน Demo; ใช้ PBKDF2 + salt และแจ้งข้อจำกัดชัดเจน
- Progress เก็บใน localStorage; session ของ Demo เก็บใน sessionStorage
- โปรเจกต์ไม่มี git repository; ไม่สร้าง commit หรือ branch
- ใช้ Node.js ที่มีในเครื่อง (v24.22.1) และไม่ติดตั้งซอฟต์แวร์ระบบ

## Review Focus

- รีเฟรชหรือเปิด track อื่นแล้ว progress หายหรือ level สลับผิด
- ข้อความยาวและ Windows path ในโค้ดทำให้ layout ล้นมือถือ
- Demo รับ username ซ้ำ case-insensitive หรือ password ไม่ผ่าน policy แต่ยังสมัครได้
- คำอธิบายบรรทัดเลื่อนไม่ตรงเลขบรรทัดเมื่อ copy/edit โค้ด
- ผู้ใช้กดส่ง quiz ซ้ำทำให้คะแนนเพิ่มหรือข้อความ screen reader อ่านซ้ำ

---

### Task 1: Foundation, test harness และ design tokens

**Files:**
- Create: `package.json`, `vite.config.ts`, `tsconfig.json`, `tsconfig.app.json`, `index.html`
- Create: `src/main.tsx`, `src/App.tsx`, `src/index.css`
- Test: `src/test/setup.ts`, `src/test/App.test.tsx`

**Interfaces:**
- Produces: `renderApp()` สำหรับ tests, CSS tokens `--ink`, `--muted`, `--brand`, `--surface`, Thai font stack

- [ ] สร้าง Vite React TypeScript project และติดตั้ง dependencies ที่ประกาศใน Tech Stack
- [ ] ตั้งค่า Vitest + Testing Library + jsdom และ Tailwind CSS v4
- [ ] เพิ่ม failing smoke test ว่าหน้าแรกแสดง `AuthLab` และปุ่มเริ่มเรียน
- [ ] สร้าง App shell พื้นฐานและ design tokens; ทำให้ test ผ่าน
- [ ] รัน `npm run build`, `npm run test`, `npm run typecheck`; ยืนยันไม่มี error

### Task 2: Course model, track selector และ progress store

**Files:**
- Create: `src/types/course.ts`
- Create: `src/data/course.ts`
- Create: `src/lib/progress.ts`
- Create: `src/components/LevelSwitcher.tsx`
- Create: `src/components/ProgressBar.tsx`
- Create: `src/hooks/useProgress.ts`
- Test: `src/lib/progress.test.ts`, `src/components/LevelSwitcher.test.tsx`

**Interfaces:**
- Produces: `Level = 'certificate' | 'diploma'`, `LessonSummary`, `LessonContent`, `ProgressState`
- Produces: `readProgress()`, `saveProgress(next)`, `toggleLesson(id, level)`, `recordQuiz(level, score)`, `resetProgress()`
- Produces: `useProgress()` คืน state, level, setLevel, toggleLesson, recordQuiz, reset

- [ ] เขียน failing tests สำหรับ default level, toggle idempotent, record quiz, corrupted JSON และ unknown lesson id
- [ ] รัน tests เพื่อยืนยัน fail จากฟังก์ชันที่ยังไม่มี
- [ ] สร้าง types, course summaries (8 certificate / 10 diploma), guarded localStorage helpers และ hook
- [ ] สร้าง LevelSwitcher ที่เปลี่ยน track โดยไม่ล้าง progress และ ProgressBar ที่คำนวณจาก lessons ของ level
- [ ] รัน unit tests และ typecheck; ยืนยัน test ผ่าน

### Task 3: Dashboard, course map และ lesson navigation

**Files:**
- Create: `src/components/AppShell.tsx`, `src/components/LessonCard.tsx`, `src/components/ContinueCard.tsx`
- Create: `src/pages/Dashboard.tsx`, `src/pages/LessonPage.tsx`
- Modify: `src/App.tsx`, `src/main.tsx`
- Test: `src/pages/Dashboard.test.tsx`, `src/pages/LessonPage.test.tsx`

**Interfaces:**
- Consumes: `useProgress()`, `Level`, `LessonSummary`
- Produces: routes `/`, `/lesson/:lessonId`, `/practice`, `/demo`; lesson map IDs `overview`, `installation`, `setup`, `database`, `backend`, `api`, `frontend`, `testing`, `security`, `devops`

- [ ] เพิ่ม failing tests: dashboard แสดง 8/10 บทตาม level, completed count ถูกต้อง, continue เปิดบทถัดไป, route ไม่รู้จัก redirect
- [ ] สร้าง AppShell พร้อม desktop sidebar/mobile nav และ HashRouter routes
- [ ] สร้าง dashboard hero, progress summary, lesson grid, criteria cards และ CTA
- [ ] สร้าง LessonPage header, outcomes, prev/next navigation และ layout สำหรับ sections จาก Task 4
- [ ] รัน tests, build และ typecheck; ตรวจ navigation ทั้งสอง level

### Task 4: Detailed Thai lesson content และ code explorer

**Files:**
- Create: `src/data/snippets/installation.ts`, `database.ts`, `backend.ts`, `frontend.ts`, `security.ts`, `devops.ts`
- Create: `src/data/lessons/certificate.ts`, `diploma.ts`
- Create: `src/components/CodeExplorer.tsx`, `src/components/Callout.tsx`, `src/components/CopyButton.tsx`
- Test: `src/data/lessons/content.test.ts`, `src/components/CodeExplorer.test.tsx`

**Interfaces:**
- Produces: `CodeSnippet { language, filename, code, notes }`, `LessonSection`, `LessonContent`
- Produces: `certificateLessons`, `diplomaLessons`, `getLesson(level, id)`

- [ ] เพิ่ม failing tests ทุก snippet มี notes ยาวเท่า code lines, ทุก lesson reference มี section และ ID ไม่ซ้ำ
- [ ] สร้างโครง content และ snippets จริง: ติดตั้ง Node/MySQL/HeidiSQL/VSCode, SQL users table, Express setup, bcrypt register/login, JWT auth middleware, Vue auth flow, validation/testing
- [ ] เพิ่ม security และ Docker/CI-CD sections เฉพาะ diploma; certificate ใช้คำอธิบาย concept และขั้นตอนทดสอบง่ายกว่า
- [ ] สร้าง CodeExplorer ที่แสดง line number, syntax-highlighted code, selected-line detail และ copy; mobile แสดง note ใต้โค้ด
- [ ] สร้าง Callout สำหรับหมายเหตุ/ข้อควรระวัง/เกณฑ์คะแนน โดยอ้างอิงข้อกำหนดไฟล์ประกอบโดยไม่คัดลอกข้อความที่อ่านไม่ชัด
- [ ] รัน tests และ typecheck; ตรวจ content coverage และ line notes

### Task 5: Working browser authentication demo

**Files:**
- Create: `src/lib/authDemo.ts`
- Create: `src/components/PasswordChecklist.tsx`
- Create: `src/pages/DemoPage.tsx`
- Test: `src/lib/authDemo.test.ts`, `src/pages/DemoPage.test.tsx`

**Interfaces:**
- Produces: `hashPassword(password, salt)`, `verifyPassword(password, stored)`, `registerUser(input)`, `loginUser(input)`, `readSession()`, `logout()`
- Produces: `DemoUser { id, name, email, salt, passwordHash, createdAt }`; ไม่มี plaintext password

- [ ] เพิ่ม failing tests: register สำyntib กรณีซ้ำ/อีเมลผิด/password อ่อน; verify ถูกและผิด; login ใช้ข้อความ error เดียวกัน; session อ่าน/ลบ
- [ ] เพิ่ม Web Crypto test polyfill เฉพาะ test หาก jsdom ไม่มี API
- [ ] สร้าง PBKDF2-SHA256 (120,000 iterations) พร้อม random salt, guarded localStorage/sessionStorage และ input normalization
- [ ] สร้าง DemoPage 2 modes, loading/error/success, password checklist, dashboard หลัง login, logout และ reset demo data พร้อม confirmation
- [ ] แสดงคำเตือนว่าการ Hash ใน client ไม่แทนที่ server และ Demo ไม่มี JWT จริง
- [ ] รัน tests, build และ typecheck; ทดลอง register → logout → login ใน browser

### Task 6: Quiz, results และ progress completion

**Files:**
- Create: `src/data/quizzes.ts`
- Create: `src/lib/quiz.ts`
- Create: `src/pages/PracticePage.tsx`
- Test: `src/lib/quiz.test.ts`, `src/pages/PracticePage.test.tsx`

**Interfaces:**
- Produces: `QuizQuestion { id, prompt, options, answer, explanation }`, `scoreQuiz(level, answers)`, `passingScore = 4`
- Consumes: `useProgress().recordQuiz`

- [ ] เพิ่ม failing tests: 5 คำถามต่อ level, correct index อยู่ในช่วง, score 0–5, ผ่านเมื่อ >=4, คำตอบไม่ครบไม่ submit
- [ ] สร้างชุดคำถาม 5 ข้อ/level ครอบคลุม HTTP, SQL, bcrypt/JWT, validation และ track-specific concept
- [ ] สร้าง PracticePage พร้อม one-question-at-a-time, progress, answer feedback, result, retry และ review
- [ ] เชื่อม score เข้า progress และอัปเดต dashboard/Course map
- [ ] รัน tests, build และ typecheck; ทดลอง quiz ทั้งสอง track

### Task 7: Responsive, accessibility และ final verification

**Files:**
- Modify: `src/index.css`, `src/components/*`, `src/pages/*` ตาม failing tests
- Test: `src/test/accessibility.test.tsx`

**Interfaces:**
- Produces: landmarks/headings/buttons/forms ที่ใช้งานด้วย keyboard และ screen reader

- [ ] เพิ่ม failing tests: ปุ่มมี accessible name, form inputs มี label, CodeExplorer selected line ประกาศผ่าน aria-live, Escape ปิด dialog
- [ ] แก้ layout ที่ล้นที่ 360/768/1440px, sticky sidebar/mobile nav, typography และ focus-visible
- [ ] ตรวจ color contrast และ reduced-motion; เพิ่ม skip link และ semantic landmarks
- [ ] รัน `npm run test`, `npm run build`, `npm run typecheck`
- [ ] เปิด dev server และใช้ browser ทดลอง: dashboard ทั้งสอง level, เปิดทุก lesson, copy code, คลิก line อธิบาย, demo register/login/duplicate/logout, quiz/pass/retry, progress หลัง refresh, mobile navigation
- [ ] ตรวจ console/network ไม่มี error และสรุปข้อจำกัดที่ยืนยันแล้ว
