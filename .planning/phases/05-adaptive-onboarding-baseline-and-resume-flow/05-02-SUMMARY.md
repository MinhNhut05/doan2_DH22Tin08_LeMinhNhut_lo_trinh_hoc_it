---
phase: 05-adaptive-onboarding-baseline-and-resume-flow
plan: 02
subsystem: api
tags: [nestjs, prisma, onboarding, learner-profile, tdd]

requires:
  - phase: 05-adaptive-onboarding-baseline-and-resume-flow
    provides: ["Round 1 onboarding shell and recommendation baseline from 05-01"]
provides:
  - "Round 2 and round 3 backend question catalogs with CareerGoal-aware skill prompts"
  - "Sequential onboarding APIs for status, per-round questions, and round 2/3 submissions"
  - "LearnerProfile creation and enrichment from onboarding rounds 1-3"
  - "Recommendation responses with learningPathId UUID for direct confirm-path calls"
affects: ["05-03 frontend onboarding container", "learner-profile", "recommendation flow"]

tech-stack:
  added: []
  patterns: ["Sequential multi-round onboarding via OnboardingRound", "Profile enrichment through injected domain service", "Recommendation response hydration by slug-to-UUID lookup"]

key-files:
  created:
    - backend/src/modules/onboarding/constants/onboarding-round-two.ts
    - backend/src/modules/onboarding/constants/onboarding-round-three.ts
    - backend/src/modules/onboarding/dto/submit-round-two.dto.ts
    - backend/src/modules/onboarding/dto/submit-round-three.dto.ts
    - backend/src/modules/onboarding/dto/onboarding-status.dto.ts
  modified:
    - backend/src/modules/onboarding/onboarding.service.ts
    - backend/src/modules/onboarding/onboarding.controller.ts
    - backend/src/modules/onboarding/onboarding.module.ts
    - backend/src/modules/learner-profile/learner-profile.service.ts
    - backend/src/modules/onboarding/onboarding.service.spec.ts
    - backend/src/modules/learner-profile/learner-profile.service.spec.ts
    - backend/src/modules/auth/auth.service.ts
    - backend/prisma/seed.ts

key-decisions:
  - "Used OnboardingRound as the single persistence model for all onboarding rounds instead of reviving legacy onboardingData storage."
  - "Created LearnerProfile immediately after round 1 and enriched it after rounds 2 and 3 to keep profile state deterministic and resumable."
  - "Blocked recommendation requests until round 3 exists, then resolved primaryPath slug to learningPathId before returning API data."

patterns-established:
  - "Onboarding status is derived from persisted rounds plus UserLearningPath count, not from frontend-local progress."
  - "Round-specific question delivery stays in constants plus service routing, with round 3 selected by CareerGoal from round 1 answers."
  - "Round submission endpoints perform prerequisite checks before persistence, then trigger LearnerProfile updates in the same service flow."

requirements-completed: [ONB-04, ONB-05, ONB-06, ONB-07, PROF-01, PROF-02]

duration: 26min
completed: 2026-03-25
---

# Phase 05 Plan 02: Backend: Onboarding Core API (Constants, DTOs, Service, Controller) Summary

**Multi-round onboarding APIs with resumable round status, CareerGoal-aware round 3 questions, and LearnerProfile enrichment across rounds 1-3.**

## Performance

- **Duration:** 26 min
- **Started:** 2026-03-25T15:00:04Z
- **Completed:** 2026-03-25T15:25:48Z
- **Tasks:** 6
- **Files modified:** 16

## Accomplishments
- Added round 2 and round 3 onboarding question catalogs, including dynamic round 3 skill topics keyed by `CareerGoal`.
- Exposed backend APIs for onboarding status, per-round question fetching, and sequential round 2/3 submission with prerequisite enforcement.
- Replaced the LearnerProfile round-1 stub with real creation/enrichment logic and covered the flow with service-level Jest tests.
- Returned `learningPathId` together with `primaryPath` so the frontend can call `POST /onboarding/confirm` without slug resolution.

## Task Commits

Each task was committed atomically:

1. **Task 1: Add round 2 and round 3 question constants** - `d71f05d` (feat)
2. **Task 2: Add DTOs for round 2 submission, round 3 submission, and status response** - `5ba0198` (feat)
3. **Task 3: Implement LearnerProfile lifecycle methods and export LearnerProfileService from its module** - `9f2132e` (feat)
4. **Task 4: Extend OnboardingService with status, per-round questions, round 2/3 submission, and LearnerProfileService wiring** - `eece537` (feat)
5. **Task 5: Add new controller endpoints for status, per-round questions, and round 2/3 submission** - `9b80698` (feat)
6. **Task 6: Add or update tests for OnboardingService and LearnerProfileService** - `f23d0a8` (test)
7. **Post-task cleanup: remove stale controller placeholders** - `124c956` (refactor)

**Plan metadata:** `e030ac0` (initial metadata capture; superseded by follow-up docs commit including SUMMARY)

## Files Created/Modified
- `backend/src/modules/onboarding/constants/onboarding-round-two.ts` - Defines static round 2 career-direction questions.
- `backend/src/modules/onboarding/constants/onboarding-round-three.ts` - Defines CareerGoal-specific round 3 skill-rating questions and selector helper.
- `backend/src/modules/onboarding/dto/submit-round-two.dto.ts` - Validates round 2 submission payloads.
- `backend/src/modules/onboarding/dto/submit-round-three.dto.ts` - Validates round 3 skill rating payloads.
- `backend/src/modules/onboarding/dto/onboarding-status.dto.ts` - Declares the backend status response contract consumed by frontend hooks.
- `backend/src/modules/onboarding/onboarding.service.ts` - Adds status, per-round question routing, round 2/3 submission, profile wiring, and recommendation UUID hydration.
- `backend/src/modules/onboarding/onboarding.controller.ts` - Exposes authenticated routes for status, per-round questions, and round 2/3 submissions.
- `backend/src/modules/onboarding/onboarding.module.ts` - Imports `LearnerProfileModule` so onboarding can inject profile lifecycle logic.
- `backend/src/modules/learner-profile/learner-profile.service.ts` - Creates and enriches canonical learner profiles from onboarding data.
- `backend/src/modules/onboarding/onboarding.service.spec.ts` - Covers status derivation, sequential round progression, recommendation gating, and confirmation flow.
- `backend/src/modules/learner-profile/learner-profile.service.spec.ts` - Covers round-derived pace/skill updates and recalculation rules.
- `backend/src/modules/auth/auth.service.ts` - Fixes legacy onboarding include filter that blocked backend type-checking.
- `backend/prisma/seed.ts` - Migrates sample onboarding seed data from removed `onboardingData` usage to `onboardingRound`.

## Decisions Made
- Used `OnboardingRound` compound keys (`userId_roundNumber`) as the only source of truth for progression and resume logic.
- Kept recommendation prompt construction based on round 1 answers, but enforced round 3 completion before the endpoint can be called.
- Resolved `primaryPath` slug to `LearningPath.id` inside the backend so frontend confirm-path stays UUID-based and deterministic.
- Stored round 2 learning style in `preferredTopics` and round 3 ratings into `strengths`/`weaknesses` using deterministic rule-based mapping instead of AI inference.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Fixed legacy onboarding schema references that broke backend type checks**
- **Found during:** Task 1 (Add round 2 and round 3 question constants)
- **Issue:** `backend/src/modules/auth/auth.service.ts` still filtered `completedAt: { not: null }` in a shape that no longer matched the onboarding relation typing, and `backend/prisma/seed.ts` still referenced removed `prisma.onboardingData`.
- **Fix:** Simplified the auth onboarding include to a valid round-1 existence check and rewired seed data to create `onboardingRound` records instead of `onboardingData` rows.
- **Files modified:** `backend/src/modules/auth/auth.service.ts`, `backend/prisma/seed.ts`
- **Verification:** `pnpm --dir backend exec tsc --noEmit`
- **Committed in:** `d71f05d`

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** The fix was required to keep the backend compiling after the onboarding model refactor. No scope creep beyond plan-adjacent correctness work.

## Issues Encountered
- Initial RED test for AI recommendation used a slug outside the parser allowlist; the spec was corrected to use a valid seeded slug so parser behavior matched production rules.
- New tests exposed a missing `LearningBackground` import in the learner-profile spec; adding the import restored GREEN without changing production behavior.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Backend now exposes the exact status and round submission contracts that 05-03 frontend onboarding hooks need.
- Recommendation payloads now include `learningPathId`, so the frontend can confirm a path directly after recommendation.
- LearnerProfile lifecycle is deterministic and test-covered, ready for downstream adaptive/resume UI work.

---
*Phase: 05-adaptive-onboarding-baseline-and-resume-flow*
*Completed: 2026-03-25*

## Self-Check: PASSED
- FOUND: `/home/minhnhut_dev/projects/path-learn/.planning/phases/05-adaptive-onboarding-baseline-and-resume-flow/05-02-SUMMARY.md`
- FOUND commits: `d71f05d`, `5ba0198`, `9f2132e`, `eece537`, `9b80698`, `f23d0a8`, `124c956`
