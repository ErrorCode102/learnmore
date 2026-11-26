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
