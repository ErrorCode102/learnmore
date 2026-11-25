# Task 2 Report — Course model, track selector และ progress store

**Status:** DONE

## Scope and changed files

Implemented Task 2 only in `C:/Users/PTC/Documents/Qoder/2026-11-25/7643741e`:

- `src/types/course.ts` — exact `Level`, `LessonId`, `LessonSummary`, and `ProgressState` interfaces.
- `src/data/course.ts` — 8 certificate summaries, 10 diploma summaries, `getLessonsForLevel`, and `getLessonSummary`.
- `src/lib/progress.ts` — guarded versioned localStorage persistence, normalization, reset, lesson toggling, and quiz recording.
- `src/hooks/useProgress.ts` — lazy progress loading, effect-based persistence, and the required wrapper API.
- `src/components/LevelSwitcher.tsx` — accessible two-track selector with `aria-pressed` and selected styling.
- `src/components/ProgressBar.tsx` — accessible Thai progressbar with rounded percentage and safe counting.
- `src/lib/progress.test.ts` — course catalog and progress-store tests.
- `src/components/LevelSwitcher.test.tsx` — selector and persisted level-switch tests.
- `src/components/ProgressBar.test.tsx` — additional TDD coverage for percentage, filtering, and empty-state behavior.
- `.superpowers/sdd/2026-11-25-authlab-classroom/task-2-report.md` — this report.

`src/App.tsx`, `src/test/App.test.tsx`, package configuration, and design tokens were not modified. No dashboard routes, detailed lesson content, authentication demo, or quizzes were added.

## TDD evidence

1. Baseline `npm run test` passed the existing home smoke test: 1 file, 1 test.
2. Wrote the Task 2 tests first, covering the exact lesson order, default state, save/read round-trip, idempotent toggling, unknown and out-of-level IDs, quiz clamping, malformed JSON, invalid levels, duplicate/unknown completion IDs, non-array completion data, invalid quiz scores, reset, absent browser storage, storage access errors, level switching without progress loss, and accessible progress calculation.
3. `npm run test` — RED, exit 1: the three new suites failed to resolve the not-yet-created Task 2 modules; the existing smoke suite still passed. This confirmed the tests exercised missing functionality rather than existing behavior.
4. Implemented the types, catalog, store, hook, and components.
5. `npm run test` — GREEN, exit 0: 4 test files passed and 21/21 tests passed, including the unchanged home smoke test.

## Final verification

- `npm run test` — exit 0; `Test Files 4 passed (4)`, `Tests 21 passed (21)`.
- `npm run typecheck` — exit 0; `tsc -b --pretty false` reported no errors.
- `npm run build` — exit 0; Vite 7.3.8 transformed 1,591 modules and emitted `dist/index.html`, CSS, and JS successfully.

## Review fix round 1

- Resolved Important 1 from `task-2-review.md`: `src/lib/progress.ts` now validates `lastLessonId` against the union of `certificateLessons` and `diplomaLessons`, rather than only the active level's catalog.
- Added a regression test in `src/components/LevelSwitcher.test.tsx` that starts in diploma with `lastLessonId: 'security'`, switches to certificate through `LevelSwitcher`/`useProgress`, and asserts `readProgress()` equals the initial state with only `level` changed. Completion arrays and quiz scores are also checked by the full-state equality assertion.
- Updated the existing invalid-reference test in `src/lib/progress.test.ts` to use an unknown ID instead of `security`, since `security` is a valid catalog ID even when certificate is active.
- RED evidence: `npm run test -- src/components/LevelSwitcher.test.tsx` exited 1 with 1 failed and 2 passed tests; the new assertion showed persisted state missing `lastLessonId: 'security'`.
- Focused GREEN evidence: `npm run test -- src/components/LevelSwitcher.test.tsx src/lib/progress.test.ts` exited 0 with 2 files and 18/18 tests passing.
- Full `npm run test` — exit 0; 4 test files and 22/22 tests passed.
- Full `npm run typecheck` — exit 0; `tsc -b --pretty false` reported no errors.
- Full `npm run build` — exit 0; TypeScript build and Vite production build passed, transforming 1,591 modules and emitting `dist/index.html`, CSS, and JS.
- No unrelated production code was changed. No Git commands were run and no subagents were spawned.

## Decisions

- The storage key is exactly `auth-classroom:progress:v1` and persisted state remains schema version `1`.
- Invalid JSON, non-object state, unsupported versions, and invalid selected levels fall back to a fresh default state. For otherwise valid state, invalid completion fields normalize to empty arrays, completion IDs are filtered to their respective level catalog and deduplicated, invalid quiz scores are omitted, and `lastLessonId` is retained only when it belongs to any catalog lesson, independent of the active level. This preserves valid progress instead of discarding all user data for one malformed field.
- `toggleLesson` is immutable, throws for globally unknown or out-of-level lesson IDs, affects only the requested level, sets that level active, and records the toggled lesson as `lastLessonId`.
- `recordQuiz` truncates toward zero before clamping to 0–5; `NaN` becomes 0. Scores remain independent per level.
- `useProgress` reads once with a lazy state initializer and persists every state change through an effect. `setLevel` changes only the selected level, so completion and quiz data survive track switches.
- Certificate and diploma share the eight guided core summaries; diploma adds the required JWT middleware/security trade-offs and Docker/CI/CD summaries. Only summaries were created, not lesson content.
- `ProgressBar` counts unique matching completed IDs, ignores IDs outside the supplied lesson list, and returns 0% for an empty list.

## Concerns

- No blocking concerns. The new selector and progressbar are intentionally not mounted in `HomePage`; dashboard integration belongs to Task 3.
- Progress persistence is effect-based within the current tab. Cross-tab storage-event synchronization was not part of Task 2 and is not implemented.
