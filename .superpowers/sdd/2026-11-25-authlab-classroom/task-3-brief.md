# Task 3 Brief — Dashboard, course map และ lesson navigation

Integrate Task 1/2 into a usable classroom shell. Preserve the polished visual direction from `src/index.css` and the current `src/App.tsx` home hero, but refactor rather than duplicate it.

## Files
Create `src/context/ProgressContext.tsx`, `src/components/AppShell.tsx`, `src/components/LessonCard.tsx`, `src/components/ContinueCard.tsx`, `src/pages/Dashboard.tsx`, `src/pages/LessonPage.tsx`, `src/pages/Dashboard.test.tsx`, `src/pages/LessonPage.test.tsx`.
Modify `src/App.tsx`, `src/main.tsx` only as needed for routes/provider.

## Exact architecture/interfaces
- `ProgressProvider({ children }: PropsWithChildren)` calls existing `useProgress()` once and provides its return value.
- `useClassroomProgress(): ReturnType<typeof useProgress>` throws a useful error outside provider.
- `renderApp()` returns `<HashRouter><ProgressProvider><Routes>...</Routes></ProgressProvider></HashRouter>`.
- Routes: `/` Dashboard, `/lesson/:lessonId` LessonPage, `/practice` simple coming-next placeholder, `/demo` simple coming-next placeholder, `*` Navigate to `/`.
- AppShell uses `<Outlet />`, shared progress/level, responsive desktop sidebar and mobile top navigation, active nav states, skip link, brand links home.
- Dashboard uses `getLessonsForLevel(level)` and `progress.completed[level]`; no duplicated progress state.
- LessonPage finds current lesson with `useParams`, active level catalog and `getLessonSummary`; unknown/out-of-level ID redirects to `/`.
- `ContinueCard` chooses first incomplete lesson or final lesson when all complete; if no progress, first lesson. CTA labels `เริ่มบทแรก` / `เรียนต่อ` / `ทบทวนบทสุดท้าย`.
- Lesson completion toggle uses shared `toggleLesson(id, level)` and immediately updates dashboard/course map.
- Keep route lesson IDs exactly: overview, installation, setup, database, backend, api, frontend, testing, security, devops.

## Dashboard requirements
- Hero: Thai headline about Login/Register, clear primary `เริ่มเรียน` link to continue lesson and secondary link to `/demo`.
- Visible `LevelSwitcher`; selected track shows 8 or 10 lessons.
- Progress summary: completed/total, percentage, total remaining/estimated minutes, quiz score if present.
- Course map with `id="course-map"` and 8/10 LessonCards. Each card shows order, title, description, duration, status, tags, and completed indicator.
- Visual timeline/progress not just text. Use current off-white/navy/indigo/coral design.
- Small reference panel citing ACFROG 57 and competition list 58 as learning foundations; do not invent sub-scores. Explain that this course focuses auth and does not replace full competition system.
- All interactive elements keyboard accessible; no emoji.

## LessonPage requirements (content arrives Task 4)
- Breadcrumb/back to course map; level badge, order, title, duration, description, tags.
- Outcomes list from summary.
- Placeholder section with stable IDs (`lesson-content`, `lesson-checkpoint`) that Task 4 can replace; explain content is being prepared without unfinished-code language.
- Right/desktop or top/mobile lesson outline showing course sequence and current item.
- `ทำเครื่องหมายว่าครบแล้ว` / `ยกเลิกเครื่องหมายความคืบหน้า` toggle.
- Previous/next lesson links within active track; next on final lesson goes to `/practice`.
- Updating `lastLessonId` should happen when lesson opens (you may extend ProgressContext with a `visitLesson` wrapper using existing progress API without changing Task 2 contracts).

## TDD/verification
Write failing tests first: default 8 lessons, switch to diploma 10, completion updates count/progress and persists after remount, continue opens first incomplete, out-of-level devops on certificate redirects, lesson toggle and prev/next. Run full `npm run test`, `npm run typecheck`, `npm run build`. Existing 22 tests must stay green.

## Report
Write `.superpowers/sdd/2026-11-25-authlab-classroom/task-3-report.md` with files, RED/GREEN evidence, checks, decisions and concerns. Return only status, changed files, checks, concerns. No subagents or git commands.
