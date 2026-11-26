# Task 3 Fix Round 1 Independent Review

**Spec: PASS**  
**Quality: PASS**

## Review basis

- Independently reviewed the original findings in `task-3-review.md`, the updated evidence in `task-3-report.md`, and the fixed source and tests in `task-3-fix-1-review-package.txt`.
- The evidenced test, typecheck, build, contrast, and real-browser checks were accepted and were not rerun. No code was edited and no subagents were dispatched.

## Finding verification

### Important 1 — Route-change focus/scroll and course-map behavior: resolved

`src/components/AppShell.tsx:44-56` now owns one post-route effect keyed to `location.key`, `location.pathname`, and `location.hash`. Ordinary routes reset document scrolling and focus `#main-content`; `#course-map` instead scrolls and focuses the map. The dashboard source in the package contains no competing hash effect, and the map is a focusable target with scroll-margin (`src/pages/Dashboard.tsx:639-644`). This removes the duplicate behavior that could race and implements the requested focus and scroll contract.

The integration tests use the real `HashRouter`, provider, and rendered pages rather than mocking the effect. They activate next-lesson and course-map-card links, assert the resulting hash and heading, assert main-content focus, and verify the exact `window.scrollTo({ top: 0, behavior: 'instant' })` call (`src/pages/LessonPage.test.tsx:1281-1301`, `src/pages/Dashboard.test.tsx:1115-1136`). Breadcrumb and direct-fragment tests separately verify `#/#course-map`, focus on the actual map element, the targeted `scrollIntoView({ block: 'start' })` call, and—on breadcrumb navigation—the absence of the ordinary scroll reset (`src/pages/LessonPage.test.tsx:1303-1326`, `src/pages/Dashboard.test.tsx:1104-1113`). Fragment-to-home coverage confirms return to normal focus and scrolling (`src/components/AppShell.test.tsx:771-789`). These are genuine behavioral assertions against user-observable routing, focus, and scroll requests.

### Important 2 — CTA contrast in normal and hover states: resolved

The continue CTA now uses `text-ink` on `bg-coral`, including its darker hover background (`src/components/ContinueCard.tsx:262-271`). The reported ratios are 5.764:1 normally and 4.655:1 on hover, both above the 4.5:1 requirement for its 14 px text.

The contrast tests are substantive rather than tautological: they parse the real `--ink` and `--coral` theme values from `index.css`, implement the WCAG relative-luminance calculation, and require at least 4.5:1. The rendered-CTA test additionally requires `bg-coral` and `text-ink`, rejects `text-white`, extracts the hover color from the link's actual hover class, and recalculates contrast against that color (`src/components/ContinueCard.test.tsx:801-855`, `src/components/ContinueCard.test.tsx:871-891`). `fireEvent.mouseOver` does not prove browser CSS hover painting, but the rendered-class coupling verifies the actual hover declaration used by the browser. Combined with the accepted evidence, this adequately covers both states without claiming jsdom performs visual or computed-style rendering.

### Minor 1 — Behavioral navigation regression tests: resolved

The added coverage directly addresses the prior gaps:

- Progressed and all-complete dashboard cases assert both the continue-card destination and the dynamic hero `เริ่มเรียน` href (`src/pages/Dashboard.test.tsx:1022-1075`).
- Direct fragment loading and lesson breadcrumb activation assert `#/#course-map` and a `scrollIntoView` call whose instance is the real `#course-map` element (`src/pages/Dashboard.test.tsx:1104-1113`, `src/pages/LessonPage.test.tsx:1303-1326`).
- The skip-link test dispatches a cancelable bubbling click, verifies default navigation is prevented, verifies main-content focus and targeted scrolling, and confirms the route remains `#/` (`src/components/AppShell.test.tsx:705-728`). This tests the native anchor's keyboard-equivalent activation behavior without pretending jsdom supplies a full browser keyboard event sequence.
- Shell assertions cover `aria-current="page"` on root home, lesson routes, practice, and demo (`src/components/AppShell.test.tsx:730-759`).
- Course-map-card activation also covers navigation from below the fold and return from fragment navigation (`src/pages/Dashboard.test.tsx:1115-1136`, `src/components/AppShell.test.tsx:771-789`).

The tests exercise rendered router links and DOM state; they do not replace the implementation with a mocked success path. The `Element.prototype.scrollIntoView` mock is necessary in jsdom, and each behavioral assertion checks both invocation and target. The mobile-overflow class test is intentionally only a structural guard; the accepted real-browser evidence supplies the layout verification.

### Minor 2 — Mobile sticky overflow: resolved

The shell wrapper now uses `overflow-x-clip`, while the mobile navigation retains `sticky top-0` (`src/components/AppShell.tsx:59`, `src/components/AppShell.tsx:77`). This avoids the `overflow-x-hidden` ancestor condition identified in the original review. The regression test checks both sides of that contract—clip present and hidden absent—plus the sticky positioning classes (`src/components/AppShell.test.tsx:761-769`).

The jsdom test does not establish actual viewport stickiness or layout, and it is not presented as doing so. The report separately records a real headless-Chrome check at 360×800 confirming computed `overflow-x: clip`, navigation at `top: 0` after scrolling to 600 px, and document/body scroll widths of 360 px before and after scrolling. That evidence is appropriate for the requested real-browser verification and was accepted without rerunning it.

## Remaining findings

None within the scoped fix review.

## Counts

- Critical: 0
- Important: 0
- Minor: 0
