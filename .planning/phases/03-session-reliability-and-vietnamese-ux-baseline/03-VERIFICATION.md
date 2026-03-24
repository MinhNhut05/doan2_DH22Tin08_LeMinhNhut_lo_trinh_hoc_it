---
phase: 03-session-reliability-and-vietnamese-ux-baseline
verified: 2026-03-24T02:30:00Z
status: human_needed
score: 4/4 must-haves verified
re_verification:
  previous_status: gaps_found
  previous_score: 2/4
  gaps_closed:
    - "User sees consistent progress, enrollment, and continue-learning state across dashboard, explore, lesson, and quiz flows."
    - "User sees correct Vietnamese text with proper diacritics and natural wording across critical user-facing screens."
  gaps_remaining: []
  regressions: []
human_verification:
  - test: "Protected route refresh restore"
    expected: "After logging in, hard-refreshing /dashboard, /lesson/:slug, and /admin keeps the user in-app, shows bootstrap/loading UI if needed, and does not flash to /login."
    why_human: "This depends on real browser cookie behavior, interceptor timing, and route transitions that static code inspection cannot fully prove."
  - test: "Explore enrollment consistency across navigation"
    expected: "After enrolling from Explore, navigating to Dashboard, and returning to Explore, the same learning path still shows as enrolled without manual refresh."
    why_human: "The code wiring is correct, but end-to-end cache invalidation and navigation behavior still need runtime confirmation in a browser."
  - test: "Vietnamese copy quality on critical learner screens"
    expected: "Dashboard, Lesson, Explore, Login, Onboarding, AI Chat, Settings, Landing, and Sidebar show natural Vietnamese wording with proper diacritics and no mixed English labels in critical learner-facing copy."
    why_human: "Static inspection can verify string sources, but wording quality and visual rendering still require human judgment."
---

# Phase 03: Session Reliability and Vietnamese UX Baseline Verification Report

**Phase Goal:** Users can trust protected flows and critical screens in daily use before deeper personalization is introduced.
**Verified:** 2026-03-24T02:30:00Z
**Status:** human_needed
**Re-verification:** Yes — after gap closure

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
| --- | --- | --- | --- |
| 1 | User can refresh any protected page with a valid session and stay signed in. | ✓ VERIFIED | `/home/minhnhut_dev/projects/path-learn/frontend/src/components/auth/AuthBootstrap.tsx` still restores via `refreshAccessTokenOnce()` then `/auth/me`; `/home/minhnhut_dev/projects/path-learn/frontend/src/main.tsx` still mounts `<AuthBootstrap>`; `/home/minhnhut_dev/projects/path-learn/frontend/src/services/api.ts` still uses single-flight refresh and 401 replay. |
| 2 | User can open the app or return to a protected route without false login redirects while auth state is still restoring. | ✓ VERIFIED | `/home/minhnhut_dev/projects/path-learn/frontend/src/components/ProtectedRoute.tsx` and `/home/minhnhut_dev/projects/path-learn/frontend/src/components/AdminGuard.tsx` still render `ProtectedAppSkeleton` while `isLoading`; `/home/minhnhut_dev/projects/path-learn/frontend/src/App.tsx` still gates `/` and `/login` redirects on bootstrap state. |
| 3 | User sees consistent progress, enrollment, and continue-learning state across dashboard, explore, lesson, and quiz flows. | ✓ VERIFIED | `/home/minhnhut_dev/projects/path-learn/backend/src/modules/learning-paths/learning-paths.controller.ts` exposes protected `GET /learning-paths/my-enrollments`; `/home/minhnhut_dev/projects/path-learn/frontend/src/hooks/useMyEnrollments.ts` queries it via `qk.myEnrollments`; `/home/minhnhut_dev/projects/path-learn/frontend/src/pages/Explore.tsx` now computes `const isEnrolled = enrolledSlugs.has(path.slug)` and no longer keeps page-local enrollment state; `/home/minhnhut_dev/projects/path-learn/frontend/src/hooks/useEnroll.ts` still invalidates `['learning-paths']`, which also refreshes `['learning-paths', 'my-enrollments']`. |
| 4 | User sees correct Vietnamese text with proper diacritics and natural wording across critical user-facing screens. | ✓ VERIFIED | `/home/minhnhut_dev/projects/path-learn/frontend/src/strings/vi.ts` now contains `badgeFirstStepName`, `badgeSevenDayStreakName`, `badgeQuizMasterName`, `resourceDocs`, `resourceVideo`, `resourceTutorial`, `resourceCourse`, and `resourceInteractive`; `/home/minhnhut_dev/projects/path-learn/frontend/src/pages/Dashboard.tsx` consumes `vi.dashboard.*Name`; `/home/minhnhut_dev/projects/path-learn/frontend/src/pages/Lesson.tsx` consumes `vi.lesson.resource*`; targeted English literals from the previous verification no longer appear in frontend `.tsx` screens. |

**Score:** 4/4 truths verified

### Required Artifacts

| Artifact | Expected | Status | Details |
| --- | --- | --- | --- |
| `/home/minhnhut_dev/projects/path-learn/frontend/src/stores/authStore.ts` | Bootstrap-aware auth state | ✓ VERIFIED | Still exposes `accessToken`, `user`, `isLoading`, `hasBootstrapped`, and bootstrap setters used by guards/bootstrap. |
| `/home/minhnhut_dev/projects/path-learn/frontend/src/services/api.ts` | Single-flight refresh + session-expiry handling | ✓ VERIFIED | `refreshAccessTokenOnce()` still shares one in-flight refresh promise and retries 401 requests after refresh. |
| `/home/minhnhut_dev/projects/path-learn/frontend/src/components/auth/AuthBootstrap.tsx` | Boot-time session restore | ✓ VERIFIED | Still calls refresh, then `/auth/me`, then `setBootstrapped()`. |
| `/home/minhnhut_dev/projects/path-learn/frontend/src/components/auth/ProtectedAppSkeleton.tsx` | Skeleton shell during bootstrap | ✓ VERIFIED | Concrete skeleton exists and is still used by protected guards. |
| `/home/minhnhut_dev/projects/path-learn/frontend/src/components/ProtectedRoute.tsx` | Loading-aware protected guard | ✓ VERIFIED | Still blocks redirects while `isLoading`. |
| `/home/minhnhut_dev/projects/path-learn/frontend/src/components/AdminGuard.tsx` | Loading-aware admin guard | ✓ VERIFIED | Still waits for bootstrap before role/auth redirects. |
| `/home/minhnhut_dev/projects/path-learn/frontend/src/App.tsx` | Routing wired to bootstrap state | ✓ VERIFIED | Root/login redirects remain conditional on `isLoading`; protected shells remain wrapped. |
| `/home/minhnhut_dev/projects/path-learn/backend/src/modules/learning-paths/learning-paths.service.ts` | Backend-owned enrolled-slug source | ✓ VERIFIED | `getMyEnrollments(userId): Promise<string[]>` selects `learningPath.slug` from user enrollments and returns mapped slugs. |
| `/home/minhnhut_dev/projects/path-learn/backend/src/modules/learning-paths/learning-paths.controller.ts` | Protected enrollment-state endpoint wired before dynamic slug route | ✓ VERIFIED | `@Get('my-enrollments')` appears before `@Get(':slug')` and calls `learningPathsService.getMyEnrollments(userId)`. |
| `/home/minhnhut_dev/projects/path-learn/frontend/src/lib/query/queryKeys.ts` | Query key for enrollment truth under learning-paths prefix | ✓ VERIFIED | Exports `myEnrollments: ['learning-paths', 'my-enrollments'] as const`. |
| `/home/minhnhut_dev/projects/path-learn/frontend/src/hooks/useMyEnrollments.ts` | React Query hook for enrolled slugs | ✓ VERIFIED | Fetches `/learning-paths/my-enrollments`, enables only when authenticated, and returns `enrolledSlugs: Set<string>`. |
| `/home/minhnhut_dev/projects/path-learn/frontend/src/pages/Explore.tsx` | Explore enrollment UI derives from server data, not page-local cache | ✓ VERIFIED | Uses `useMyEnrollments()` and `enrolledSlugs.has(path.slug)`; no `useState<Record<string, boolean>>` remains for enrollment status. |
| `/home/minhnhut_dev/projects/path-learn/frontend/src/strings/vi.ts` | Central Vietnamese string source includes remaining critical keys | ✓ VERIFIED | Gap-closure keys for dashboard badges and lesson resources now exist with Vietnamese copy and diacritics. |
| `/home/minhnhut_dev/projects/path-learn/frontend/src/pages/Dashboard.tsx` | Dashboard localized through `vi.ts` | ✓ VERIFIED | `mockBadges` now reads `vi.dashboard.badgeFirstStepName`, `badgeSevenDayStreakName`, and `badgeQuizMasterName`. |
| `/home/minhnhut_dev/projects/path-learn/frontend/src/pages/Lesson.tsx` | Lesson localized through `vi.ts` | ✓ VERIFIED | `linkTypeConfig` now reads `vi.lesson.resourceDocs`, `resourceVideo`, `resourceTutorial`, `resourceCourse`, and `resourceInteractive`. |
| `/home/minhnhut_dev/projects/path-learn/frontend/src/hooks/useDashboard.ts` | Dashboard query hook | ✓ VERIFIED | Still reads `/dashboard/overview` through React Query. |
| `/home/minhnhut_dev/projects/path-learn/frontend/src/hooks/useLesson.ts` | Lesson query + start side effect | ✓ VERIFIED | Still starts lesson and fetches lesson detail by slug. |
| `/home/minhnhut_dev/projects/path-learn/frontend/src/hooks/useQuiz.ts` | Quiz query hook | ✓ VERIFIED | Still fetches `/lessons/:slug/quiz` through React Query. |
| `/home/minhnhut_dev/projects/path-learn/frontend/src/hooks/useEnroll.ts` | Enrollment mutation with invalidation | ✓ VERIFIED | Still invalidates `['dashboard']`, `['learning-paths']`, and `['progress']`, which refreshes the new child enrollment query as intended. |

### Key Link Verification

| From | To | Via | Status | Details |
| --- | --- | --- | --- | --- |
| `/home/minhnhut_dev/projects/path-learn/frontend/src/main.tsx` | `queryClient` | `QueryClientProvider client={queryClient}` | WIRED | Shared React Query client remains mounted at the app root. |
| `/home/minhnhut_dev/projects/path-learn/frontend/src/main.tsx` | `AuthBootstrap` | `<AuthBootstrap><App /></AuthBootstrap>` | WIRED | Auth bootstrap still runs before app routes render. |
| `/home/minhnhut_dev/projects/path-learn/frontend/src/components/auth/AuthBootstrap.tsx` | `/auth/refresh` + `/auth/me` | `refreshAccessTokenOnce()` then `api.get('/auth/me')` | WIRED | Restore path still populates the auth store from server-backed session data. |
| `/home/minhnhut_dev/projects/path-learn/frontend/src/components/ProtectedRoute.tsx` | auth store | `useAuthStore((s) => s.isLoading/accessToken)` | WIRED | Protected routes still avoid false redirects during bootstrap. |
| `/home/minhnhut_dev/projects/path-learn/frontend/src/components/AdminGuard.tsx` | auth store | `useAuthStore((s) => s.isLoading/accessToken/user)` | WIRED | Admin role check still waits for bootstrap completion. |
| `/home/minhnhut_dev/projects/path-learn/backend/src/modules/learning-paths/learning-paths.controller.ts` | `/learning-paths/my-enrollments` service path | `getMyEnrollments(@CurrentUser('id')) -> learningPathsService.getMyEnrollments(userId)` | WIRED | Protected route exists and is ordered before the dynamic `:slug` route, so it cannot be shadowed. |
| `/home/minhnhut_dev/projects/path-learn/frontend/src/hooks/useMyEnrollments.ts` | enrollment API | `api.get('/learning-paths/my-enrollments')` | WIRED | Frontend enrollment-truth hook is connected to the new protected backend endpoint. |
| `/home/minhnhut_dev/projects/path-learn/frontend/src/pages/Explore.tsx` | enrollment truth | `const { enrolledSlugs } = useMyEnrollments(); const isEnrolled = enrolledSlugs.has(path.slug);` | WIRED | Explore card state is now derived from query-backed server data instead of local component state. |
| `/home/minhnhut_dev/projects/path-learn/frontend/src/hooks/useEnroll.ts` | `qk.myEnrollments` refresh path | `invalidateQueries({ queryKey: ['learning-paths'] })` prefix invalidation | WIRED | Because `qk.myEnrollments` is `['learning-paths', 'my-enrollments']`, enroll success refreshes the enrollment-truth query automatically. |
| `/home/minhnhut_dev/projects/path-learn/frontend/src/pages/Dashboard.tsx` | `vi.ts` | `vi.dashboard.badge*Name` | WIRED | Dashboard badge names are now centralized and no longer page-local English literals. |
| `/home/minhnhut_dev/projects/path-learn/frontend/src/pages/Lesson.tsx` | `vi.ts` | `vi.lesson.resource*` | WIRED | Lesson resource labels are now centralized and no longer hardcoded English literals. |
| `/home/minhnhut_dev/projects/path-learn/frontend/src/hooks/useDashboard.ts` | dashboard API | `api.get('/dashboard/overview')` | WIRED | Dashboard remains query-backed. |
| `/home/minhnhut_dev/projects/path-learn/frontend/src/hooks/useLesson.ts` | lesson API | `api.post('/lessons/:slug/start')` + `api.get('/lessons/:slug')` | WIRED | Lesson detail and start side effect remain connected. |
| `/home/minhnhut_dev/projects/path-learn/frontend/src/hooks/useQuiz.ts` | quiz API | `api.get('/lessons/:slug/quiz')` | WIRED | Quiz flow remains server-backed. |

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
| --- | --- | --- | --- | --- |
| STAB-01 | `03-01-PLAN.md`, `03-02-PLAN.md` | User can refresh any protected page with a valid session and stay signed in | ✓ SATISFIED | `/home/minhnhut_dev/projects/path-learn/frontend/src/components/auth/AuthBootstrap.tsx`, `/home/minhnhut_dev/projects/path-learn/frontend/src/services/api.ts`, and `/home/minhnhut_dev/projects/path-learn/frontend/src/main.tsx` still implement and mount restore-on-refresh behavior. |
| STAB-02 | `03-01-PLAN.md`, `03-02-PLAN.md` | User can open the app or return to a protected route without false login redirects while auth state is loading | ✓ SATISFIED | `/home/minhnhut_dev/projects/path-learn/frontend/src/components/ProtectedRoute.tsx`, `/home/minhnhut_dev/projects/path-learn/frontend/src/components/AdminGuard.tsx`, and `/home/minhnhut_dev/projects/path-learn/frontend/src/App.tsx` still gate redirects on bootstrap loading state. |
| STAB-03 | `03-01-PLAN.md`, `03-04-PLAN.md`, `03-06-PLAN.md` | User sees correct Vietnamese text with proper diacritics and natural wording across all user-facing screens | ✓ SATISFIED | `/home/minhnhut_dev/projects/path-learn/frontend/src/strings/vi.ts` now contains the previously missing keys; `/home/minhnhut_dev/projects/path-learn/frontend/src/pages/Dashboard.tsx` and `/home/minhnhut_dev/projects/path-learn/frontend/src/pages/Lesson.tsx` now read those keys instead of hardcoded English labels. |
| STAB-04 | `03-01-PLAN.md`, `03-03-PLAN.md`, `03-05-PLAN.md` | Existing progress, enrollment, and continue-learning data is consistent and free of stale/contradictory state across dashboard, explore, lesson, and quiz flows | ✓ SATISFIED | `/home/minhnhut_dev/projects/path-learn/backend/src/modules/learning-paths/learning-paths.controller.ts` + `/home/minhnhut_dev/projects/path-learn/backend/src/modules/learning-paths/learning-paths.service.ts` now expose backend-owned enrollment truth; `/home/minhnhut_dev/projects/path-learn/frontend/src/hooks/useMyEnrollments.ts`, `/home/minhnhut_dev/projects/path-learn/frontend/src/pages/Explore.tsx`, and `/home/minhnhut_dev/projects/path-learn/frontend/src/hooks/useEnroll.ts` now keep Explore in sync with server-backed enrollment state. |

**Orphaned requirements:** None. All Phase 03 requirement IDs mapped in `/home/minhnhut_dev/projects/path-learn/.planning/REQUIREMENTS.md` are claimed by plan frontmatter and accounted for above.

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
| --- | --- | --- | --- | --- |
| — | — | No blocker anti-patterns found in the re-verified gap-closure files. | Info | The previous phase blockers were removed; remaining risk is limited to runtime/browser confirmation. |

### Human Verification Required

### 1. Protected route refresh restore

**Test:** Log in, then hard-refresh `/dashboard`, `/lesson/:slug`, and `/admin` in the browser.
**Expected:** Signed-in pages remain in-app, may show bootstrap/loading UI briefly, and do not bounce to `/login`.
**Why human:** Cookie transport, refresh timing, and routing behavior require an actual browser/runtime.

### 2. Explore enrollment consistency across navigation

**Test:** Enroll in a learning path from `/explore`, go to `/dashboard`, then return to `/explore`.
**Expected:** The same card still shows as enrolled without any manual refresh.
**Why human:** The code wiring is correct, but cache invalidation and navigation timing still need runtime confirmation.

### 3. Vietnamese copy quality on critical learner screens

**Test:** Review Dashboard, Lesson, Explore, Login, Onboarding, AI Chat, Settings, Landing, and Sidebar in the browser.
**Expected:** Critical learner-facing copy is natural Vietnamese with proper diacritics and no mixed English labels in the targeted UI.
**Why human:** Static analysis can prove string sourcing, not copy naturalness or visual rendering quality.

### Gaps Summary

The two previously failing outcome-level gaps are now closed in code.

For STAB-04, Explore no longer owns enrollment truth in a page-local cache. A protected backend endpoint now returns the current user's enrolled learning path slugs, the frontend reads that via `useMyEnrollments()`, and the Explore cards derive `isEnrolled` from a query-backed `Set`. Because the new query key lives under the existing `['learning-paths']` invalidation prefix, enroll mutations automatically refresh the authoritative enrollment state.

For STAB-03, the previously flagged English learner-facing labels were moved behind centralized Vietnamese string keys. Dashboard badge names now use `vi.dashboard.*Name`, and Lesson resource labels now use `vi.lesson.resource*`. The specific English literals that blocked the previous verification are gone from the targeted frontend screens.

Quick regression checks on the already-passed session reliability work also held: auth bootstrap is still mounted, refresh remains single-flight, and protected/admin route guards still wait for bootstrap before redirecting.

Automated verification therefore passes all four Phase 03 truths. The remaining work is human runtime confirmation rather than code-gap closure.

---

_Verified: 2026-03-24T02:30:00Z_
_Verifier: Claude (gsd-verifier)_