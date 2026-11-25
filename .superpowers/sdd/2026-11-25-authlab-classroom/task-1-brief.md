# Task 1 Brief — Foundation, test harness และ design tokens

This task starts the empty AuthLab project. Implement only this task, not later features.

## Files
Create `package.json`, `vite.config.ts`, `tsconfig.json`, `tsconfig.app.json`, `index.html`, `src/main.tsx`, `src/App.tsx`, `src/index.css`, `src/test/setup.ts`, `src/test/App.test.tsx`.

## Requirements and exact interfaces
- Stack: React, TypeScript, Vite, React Router (HashRouter), Tailwind CSS, Vitest, Testing Library, jsdom, lucide-react.
- UI copy is Thai; technical terms remain English.
- `src/main.tsx` exports/starts app; `src/App.tsx` renders an app root.
- `src/test/App.test.tsx` smoke test expects visible `AuthLab` and a button/link named `เริ่มเรียน` on the home page.
- CSS tokens: `--ink`, `--muted`, `--brand`, `--surface`, plus a Thai-capable font stack.
- Design direction: premium light classroom, off-white surfaces, dark navy ink, indigo primary, coral accent, generous spacing, responsive. Do not use emojis.
- Support keyboard focus and responsive viewport from the start.
- No Git repository: do not run git init, git add, or git commit.

## TDD steps
1. Install/config dependencies and test harness as needed.
2. Write failing smoke test.
3. Run `npm run test` and confirm it fails for missing implementation.
4. Implement minimal App shell and tokens.
5. Run `npm run test`, `npm run build`, `npm run typecheck` and confirm all pass.
6. Add package scripts `dev`, `build`, `test`, `typecheck`.

## Report contract
Write a concise report to `.superpowers/sdd/2026-11-25-authlab-classroom/task-1-report.md` including files changed, commands/output evidence, decisions, and concerns. Return only DONE / DONE_WITH_CONCERNS / BLOCKED, changed file summary, one-line test summary, and concerns. Do not dispatch subagents.
