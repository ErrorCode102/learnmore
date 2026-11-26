# Task 6 Independent Read-Only Review

## Verdicts

- **Spec PASS**
- **Quality PASS**
- **Blocking concerns:** None.

## Scope and evidence

- Reviewed committed implementation `dacb646` against baseline `bceedea`.
- Read the brief, committed diff package, plan/spec context, actual source, and actual tests.
- Did not edit implementation files, create commits/branches, dispatch subagents, or rerun `npm test`, `npm run typecheck`, or `npm run build`.
- Controller-supplied verification, used only as supplied evidence: `npm test` = **168/168 across 17 files**; `npm run typecheck` = **exit 0**; `npm run build` = **exit 0** with a non-blocking **638.41 kB** chunk warning.
- Independently inspected the existing production `dist` in headless Chrome at a 360px viewport. This checked real layout metrics, computed theme colors/contrast, answer/result focus, repeated final activation, track switching, and true reload persistence. Actual screen-reader speech cannot be observed in headless Chrome.
- The committed source files were clean. Uncommitted generated `dist` changes and the review package were excluded from the implementation verdict.

All file references below are relative to `D:/สอน/learnmore`.

## Requirements traceability

### Quiz data and scoring

- `src/data/quizzes.ts:3-9` matches the required `QuizQuestion` interface.
- `src/data/quizzes.ts:11-136` exports exactly five questions for each track, with four options, valid answer indices, unique in-track IDs, Thai prompts, and useful Thai explanations.
- Certificate covers HTTP/GET, SQL safety, bcrypt, server validation, and beginner flow/testing at `src/data/quizzes.ts:13-72`. Diploma covers HTTP/DELETE, SQL safety, JWT middleware, server validation, and Docker/CI/CD secrets/testing at `src/data/quizzes.ts:75-134`.
- `src/lib/quiz.ts:4-24` exports `passingScore = 4`, `getQuizQuestions`, `scoreQuiz`, and `hasPassed` with the required behavior. Lengths other than five throw `คำตอบยังไม่ครบ`.
- Tests independently pin data shape/concepts, exact scoring, incomplete/oversized rejection, and pass boundaries at `src/lib/quiz.test.ts:12-91`.

### Practice flow, accessibility, and persistence

- `src/pages/PracticePage.tsx:288-318` shows the Thai heading, active track, instructions, latest stored score, and track switcher.
- `src/pages/PracticePage.tsx:176-285` renders one question at a time with a real `fieldset`/`legend`, native radios, visible labels, progress text, locked options after selection, immediate feedback/explanation, and the Next/result action.
- `src/pages/PracticePage.tsx:52-78` blocks incomplete submission and guards final submission with `submittedRef` before setting result state or calling `recordQuiz` exactly once.
- `src/pages/PracticePage.tsx:88-174` renders score, pass/fail, retry/course-map actions, and a five-item review containing every prompt, user answer, correct answer, and explanation.
- `src/pages/PracticePage.tsx:80-86` resets only the in-memory attempt on retry; it does not clear stored progress.
- `src/pages/PracticePage.tsx:315` keys the attempt by `level`, so changing tracks remounts it at question 1 with no selected answers. `src/lib/progress.ts:163-178` preserves the other track's score and updates only the submitted track.
- `src/pages/PracticePage.tsx:34-42` focuses each new question heading and the result heading. `src/pages/PracticePage.tsx:248-270` provides one persistent polite, atomic live region for answer feedback.
- `src/App.tsx:14-18` replaces the placeholder with the real `/practice` route.
- Tests cover initial state, answer locking/feedback, incomplete submission prevention, exact result/review/persistence, retry, remount restoration, track isolation, repeated final activation, focus, and course-map return at `src/pages/PracticePage.test.tsx:74-288`.

### Dashboard/course-map integration

- `src/pages/Dashboard.tsx:344-390` adds the active-track quiz status and CTA without changing lesson completion calculations.
- No score shows `เริ่มแบบฝึกหัด`; a failing score shows `คะแนน x/5` plus `ทำแบบฝึกหัดใหม่`; a passing score shows success-styled `ผ่านแล้ว x/5` plus `ทบทวนแบบฝึกหัด`.
- Tests cover all three CTA/status states and score preservation across track switches at `src/pages/Dashboard.test.tsx:273-356`.

## Review-focus verification

### Repeated submission and announcements

- The synchronous `submittedRef` guard at `src/pages/PracticePage.tsx:52-65` prevents a second score calculation, result transition, or `recordQuiz` call.
- In the browser check, two activations of the final action produced **one** progress write and one `5/5` passing result.
- There is only one answer-feedback live region, with `aria-live="polite"` and `aria-atomic="true"` at `src/pages/PracticePage.tsx:248-253`. The result view replaces the question view rather than mounting a second result/live region.
- The regression test asserts one additional progress write at `src/pages/PracticePage.test.tsx:235-251`.

### Track switching and refresh

- Browser flow completed certificate at `5/5`, switched to diploma, completed it at `0/5`, and confirmed storage contained both scores independently.
- A true browser reload restored `คะแนนล่าสุด: 5/5` for certificate and later `คะแนนล่าสุด: 0/5` for diploma, always returning to question 1 with zero checked radios and no visible prior result.
- No certificate answers or score appeared in the diploma attempt. The implementation uses `key={level}` at `src/pages/PracticePage.tsx:315` and per-level score keys at `src/lib/progress.ts:171-177`.

### Incomplete answers

- The result action is not rendered until the current question is answered at `src/pages/PracticePage.tsx:272-283`.
- `submitQuiz` also checks answer count and undefined entries at `src/pages/PracticePage.tsx:52-59`.
- Tests confirm no result action or saved score before question 5 is answered at `src/pages/PracticePage.test.tsx:125-137`.

### 360px long Thai content

- At a 360px viewport, document `scrollWidth` equaled `clientWidth` (345px including the headless scrollbar); there was no horizontal overflow.
- The page heading, all ten question prompts, and all forty option labels had `scrollWidth <= clientWidth`. The heading/right edge stayed within the header bounds.
- The implementation uses `min-w-0` and `break-words` on the relevant containers/text at `src/pages/PracticePage.tsx:145-166`, `src/pages/PracticePage.tsx:197-204`, and `src/pages/PracticePage.tsx:218-241`.

### Dark/light state readability

- Correct/incorrect feedback and result panels use semantic `success`/`danger` and `soft-success`/`soft-coral` tokens at `src/pages/PracticePage.tsx:96-115` and `src/pages/PracticePage.tsx:254-268`.
- Existing token tests pin status-text AA contrast in both themes at `src/lib/themeStyles.test.ts:35-57`.
- Independently measured computed contrast in Chrome:
  - Light correct feedback: **4.77:1**; light incorrect feedback/result: **5.96:1**.
  - Dark correct feedback: **8.55:1**; dark incorrect feedback/result: **8.61:1**.
  - Passing results use the same success token pair as correct feedback. Correct-answer text in the review list is **4.70:1** on light canvas and **11.73:1** on dark canvas.
- Focus after final submission was the result heading (`quiz-result-title`) in both light and dark flows.

## Global constraints

- **ภาษา UI และเนื้อหาหลักเป็นไทย; คำเทคนิคเก็บเป็นภาษาอังกฤษตามมาตรฐาน** — PASS. Instructional quiz prompts, options, explanations, feedback, results, and CTAs are Thai; standard technical terms remain English.
- **เว็บ responsive บน desktop/tablet/mobile; รองรับ keyboard navigation และ focus state** — PASS for Task 6 scope. Native radios/buttons preserve keyboard operation; focus moves after Next/final submission; 360px browser metrics showed no prompt/option/page overflow. Broader viewport coverage remains part of the later final-verification task.
- **บทเรียนปวช. มี 8 บท และปวส. มี 10 บท โดยสองบทสุดท้ายของปวส. เป็น Advanced** — PASS, unchanged by Task 6. Eight core lessons plus Advanced `security` and `devops` are defined at `src/data/course.ts:128-175`.
- **โค้ดตัวอย่างต้องมีคำอธิบายครบทุกบรรทัด รวมบรรทัดว่าง** — PASS, unchanged by Task 6. The content test checks note count against `code.split('\n')` and requires a non-empty Thai note for every line at `src/data/lessons/content.test.ts:151-161`.
- **ห้ามเก็บ plaintext password ใน Demo; ใช้ PBKDF2 + salt และแจ้งข้อจำกัดชัดเจน** — PASS, unchanged by Task 6. PBKDF2-SHA256 with 120,000 iterations and random salt is at `src/lib/authDemo.ts:81-100` and `src/lib/authDemo.ts:190-199`; the production/server limitation is disclosed at `src/pages/DemoPage.tsx:126-133`.
- **Progress เก็บใน localStorage; session ของ Demo เก็บใน sessionStorage** — PASS. Progress persistence uses localStorage at `src/lib/progress.ts:105-127`; Demo session persistence uses sessionStorage at `src/lib/authDemo.ts:158-163`.
- **ใช้ Node.js ที่มีในเครื่อง (v24.22.1) และไม่ติดตั้งซอฟต์แวร์ระบบ** — PASS based on the supplied controller environment and this review's operations; no software was installed.

## Findings by severity

### Critical

None.

### Important

None.

### Minor

None.

## Optional polish (not a current defect)

- Add a browser-level regression for the Task 6 review focus: 360px `scrollWidth <= clientWidth` checks for prompts/options and computed contrast checks for correct/incorrect/result states. Current jsdom tests validate semantics/classes at `src/pages/PracticePage.test.tsx:94-109` and `src/pages/PracticePage.test.tsx:235-275`, while token contrast is covered generically at `src/lib/themeStyles.test.ts:35-57`; neither measures real 360px geometry. This would prevent future CSS regressions. The independent browser check for this review passed, so this is optional coverage improvement rather than a blocking finding.

## Limitations

- The full test/typecheck/build commands were not rerun, as instructed; their results are controller-supplied.
- Headless Chrome verified DOM, geometry, focus, storage, and computed colors, but cannot prove actual screen-reader announcement wording or timing.
