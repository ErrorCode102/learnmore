# SDD ledger — plan: C:/Users/PTC/Documents/Qoder/2026-11-25/7643741e/docs/superpowers/plans/2026-11-25-authlab-classroom.md

## Setup
- Spec: approved short design in conversation (no separate design file).
- Workspace: primary working directory is empty of product code and is not a Git repository.
- Ruling: Use the primary project directory as the isolated workspace; do not initialize Git or create commits — the approved plan forbids commits and no repository/shared branch exists — cost: no commit-based rollback/review range.
- Ruling: SDD helper scripts/templates are absent from the installed skill; use plan-derived briefs, file-based reports, manual review packages, and the same implementer/reviewer gates — cost: more controller bookkeeping.
- Ruling: Agent tool exposes no model selector; use available general-purpose agents for implementation and review — cost: cannot choose lower-cost model tiers.
- Preflight conflicts: no existing package.json, source tree, AGENTS.md, or user changes in product workspace. Only plan and PDF text extracts created during this session.
- Current: Task 4 ready. External commit 94da894 contains reviewed Task 3 production fixes; only added regression tests/report remain uncommitted. No new commits authorized.

## Completion
- Task 1: complete (no Git commits, review clean; esbuild postinstall skipped but build/tests passed; non-blocking policy concern accepted).
- Task 2: complete after fix round 1 (review clean; 22/22 tests passed; diploma-only lastLessonId now survives track switch).
- Task 2 fix round 1: resolved Important finding; scoped re-review Spec PASS / Quality PASS.
- Task 3: complete after independent fix re-review (Spec PASS / Quality PASS; 48/48 tests; production fixes present in external commit 94da894, added tests uncommitted).
- Task 3 fix round 1: resolved 2 Important + 2 Minor; scoped independent re-review clean.
- Task 3: Ruling: Extend `useProgress` additively with `visitLesson(id)` to record the opened lesson without toggling completion — preserves the Task 2 API and avoids state side effects — cost: one additional public hook method.
- Task 3: Ruling: Keep the mobile shell `เริ่มเรียน` button so the unchanged legacy smoke test stays green while the hero uses the required semantic link — preserves both contracts — cost: a duplicate start action on mobile.

## Task 4 review fix round 1
- Initial independent review: Spec FAIL / Quality FAIL despite 83/83 tests; 4 Critical, 6 Important, 2 Minor and 1 optional finding.
- Fixed Critical invalid IntersectionObserver margin, missing Express router, Vue main.js/main.ts mismatch and PowerShell brace expansion; strict-observer regression went RED→GREEN and the real browser lesson page rendered without console errors.
- Fixed Important refresh dependency/mount/Origin/atomic rotation, Setup import order, SHA-tagged image deployment, expired-token user fixture and inaccurate Thai line notes; project-coherence regressions went RED→GREEN.
- Fixed Minor nginx config copy and Tailwind scaffold/configuration findings.
- Task 4: Ruling: Reject the extra MySQL GRANT script suggested by review — the official MySQL image grants MYSQL_USER access to MYSQL_DATABASE when MYSQL_USER, MYSQL_PASSWORD and MYSQL_DATABASE are configured — cost if wrong: a customized image may need explicit least-privilege grants.
- Task 4: Ruling: Do not add optional try/catch around every async controller operation — Express 5 forwards rejected async handlers to error middleware and Register already demonstrates next(error) — cost if wrong: learners may overgeneralize that every await requires manual wrapping.
- Verification after repairs: focused content/LessonPage 38/38; full suite 89/89 across 10 files; typecheck passed; build passed with non-blocking 600.26 kB chunk warning; browser line selection and active-outline scrolling passed.
- Coverage after repairs: certificate 8 lessons / 30 sections / 831 code lines and notes; diploma 10 lessons / 40 sections / 1,206 code lines and notes.
- Docker unavailable, so container/pipeline examples were statically reviewed only.
- Current: Task 4 repair round complete; scoped independent re-review pending; ledger not marked complete and no commits created.
- Task 4 scoped independent re-review: Spec PASS / Quality PASS; reviewer reran 89/89 tests, typecheck and build successfully; no unresolved/new Critical or Important findings.
- Task 4: minor (deferred): Russian `даже когда` remains in one Thai setup note at src/data/snippets/setup.ts:292.
- Task 4: minor (deferred): backend pool caption can imply static /api/health verifies DB connectivity at src/data/snippets/backend.ts:42.
- Task 4: minor (deferred): .dockerignore caption incorrectly offers auth-lab root placement for nested build contexts at src/data/snippets/devops.ts:151.
- Task 4: minor (deferred): installation uses PowerShell-incompatible `where` at src/data/snippets/installation.ts:10,13,24.
- Task 4: complete after independent repair re-review (no Git commits; Spec PASS / Quality PASS; 89/89 tests, typecheck and build passed).
- Task 5: independent review pending — browser Demo implemented with PBKDF2-SHA256 120,000 iterations; 113/113 tests, typecheck and static build passed; real-browser Register → Logout → Login passed with no plaintext password in storage and no console errors after reload. Vercel compatibility confirmed for Vite static output and HashRouter; production preview at port 4173 rendered /#/demo with no console errors. Publication requires explicit approval.
- Task 5 review fix round 1: fixed Important findings for validation/error contrast, storage-removal failures, and concurrent cross-tab registration; regression coverage added with RED→GREEN evidence.
- Task 5 repair verification: focused 31/31; full suite 120/120 across 12 files; typecheck and build passed. Fresh production preview confirmed #b42318 on #fff1ec at 5.96:1 contrast, Register → Logout → wrong-password → Login, 32-hex salt/64-hex hash, no plaintext password, and honest logout/reset errors under simulated blocked storage; no current console errors.
- Task 5 scoped independent re-review: Spec PASS / Quality PASS; reviewer reran 120/120 tests, typecheck and build; all three Important repairs verified and no new/unresolved Critical or Important findings.
- Task 5: minor (deferred): password checklist can show 5/5 while UTF-8 byte-length enforcement rejects a long Unicode password.
- Task 5: minor (deferred): pending Demo operations lack an explicit busy/live announcement.
- Task 5: minor (deferred): PBKDF2 tests do not independently pin SHA-256/120,000 iterations with a known-answer vector.
- Task 5: minor (deferred): unavailable Web Crypto can surface a raw misleading error instead of the browser-support message.
- Task 5: complete after independent repair re-review (no Git commits; Spec PASS / Quality PASS; 120/120 tests, typecheck, build and production-browser flows passed).
- Task 12: implemented user-requested Light/Dark/System theme with pre-React bootstrap, `auth-classroom:theme:v1` persistence, live system-theme updates, browser/theme-color updates and semantic light/dark tokens. Fixed-dark code panes, inverse panels and solid action colors remain stable; theme-aware validation/success colors use dedicated tokens.
- Task 12 regression coverage: RED→GREEN theme/bootstrap/toggle/token tests plus semantic-class checks across Dashboard, Demo, Lesson, AppShell, CodeExplorer, Callout and ContinueCard; temporarily restoring old fixed classes made the targeted assertions fail, then restoring semantic classes made them pass.
- Task 12 verification: full suite 140/140 across 15 files passed in 81.66s; `npm run typecheck` passed; `npm run build` passed (1,628 modules; JS 621.33 kB / gzip 176.50 kB; non-blocking chunk-size warning).
- Task 12 production-browser verification: default System, System→Light→Dark→System, saved preference after reload, and controlled OS dark/light changes all passed. Latest hashed JS/CSS assets loaded with no failed requests or console errors/warnings.
- Task 12 responsive browser verification: same-origin iframes at 360/768/1440px showed no horizontal overflow or header-control overlap; 360px kept icon controls, 768px showed labels, 1440px kept the fixed 288px sidebar and hid the mobile start action.
- Task 12 computed contrast: dark/light body 16.74/14.25:1, muted 9.13/5.06:1, code detail 15.29/15.67:1, inverse next link 15.81/15.81:1, brand button 6.29/6.29:1, success Callout 12.21/14.45:1, coral CTA 5.76/5.76:1 and inverse Continue panel 15.81/15.81:1. Focus outline remained 3px and reduced-motion CSS was present.
- Task 12 limitation: screenshot capture was unavailable because the in-app browser exposed no visible viewport; visual/layout evidence came from DOM snapshots, computed styles, metrics and scripted interaction, not screenshots.
- Task 12 independent read-only review: Spec PASS / Quality PASS; no Critical or Important findings. Reviewer independently ran focused theme tests 31/31, full suite 140/140 and typecheck successfully; production-browser checks confirmed saved Dark, 360px header fit, 1024/1280px sidebar-header fit and lowest checked text contrast 4.66:1.
- Task 12: minor (deferred): explicit-choice test changes the simulated OS to the same theme and would not catch an implementation that always follows OS theme at src/components/ThemeToggle.test.tsx:74-91.
- Task 12: minor (deferred): bootstrap tests omit saved Dark against a light OS, the key first-paint regression case at src/lib/theme.test.ts:88-121.
- Task 12: minor (deferred): AppShell test asserts classes/visibility but jsdom cannot prove responsive geometry at 360/1024/1280px at src/components/AppShell.test.tsx:81-92; real-browser metrics were checked separately.
- Task 12: complete after independent review (no Git commits; Spec PASS / Quality PASS; 140/140 tests, typecheck, build and production-browser flows passed). Vercel publication still requires explicit approval.
- Task 6 preflight: `ProgressState.quizScores`, `recordQuiz`, Dashboard score display and the `/practice` placeholder already satisfy the required storage/route interfaces; no conflict with earlier tasks. Implement five-question track data, pure scoring, one-question UI, result/retry/review and course-map CTA.
- Task 6: Ruling: External checkpoint commits `dc07d75` and `bceedea` appeared during Task 12 and advanced local/origin main; preserve them unchanged and use `bceedea` as Task 6 BASE — the assistant did not create or push commits, and rewriting external checkpoints would risk unrelated work — cost if wrong: Task 6 review diff may include checkpoint noise.
- Current: Task 6 ready; manual brief/review workflow remains necessary because the installed subagent-driven-development skill contains only SKILL.md and no helper scripts/templates.
- Task 6: complete (commits bceedea..dacb646, review clean; 168/168 tests, typecheck and build passed).
- Task 6 independent review: Spec PASS / Quality PASS; no Critical, Important or Minor findings. Reviewer additionally verified 360px geometry, dark/light contrast, focus, repeated submission and true reload persistence in headless Chrome.
- Task 7: Ruling: Continue in the current primary worktree on `main` without new commits/branches because external checkpoints are already landing there and the approved workflow forbids assistant commits — cost: uncommitted Task 7 changes share the user's active branch until they choose to commit.
