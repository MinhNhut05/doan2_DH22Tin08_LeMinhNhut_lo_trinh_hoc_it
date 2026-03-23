---
phase: 03-session-reliability-and-vietnamese-ux-baseline
plan: 02
subsystem: auth
tags: [react, zustand, axios, auth, session, sonner]
requires:
  - phase: 03-01
    provides: shared feedback primitives and frontend session reliability groundwork
provides:
  - boot-time auth bootstrap with single-flight refresh restore
  - loading-aware protected and admin route guards
  - delayed session-expiry toast and redirect behavior
affects: [phase-03-vietnamese-ux, onboarding-auth-flows, protected-routing]
tech-stack:
  added: [sonner, @tanstack/react-query]
  patterns: [single-flight token refresh, bootstrap-aware route guards, root-mounted auth bootstrap]
key-files:
  created:
    - frontend/src/components/auth/AuthBootstrap.tsx
    - frontend/src/components/auth/ProtectedAppSkeleton.tsx
    - frontend/src/components/feedback/Skeleton.tsx
    - frontend/src/strings/vi.ts
  modified:
    - frontend/src/stores/authStore.ts
    - frontend/src/services/api.ts
    - frontend/src/components/ProtectedRoute.tsx
    - frontend/src/components/AdminGuard.tsx
    - frontend/src/App.tsx
    - frontend/src/main.tsx
    - frontend/src/pages/Login.tsx
    - frontend/src/pages/AuthCallback.tsx
key-decisions:
  - "Keep auth bootstrap state in Zustand so guards and root routes share the same loading contract."
  - "Use per-tab single-flight refresh dedupe without cross-tab coordination, matching the phase decision D-03."
  - "Handle expired sessions with one guarded toast plus delayed redirect instead of immediate hard navigation."
patterns-established:
  - "Auth bootstrap pattern: refresh cookie-backed token, then fetch /auth/me, then mark bootstrap complete."
  - "Guard pattern: render skeleton while auth is loading, redirect only after bootstrap resolves."
requirements-completed: [STAB-01, STAB-02]
duration: 19m
completed: 2026-03-23
---

# Phase 3 Plan 2: Auth Bootstrap & Session Restore Summary

**Boot-time session restore with per-tab single-flight refresh, loading-aware guards, and delayed expired-session recovery for protected routes**

## Performance

- **Duration:** 19m
- **Started:** 2026-03-23T10:27:36Z
- **Completed:** 2026-03-23T10:47:05Z
- **Tasks:** 6
- **Files modified:** 12

## Accomplishments
- Added `isLoading` and `hasBootstrapped` auth-store state so the app can distinguish unknown auth state from logged-out state.
- Reworked frontend auth refresh into a single-flight helper shared by bootstrap and the 401 interceptor.
- Prevented false redirects by making protected routes, admin guards, and root-level redirects wait for bootstrap completion.
- Mounted app bootstrap and toast providers at the root so expired-session recovery is visible and consistent.

## Task Commits

Each task was committed atomically:

1. **Task 1: Extend authStore with isLoading and hasBootstrapped flags** - `82f6889` (feat)
2. **Task 2: Add single-flight refresh helper to api.ts and fix 401 interceptor** - `2e74d86` (fix)
3. **Task 3: Create AuthBootstrap component and ProtectedAppSkeleton** - `b0d7852` (feat)
4. **Task 4: Make ProtectedRoute and AdminGuard loading-aware** - `4f0d2d0` (feat)
5. **Task 5: Update App.tsx to defer auth-dependent redirects until bootstrap completes** - `903f9ec` (feat)
6. **Task 6: Integrate AuthBootstrap, QueryClientProvider, and Toaster into main.tsx** - `0f48615` (feat)
7. **Verification fix: patch auth bootstrap verification issues** - `5631d5c` (fix)

## Files Created/Modified
- `/home/minhnhut_dev/projects/path-learn/frontend/src/stores/authStore.ts` - Adds bootstrap/loading flags and store actions.
- `/home/minhnhut_dev/projects/path-learn/frontend/src/services/api.ts` - Adds single-flight refresh, guarded session expiry handling, and shared helpers.
- `/home/minhnhut_dev/projects/path-learn/frontend/src/strings/vi.ts` - Supplies Vietnamese auth and shared feedback strings used by the new flow.
- `/home/minhnhut_dev/projects/path-learn/frontend/src/components/auth/AuthBootstrap.tsx` - Restores the session on app startup.
- `/home/minhnhut_dev/projects/path-learn/frontend/src/components/auth/ProtectedAppSkeleton.tsx` - Shows protected-shell loading UI during bootstrap.
- `/home/minhnhut_dev/projects/path-learn/frontend/src/components/feedback/Skeleton.tsx` - Provides the minimal skeleton primitive needed by the protected shell.
- `/home/minhnhut_dev/projects/path-learn/frontend/src/components/ProtectedRoute.tsx` - Waits for bootstrap before redirecting.
- `/home/minhnhut_dev/projects/path-learn/frontend/src/components/AdminGuard.tsx` - Waits for bootstrap before evaluating auth and admin role.
- `/home/minhnhut_dev/projects/path-learn/frontend/src/App.tsx` - Defers root and catch-all redirects while auth is unresolved.
- `/home/minhnhut_dev/projects/path-learn/frontend/src/main.tsx` - Mounts QueryClientProvider, Toaster, and AuthBootstrap around the app.
- `/home/minhnhut_dev/projects/path-learn/frontend/src/pages/Login.tsx` - Resets the expired-session guard after a successful credential login.
- `/home/minhnhut_dev/projects/path-learn/frontend/src/pages/AuthCallback.tsx` - Resets the expired-session guard after successful OAuth callback completion.

## Decisions Made
- Kept bootstrap state inside `useAuthStore` instead of local component state so guards, public routes, and future auth-aware UI can subscribe to one source of truth.
- Reused the same refresh helper for bootstrap and interceptor retries to guarantee per-tab single-flight behavior.
- Used toast-first session-expiry handling with a 2-second redirect delay to improve Vietnamese UX and avoid abrupt navigation.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Added missing shared `Skeleton` primitive**
- **Found during:** Task 3 (Create AuthBootstrap component and ProtectedAppSkeleton)
- **Issue:** The plan referenced `frontend/src/components/feedback/Skeleton.tsx`, but the file did not exist in the repo.
- **Fix:** Created a minimal reusable `Skeleton` component and used it from `ProtectedAppSkeleton`.
- **Files modified:** `frontend/src/components/feedback/Skeleton.tsx`, `frontend/src/components/auth/ProtectedAppSkeleton.tsx`
- **Verification:** Task 3 acceptance checks passed.
- **Committed in:** `b0d7852`

**2. [Rule 3 - Blocking] Expanded Vietnamese string catalog needed by shared feedback UI**
- **Found during:** Final TypeScript verification
- **Issue:** Newly added `vi.ts` only defined auth text, but existing feedback components already referenced `vi.common.*` and `vi.dashboard.*`, causing type-check failure.
- **Fix:** Extended `vi.ts` with the shared `common` and `dashboard` keys used by existing feedback components.
- **Files modified:** `frontend/src/strings/vi.ts`
- **Verification:** `pnpm --filter frontend exec tsc --noEmit`
- **Committed in:** `5631d5c`

**3. [Rule 3 - Blocking] Wired the exported session-expired reset helper into successful login flows**
- **Found during:** Final TypeScript verification and auth lifecycle review
- **Issue:** `Login.tsx` used `resetSessionExpiredGuard()` without importing it, and successful login/OAuth flows needed to clear the one-shot expired-session guard before continuing.
- **Fix:** Imported and called `resetSessionExpiredGuard()` in both credential login and OAuth callback success paths.
- **Files modified:** `frontend/src/pages/Login.tsx`, `frontend/src/pages/AuthCallback.tsx`
- **Verification:** `pnpm --filter frontend exec tsc --noEmit`
- **Committed in:** `0f48615`, `5631d5c`

---

**Total deviations:** 3 auto-fixed (3 blocking)
**Impact on plan:** All deviations were required to make the planned auth-bootstrap flow compile and behave correctly. No architectural scope change.

## Issues Encountered
- `frontend/package.json` had already been modified by parallel work, so task commits were limited to files with actual plan-specific diffs.
- Final verification initially failed because shared feedback components depended on broader Vietnamese string keys than the plan explicitly mentioned.

## User Setup Required
None - no external service configuration required.

## Known Stubs
None.

## Next Phase Readiness
- Protected pages now have a reliable auth bootstrap contract that later Phase 3 UX cleanup can reuse.
- Vietnamese session-expiry messaging is now centralized in `frontend/src/strings/vi.ts`, which makes future copy cleanup easier.

## Self-Check: PASSED
- Verified summary file exists at `/home/minhnhut_dev/projects/path-learn/.planning/phases/03-session-reliability-and-vietnamese-ux-baseline/03-02-SUMMARY.md`.
- Verified task commits exist: `82f6889`, `2e74d86`, `b0d7852`, `4f0d2d0`, `903f9ec`, `0f48615`, `5631d5c`.

---
*Phase: 03-session-reliability-and-vietnamese-ux-baseline*
*Completed: 2026-03-23*

