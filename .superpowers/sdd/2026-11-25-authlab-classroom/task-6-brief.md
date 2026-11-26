# Task 6 brief — Quiz, results และ progress completion

Plan: `C:/Users/PTC/Documents/Qoder/2026-11-25/7643741e/docs/superpowers/plans/2026-11-25-authlab-classroom.md`
Spec: approved short design in conversation (no separate design file): Thai classroom + Demo; separate certificate/diploma tracks; line explanations, quiz, localStorage progress and auth demo.

## Global constraints (verbatim)

- ภาษา UI และเนื้อหาหลักเป็นไทย; คำเทคนิคเก็บเป็นภาษาอังกฤษตามมาตรฐาน
- เว็บ responsive บน desktop/tablet/mobile; รองรับ keyboard navigation และ focus state
- บทเรียนปวช. มี 8 บท และปวส. มี 10 บท โดยสองบทสุดท้ายของปวส. เป็น Advanced
- โค้ดตัวอย่างต้องมีคำอธิบายครบทุกบรรทัด รวมบรรทัดว่าง
- ห้ามเก็บ plaintext password ใน Demo; ใช้ PBKDF2 + salt และแจ้งข้อจำกัดชัดเจน
- Progress เก็บใน localStorage; session ของ Demo เก็บใน sessionStorage
- โปรเจกต์ไม่มี git repository; ไม่สร้าง commit หรือ branch
- ใช้ Node.js ที่มีในเครื่อง (v24.22.1) และไม่ติดตั้งซอฟต์แวร์ระบบ

Ruling from existing ledger: the workspace is now a Git repository, but the approved plan still forbids new commits/branches; use the current working tree and baseline `bceedea843ae11760bf237bcf2120192eafaf9e2` for review packaging. External checkpoint commits `dc07d75` and `bceedea` appeared during Task 12; do not amend, reset or push them.

## Required files

- Create: `src/data/quizzes.ts`
- Create: `src/lib/quiz.ts`
- Create: `src/pages/PracticePage.tsx`
- Create: `src/lib/quiz.test.ts`
- Create: `src/pages/PracticePage.test.tsx`
- Modify: `src/App.tsx`
- Modify: `src/pages/Dashboard.tsx`
- Modify/test as needed: `src/pages/Dashboard.test.tsx`

## Existing interfaces to preserve

- `Level = 'certificate' | 'diploma'`
- `ProgressState.quizScores: Partial<Record<Level, number>>`
- `useClassroomProgress()` returns `{ progress, level, setLevel, toggleLesson, visitLesson, recordQuiz, reset }`
- `recordQuiz(level, score)` already updates shared progress, switches the active level, clamps to 0–5, and persists through `useProgress`.
- Dashboard already renders `progress.quizScores[level]` when present.
- `/practice` is currently a ComingNext placeholder inside `AppShell`.
- Use existing semantic Tailwind tokens/classes, including dark-mode-safe `bg-brand-solid`, `text-on-inverse`, `bg-inverse`, `bg-soft-success`, `text-success`, `border-line`, `bg-surface`, `text-ink`, `text-muted`, `text-danger`, `bg-soft-coral`.

## Task 6 interface decisions (implement exactly)

```ts
export interface QuizQuestion {
  id: string;
  prompt: string;
  options: string[];
  answer: number; // zero-based correct option index
  explanation: string;
}

export const passingScore = 4;

export function getQuizQuestions(level: Level): QuizQuestion[];
export function scoreQuiz(level: Level, answers: readonly number[]): number;
export function hasPassed(score: number): boolean;
```

- `quizzes` is exported as `Record<Level, QuizQuestion[]>`, with exactly 5 questions per level.
- Every question has exactly 4 options, a unique ID within its track, a correct index in `0..3`, a Thai prompt and a useful Thai explanation.
- Questions collectively cover HTTP status/method semantics, SQL safety/constraints, password hashing or JWT verification, server-side validation, and a track-specific concept. Diploma must include JWT middleware and Docker/CI/CD secrets/testing; certificate must include bcrypt and beginner flow/testing.
- `scoreQuiz` throws `Error('คำตอบยังไม่ครบ')` when `answers.length !== 5`; otherwise it returns the number of answers equal to the corresponding question's correct index. Do not silently score incomplete input.
- `hasPassed(score)` returns `score >= passingScore`.

## PracticePage behavior

- Replace the `/practice` placeholder with `PracticePage`; remove `ComingNext` and unused imports if no longer used.
- Show a Thai page heading, active track name, five-question/pass-4-of-5 instructions, and the latest stored score for the active track when one exists.
- One question at a time. Render a real `fieldset` + `legend` and radio inputs with visible labels. Show question progress such as `คำถามที่ 1 จาก 5`.
- Selecting an answer locks the current options, immediately shows correct/incorrect feedback plus the question explanation, and enables a Next button. The final action says `ดูผลลัพธ์`.
- On final submission, call `recordQuiz(level, score)` exactly once, then show score, pass/fail, and a review list containing every prompt, the user's answer, the correct answer and explanation. Passing means 4/5 or 5/5.
- Result actions: `ทำแบบฝึกหัดใหม่` resets only the in-memory attempt, and `กลับไปยังแผนภูมิหลักสูตร` links to `/#course-map`.
- Retry starts again at question 1 with no options selected; it must not erase the stored score before a new result is submitted.
- Switching certificate/diploma while on `/practice` resets the visible attempt to the correct new track and never carries selected answers between tracks.
- Move keyboard focus to the question heading after Next and to the result heading after final submission. Use a polite live region for answer feedback. Do not submit incomplete answers.
- Use semantic theme-safe classes and responsive spacing consistent with existing pages.

## Dashboard/course-map integration

- In the course-map header/action area, add a visible link to `/practice` whose label/status reflects the active track:
  - no stored score: `เริ่มแบบฝึกหัด`
  - score below 4: `ทำแบบฝึกหัดใหม่` and show `คะแนน x/5`
  - score at least 4: show a success-styled `ผ่านแล้ว x/5` status and keep a link to review/retry.
- Keep the existing lesson count, progress calculations, track switching and dark-mode classes intact.
- Do not change the meaning of lesson-completion percentage; quiz score remains separate.

## TDD steps and required evidence

1. Write `src/lib/quiz.test.ts` first. Cover: 5 questions per level; 4 options each; unique IDs; valid answer indices; Thai content; `scoreQuiz` all-correct = 5, mixed answers = expected exact score, all-wrong = 0; incomplete answers throw `คำตอบยังไม่ครบ`; `hasPassed(3) === false`, `hasPassed(4) === true`, `hasPassed(5) === true`.
2. Write `src/pages/PracticePage.test.tsx` first. Use `renderApp()` with hash `#/practice` and real shared progress/localStorage. Cover:
   - starts certificate at question 1 with no result and no score saved;
   - correct answer locks radio options and shows explanation + Next;
   - incorrect answer shows correct/incorrect feedback without advancing automatically;
   - incomplete quiz cannot be submitted because no result action exists before all five answers;
   - complete five answers, result shows exact score/pass state/review, and `readProgress().quizScores.certificate` is persisted;
   - retry returns to question 1 and preserves the stored score;
   - reload/remount restores the latest score;
   - switching to diploma on `/practice` shows diploma question 1 and does not carry certificate answers/scores into diploma;
   - final submit cannot record twice through repeated activation;
   - result focus and question focus behavior;
   - course-map link returns to dashboard.
3. Add Dashboard tests for no-score CTA, failing score CTA/status, passing score success status, and preservation when switching tracks.
4. Run the new tests before production implementation and capture the expected RED failure caused by missing modules/route behavior (not syntax/typo errors).
5. Implement quiz data/helpers, PracticePage, route and Dashboard integration minimally.
6. Run focused tests until GREEN; then run the full `npm test`, `npm run typecheck`, and `npm run build`. Read and report exact counts/results and any warnings.
7. Exercise both tracks in a browser if a usable browser surface is available: answer all five, pass one track, fail/retry the other, verify persisted score on dashboard after navigation/reload, check mobile layout at 360px, console and network. If the browser surface is unavailable, state that limitation rather than claiming browser success.

## Review focus carried from the plan

- Repeated quiz submission must not record multiple results or cause repeated screen-reader announcements.
- Track switching/refresh must preserve each track's stored score and never leak answers between tracks.
- Incomplete answers must not submit.
- Long Thai prompts/options must not overflow 360px.
- Dark mode must remain readable for correct/incorrect/result states.

## Report contract

Write the full implementation report to:
`C:/Users/PTC/Documents/Qoder/2026-11-25/7643741e/.superpowers/sdd/2026-11-25-authlab-classroom/task-6-report.md`

Include: files changed, interface/behavior decisions, exact RED command/output summary, exact GREEN/full-suite/typecheck/build commands and results, browser evidence or limitation, self-review findings/fixes, and concerns. Do not create Git commits or branches. Do not dispatch subagents. Return only DONE / DONE_WITH_CONCERNS / NEEDS_CONTEXT / BLOCKED, no commit hash (none authorized), a one-line test summary, and concerns.
