# Task 1 Report — Foundation, test harness และ design tokens

**Status:** DONE_WITH_CONCERNS

## Scope and changed files

Implemented only the Task 1 foundation in `C:/Users/PTC/Documents/Qoder/2026-11-25/7643741e`:

- `package.json` and generated `package-lock.json`
- `vite.config.ts`, `tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json`
- `index.html`
- `src/main.tsx`, `src/App.tsx`, `src/index.css`
- `src/test/setup.ts`, `src/test/App.test.tsx`
- This report: `.superpowers/sdd/2026-11-25-authlab-classroom/task-1-report.md`

No later-task routes, course data, progress storage, lessons, authentication, or quizzes were implemented. `dist/` and `node_modules/` are generated local artifacts.

## TDD evidence

1. Configured React, TypeScript, Vite, HashRouter, Tailwind CSS v4, Vitest, Testing Library, jsdom, and lucide-react, then wrote the smoke test before the app implementation.
2. `npm run test` — RED, exit 1: `Failed to resolve import "../App" from "src/test/App.test.tsx"` because the implementation did not exist.
3. Implemented the minimal home shell and exported `renderApp()`.
4. `npm run test` — GREEN, exit 0: `Test Files 1 passed (1)`, `Tests 1 passed (1)`.

## Final verification

- `npm run test` — exit 0; 1/1 test passed.
- `npm run typecheck` — exit 0; `tsc -b --pretty false` reported no errors.
- `npm run build` — exit 0; Vite 7.3.8 transformed 1,591 modules and emitted `dist/index.html`, CSS, and JS successfully.
- `npm audit` — exit 0; `found 0 vulnerabilities`.
- `npm ls --depth=0` — exit 0; installed dependency tree valid.
- Browser check at 825px and a real 360px iframe viewport: Thai document language, visible AuthLab brand and `เริ่มเรียน` action, no horizontal overflow, no console errors/warnings.
- Keyboard check: first Tab focused the skip link; global focus outline was indigo at 3px. The focused CTA retained a 3px outline and scrolled the overview into view (`sectionTop: 32`).

## Decisions

- `renderApp()` owns `HashRouter` and the home root so tests and later route work share one entry point; `main.tsx` starts it in `StrictMode`.
- Tailwind v4 uses CSS-first configuration with `@theme inline`; required `--ink`, `--muted`, `--brand`, and `--surface` tokens are defined in `:root`, alongside coral/canvas/supporting tokens and a Thai-capable system font stack.
- Added `tsconfig.node.json` so the solution typecheck covers `vite.config.ts` as well as application source.
- The `เริ่มเรียน` button intentionally scrolls to the static course overview rather than linking to an unimplemented lesson route.
- Upgraded the initially installed Vitest 3 line to patched Vitest 5.1.1 after audit reported critical/moderate transitive advisories; the final audit is clean.

## Concerns

- Non-blocking: npm 11 reported that esbuild's postinstall script is not covered by its `allowScripts` policy. The platform binary was available, and both tests and the production build succeeded. No permission-policy changes were made.
