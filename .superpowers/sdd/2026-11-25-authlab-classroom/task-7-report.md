# Task 7 Report — Responsive, accessibility และ final verification

**Status:** DONE

## Implementation
- Replaced `window.confirm` in `src/pages/DemoPage.tsx` with a native modal `<dialog>` using `alertdialog`, accessible title/description, initial cancel focus, Escape cancellation, focus restoration, and explicit confirm/cancel actions.
- Added jsdom-only `showModal`/`close` polyfills in `src/test/setup.ts`.
- Added accessibility regression coverage in `src/test/accessibility.test.tsx` for landmarks, form labels, named controls, CodeExplorer live announcements, dialog semantics/focus/Escape, cancel preservation, and confirmed deletion.
- Added explicit course-map link names in `src/components/LessonCard.tsx` after Chrome's accessibility tree exposed ten unnamed lesson links.
- Added `public/favicon.svg`, declared it in `index.html`, and covered the declaration/existence in `src/test/indexDocument.test.ts` after Chrome logged a favicon 404.
- Preserved existing progress/session storage and PBKDF2 Demo constraints.

## RED → GREEN evidence
- New diploma course-map accessible-name test failed before the `aria-label` change, then passed.
- New favicon test failed before the asset/link existed, then passed.
- Focused regression run: 6/6 passed across `accessibility.test.tsx` and `indexDocument.test.ts`.

## Fresh automated verification
- `npm test`: 19 files, 174/174 tests passed.
- `npm run typecheck`: passed.
- `npm run build`: passed; Vite reports a non-blocking 640.03 kB JS chunk-size warning. Final CSS is 46.67 kB (8.90 kB gzip).
- `git diff --check -- index.html src public`: passed.

## Fresh Chrome 158 verification
Evidence: `C:/Users/CodeError/.qoder/tmp/authlab-cdp-results.json`.

- Viewports: 360, 768, 1440px.
- Visited all 8 certificate and 10 diploma lesson routes at each viewport (54 route checks): no document horizontal overflow, expected headings/code/line controls present, main focused after navigation.
- Dashboard and reset dialog: no overflow at any viewport; dialog stayed within viewport; cancel button focused; real Escape closed it, preserved session, and returned focus to the trigger.
- Mobile navigation at 360px: opened Authentication Demo, focused main, rendered correct h1, no overflow.
- Code copy at 360px: real mouse click produced `คัดลอกแล้ว`; clipboard text matched the first snippet after normalizing Windows CRLF.
- Line selection: line 2 live region contained `LINE NOTE บรรทัด 2` and its explanation.
- Chrome accessibility tree: one main, zero unnamed interactive nodes.
- Contrast: lowest checked normal-text pair 4.77:1 (light success on soft-success); all other checked pairs higher.
- Reduced motion: root scroll behavior `auto`; sampled transition duration `1e-05s`.
- Errors: zero page exceptions, console errors, failed requests, or HTTP 400+ responses.

## Fresh production-preview verification
- Served the latest `dist` through Vite preview and loaded `/#/demo`; the page rendered the expected heading and current hashed JS/CSS with no horizontal overflow or console warnings/errors.
- Registered a disposable Demo account, confirmed the stored user had only `id`, `name`, `email`, `salt`, `passwordHash`, and `createdAt`, with 32-character salt/64-character hash and no plaintext password; the session was in `sessionStorage`.
- Logged out and logged back in successfully, then reset the disposable data and confirmed zero Demo users and no session remained.
- While the native alertdialog was open, Tab moved Cancel → Confirm → Cancel and Shift+Tab moved Cancel → Confirm; focus stayed inside the dialog and `:modal` was true.
- Hit-testing the background Logout/Reset controls returned dialog content instead of those controls; the modal accessibility snapshot exposed only the alertdialog.
- Escape closed the dialog, preserved the session, and restored focus to the Reset trigger.

## Earlier Task 7 browser evidence retained
- Demo Register → active session → reset cancel/Escape → Logout → wrong-password generic error → correct Login → duplicate-registration error.
- Certificate quiz 5/5 pass, persisted score after reload, 0/5 wrong attempt, retry reset/focus, stored score preserved during retry.
- Lesson completion and dashboard progress persisted after reload.
- All diploma routes opened with code and line controls.

## Build-output hygiene
- Reproduced Tailwind scanning generated `dist`: a temporary `p-[137px]` probe appeared in built CSS.
- Added `@source not "../dist";` in `src/index.css`; the same probe no longer appeared in the current CSS while normal utility generation remained intact.
- Confirmed this Windows/Node runtime silently leaves files in place when Vite calls `fs.rmSync(..., { recursive: true, force: true })`; manually removed only generated `dist` contents with `unlink`/`rmdir`, then rebuilt. Final `dist` contains only `index.html`, favicon, and the current JS/CSS assets.
- Latest production preview loaded the current hashed assets and rendered Dashboard, Practice, Lesson, and Demo routes with no horizontal overflow or console warnings/errors.

## Known limitations / deferred findings
- Browser automation covered Chrome 158 and the current in-app browser only; no manual screen-reader or cross-browser certification was performed.
- Live-region evidence proves DOM updates, not actual assistive-technology speech.
- Docker/pipeline examples were statically reviewed, not executed.
- Existing deferred content/Demo/theme minor findings remain recorded in the ledger.
- Vite's large-chunk warning remains; no code splitting was added outside Task 7 scope.

## Repository state
- External checkpoint `c857629` contains the initial Task 7 dialog/test changes.
- The course-map naming, favicon, and their regression tests are current uncommitted working-tree changes.
- No commits, branches, pushes, or Vercel publication were created by the assistant.
