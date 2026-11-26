# Task 4 Brief — Detailed Thai lesson content และ Code Explorer

This is the core content task. Build on reviewed Tasks 1–3 in `C:/Users/PTC/Documents/Qoder/2026-11-25/7643741e`. The site runs React, but the taught project is Node.js + Express + MySQL + Vue 3, matching the supplied ACFROG/competition reference direction. Do not create a second runnable app in this repository; embed complete, copyable snippets in lesson data.

## Files
- Modify `src/types/course.ts` additively.
- Create `src/data/snippets/installation.ts`, `database.ts`, `backend.ts`, `frontend.ts`, `security.ts`, `devops.ts`.
- Create `src/data/lessons/certificate.ts`, `diploma.ts`, and a small registry/helper if needed.
- Create `src/components/CodeExplorer.tsx`, `Callout.tsx`, `CopyButton.tsx`, `LessonSectionView.tsx` (optional if focused).
- Modify `src/pages/LessonPage.tsx` and its tests.
- Create `src/data/lessons/content.test.ts`, `src/components/CodeExplorer.test.tsx`.

## Exact data interfaces
Add:
```ts
export type CodeLanguage = 'bash' | 'sql' | 'javascript' | 'vue' | 'json' | 'text';
export interface CodeSnippet {
  id: string;
  filename: string;
  language: CodeLanguage;
  code: string;
  notes: string[];
  caption?: string;
}
export interface LessonCallout {
  tone: 'info' | 'warning' | 'success';
  title: string;
  text: string;
}
export interface LessonSection {
  id: string;
  title: string;
  body: string[];
  bullets?: string[];
  snippets?: CodeSnippet[];
  callouts?: LessonCallout[];
  diplomaNote?: string;
}
export interface LessonContent extends LessonSummary {
  intro: string;
  sections: LessonSection[];
  checkpoint: { summary: string; checklist: string[] };
}
```
Preserve all existing exports and Task 1–3 contracts. Add `getLessonContent(level: Level, id: LessonId): LessonContent | undefined`, `certificateLessonContent`, `diplomaLessonContent`. Existing `getLessonsForLevel`/`getLessonSummary` remain summary-based for the dashboard.

## Content quality bar
- Main UI and explanations in natural Thai. Keep commands, identifiers and API terms English.
- Every lesson has a useful intro, at least 3 substantive sections, and at least 3 checkpoint checks. No TBD/lorem/“content coming soon”.
- Every code line has a specific Thai explanation of what it does and why it matters. `notes.length === code.split('\n').length` exactly. Blank lines get a short grouping explanation. Do not use one generic note for many lines.
- Snippet IDs globally unique; section IDs unique within lesson. Filenames correspond to the real taught project.
- Include expected output or a verification step after important commands.
- Certificate: guided, concrete, minimal jargon. Diploma: same complete core plus `diplomaNote` deeper trade-offs and two advanced lessons. Do not merely relabel the tracks.
- Reference the supplied documents as curriculum foundations, not as a claim that the auth course is the whole competition. Do not invent scoring weights.
- Security: parameterized SQL, bcrypt hashes only, generic login error, validation on server, JWT secret from env, no secrets in snippets/repo. Explain limitations of localStorage tokens and that browser Demo is not production auth.

## Required lesson coverage
1. `overview`: Register/Login/Session flow, Frontend/Backend/DB responsibilities, HTTP request/response and JSON example, key terms, architecture diagram in accessible text/CSS.
2. `installation`: Node.js LTS (reference floor 18; recommend current LTS), npm, MySQL/MariaDB utf8mb4, HeidiSQL, VS Code, Git; Windows Terminal commands and verification outputs. Use official programming URLs only where useful.
3. `setup`: create backend/frontend folders, npm init/install, `npm create vite@latest auth-frontend -- --template vue-ts`, dependencies (express, mysql2, bcryptjs, jsonwebtoken, cors, dotenv, express-validator, helmet, express-rate-limit; dev nodemon), folder tree, `.env`, `.gitignore`, `app.js`, `server.js`, Vite dev proxy.
4. `database`: create `authlab` database and `users` table with primary/unique keys, utf8mb4, timestamps, password hash field; SQL line explanations; parameterized query examples and why `?` placeholders prevent SQL injection.
5. `backend`: MySQL pool, user model, express-validator rules, register/login controller, duplicate-entry and generic credential errors, consistent `{status,message,data}` responses, protected `/me` route; explain status codes.
6. `api`: JWT signing/verification middleware, Bearer header, `/api/auth/register`, `/api/auth/login`, `/api/auth/me`, CORS/rate limits, `.http`/curl tests, response/error examples and DevTools Network checks.
7. `frontend`: Vue 3 Composition API, Vite proxy, Axios instance, Pinia auth store, router guard, LoginView, RegisterView, DashboardView, loading/error states, labels/autocomplete, logout, token storage caveat.
8. `testing`: happy path and negative test matrix (duplicate user, weak password, wrong password, missing/expired token), curl/Thunder Client, a small Vitest unit test for a pure password-policy helper, manual browser checklist.
9. `security` (diploma only): JWT vs session trade-offs, expiry/rotation/revocation, refresh-token HttpOnly cookie concept, XSS/CSRF/CORS, rate limiting, user enumeration, production secret management, security review checklist. Include focused code/config examples with line notes.
10. `devops` (diploma only): backend/frontend Dockerfiles, `.dockerignore`, `docker-compose.yaml` with MySQL healthcheck and persistent volume, build/run commands, GitLab CI/CD stages test/build/push/deploy, environment/secret separation. Explain each line.

All project snippets must form a coherent project: same filenames, env names, table/column names, response shape and endpoint paths. Prefer ESM (`"type":"module"`) consistently. Backend uses mysql2/promise, bcryptjs, jsonwebtoken and Express. Frontend uses Vue 3 + Vite + Axios + Pinia.

## CodeExplorer UI
- Install a local syntax-highlighting dependency if needed (Prism is acceptable); never fetch remote code/highlight assets.
- Header: filename, language badge, caption, copy action.
- Code area: horizontal overflow contained within the component, visible line numbers, one selectable button per line.
- Detail panel: `บรรทัด N`, exact note, previous/next line controls. On desktop show side-by-side; on mobile show below code.
- Selected explanation updates via `aria-live="polite"`. Keyboard ArrowUp/ArrowDown moves selection when code explorer is focused; native buttons remain operable.
- Copy uses Clipboard API with a safe fallback and visible `คัดลอกแล้ว` feedback. Never inject raw code as unsanitized HTML.
- Reset selection when snippet changes. Include blank-line explanation.
- Callout component supports info/warning/success with accessible heading and non-color-only label/icon.

## LessonPage integration
- Use `getLessonContent`; retain existing header, outcomes, outline, completion and prev/next behavior.
- Render intro, sections, body, bullets, snippets, callouts and diplomaNote only for diploma.
- Section headings/IDs feed the outline (`aria-label="เนื้อหาในบทเรียน"`); add active-section highlighting with IntersectionObserver where supported, with safe fallback.
- Render checkpoint summary/checklist at `#lesson-checkpoint`.
- Update placeholder tests to assert real content, line explanation interaction, copy feedback, diploma-only notes and unknown lesson redirect.

## TDD/verification
Write failing content-invariant and CodeExplorer tests first. Tests must validate all 8/10 lessons, section/snippet uniqueness, non-placeholder content, note-length equality, selected line changes, keyboard navigation, copy feedback, aria-live, and mobile-friendly structure. Run `npm run test`, `npm run typecheck`, `npm run build`. All prior 48 tests must stay green or be intentionally updated only where placeholders changed.

## Report
Write `.superpowers/sdd/2026-11-25-authlab-classroom/task-4-report.md` with content inventory, files, RED/GREEN evidence, checks, line-note coverage counts, security review notes and concerns. Return only status, files, checks, coverage counts, concerns. Do not spawn subagents, create commits, or mark ledger/final review complete.
