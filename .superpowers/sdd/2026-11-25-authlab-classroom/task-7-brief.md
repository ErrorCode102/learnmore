# Task 7 Brief — Responsive, accessibility และ final verification

## Goal
Finish AuthLab Classroom with keyboard/screen-reader accessible interactions, responsive layouts at 360/768/1440px, verified light/dark contrast and reduced motion, and a clean final browser/test/build pass.

## Binding requirements
- Buttons and links have accessible names; form inputs have labels.
- CodeExplorer announces the selected line and explanation through a polite atomic live region.
- Escape closes the Demo reset dialog without deleting data; focus moves inside and returns to the trigger.
- No horizontal overflow at 360, 768, or 1440px; sticky desktop sidebar/mobile navigation remains usable.
- Check WCAG AA text contrast in light/dark themes and reduced-motion behavior.
- Preserve one main landmark, one h1, skip link, route focus/scroll behavior, and visible focus.
- Demo must never store plaintext passwords; use PBKDF2 + salt and state Demo limitations.
- Progress stays in localStorage; Demo session stays in sessionStorage.
- Verify dashboard tracks, every lesson, code copy, line selection, Demo Register/Login/duplicate/Logout, quiz pass/retry, progress after refresh, and mobile navigation.
- No console or network errors.
- Run `npm test`, `npm run typecheck`, and `npm run build`.
- Do not create commits/branches or publish to Vercel without explicit user approval.

## Review focus
1. Keyboard-only dialog use: Tab/Shift+Tab/Escape and focus restoration.
2. Screen-reader names: especially course-map links and icon-only controls.
3. Narrow layouts: long code, dialogs, navigation, and controls at 360px.
4. Theme contrast: normal text, status messages, buttons, and inverse panels.
5. Reduced motion: transitions and scrolling become effectively immediate.

## Files in scope
- `index.html`
- `public/favicon.svg`
- `src/components/LessonCard.tsx`
- `src/pages/DemoPage.tsx`
- `src/pages/DemoPage.test.tsx`
- `src/test/accessibility.test.tsx`
- `src/test/indexDocument.test.ts`
- `src/test/setup.ts`
