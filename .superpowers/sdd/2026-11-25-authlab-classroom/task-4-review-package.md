# Task 4 Scoped Re-review Package

Review the current working tree read-only. Do not modify files, create commits or mark Task 4 complete. External HEAD is `690bbb6`; Task 4 source changes remain uncommitted and `src/data/lessons/diploma.ts` is untracked.

Read:
- `.superpowers/sdd/2026-11-25-authlab-classroom/task-4-brief.md`
- `.superpowers/sdd/2026-11-25-authlab-classroom/task-4-report.md`
- `.superpowers/sdd/2026-11-25-authlab-classroom/ledger.md`

Inspect:
- `src/pages/LessonPage.tsx` and its strict native-observer regression in `src/pages/LessonPage.test.tsx`.
- `src/data/snippets/setup.ts`, `backend.ts`, `frontend.ts`, `security.ts`, `devops.ts` and `testing.ts`.
- `src/data/lessons/certificate.ts`, `diploma.ts` and `content.test.ts`.
- `git diff 690bbb6 -- src package.json vite.config.ts`, including untracked lesson content.

Verify with:
- `npm run test -- --reporter=dot`
- `npm run typecheck`
- `npm run build`

Re-check the original findings specifically:
1. `IntersectionObserver` uses only native pixel/percent margins; the lesson renders without a browser crash.
2. Express router exists before route declarations; Setup can start before later lessons; all backend snippets are referenced in teaching order.
3. Vue `vue-ts` scaffold uses `main.ts`, Tailwind is installed/configured, directories exist and Bash brace expansion is explicitly tied to Git Bash.
4. Refresh flow installs and mounts cookie-parser, checks Origin and rotates atomically with row lock, conditional update, affectedRows and commit/rollback.
5. SameSite/CSRF explanations are accurate.
6. Frontend Dockerfile copies nginx.conf; Compose mounts the real schema and consumes immutable image variables; remote deploy authenticates and pulls the exact SHA-tagged images.
7. Expired-token negative test uses an existing user and cannot pass merely because user 1 is absent.
8. Thai notes align with the exact nginx and frontend code lines.
9. The optional controller try/catch suggestion was declined based on Express 5 async rejection forwarding.
10. The MySQL grant sub-finding was declined based on official image documentation: MYSQL_USER receives access to MYSQL_DATABASE when configured.

Return only unresolved or newly discovered Critical / Important / Minor findings with file and line evidence, plus explicit Spec PASS/FAIL and Quality PASS/FAIL verdicts. If no Critical/Important findings remain, say so directly.
