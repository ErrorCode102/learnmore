# Task 2 Review

**Spec: FAIL**  
**Quality: FAIL**

## Review basis

- The exported types match the required `Level`, `LessonId`, `LessonSummary`, and `ProgressState` contracts (`src/types/course.ts:1-20`).
- The catalogs contain the exact 8 certificate and 10 diploma IDs in order, with sequential `order` values, 10–45 minute durations, Thai titles/descriptions/outcomes, English technical terms, and the required diploma JWT/security/Docker/CI-CD additions (`src/data/course.ts:3-173`, `src/data/course.ts:175-180`).
- The storage key is exactly `auth-classroom:progress:v1`; browser absence, access failures, malformed JSON, invalid versions/levels, duplicate or out-of-level completion IDs, non-array completion data, and invalid quiz scores are handled (`src/lib/progress.ts:4`, `src/lib/progress.ts:19-103`, `src/lib/progress.ts:105-128`).
- Lesson toggling is immutable, level-isolated, idempotent, and rejects unknown/out-of-level IDs. Quiz recording truncates and clamps to 0–5 (`src/lib/progress.ts:136-179`).
- `useProgress` exposes the required API and persists state changes through an effect (`src/hooks/useProgress.ts:11-45`).
- `LevelSwitcher` uses native keyboard-operable buttons, exact Thai labels, `aria-pressed`, a labelled group, and distinct selected styling (`src/components/LevelSwitcher.tsx:8-39`). `ProgressBar` exposes the required Thai accessible progressbar semantics and rounded integer percentage, with safe empty and duplicate handling (`src/components/ProgressBar.tsx:8-37`).
- Tests cover the catalogs, default/round-trip state, toggling, quiz clamping, corrupted storage, unknown IDs, reset, unavailable storage, selector state/persistence, and progressbar percentages (`src/lib/progress.test.ts:40-287`, `src/components/LevelSwitcher.test.tsx:12-70`, `src/components/ProgressBar.test.tsx:7-44`). The reported 21/21 tests, typecheck, and build were accepted as evidence and were not rerun.
- No Task 3 integration was required or treated as missing. No code was edited, no subagents were dispatched, and no Git commands were run.

## Findings

### Important 1 — Switching tracks can silently delete valid last-lesson progress during persistence

**Evidence:** `normalizeProgress` accepts `lastLessonId` only when it belongs to the currently selected level (`src/lib/progress.ts:91-99`). `setLevel` changes only `progress.level` (`src/hooks/useProgress.ts:18-23`), after which the persistence effect calls `saveProgress` and its normalization (`src/hooks/useProgress.ts:14-16`, `src/lib/progress.ts:118-124`). Therefore, switching from diploma to certificate when `lastLessonId` is `security` removes that valid `LessonId` from persisted state. This conflicts with the requirement that level switching not clear progress (`.superpowers/sdd/2026-11-25-authlab-classroom/task-2-brief.md:44`) and with the report's statement that `setLevel` changes only the selected level.

The existing regression test does not expose the defect because it uses `lastLessonId: 'api'`, which is valid in both tracks (`src/components/LevelSwitcher.test.tsx:37-70`, especially line 49).

**Impact:** Normal track switching causes silent loss of resume/continue metadata. Completed lessons and quiz scores survive, but the full `ProgressState` does not round-trip unchanged.

**Exact fix:** Validate `lastLessonId` against the union of all catalog IDs rather than `getLessonsForLevel(value.level)`. For example, build the allowed set from both `certificateLessons` and `diplomaLessons` in `src/lib/progress.ts:91-99`. Add a regression test that starts in diploma with `lastLessonId: 'security'`, switches to certificate, and asserts `readProgress()` retains `lastLessonId: 'security'` while only `level` changes.

### Critical: 0
### Important: 1
### Minor: 0

## Required fixes

Fix the `lastLessonId` normalization and add the diploma-only-to-certificate persistence regression test described above.
