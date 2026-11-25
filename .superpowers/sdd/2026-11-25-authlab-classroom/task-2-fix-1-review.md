# Task 2 Fix Round 1 Review

**Spec: PASS**  
**Quality: PASS**

## Scoped verification

Reviewed only the original Important finding and its round 1 fix. Reported test, typecheck, and build results were accepted as evidence and were not rerun.

- **Fix is correct:** `normalizeProgress` now builds `allowedLastLessonIds` from the union of `certificateLessons` and `diplomaLessons` (`src/lib/progress.ts:93-102`). Because `saveProgress` persists the normalized state (`src/lib/progress.ts:120-127`), diploma-only `lastLessonId: 'security'` remains valid after the selected level changes to certificate.
- **Regression test genuinely exercises persistence:** the test saves a diploma state containing `lastLessonId: 'security'`, mounts `LevelSwitcher` with `useProgress`, clicks the certificate button, and then calls `readProgress()` (`src/components/LevelSwitcher.test.tsx:221-254`). Reading storage after the UI-driven switch verifies the persisted round trip rather than merely inspecting hook state. The full-state equality assertion also confirms that only `level` changes and that both completion arrays and quiz scores survive.

## Remaining findings

- **Critical: 0**
- **Important: 0**

No new findings were assessed outside the requested scope. No code was edited and no subagents were spawned.
