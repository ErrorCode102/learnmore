# Task 4 Report — Detailed Thai lesson content and Code Explorer

## Status
Implementation, repair and scoped independent re-review are complete. Re-review returned Spec PASS / Quality PASS with no unresolved Critical or Important findings. No commits were created; the ledger records Task 4 completion.

## Content inventory
- Certificate: 8 lessons, 30 sections, 44 displayed snippets, 831 code lines, 831 Thai line notes.
- Diploma: 10 lessons, 40 sections, 58 displayed snippets, 1,206 code lines, 1,206 Thai line notes.
- Every snippet ID is globally unique in the diploma registry; every section ID is unique within its lesson.
- Core lessons have deeper `diplomaNote` trade-offs; Security and DevOps are diploma-only.
- Overview includes an accessible Client → Backend → Database flow.

Per-lesson diploma coverage (sections / displayed snippets / code lines):
- overview: 4 / 3 / 24
- installation: 3 / 3 / 12
- setup: 4 / 9 / 144
- database: 3 / 3 / 30
- backend: 4 / 9 / 243
- api: 4 / 4 / 67
- frontend: 4 / 8 / 245
- testing: 4 / 5 / 66
- security: 5 / 7 / 187
- devops: 5 / 7 / 188

## Files
- Types and registry: `src/types/course.ts`, `src/data/course.ts`
- Lesson data: `src/data/lessons/certificate.ts`, `src/data/lessons/diploma.ts`, `src/data/lessons/content.test.ts`
- Snippet libraries: `src/data/snippets/defineSnippet.ts`, `installation.ts`, `setup.ts`, `database.ts`, `backend.ts`, `api.ts`, `frontend.ts`, `testing.ts`, `security.ts`, `devops.ts`
- UI: `src/components/CodeExplorer.tsx`, `CopyButton.tsx`, `Callout.tsx`, `src/pages/LessonPage.tsx`
- Tests: `src/components/CodeExplorer.test.tsx`, `src/pages/LessonPage.test.tsx`

## RED/GREEN evidence
- Initial implementation reached 83/83 tests, typecheck and build, but independent review returned Spec FAIL / Quality FAIL because the suite did not exercise several real browser and taught-project failures.
- Added failing regressions for native `IntersectionObserver` units, router creation, Setup startability, Vue/Tailwind scaffold coherence, refresh-token protection, Docker/CI deployment, nginx note alignment and expired-token fixture validity.
- Initial review-fix regression run failed in 2 files with 6 failures; content-only follow-up reduced this to 4 failures before the remaining repairs.
- Final focused LessonPage/content run: 38/38 passed.
- Final full suite: 89/89 passed across 10 files.
- `npm run typecheck`: passed.
- `npm run build`: passed; Vite reports a non-blocking 600.26 kB chunk-size warning.

## Review findings and repairs
- Replaced invalid `rem` IntersectionObserver margins with `-112px`; added a strict-observer regression and verified the real lesson page in a browser.
- Created the Express router before route declarations and corrected backend snippet indices so controllers, middleware, routes and the mounted app are all displayed.
- Aligned the Vue entry with `src/main.ts`, installed/configured Tailwind, created the documented frontend directories and explicitly required Git Bash for brace expansion.
- Made Setup independently runnable by removing future auth-route imports and teaching `db/pool.js` before `server.js`; added a later complete app that mounts auth routes.
- Installed `cookie-parser`, mounted refresh routes, added Origin allowlisting and replaced refresh rotation with a transaction, `FOR UPDATE`, conditional UPDATE, `affectedRows` check, commit/rollback and connection release.
- Corrected SameSite=Lax/CSRF wording and several mismatched Thai line notes.
- Copied `nginx.conf` in the frontend build stage, fixed the schema mount, added immutable image variables and made deployment log into the registry and pull the exact SHA-tagged images.
- Changed the expired-token script to select an existing user, fail clearly without one and sign HS256 with the application issuer/audience so expiry is the only rejection cause.

## Security and browser checks
- Snippets use parameterized SQL, bcrypt hashes only, server-side validation, generic Login errors, environment-based JWT secrets and no sample production secrets.
- JWT middleware allows HS256 only and verifies issuer/audience/expiry.
- Browser-demo and localStorage limitations are stated explicitly; refresh-cookie, Origin/CSRF and rotation concerns appear in the diploma track.
- Prism renders token nodes as React text rather than injecting raw HTML.
- Clipboard copy has a temporary-textarea fallback and visible success/failure feedback.
- Real browser at `http://127.0.0.1:5173/#/lesson/overview`: lesson rendered, line selection worked, scrolling updated the active outline item, `#root` remained populated and no console errors were reported.

## Rulings and concerns
- The reviewer's MySQL grant sub-finding is not accepted: the official MySQL image documents that `MYSQL_USER` receives permissions on `MYSQL_DATABASE` when those variables are configured, so an extra GRANT script is unnecessary for this Compose example. Source: https://hub.docker.com/_/mysql
- Optional manual `try/catch` wrapping for every async controller operation was not added because Express 5 forwards rejected async handlers to error middleware; Register still demonstrates explicit `next(error)` handling.
- Docker was unavailable in this environment, so Docker/CI examples were statically reviewed but not runtime-executed.
- Full responsive, accessibility and complete user-flow verification remains Task 7 work.
- The production bundle exceeds Vite's 500 kB warning threshold; consider route-level code splitting after feature work is complete.

## Scoped independent re-review
- Verdict: Spec PASS / Quality PASS; no unresolved or new Critical/Important findings.
- Reviewer reran 89/89 tests, typecheck and build successfully and verified both declined rulings.
- Deferred minors: replace Russian `даже когда` in a Thai setup note; clarify that static `/api/health` does not prove DB connectivity; remove the incorrect root-level `.dockerignore` alternative; replace PowerShell-incompatible `where` lookup in installation commands.
