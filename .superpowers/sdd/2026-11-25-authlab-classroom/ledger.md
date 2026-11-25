# SDD ledger — plan: C:/Users/PTC/Documents/Qoder/2026-11-25/7643741e/docs/superpowers/plans/2026-11-25-authlab-classroom.md

## Setup
- Spec: approved short design in conversation (no separate design file).
- Workspace: primary working directory is empty of product code and is not a Git repository.
- Ruling: Use the primary project directory as the isolated workspace; do not initialize Git or create commits — the approved plan forbids commits and no repository/shared branch exists — cost: no commit-based rollback/review range.
- Ruling: SDD helper scripts/templates are absent from the installed skill; use plan-derived briefs, file-based reports, manual review packages, and the same implementer/reviewer gates — cost: more controller bookkeeping.
- Ruling: Agent tool exposes no model selector; use available general-purpose agents for implementation and review — cost: cannot choose lower-cost model tiers.
- Preflight conflicts: no existing package.json, source tree, AGENTS.md, or user changes in product workspace. Only plan and PDF text extracts created during this session.
- Current: Task 2 review fix round 1 (Important: track switch drops diploma-only lastLessonId).

## Completion
- Task 1: complete (no Git commits, review clean; esbuild postinstall skipped but build/tests passed; non-blocking policy concern accepted).
- Task 2 fix round 1: resume implementer to validate lastLessonId against all catalog IDs and add diploma security -> certificate persistence regression test.
