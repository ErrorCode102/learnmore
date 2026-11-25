# Task 2 Brief — Course model, track selector และ progress store

Build on Task 1's React/Vite/Tailwind/test foundation. Do not edit later-page features beyond the requested LevelSwitcher/ProgressBar. The project is not a Git repo.

## Files
Create `src/types/course.ts`, `src/data/course.ts`, `src/lib/progress.ts`, `src/components/LevelSwitcher.tsx`, `src/components/ProgressBar.tsx`, `src/hooks/useProgress.ts`, `src/lib/progress.test.ts`, `src/components/LevelSwitcher.test.tsx`.

## Exact interfaces to produce
```ts
export type Level = 'certificate' | 'diploma';
export type LessonId = 'overview' | 'installation' | 'setup' | 'database' | 'backend' | 'api' | 'frontend' | 'testing' | 'security' | 'devops';
export interface LessonSummary {
  id: LessonId;
  order: number;
  title: string;
  shortTitle: string;
  description: string;
  durationMinutes: number;
  level: Level;
  outcomes: string[];
  tags: string[];
}
export interface ProgressState {
  version: 1;
  level: Level;
  completed: Record<Level, LessonId[]>;
  quizScores: Partial<Record<Level, number>>;
  lastLessonId?: LessonId;
}
```
Export `certificateLessons` (8) and `diplomaLessons` (10), `getLessonsForLevel(level)`, `getLessonSummary(level,id)`.
Progress functions: `readProgress(): ProgressState`, `saveProgress(next: ProgressState): void`, `resetProgress(): ProgressState`, `toggleLesson(state: ProgressState, id: LessonId, level: Level): ProgressState`, `recordQuiz(state: ProgressState, level: Level, score: number): ProgressState`.
`useProgress()` returns `{ progress, level, setLevel, toggleLesson, recordQuiz, reset }`; wrapper functions accept the same args minus state and persist via effect.

## Exact content requirements
- Certificate IDs in order: overview, installation, setup, database, backend, api, frontend, testing.
- Diploma IDs add security and devops at the end.
- Titles/outcomes Thai, technical terms English. Certificate focuses guided flow/API basics; diploma adds JWT middleware, security trade-offs, Docker/CI/CD.
- Sensible duration values 10–45 minutes and useful tags.
- localStorage key exactly `auth-classroom:progress:v1`.
- Guard browser absence, malformed JSON, invalid level, duplicate IDs, non-array completion data and invalid quiz scores; normalize safely to defaults.
- `toggleLesson` must toggle idempotently within its level without affecting the other level; reject unknown IDs.
- `recordQuiz` clamps integer scores to 0–5.
- LevelSwitcher: two buttons with labels `ปวช.` and `ปวส.`, `aria-pressed`, clear selected styling, does not clear progress.
- ProgressBar: accessible progressbar with Thai label, accepts lessons and completed IDs, rounded integer percentage.

## TDD and verification
Write failing tests first for default state, toggling, quiz clamp, corrupted storage, unknown IDs, and level switching. Then implement. Run `npm run test`, `npm run typecheck`, `npm run build`. Keep existing home smoke test passing.

## Report
Write full report to `.superpowers/sdd/2026-11-25-authlab-classroom/task-2-report.md` with files, RED/GREEN evidence, final checks, decisions and concerns. Return only status, changed files summary, one-line checks, concerns. Do not spawn subagents or run git commands.
