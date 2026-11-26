# AuthLab Classroom — Final Whole-Project Review

## Goal

Independently review the complete AuthLab Classroom implementation against the approved plan and the user's original requirements. This is a read-only review: do not edit source, create commits, push, deploy, or publish.

## Binding user requirements

- Thai educational website for teaching students to build Login/Register systems.
- Separate ปวช. (certificate) and ปวส. (diploma) curricula.
- Detailed installation instructions and step-by-step implementation.
- Explain every example-code line, including blank lines.
- Use the supplied ACFROG competition PDF and Thai competition-list PDF as references; extracted text is available at `acfrog3.txt` and `competition-list.txt`.
- Classroom plus a working browser Demo.
- Progress persists in localStorage; Demo session persists in sessionStorage.
- Never store plaintext Demo passwords; use PBKDF2 with a random salt and clearly disclose Demo limitations.
- Responsive desktop/tablet/mobile layout, keyboard access, visible focus, dark mode, and reduced-motion support.
- Production output must be deployable to Vercel as a static Vite site.
- Do not place real secrets in examples or configuration.

## Approved plan

Read `docs/superpowers/plans/2026-11-25-authlab-classroom.md`. Its Global Constraints and Review Focus are binding. The complete implementation includes Tasks 1–7 plus the user-requested dark-mode work.

## Review scope

Review the current working tree, including committed and uncommitted source changes. The review package begins after commit `e305a0a` and excludes generated `dist`, `node_modules`, and internal SDD scratch files. Untracked product files are appended to the package. Use the actual source tree for full context; the package is a navigation and diff aid.

Assess at minimum:

1. Curriculum completeness and correct ปวช./ปวส. separation (8 and 10 lessons respectively).
2. Detailed Thai instructional content, installation steps, runnable/coherent examples, and line-note coverage including blank lines.
3. Dashboard, lesson navigation, progress persistence, quiz scoring/results/retry, and refresh behavior.
4. Demo registration/login/logout/reset correctness, duplicate handling, input validation, password hashing, storage isolation, and honest security limitations.
5. Dark/light/system theme behavior and persistence.
6. Accessibility semantics, labels, focus, modal behavior, live announcements, responsive layout, contrast, and reduced motion.
7. Vercel deployability: package scripts, Node engine, Vite build, `dist` output, HashRouter compatibility, absence of required environment variables or backend runtime, and absence of exposed secrets.
8. Cross-file integration and any regressions not caught by tests.

Previously deferred minor findings are recorded in `.superpowers/sdd/2026-11-25-authlab-classroom/ledger.md`. Reassess them independently; do not assume they are acceptable or fixed.

## Required fresh verification

Run these commands from `D:\สอน\learnmore` and report exact results:

- `npm test`
- `npm run typecheck`
- `npm run build`

Record test counts, exit status, and any warnings. Do not treat an earlier report as fresh evidence. Do not modify files to make a command pass.

Existing real-browser evidence is in `C:\Users\CodeError\.qoder\tmp\authlab-cdp-results.json`; inspect it as supporting evidence, but distinguish what it actually measured from what it did not.

## Report contract

Return:

- **Spec compliance: PASS or FAIL**
- **Code quality: PASS or FAIL**
- **Critical / Important / Minor findings**, each with `file:line` evidence, impact, and a concrete recommended correction.
- **Fresh verification results** with exact counts and warnings.
- **Vercel readiness verdict** and any required project settings.
- **Verified limitations** and anything that could not be independently confirmed.

Do not edit code. Keep the returned message concise; if a detailed report is needed, write it only to `.superpowers/sdd/2026-11-25-authlab-classroom/final-review.md` and return its path plus the verdicts and findings summary.
