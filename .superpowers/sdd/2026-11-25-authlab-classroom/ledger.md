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
