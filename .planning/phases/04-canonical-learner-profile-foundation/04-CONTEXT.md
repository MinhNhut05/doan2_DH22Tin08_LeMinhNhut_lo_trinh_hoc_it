# Phase 4: Canonical Learner Profile Foundation - Context

**Gathered:** 2026-03-24
**Status:** Ready for planning

<domain>
## Phase Boundary

Establish one backend-owned learner profile that combines onboarding answers and observed learning signals. This profile is the single source of truth for personalization across onboarding (Phase 5), recommendations (Phase 6), and AI chat (Phase 6). Phase 4 builds the data model, migration, recalculation service, and read-only API. It does NOT implement onboarding round submission UI or recommendation logic.

</domain>

<decisions>
## Implementation Decisions

### Profile Data Model
- **D-01:** Create a separate `LearnerProfile` Prisma model (1:1 with User), distinct from OnboardingData. Raw answers stay in round storage; profile holds computed/aggregated fields.
- **D-02:** Learning-focused fields: `careerGoal` (from onboarding), `skillLevel` (computed enum: beginner/intermediate/advanced), `learningPace` (computed: slow/normal/fast), `strengths` (Json string[]), `weaknesses` (Json string[]), `preferredTopics` (Json string[]).
- **D-03:** Single row per user, overwrite on recalculation. Include `lastRecalculatedAt` timestamp. No version history needed.
- **D-04:** LearnerProfile is created when user completes onboarding round 1 (Phase 5 will call the creation). Phase 4 provides the create + recalculate methods.

### Round-based Storage
- **D-05:** Create a new `OnboardingRound` Prisma model: `userId`, `roundNumber` (Int), `answers` (Json: `{ questionId: answer }`), `completedAt`. One user has multiple rows (one per round).
- **D-06:** Migrate existing OnboardingData records into OnboardingRound as round 1. Then deprecate and remove the OnboardingData model from the schema.
- **D-07:** Each round stores answers as Json (`{ questionId: answer }`) — flexible because each round asks different questions.
- **D-08:** Phase 4 scope is model + migration only. Round submission logic, resume flow, and round-specific questions are Phase 5.

### Recalculation Triggers
- **D-09:** Profile recalculates on 3 events: lesson completion, quiz pass, and track completion.
- **D-10:** Recalculation runs synchronously in the request handler (after saving progress/quiz result). No async queue needed at this scale.
- **D-11:** Incremental update strategy — only update profile fields affected by the triggering event (e.g., quiz pass updates skillLevel and strengths/weaknesses; lesson complete updates learningPace).
- **D-12:** Create a dedicated `LearnerProfileService` in a new `learner-profile` module. Other services (progress, quiz) call `profileService.recalculate(userId, event)` after their write operations.

### Signal Composition
- **D-13:** Four signal sources feed into profile: lesson completion patterns, quiz performance, time & frequency, and AI chat topics.
- **D-14:** SkillLevel computed via rule-based tiers from quiz scores + completion rate (e.g., >80% quiz avg + >70% lessons done = intermediate). No weighted scoring or AI assessment.
- **D-15:** Strengths and weaknesses derived from quiz topic analysis — high pass rate on a topic/track = strength, low = weakness.
- **D-16:** LearningPace computed by comparing actual lesson time (from LearningSession/UserProgress) against lesson's estimatedMins. Faster than estimate = fast, slower = slow.

### API Surface
- **D-17:** Phase 4 exposes `GET /api/v1/learner-profile/me` (read own profile). Recalculate is internal-only (called by other services). Phase 5-6 will add update/enrichment endpoints.

### Claude's Discretion
- Exact rule thresholds for skillLevel tiers (researcher/planner can tune)
- Prisma migration naming and ordering
- Internal method signatures and error handling details
- How to handle edge case of recalculate when profile doesn't exist yet (pre-onboarding)
- Strength/weakness topic granularity (track-level vs lesson-level)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Data model
- `backend/prisma/schema.prisma` -- Current data model with OnboardingData, UserProgress, QuizResult, LearningSession, AIInteractionLog
- `.planning/codebase/ARCHITECTURE.md` -- Module pattern, data flow, service-controller pattern

### Existing onboarding
- `backend/src/modules/onboarding/onboarding.service.ts` -- Current onboarding logic to understand migration from OnboardingData
- `backend/src/modules/onboarding/constants/` -- Current onboarding questions (will inform round 1 answer structure)

### Conventions
- `.planning/codebase/CONVENTIONS.md` -- Naming, DTO, error handling, test patterns

### Requirements
- `.planning/REQUIREMENTS.md` -- PROF-01, PROF-02, PROF-03 definitions

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `PrismaService` (global module): Direct DB access for new LearnerProfile model
- `TransformInterceptor`: Auto-wraps responses in `{ success, data, meta }` format
- `UserProgress` model: Has lesson completion + time tracking data (timeSpentSeconds)
- `QuizResult` model: Has score, passed, answers, attemptNumber
- `LearningSession` model: Has activityType, durationSeconds, metadata
- `AIInteractionLog` model: Has sessionContext, questionSummary (for topic extraction)
- Auth guards: `JwtAuthGuard` for protecting new profile endpoint

### Established Patterns
- Feature modules in `backend/src/modules/` with controller + service + DTOs
- Prisma model with `@@map()` for snake_case table names
- Global `@Module()` for shared services (Prisma, AI) -- no need to re-import
- `class-validator` + `ValidationPipe` for DTO validation
- NestJS `Logger` for structured logging in services

### Integration Points
- `ProgressService` and quiz-related services will call `LearnerProfileService.recalculate()` after write operations
- New `/api/v1/learner-profile/me` endpoint integrates with existing JWT auth flow
- OnboardingData migration ties into existing onboarding module (need to update references)

</code_context>

<specifics>
## Specific Ideas

No specific requirements -- open to standard approaches following existing NestJS patterns.

</specifics>

<deferred>
## Deferred Ideas

None -- discussion stayed within phase scope.

</deferred>

---

*Phase: 04-canonical-learner-profile-foundation*
*Context gathered: 2026-03-24*
