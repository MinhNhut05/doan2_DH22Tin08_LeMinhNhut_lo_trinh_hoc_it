# Phase 3: Session Reliability and Vietnamese UX Baseline - Context

**Gathered:** 2026-03-23
**Status:** Ready for planning

<domain>
## Phase Boundary

Remove false auth redirects, stale protected-state bugs, and broken Vietnamese copy from critical flows. Users can trust protected flows and critical screens in daily use before deeper personalization is introduced.

Requirements: STAB-01, STAB-02, STAB-03, STAB-04

</domain>

<decisions>
## Implementation Decisions

### Session Restore UX
- **D-01:** Boot screen shows skeleton within existing layout (Sidebar/Header visible, content area shows skeleton shimmer) while /auth/refresh is in progress. No full-screen spinner or blank screen.
- **D-02:** When refresh token fails (expired, revoked), show a toast notification "Phien da het han, vui long dang nhap lai" then redirect to /login after ~2 seconds. No silent redirect, no dialog/modal.
- **D-03:** Multi-tab handling: each tab independently calls /auth/refresh on load. No cross-tab synchronization (BroadcastChannel). Backend token rotation already handles concurrent refreshes safely.
- **D-04:** No retry on /auth/refresh failure. Single attempt; if it fails, treat session as expired and trigger the toast+redirect flow (D-02).

### Vietnamese Text Strategy
- **D-05:** Create a central strings file (vi.ts) containing all Vietnamese UI text. No i18n library (react-i18next). Components import strings from this file instead of hardcoding.
- **D-06:** Fix Vietnamese text across ALL user-facing screens: Login, Dashboard, Explore, Lesson, LessonSidebar, Settings, Onboarding, Quiz, and any other user-visible components.
- **D-07:** Single file structure: one vi.ts file organized by sections (auth, dashboard, lesson, explore, settings, onboarding, quiz, common). Each section exports an object of key-value string pairs.
- **D-08:** Tone: friendly, address user as "ban" (ban). Example: "Ban chua dang ky lo trinh nao" not "Chua dang ky lo trinh nao". Natural Vietnamese with proper diacritics throughout.

### Data Consistency Pattern
- **D-09:** Adopt React Query (TanStack Query) for server state management. Replaces per-component useState+useEffect fetch patterns.
- **D-10:** Invalidate related queries on mutations. After enroll action, invalidate dashboard overview and learning paths queries. After lesson completion, invalidate progress and dashboard queries. Data stays fresh without polling.
- **D-11:** Phase 3 scope: migrate critical flows only — dashboard overview, learning paths listing, progress tracking, enrollment. Other pages migrate to React Query in future phases.
- **D-12:** Keep Zustand authStore for client-side auth state (token, user, isLoading flag). React Query handles all server data fetching and caching. Clear separation: Zustand = client state, React Query = server state.

### Error & Edge Case UX
- **D-13:** Non-auth API errors show toast notifications (bottom-right corner, auto-dismiss after ~5s). No inline error banners for transient errors. Does not block user interaction.
- **D-14:** Empty states use friendly pattern: small illustration + descriptive text + CTA button. Example: "Ban chua co lo trinh nao" + "Kham pha ngay" button linking to /explore.
- **D-15:** Offline detection: show toast "Khong co ket noi mang" and auto-retry requests when connection is restored. React Query's built-in online/offline detection handles this.
- **D-16:** Loading states use skeleton shimmer pattern consistently across all pages (matching the boot screen pattern from D-01). No spinners for page-level loading.

### Claude's Discretion
- Exact skeleton component implementation details
- Toast library choice (Sonner, react-hot-toast, or shadcn toast)
- Specific illustration assets for empty states
- vi.ts key naming conventions
- React Query configuration (staleTime, cacheTime, retry settings)
- Axios interceptor refactoring approach for boot-time refresh

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Auth/Session
- `frontend/src/stores/authStore.ts` — Current Zustand auth store, needs isLoading flag addition
- `frontend/src/services/api.ts` — Axios instance with refresh interceptor, needs boot-time refresh logic
- `frontend/src/components/ProtectedRoute.tsx` — Route guard, needs loading-aware check
- `frontend/src/App.tsx` — Route definitions with auth-conditional redirects
- `backend/src/modules/auth/auth.controller.ts` — Backend refresh endpoint with token rotation

### Vietnamese Text
- `frontend/src/pages/Login.tsx` — Example of missing diacritics ("Dang nhap")
- `frontend/src/pages/Dashboard.tsx` — Example of inconsistent Vietnamese copy
- `frontend/src/pages/Settings.tsx` — Mixed diacritics quality (some correct, some missing)

### Data/Progress
- `frontend/src/pages/Dashboard.tsx` — Uses GET /dashboard/overview with local state
- `frontend/src/pages/Explore.tsx` — Enrollment with local state, no cache invalidation
- `backend/src/modules/progress/progress.controller.ts` — Progress API endpoints
- `backend/src/modules/learning-paths/learning-paths.controller.ts` — Enrollment endpoint

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `authStore.ts` (Zustand): Already manages auth state, needs isLoading flag and boot-time refresh action
- `api.ts` (Axios): Already has refresh interceptor on 401 responses, needs boot-time proactive refresh
- `ProtectedRoute.tsx`: Simple token check component, needs loading-aware guard logic
- shadcn/ui components: Available for toast and skeleton UI patterns

### Established Patterns
- Zustand for client state (authStore) — keep this, extend with isLoading
- Axios with interceptors for API calls — build boot-time refresh on top of existing interceptor
- Backend JWT + refresh cookie flow with token rotation — already solid, no backend changes needed for session restore
- Tailwind CSS + shadcn/ui for styling — use for skeleton, toast, empty state components

### Integration Points
- `App.tsx` route definitions: Need to wrap with auth-loading check before rendering protected routes
- `main.tsx` or new `AuthProvider`: Boot-time refresh should run before app renders routes
- `api.ts` interceptor: Needs refresh queue/lock to prevent concurrent refresh calls during boot
- Dashboard/Explore/Lesson components: Migrate from useState+fetch to React Query hooks

</code_context>

<specifics>
## Specific Ideas

- Skeleton during auth restore should preserve layout structure (Sidebar + Header visible) — user should feel like the app is loading content, not loading the entire app
- Vietnamese tone should feel like a tutor talking to a student — friendly "ban" address, encouraging, not corporate
- React Query adoption is strategic: Phase 3 establishes the pattern, future phases benefit from consistent server state management
- Toast notifications should be in Vietnamese with proper diacritics

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 03-session-reliability-and-vietnamese-ux-baseline*
*Context gathered: 2026-03-23*
