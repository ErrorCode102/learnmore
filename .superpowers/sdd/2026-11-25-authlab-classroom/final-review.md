# AuthLab Classroom — Independent Final Whole-Project Review

## Verdicts

- **Spec compliance: FAIL.** The approved Task 4 requires syntax-highlighted code, but the implementation tokenizes code without applying any visible token colors. Several instructional examples also contradict the current toolchain or one another, weakening the required detailed, coherent implementation guidance.
- **Code quality: FAIL.** Automated gates pass, but Important installation/content-integration defects and several Demo/accessibility/editorial defects remain.
- **Critical findings: None identified.**

The review covered the actual working tree at HEAD `c857629` plus uncommitted product changes, not only the supplied diff. No source or test files were edited. The required production build refreshed generated files under `dist/`; no commit, branch, push, deployment, or publication was performed.

## Findings

### Important

#### I-1. Code is tokenized but not visibly syntax-highlighted

- **Evidence:** `docs/superpowers/plans/2026-11-25-authlab-classroom.md:105`; `src/components/CodeExplorer.tsx:26-35`; `src/main.tsx:4`; `src/index.css:1-147`.
- **Impact:** Prism emits `.token.*` spans, but no Prism stylesheet or local `.token.*` color rules are loaded. Tokens inherit the single code text color, so the binding Task 4 feature is not visually delivered.
- **Correction:** Import an appropriate Prism theme or define accessible light/dark `.token.*` rules, then add a browser/computed-style regression test proving token categories render in different colors.

#### I-2. The taught Node.js 18 minimum conflicts with the current Vite toolchain

- **Evidence:** `src/data/lessons/certificate.ts:180,184,194`; `src/data/snippets/installation.ts:16`; `src/data/snippets/setup.ts:16`; `package-lock.json:3414-3416`.
- **Impact:** Learners are told Node 18 is acceptable, while `npm create vite@latest` and the locked Vite 7 toolchain require Node `^20.19.0 || >=22.12.0`. Following the stated minimum can fail scaffolding or building.
- **Correction:** State Node `>=20.19.0` or a compatible `>=22.12.0` release for this workshop. Mention Node 18 only as a historical competition-reference baseline, not a supported workshop floor.

#### I-3. The advanced refresh-token lifecycle never issues its initial cookie

- **Evidence:** `src/data/lessons/diploma.ts:43`; `src/data/snippets/security.ts:130-143`; `src/data/snippets/backend.ts:301-353`; `src/data/snippets/security.ts:269-292,391-392`.
- **Impact:** The diploma text says Register/Login must call `issueRefreshToken`, but the shown controllers issue only access tokens. The refresh route rotates an existing cookie, so a learner following the displayed code cannot obtain the initial refresh cookie and the presented lifecycle does not work end to end.
- **Correction:** Show patched Register/Login code importing and awaiting `issueRefreshToken(res, user.id)` after successful credential/database operations, with rollback/error handling, and add integration coverage for initial issuance, refresh, and logout.

### Minor

#### M-1. Registration can persist an account but report failure

- **Evidence:** `src/lib/authDemo.ts:201-210`.
- **Impact:** If `localStorage` succeeds but `sessionStorage` fails, registration throws even though the user was already saved. Retrying then produces a duplicate-email error.
- **Correction:** Make user/session persistence atomic under the lock, roll back a newly created user on session failure, or return an explicit “account created, session unavailable” result. Add a sessionStorage-failure test.

#### M-2. Confirm-reset likely leaves keyboard focus without a valid target

- **Evidence:** `src/pages/DemoPage.tsx:42-55,113-130,195-203`.
- **Impact:** Confirmation clears the session, unmounting the reset trigger before the effect attempts to focus it. Cancellation/Escape works, but successful reset can drop focus to the document.
- **Correction:** Focus a persistent heading or form control after reset, or restore focus only when the trigger remains connected. Add a confirm-reset focus assertion.

#### M-3. The password checklist can disagree with enforcement

- **Evidence:** `src/lib/authDemo.ts:62-78`.
- **Impact:** The checklist counts JavaScript characters, while enforcement also limits UTF-8 bytes. A multibyte password can show all checks passed and still be rejected.
- **Correction:** Share one byte-aware policy helper between checklist and validation, and label the limit clearly as UTF-8 bytes where applicable.

#### M-4. Pending Demo operations lack an explicit live announcement

- **Evidence:** `src/pages/DemoPage.tsx:70-85,314-329`.
- **Impact:** The button changes text and becomes disabled, but assistive technology is not explicitly informed that an operation is pending.
- **Correction:** Add `aria-busy` and a polite status message for pending/completed operations.

#### M-5. Unsupported Web Crypto can surface raw or misleading errors

- **Evidence:** `src/lib/authDemo.ts:45-47,81-112`.
- **Impact:** Environments without `crypto.subtle` can fail with low-level exceptions rather than a clear browser-support message.
- **Correction:** Capability-check Web Crypto and return a clear Thai HTTPS/browser-support error before hashing.

#### M-6. Dashboard teaches the wrong Register endpoint and status

- **Evidence:** `src/pages/Dashboard.tsx:213-216`; compare `src/data/lessons/certificate.ts:367` and `src/data/snippets/backend.ts:321`.
- **Impact:** The visible dashboard strip says `POST /api/register` and `200 OK`, while the lessons implement `/api/auth/register` and `201 Created`. `aria-hidden` does not fix the visual instructional contradiction.
- **Correction:** Use `/api/auth/register` and `201 Created`.

#### M-7. Practice heading lacks Thai/English spacing

- **Evidence:** `src/pages/PracticePage.tsx:301`.
- **Impact:** `ฝึกท้ายบทAuthentication` is visibly malformed.
- **Correction:** Change it to `ฝึกท้ายบท Authentication` and update the matching test expectation.

#### M-8. Russian text remains in a Thai line note

- **Evidence:** `src/data/snippets/setup.ts:292`.
- **Impact:** `даже когда` breaks the Thai-only instructional presentation.
- **Correction:** Replace it with the intended Thai wording.

#### M-9. Health-check guidance contradicts the implementation

- **Evidence:** `src/data/snippets/backend.ts:42`; `src/data/snippets/devops.ts:19`; `src/data/lessons/diploma.ts:86`.
- **Impact:** The lesson implies `/api/health` verifies MySQL and uses it as a container healthcheck, but the endpoint only proves the process responds. The same diploma later says healthchecks must check the real service.
- **Correction:** Separate liveness from readiness and query MySQL for readiness, or stop claiming database verification.

#### M-10. `.dockerignore` placement advice is wrong for the shown nested contexts

- **Evidence:** `src/data/snippets/devops.ts:151,178,198-200`.
- **Impact:** Compose builds from `./auth-backend` and `./auth-frontend`; a root `auth-lab/.dockerignore` is not automatically used for those contexts, so secrets or dependencies may enter the build context.
- **Correction:** Place ignore files in each build context or use Dockerfile-specific ignore files, and show the resulting directory layout.

#### M-11. Installation commands are not portable to PowerShell as presented

- **Evidence:** `src/data/snippets/installation.ts:10,13`.
- **Impact:** In PowerShell, `where` aliases `Where-Object`, so the displayed checks do not behave as intended unless the shell is explicitly Git Bash/Command Prompt.
- **Correction:** Specify Git Bash and `where`, or use PowerShell `Get-Command`.

#### M-12. Register response timestamp differs between code and example

- **Evidence:** `src/data/snippets/backend.ts:297-299,324`; `src/data/snippets/api.ts:102`.
- **Impact:** The controller passes only `{ id, email }`, producing `created_at: null`, while the JSON example promises a concrete timestamp.
- **Correction:** Fetch and return the created row, or make both examples consistently use `null`.

#### M-13. The initial JavaScript bundle triggers the build size warning

- **Evidence:** `src/App.tsx:4-7`; fresh build output below.
- **Impact:** All routes and lesson data are eagerly imported, producing 640.03 kB minified JavaScript (180.56 kB gzip).
- **Correction:** Code-split routes and heavy lesson/snippet data, load Prism grammars on demand, and remeasure.

#### M-14. PBKDF2 coverage lacks an independent known-answer vector

- **Evidence:** `src/lib/authDemo.test.ts:47-57`.
- **Impact:** The test proves determinism and verification within the same implementation but does not independently pin SHA-256, 120,000 iterations, or the expected derived bytes.
- **Correction:** Add a fixed password/salt expected-output vector generated independently of this implementation.

#### M-15. Theme tests omit the most important first-paint and explicit-choice contrasts

- **Evidence:** `src/lib/theme.test.ts:88-121`; `src/components/ThemeToggle.test.tsx:74-91`.
- **Impact:** Bootstrap tests omit saved Dark against a light OS. The explicit-choice test changes the OS to the same theme as the selected preference, so it would not catch an implementation that incorrectly follows the OS after an explicit choice.
- **Correction:** Add saved Dark/light-OS bootstrap coverage and explicit-choice tests where OS and selected themes differ.

## Fresh verification

Executed from `D:\สอน\learnmore` using Node `v24.11.0` and npm `11.6.2`.

| Command | Exit | Fresh result | Warnings |
|---|---:|---|---|
| `npm test` | 0 | Vitest `5.1.1`; 19 test files passed; 174 tests passed; 15.12 s; started 21:51:56 | Informational: jsdom was created 19 times, totaling 74.68 s; Vitest suggested `pool: 'vmThreads'` or `isolate: false`. No test failures or React warnings. |
| `npm run typecheck` | 0 | `tsc -b --pretty false`; no diagnostics | None. |
| `npm run build` | 0 | Vite `7.3.8`; 1,631 modules transformed; built in 4.39 s | Minified JavaScript chunk exceeds 500 kB. |

Build output:

- `dist/index.html`: 1.62 kB; gzip 0.79 kB
- CSS: 47.44 kB; gzip 9.00 kB
- JavaScript: 640.03 kB; gzip 180.56 kB

## Confirmed strengths

- The registries provide eight certificate lessons and ten diploma lessons; `security` and `devops` are diploma-only.
- `defineSnippet` enforces one note per physical code line, including blank lines. Content tests check IDs, note counts, Thai substance, required terms, and placeholders. Semantic accuracy is not guaranteed by those checks, as the findings above demonstrate.
- Dashboard, lesson navigation, completion state, per-level quiz scores, retry, and invalid-route redirects are implemented. Progress and Demo data use separate keys; Demo users use `localStorage`, sessions use `sessionStorage`.
- Quiz attempts lock answers, prevent incomplete/duplicate final submission, retain results, and remount correctly when the track changes.
- Demo passwords use PBKDF2-SHA256 with 120,000 iterations, 256-bit derived keys, and random per-user salts. Duplicate registration is protected across tabs with Web Locks. The page clearly states that the Demo is browser-only, has no real JWT, and is not production authentication.
- Light/dark/system selection, pre-React theme bootstrap, persistence, OS-theme listening, and theme-color updates are implemented.
- The source includes semantic landmarks, labels, skip link, visible focus, live line notes, native dialog semantics, and reduced-motion overrides.
- `HashRouter` avoids server rewrite requirements. No real secrets were identified in the reviewed source/configuration.

## Existing CDP evidence

The supplied `C:\Users\CodeError\.qoder\tmp\authlab-cdp-results.json` records Chrome `158.0.8127.37` at 360, 768, and 1440 px:

- No dashboard or lesson-route horizontal overflow; main content received focus on lesson navigation.
- Reset dialog remained in the viewport, was modal, initially focused Cancel, and Escape restored trigger focus while preserving the session.
- Lowest listed sampled contrast ratio was 4.77:1; other samples included 5.06:1, 5.76:1, and 9.13:1.
- Reduced motion produced `scroll-behavior: auto` and approximately `0.00001 s` transitions.
- No unnamed interactive nodes appeared in the measured snapshot.
- Clipboard content matched after newline normalization; selected-line notes updated.
- `pageErrors`, `consoleErrors`, `failedRequests`, and `badResponses` were empty.

This was existing evidence, not a fresh CDP run by this reviewer.

## Vercel readiness

**Ready, with project-setting caveats.**

- Framework: Vite
- Build command: `npm run build`
- Output directory: `dist`
- Node: select `>=20.19.0`; a compatible 20.x release at or above 20.19 or suitable 22.x release is required
- Environment variables: none required
- Backend/services: none required
- SPA rewrites: none required because routes use hashes
- `vercel.json`: not required or present
- Secrets: no high-confidence real credentials/private keys found in the static scan
- Non-blocking issue: address the 500 kB chunk warning

No Vercel deployment was performed.

## Verified limitations and unconfirmed behavior

- The supplied reference extracts `acfrog3.txt` and `competition-list.txt` produced invalid-UTF-8/legacy-encoding warnings. Visible English terms and section numbering support the ACFROG 57/competition 58 topic mapping, but exact Thai wording was not independently confirmed.
- The separate Node/Express/MySQL/Vue/Docker/GitLab instructional project was reviewed statically, not executed.
- The supplied CDP evidence did not measure the full Demo register → logout → login flow, duplicate/reset confirmation, quiz result/retry, progress after actual refresh, theme cycling/reload/OS changes, confirm-reset focus, complete Tab traversal/background inertness, screenshots, every contrast pair, production HTTPS, or Vercel deployment.
- Static secret scanning cannot prove the absence of every possible obfuscated or externally supplied secret.
