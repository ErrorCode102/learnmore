# Task 3 Report — Dashboard, course map และ lesson navigation

**Status:** DONE

## Scope

Implemented Task 3 in `C:/Users/PTC/Documents/Qoder/2026-11-25/7643741e` only. Detailed lesson content, the authentication demo, and quizzes remain intentionally unimplemented.

## Changed files

### Created

- `src/context/ProgressContext.tsx` — single shared `useProgress()` instance, typed context, and the required outside-provider error.
- `src/components/AppShell.tsx` — responsive desktop sidebar/mobile top navigation, active nav states, shared level/progress display, skip link, home brand link, and `<Outlet />`.
- `src/components/LessonCard.tsx` — timeline lesson card with order, title, description, duration, status, tags, and completed indicator.
- `src/components/ContinueCard.tsx` — first-incomplete/final-lesson selection and the exact Thai CTA labels.
- `src/pages/Dashboard.tsx` — refactored home hero, visible track switcher, progress summary, continue card, 8/10 lesson course map, and ACFROG/competition reference panel.
- `src/pages/LessonPage.tsx` — summary header, outcomes, stable Task 4 placeholders, lesson outline, shared completion toggle, previous/next navigation, and last-lesson tracking.
- `src/pages/Dashboard.test.tsx` — dashboard, provider, persistence, continue, reference, and redirect tests.
- `src/pages/LessonPage.test.tsx` — lesson summary, placeholders, outline, completion, navigation, final-lesson, and invalid-route tests.
- `.superpowers/sdd/2026-11-25-authlab-classroom/task-3-report.md` — this report.

### Modified

- `src/App.tsx` — replaced the standalone home page with the required `HashRouter` → `ProgressProvider` → `Routes` composition, `/`, `/lesson/:lessonId`, `/practice`, `/demo`, and wildcard redirect. Added simple coming-next placeholders.
- `src/hooks/useProgress.ts` — added the additive `visitLesson(id)` action so opening a lesson updates `lastLessonId` without changing completion. All Task 2 methods and behavior remain intact.
- `.superpowers/sdd/2026-11-25-authlab-classroom/ledger.md` — recorded Task 3 completion, decisions, and self-review status.

`src/main.tsx`, `src/index.css`, the course catalog, the progress store, and all pre-existing tests were left unchanged.

## Architecture and behavior

- `ProgressProvider({ children }: PropsWithChildren)` calls `useProgress()` exactly once and provides its return value.
- `useClassroomProgress(): ReturnType<typeof useProgress>` throws `useClassroomProgress must be used within a ProgressProvider.` outside the provider.
- `renderApp()` returns the exact router/provider/route nesting required by the brief.
- `AppShell` uses one responsive navigation container that becomes a fixed desktop sidebar and a sticky mobile top bar, avoiding duplicate brand markup. Native links/buttons, `aria-current`, a focus-managed skip link, and visible focus styles preserve keyboard access.
- `Dashboard` derives its lesson list from `getLessonsForLevel(level)` and completion from `progress.completed[level]`; it does not keep duplicate progress state.
- The course map is an ordered visual timeline with exactly 8 certificate or 10 diploma cards. Completion, percentage, remaining minutes, total minutes, and an existing quiz score are shown.
- `ContinueCard` selects the first incomplete lesson, or the final lesson for review when the track is complete. Its labels are `เริ่มบทแรก`, `เรียนต่อ`, and `ทบทวนบทสุดท้าย`.
- `LessonPage` resolves `useParams()` against the active catalog with `getLessonSummary`. Unknown and out-of-level IDs redirect to `/`.
- Lesson completion calls shared `toggleLesson(id, level)` and immediately updates the lesson page, dashboard, and course map.
- Opening a valid lesson calls `visitLesson`, preserving completion arrays and quiz scores while recording `lastLessonId`.
- Previous/next links stay within the active track. The final certificate lesson (`testing`) and final diploma lesson (`devops`) link to `/practice`.
- `/practice` and `/demo` are simple coming-next placeholders only.

## TDD evidence

1. **Baseline:** `npm run test` passed 4 files and 22/22 tests before Task 3 changes.
2. **Initial RED:** Wrote `Dashboard.test.tsx` and `LessonPage.test.tsx` first, then ran:
   - `npm run test -- src/pages/Dashboard.test.tsx src/pages/LessonPage.test.tsx`
   - Exit 1; 2 files failed and all 15 new tests failed.
   - Failures were the expected missing behavior: no `เริ่มเรียน` link, no `ปวส.` switcher, no progressbar, no continue card, no lesson toggle, no lesson outline/navigation, no ACFROG reference, and no wildcard/out-of-level redirects.
3. **Provider RED:** Added the outside-provider contract test and strengthened the lesson-open test to prove `lastLessonId` changes without altering completion.
   - The expanded run failed because `ProgressContext` did not exist; the 8 lesson tests also remained RED.
   - After creating only the provider, `npm run test -- src/pages/Dashboard.test.tsx` showed the provider contract passing and the remaining 7 dashboard behavior tests failing for the intended reasons.
4. **Implementation GREEN:** Added the shared shell, dashboard, lesson page, route wiring, and additive `visitLesson` action.
   - `npm run test -- src/pages/Dashboard.test.tsx src/pages/LessonPage.test.tsx src/test/App.test.tsx`
   - Exit 0; 3 files and 17/17 tests passed, including the unchanged legacy home smoke test.
5. **Full GREEN:** `npm run test` passed 6 files and 38/38 tests. The original 22 tests remained unchanged and green.

## Final verification

- `npm run test` — exit 0; `Test Files 6 passed (6)`, `Tests 38 passed (38)`.
- `npm run typecheck` — exit 0; `tsc -b --pretty false` reported no errors. An initial unused test import was removed before this passing run.
- `npm run build` — exit 0; TypeScript build and Vite production build passed, transforming 1,602 modules and emitting `dist/index.html`, CSS, and JS.
- No Git commands were run and no subagents were spawned.

## Self-review

**Spec: PASS**  
**Quality: PASS**

Checked the implementation against every Task 3 brief item: exact provider interfaces and routes; shared progress; 8/10 lesson maps; continue selection; lesson validation and redirects; stable placeholders; completion persistence; outline and previous/next behavior; reference wording; keyboard-operable controls; and exclusion of Task 4–6 scope. No blocking findings were identified. This was an author self-review because the task explicitly prohibited subagents.

## Decisions

- Extended `useProgress` additively with `visitLesson(id)` rather than simulating a visit through completion toggles. This preserves the reviewed Task 2 API while providing the required last-lesson update without side effects.
- Kept the existing `src/test/App.test.tsx` unchanged. The mobile shell retains a native `เริ่มเรียน` button for that legacy contract, while the dashboard hero uses the required semantic `เริ่มเรียน` link to the selected continue lesson.
- Used a single responsive navigation container instead of separate desktop/mobile brand trees, preventing duplicate brand content and keeping active-state logic in one place.
- Kept quiz display conditional on an existing score; no quiz behavior or invented sub-scores were added.

## Concerns

- No blocking concerns.
- Cross-tab progress synchronization remains outside Task 2/3 scope; persistence is local to the current browser tab.
- Automated jsdom tests verify behavior and semantics but not visual layout at 360/768/1440 px. The dedicated responsive browser audit remains Task 7 scope.
- Detailed lesson content, the working authentication demo, and quizzes are deliberately represented only by stable placeholders for Tasks 4–6.
