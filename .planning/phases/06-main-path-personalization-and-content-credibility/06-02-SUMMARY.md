---
phase: 06-main-path-personalization-and-content-credibility
plan: 02
subsystem: api
tags: [onboarding, recommendation, ai, nestjs, prisma]

# Dependency graph
requires:
  - phase: 04-canonical-learner-profile-foundation
    provides: round-based onboarding persistence and learner profile hooks
  - phase: 05-adaptive-onboarding-baseline-and-resume-flow
    provides: onboarding round completion gating and recommendation endpoint contract
provides:
  - ranked onboarding recommendation contract with 3 paths, scores, explanations, and focus areas
  - deterministic fallback ranking pipeline aligned with AI output shape
  - learning path id resolution for each ranked recommendation item
affects: [frontend-onboarding, recommendation-ui, personalization]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - ranked AI prompt -> parser -> fallback pipeline with shared RecommendationResult contract
    - backend slug-to-id resolution for all recommendation rankings before returning API data

key-files:
  created: []
  modified:
    - backend/src/modules/onboarding/recommendation/onboarding-recommendation.parser.ts
    - backend/src/modules/onboarding/recommendation/index.ts
    - backend/src/modules/onboarding/recommendation/onboarding-prompt.builder.ts
    - backend/src/modules/onboarding/recommendation/onboarding-recommendation.fallback.ts
    - backend/src/modules/onboarding/onboarding.service.ts
    - backend/src/modules/onboarding/onboarding.service.spec.ts

key-decisions:
  - "Use a shared rankings array contract across prompt, parser, fallback, and service to avoid single-path/split-shape drift."
  - "Resolve learningPathId for every ranked slug in the backend so the frontend can consume a fully normalized recommendation payload."
  - "Allow parser degradation to 1-3 valid ranked items, but require fallback to always supply exactly three deterministic recommendations."

patterns-established:
  - "Ranked recommendation payloads always carry pathSlug, matchScore, explanation, and focusAreas per item."
  - "Onboarding recommendation consumers should map slugs to ids in one batched Prisma query instead of per-item lookups."

requirements-completed: [LP-07, ONB-08]

# Metrics
duration: 14m
completed: 2026-03-26
---

# Phase 06 Plan 02: Ranked Recommendation Pipeline — Backend Summary

**Three ranked onboarding path recommendations with per-path scores, Vietnamese explanations, deterministic fallback ordering, and backend-resolved learning path ids.**

## Performance

- **Duration:** 14m 20s
- **Started:** 2026-03-26T04:16:17Z
- **Completed:** 2026-03-26T04:30:37Z
- **Tasks:** 5
- **Files modified:** 6

## Accomplishments
- Replaced the old single primary-path recommendation contract with a shared ranked array shape.
- Updated AI prompt and parser so onboarding recommendations now carry `matchScore`, `explanation`, and `focusAreas` per ranked path.
- Rebuilt fallback and service response flow so all ranked slugs resolve to backend-owned `learningPathId` values before returning to clients.

## Task Commits

Each task was committed atomically:

1. **Task 1: Update RecommendationResult type to RankedRecommendation array contract** - `8e2770e` (refactor)
2. **Task 2: Update buildOnboardingPrompt to request 3 ranked paths with matchScore and explanation** - `4245668` (feat)
3. **Task 3: Rewrite parseRecommendation to validate and return ranked array** - `25a579d` (feat)
4. **Task 4: Rewrite getFallbackRecommendation to return 3 ranked paths with deterministic scores** - `a76366c` (feat)
5. **Task 5: Update getRecommendation in OnboardingService to return ranked array with learningPathIds** - `c151a73` (feat)

**Plan metadata:** Pending

## Files Created/Modified
- `/home/minhnhut_dev/projects/path-learn/backend/src/modules/onboarding/recommendation/onboarding-recommendation.parser.ts` - Defines ranked recommendation types and validates/sorts AI rankings.
- `/home/minhnhut_dev/projects/path-learn/backend/src/modules/onboarding/recommendation/index.ts` - Re-exports the new ranked recommendation types.
- `/home/minhnhut_dev/projects/path-learn/backend/src/modules/onboarding/recommendation/onboarding-prompt.builder.ts` - Requests exactly 3 ranked recommendations with scores and personalized explanations from AI.
- `/home/minhnhut_dev/projects/path-learn/backend/src/modules/onboarding/recommendation/onboarding-recommendation.fallback.ts` - Produces deterministic 3-item fallback rankings with per-path explanations and focus areas.
- `/home/minhnhut_dev/projects/path-learn/backend/src/modules/onboarding/onboarding.service.ts` - Resolves all ranked slugs to learning path ids and returns normalized onboarding recommendation payloads.
- `/home/minhnhut_dev/projects/path-learn/backend/src/modules/onboarding/onboarding.service.spec.ts` - Verifies ranked AI responses, ranked fallback behavior, filtered unresolved slugs, and batched slug lookup resolution.

## Decisions Made
- Used one shared `rankings` payload shape across prompt, parser, fallback, and service to keep the recommendation pipeline consistent end-to-end.
- Batched `learningPath.findMany` by slug instead of resolving only the first recommendation, because the API now returns multiple ranked options.
- Kept parser behavior tolerant of partially valid AI payloads while ensuring fallback always returns three deterministic options for stable UX.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Updated onboarding service tests for the ranked response contract**
- **Found during:** Task 5 (Update getRecommendation in OnboardingService to return ranked array with learningPathIds)
- **Issue:** Existing onboarding tests still mocked the old single-path response shape and `findUnique` lookup, which blocked verification of the new ranked API contract.
- **Fix:** Reworked service specs to assert ranked payloads, batched slug lookups, unresolved-slug filtering, and fallback behavior with three resolved ids.
- **Files modified:** `/home/minhnhut_dev/projects/path-learn/backend/src/modules/onboarding/onboarding.service.spec.ts`
- **Verification:** `pnpm --dir /home/minhnhut_dev/projects/path-learn/backend test -- onboarding`
- **Committed in:** `c151a73` (part of task commit)

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** The deviation was necessary to verify the new ranked recommendation contract correctly. No scope creep.

## Issues Encountered
- `onboarding.service.ts` was auto-touched by project hooks after an edit, so the file had to be re-read before the final Task 5 patch was applied.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Backend is ready for frontend consumption of ranked recommendation cards with scores, explanations, and focus areas.
- Future personalization work can reuse the shared ranked contract without reintroducing single-path response handling.

## Self-Check: PASSED
- Verified summary file exists at `/home/minhnhut_dev/projects/path-learn/.planning/phases/06-main-path-personalization-and-content-credibility/06-02-SUMMARY.md`
- Verified task commits exist: `8e2770e`, `4245668`, `25a579d`, `a76366c`, `c151a73`

## Known Stubs
None.
