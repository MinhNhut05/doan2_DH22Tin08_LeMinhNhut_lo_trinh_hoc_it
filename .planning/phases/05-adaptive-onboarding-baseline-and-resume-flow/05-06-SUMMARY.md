---
phase: 05-adaptive-onboarding-baseline-and-resume-flow
plan: 06
subsystem: ui
tags: [react, typescript, react-query, framer-motion, vitest, onboarding]
requires:
  - phase: 05-adaptive-onboarding-baseline-and-resume-flow
    provides: hook-based onboarding data access from plan 05-03 and onboarding UI primitives from plan 05-05
provides:
  - hook-driven onboarding page container with server-authoritative resume and redirect logic
  - centralized Vietnamese onboarding copy contract in vi.ts
  - integration tests for resume, round submit, confirm, and redirect flows
affects: [frontend, onboarding, learner-profile, recommendation-flow, testing]
tech-stack:
  added: []
  patterns:
    - hook-only server access in page containers via React Query hooks
    - centralized locked UI copy via frontend/src/strings/vi.ts
    - module-boundary hook mocking for onboarding integration tests
key-files:
  created: []
  modified:
    - frontend/src/pages/Onboarding.tsx
    - frontend/src/strings/vi.ts
    - frontend/src/pages/Onboarding.test.tsx
    - frontend/src/components/onboarding/WelcomeBackCard.tsx
    - frontend/src/components/onboarding/Stepper.tsx
    - frontend/src/components/onboarding/RoundOne.tsx
    - frontend/src/components/onboarding/RoundTwo.tsx
    - frontend/src/components/onboarding/RoundThree.tsx
    - frontend/src/components/onboarding/RecommendationPanel.tsx
key-decisions:
  - "Onboarding.tsx now derives active round, resume visibility, recommendation state, and redirect behavior from React Query hooks instead of direct axios calls."
  - "Locked onboarding copy is centralized in vi.ts and reused by child components to keep resume and confirm flows consistent with the UI-SPEC contract."
patterns-established:
  - "Page container pattern: hooks own server state, child components emit typed payloads upward, and page-level motion wraps state transitions."
  - "Onboarding tests mock hook modules instead of axios so behavior stays stable as data-access internals evolve."
requirements-completed: [ONB-04, ONB-05, ONB-06, ONB-07]
duration: 12min
completed: 2026-03-25
---

# Phase 05 Plan 06: Frontend: Onboarding Page Container, Strings, and Integration Tests Summary

**Hook-driven multi-round onboarding container with resume-aware transitions, centralized Vietnamese copy, and integration coverage for submit, confirm, and redirect flows**

## Performance

- **Duration:** 12 min
- **Started:** 2026-03-25T16:34:00Z
- **Completed:** 2026-03-25T16:46:08Z
- **Tasks:** 3
- **Files modified:** 9

## Accomplishments
- Rebuilt `/onboarding` as a clean container that uses the dedicated onboarding hooks instead of direct `api.get/post` calls.
- Centralized the locked onboarding copy contract in `frontend/src/strings/vi.ts` and reused it across resume, round, stepper, and confirm surfaces.
- Added behavioral tests that cover resume continuation, round-one submit payloads, recommendation confirmation, and post-confirm redirect behavior.

## Task Commits

Each task was committed atomically:

1. **Task 8: Refactor Onboarding.tsx as multi-round container** - `490563f` (feat)
2. **Task 9: Add onboarding string keys to vi.ts** - `6fc3fdd` (feat)
3. **Task 10: Extend Onboarding.test.tsx with resume and confirm integration tests** - `486aa14` (test)

## Files Created/Modified
- `/home/minhnhut_dev/projects/path-learn/frontend/src/pages/Onboarding.tsx` - Container page that derives status from hooks, controls resume card visibility, animates round/recommendation transitions, and redirects on confirmed paths.
- `/home/minhnhut_dev/projects/path-learn/frontend/src/strings/vi.ts` - Locked onboarding copy contract for resume, round titles, CTA labels, and onboarding error/loading states.
- `/home/minhnhut_dev/projects/path-learn/frontend/src/pages/Onboarding.test.tsx` - Hook-mocked integration tests for resume, submit, confirm, and redirect behaviors.
- `/home/minhnhut_dev/projects/path-learn/frontend/src/components/onboarding/WelcomeBackCard.tsx` - Resume card updated to read copy from the centralized onboarding strings.
- `/home/minhnhut_dev/projects/path-learn/frontend/src/components/onboarding/Stepper.tsx` - Step labels now come from centralized onboarding strings.
- `/home/minhnhut_dev/projects/path-learn/frontend/src/components/onboarding/RoundOne.tsx` - Primary CTA now uses centralized onboarding strings.
- `/home/minhnhut_dev/projects/path-learn/frontend/src/components/onboarding/RoundTwo.tsx` - Title, subtitle, and CTA now use centralized onboarding strings.
- `/home/minhnhut_dev/projects/path-learn/frontend/src/components/onboarding/RoundThree.tsx` - Title, subtitle, and CTA now use centralized onboarding strings.
- `/home/minhnhut_dev/projects/path-learn/frontend/src/components/onboarding/RecommendationPanel.tsx` - Confirm CTA and inline error now use centralized onboarding strings.

## Decisions Made
- Used `useOnboardingStatus`, `useOnboardingQuestions`, `useOnboardingRecommendation`, `useSubmitOnboardingRound`, and `useConfirmOnboardingPath` as the only server interaction points in the page container.
- Kept full-page loading for status bootstrap, but used inline loading/error cards for round-question and recommendation states so the page shell and stepper remain stable.
- Mocked hook modules directly in tests instead of mocking axios, which keeps tests focused on user-visible behavior and the page contract rather than transport details.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing Critical] Centralized child-component onboarding copy that remained hardcoded outside `vi.ts`**
- **Found during:** Task 10 (Extend Onboarding.test.tsx with resume and confirm integration tests)
- **Issue:** The plan required all locked onboarding strings to be centralized in `vi.ts`, but several onboarding child components still hardcoded resume, round, stepper, and confirm copy.
- **Fix:** Updated `WelcomeBackCard`, `Stepper`, `RoundOne`, `RoundTwo`, `RoundThree`, and `RecommendationPanel` to consume the onboarding string keys from `vi.ts`.
- **Files modified:** `/home/minhnhut_dev/projects/path-learn/frontend/src/components/onboarding/WelcomeBackCard.tsx`, `/home/minhnhut_dev/projects/path-learn/frontend/src/components/onboarding/Stepper.tsx`, `/home/minhnhut_dev/projects/path-learn/frontend/src/components/onboarding/RoundOne.tsx`, `/home/minhnhut_dev/projects/path-learn/frontend/src/components/onboarding/RoundTwo.tsx`, `/home/minhnhut_dev/projects/path-learn/frontend/src/components/onboarding/RoundThree.tsx`, `/home/minhnhut_dev/projects/path-learn/frontend/src/components/onboarding/RecommendationPanel.tsx`
- **Verification:** `pnpm --dir frontend exec tsc --noEmit` and `pnpm --dir frontend test:run -- src/pages/Onboarding.test.tsx`
- **Committed in:** `486aa14` (part of Task 10 commit)

---

**Total deviations:** 1 auto-fixed (1 missing critical)
**Impact on plan:** The auto-fix was required to satisfy the plan's locked-copy single-source-of-truth requirement. No scope creep.

## Issues Encountered
- Initial Task 8 type-check failed because the new onboarding string keys were not available yet in `vi.ts`. I temporarily kept the container on existing keys, completed Task 9, then switched the container to the new centralized copy contract.
- A batch edit for onboarding child components aborted when one replacement produced no change. The remaining string-centralization edits were applied file-by-file and re-verified successfully.

## Verification Results
- `pnpm --dir frontend exec tsc --noEmit` — PASS
- `pnpm --dir frontend test:run -- src/pages/Onboarding.test.tsx` — PASS
- `frontend/src/pages/Onboarding.tsx` imports onboarding components and all required hooks — PASS
- `frontend/src/strings/vi.ts` contains `resumeHeading`, `confirmCta`, and `sequentialGateError` — PASS
- `frontend/src/pages/Onboarding.tsx` contains zero direct `api.get/post` calls — PASS

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Frontend onboarding now matches the multi-round resume and confirm contract needed by downstream recommendation and main-path work.
- Future onboarding phases can extend behavior by evolving the hooks and child components without reintroducing direct page-level transport logic.

## Known Stubs
None.

---
*Phase: 05-adaptive-onboarding-baseline-and-resume-flow*
*Completed: 2026-03-25*

## Self-Check: PASSED
- Found summary file and key implementation files.
- Verified task commits `490563f`, `6fc3fdd`, and `486aa14` exist in git history.
