---
phase: 03-session-reliability-and-vietnamese-ux-baseline
plan: 05
subsystem: api
tags: [nest, prisma, react-query, explore, enrollment]
requires:
  - phase: 03-01
    provides: auth bootstrap and session restore contract for protected frontend queries
  - phase: 03-02
    provides: enrollment mutation invalidation behavior used by the new enrollment query key
  - phase: 03-04
    provides: Vietnamese Explore strings already centralized in vi.ts
provides:
  - protected learning-path enrollment slug endpoint for the current user
  - React Query hook that exposes enrolled learning path slugs as a Set
  - Explore page enrollment state derived from backend data instead of page-local state
affects: [explore, dashboard, learning-paths, enrollment-state]
tech-stack:
  added: []
  patterns:
    - server-backed enrollment state via protected slug lookup endpoint
    - child React Query keys under ['learning-paths'] for automatic prefix invalidation
key-files:
  created:
    - frontend/src/hooks/useMyEnrollments.ts
  modified:
    - backend/src/modules/learning-paths/learning-paths.service.ts
    - backend/src/modules/learning-paths/learning-paths.controller.ts
    - backend/prisma/prisma.config.ts
    - frontend/src/lib/query/queryKeys.ts
    - frontend/src/pages/Explore.tsx
key-decisions:
  - "Return enrolled learning path slugs instead of ids so Explore can use its existing slug-based card keys without extra mapping."
  - "Derive Explore enrollment state from a React Query-backed Set and keep it fresh through the existing ['learning-paths'] prefix invalidation path."
patterns-established:
  - "Enrollment UI state should come from backend-owned learner state, not page-local useState caches."
  - "When new query data must stay in sync with an existing mutation, nest its query key under the mutation's invalidation prefix."
requirements-completed: [STAB-04]
duration: 10 min
completed: 2026-03-24
---

# Phase 03 Plan 05: Fix Explore Enrollment State Inconsistency Summary

**Protected enrolled-slug lookup plus a React Query enrollment Set keeps Explore cards consistent across navigation without manual refresh.**

## Performance

- **Duration:** 10 min
- **Started:** 2026-03-24T01:44:20Z
- **Completed:** 2026-03-24T01:55:07Z
- **Tasks:** 5
- **Files modified:** 6

## Accomplishments
- Added a protected backend endpoint that returns the authenticated user's enrolled learning path slugs.
- Introduced a dedicated `useMyEnrollments` hook with a child query key that stays fresh when enroll mutations invalidate `['learning-paths']`.
- Removed Explore's page-local enrollment cache so cards now reflect backend truth after Explore → Dashboard → Explore navigation.

## Task Commits

Each task was committed atomically:

1. **Task 1: Add getMyEnrollments method to learning-paths.service.ts** - `3adabc8` (feat)
2. **Task 2: Add GET /learning-paths/my-enrollments protected endpoint** - `99f20b5` (feat)
3. **Task 3: Add myEnrollments query key to queryKeys.ts** - `ce680e8` (feat)
4. **Task 4: Create useMyEnrollments hook** - `56dc9a1` (feat)
5. **Task 5: Rewire Explore.tsx to derive enrollment from server data** - `252ef5b` (fix)

## Files Created/Modified
- `backend/src/modules/learning-paths/learning-paths.service.ts` - Added `getMyEnrollments(userId)` to return enrolled path slugs.
- `backend/src/modules/learning-paths/learning-paths.controller.ts` - Added protected `GET /learning-paths/my-enrollments` before the dynamic slug route.
- `backend/prisma/prisma.config.ts` - Fixed TypeScript/CommonJS compatibility so backend verification can run.
- `frontend/src/lib/query/queryKeys.ts` - Added `qk.myEnrollments` under the `learning-paths` prefix.
- `frontend/src/hooks/useMyEnrollments.ts` - Added authenticated enrollment query hook returning `Set<string>`.
- `frontend/src/pages/Explore.tsx` - Removed local enrollment state and switched card rendering to server-derived enrollment data.

## Decisions Made
- Returned learning path slugs from the backend instead of ids because Explore already keys enroll actions and cards by slug.
- Reused the existing `invalidateQueries({ queryKey: ['learning-paths'] })` behavior by placing the new query under that prefix instead of adding a separate mutation invalidation path.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Fixed backend verification failure caused by Prisma config module semantics**
- **Found during:** Task 1 (Add getMyEnrollments method to learning-paths.service.ts)
- **Issue:** `pnpm --filter backend exec tsc --noEmit` failed before task verification because `backend/prisma/prisma.config.ts` used `import.meta.dirname`, which was rejected in the backend TypeScript check path with TS1470.
- **Fix:** Replaced `import.meta.dirname` usage with a `__dirname`-based `configDir` fallback compatible with the repo's current verification mode.
- **Files modified:** `backend/prisma/prisma.config.ts`
- **Verification:** `pnpm --filter backend exec tsc --noEmit`
- **Committed in:** `3adabc8`

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** The fix was required to make the plan's backend acceptance criteria verifiable. No scope creep beyond enabling the planned work.

## Issues Encountered
- Initial backend TypeScript verification was blocked by a pre-existing Prisma config incompatibility; fixed inline and verification then passed.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Explore enrollment state now comes from backend-owned data and remains consistent after navigation.
- Phase 03 now has implementation coverage for all six plans on disk once this summary is recorded in project state.

## Self-Check: PASSED

---
*Phase: 03-session-reliability-and-vietnamese-ux-baseline*
*Completed: 2026-03-24*
