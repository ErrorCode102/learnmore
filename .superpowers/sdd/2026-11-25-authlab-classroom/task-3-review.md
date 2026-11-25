# Task 3 Independent Review

**Spec: PASS**  
**Quality: FAIL**

## Review basis

- Reviewed the brief, implementation, tests, and report. The implementer's self-review and completion notes were not used as evidence. The reported test/typecheck/build results were accepted and not rerun. No code was edited, no subagents were spawned, and no Git commands were run.
- The required provider/router composition is present. `ProgressProvider` calls `useProgress()` once and `useClassroomProgress()` exposes its return type with a useful outside-provider error (`src/context/ProgressContext.tsx:5-22`). `renderApp()` has the required HashRouter → ProgressProvider → Routes nesting and the four requested destinations plus wildcard redirect (`src/App.tsx:44-76`).
- Progress is shared rather than copied: the shell, dashboard, continue card, and lesson page all consume the same context (`src/components/AppShell.tsx:34-40`, `src/pages/Dashboard.tsx:60-75`, `src/components/ContinueCard.tsx:39-44`, `src/pages/LessonPage.tsx:16-35`). Completion goes through `toggleLesson`, updates consumers immediately, and is persisted by the existing effect (`src/hooks/useProgress.ts:11-32`).
- The catalogs retain the exact eight certificate and ten diploma IDs and order (`src/data/course.ts:3-180`; exact-ID regression coverage at `src/lib/progress.test.ts:40-58`). The dashboard renders one `LessonCard` per active-catalog lesson, with the required metadata and visual timeline (`src/pages/Dashboard.tsx:350-382`, `src/components/LessonCard.tsx:10-65`).
- Continue selection is correct for empty, non-contiguous, and complete completion sets: it uses a set, selects the first incomplete catalog item, and falls back to the final item only when every item is complete. All three Thai CTA labels are exact (`src/components/ContinueCard.tsx:11-32`).
- Lesson validation is against the active level, so unknown and diploma-only IDs redirect from the certificate track; valid final lessons link to `/practice` (`src/pages/LessonPage.tsx:16-35`, `src/pages/LessonPage.tsx:252-267`). Opening a valid lesson records `lastLessonId` without changing completion (`src/hooks/useProgress.ts:29-33`, `src/pages/LessonPage.tsx:22-26`).
- The HashRouter fragment links use the correct `/#course-map` form, and the dashboard observes React Router's inner location hash (`src/App.tsx:32-38`, `src/pages/LessonPage.tsx:43-49`, `src/pages/LessonPage.tsx:243-249`, `src/pages/Dashboard.tsx:77-81`). The skip link prevents its native fragment from being interpreted as a HashRouter route and explicitly focuses content (`src/components/AppShell.tsx:26-31`, `src/components/AppShell.tsx:53-59`, `src/components/AppShell.tsx:149-151`).
- The shell has one main landmark, labelled navigation, active states, a home brand link, native keyboard-operable controls, and responsive sidebar/top-navigation structure (`src/components/AppShell.tsx:61-116`, `src/components/AppShell.tsx:149-160`). Primary UI copy is Thai with English technical terms; no emojis or invented competition sub-scores were found. The ACFROG 57/competition list 58 disclaimer is present (`src/pages/Dashboard.tsx:385-403`). Task 4–6 placeholders were not treated as missing implementation.
- The new tests genuinely exercise the real router, provider, and localStorage for the listed TDD cases. In particular, the completion test reads persisted storage and remounts before asserting restored progress (`src/pages/Dashboard.test.tsx:164-189`), and the redirect tests assert both rendered content and the resulting hash (`src/pages/LessonPage.test.tsx:132-153`). They are not mere snapshot or implementation-detail tests. Coverage gaps are called out below.

## Findings

### Important 1 — Client-side lesson navigation loses focus and retains the previous scroll position

**Evidence:** Route links are ordinary React Router links (`src/components/LessonCard.tsx:24-26`, `src/pages/LessonPage.tsx:230-267`), but the shell only reads `useLocation()` to style active navigation and then renders `<Outlet />`; it has no route-change focus or scroll effect (`src/components/AppShell.tsx:34-40`, `src/components/AppShell.tsx:149-151`). The tests click next/breadcrumb links and immediately query the new heading, but never assert `document.activeElement` or scroll position (`src/pages/LessonPage.test.tsx:96-109`, `src/pages/Dashboard.test.tsx:174-183`).

**Impact:** Activating a lesson link unmounts the focused link without moving focus to the new route. Keyboard users must restart tabbing from the skip link, screen-reader users may not be notified of the new page, and a user who clicks a course-map card or the bottom previous/next control can land mid-page on the new lesson because HashRouter does not reset document scrolling. This undermines the required usable, keyboard-accessible lesson navigation.

**Exact fix:** Add a route-change effect in `AppShell`, keyed to `location.key`/`location.pathname`, that runs after the new route commits. For ordinary lesson/placeholder navigation, call `window.scrollTo({ top: 0, behavior: 'instant' })` and focus `#main-content` with `{ preventScroll: true }`. For `location.hash === '#course-map'`, focus/scroll `#course-map` after render instead, and remove the duplicate dashboard hash effect so the two behaviors cannot race. Add integration tests that activate a lesson link, assert the new route's main content receives focus and scroll is reset, then separately activate the breadcrumb and assert the course-map fragment behavior.

### Important 2 — The primary continue CTA has insufficient text contrast

**Evidence:** The continue link combines `bg-coral` with `text-white` at `text-sm` (`src/components/ContinueCard.tsx:80-89`). The coral token is `#f97362` (`src/index.css:17-28`), which has approximately 2.8:1 contrast against white; normal 14 px text requires at least 4.5:1 under WCAG AA.

**Impact:** The main continuation action is difficult to read for low-vision users and fails baseline accessible contrast despite being keyboard operable.

**Exact fix:** Keep the coral design but use dark ink text on that background (`text-ink`, approximately 5.8:1 against `#f97362`), or introduce a darker coral background token that reaches 4.5:1 with white. Apply the same verified contrast to the hover state and add a contrast assertion/accessibility audit for this CTA.

### Minor 1 — Several navigation requirements lack behavioral regression tests

**Evidence:** The hero is dynamic in code (`src/pages/Dashboard.tsx:75`, `src/pages/Dashboard.tsx:110-119`), but its only href assertion is the default overview case (`src/pages/Dashboard.test.tsx:49-71`); the progressed/all-complete cases assert only `ContinueCard` (`src/pages/Dashboard.test.tsx:119-162`). The implementation has explicit fragment handling (`src/pages/Dashboard.tsx:77-81`) and skip-link handling (`src/components/AppShell.tsx:26-31`), but the breadcrumb tests assert only dashboard progress/continue content (`src/pages/Dashboard.test.tsx:174-183`, `src/pages/LessonPage.test.tsx:73-83`). No test asserts the `#/#course-map` URL, a `course-map` scroll call, skip-link focus, or shell `aria-current` states. The optional `scrollIntoView?.` call silently does nothing in jsdom unless mocked.

**Impact:** Regressions such as hard-coding the hero to overview, changing fragment links to `#course-map`, removing the dashboard effect, letting the skip link reroute HashRouter, or breaking active nav states would leave the current suite green.

**Exact fix:** Extend the progressed/all-complete dashboard test to assert the hero `เริ่มเรียน` href as well as the continue-card href. Mock/spy on `Element.prototype.scrollIntoView`, load `#/#course-map` directly and via the lesson breadcrumb, and assert both the HashRouter URL and a call targeting `#course-map` with `{ block: 'start' }`. Add a skip-link test that dispatches keyboard-equivalent activation, asserts default navigation is prevented, and asserts `#main-content` receives focus. Add shell assertions for `aria-current="page"` on home (including lesson routes), practice, and demo.

### Minor 2 — The wrapper's horizontal overflow can disable the intended sticky mobile navigation

**Evidence:** The mobile navigation is `sticky top-0` (`src/components/AppShell.tsx:61`), but its ancestor uses `overflow-x-hidden` (`src/components/AppShell.tsx:43`). In CSS, `overflow-x: hidden` causes the orthogonal visible overflow to compute as `auto`, establishing a scroll container that can prevent the descendant sticky header from remaining fixed to the viewport.

**Impact:** On mobile widths the navigation can scroll away instead of remaining the intended sticky top bar, reducing persistent access to classroom navigation.

**Exact fix:** Replace the wrapper's `overflow-x-hidden` with `overflow-x-clip` (or move horizontal clipping to a non-ancestor), then verify at 360 px in a real browser that the top navigation remains visible while the page scrolls and that decorative blur still does not create horizontal overflow.

## Counts

- Critical: 0
- Important: 2
- Minor: 2

## Required fixes

Resolve Important 1 and Important 2 before acceptance. The minor items are low-cost regression/accessibility hardening and should be fixed with the same pass.
