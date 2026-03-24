# Phase 4: Canonical Learner Profile Foundation - Research

**Researched:** 2026-03-24
**Domain:** NestJS + Prisma canonical learner profile, onboarding round persistence, and synchronous profile recalculation
**Confidence:** HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

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

### Deferred Ideas (OUT OF SCOPE)

## Deferred Ideas

None -- discussion stayed within phase scope.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| PROF-01 | System stores a canonical learner profile that combines onboarding answers and observed learning signals | Separate `LearnerProfile` model, dedicated `LearnerProfileService`, synchronous recompute hooks, and protected `GET /learner-profile/me` API establish one backend-owned source of truth |
| PROF-02 | System persists onboarding answers per round so they can be reused for later recommendations and profile updates | `OnboardingRound` append-per-round storage with `answers` JSON, migration from `OnboardingData`, and stable `questionId` keys preserve reusable raw inputs |
| PROF-03 | System recalculates learner profile after relevant lesson milestones to support later onboarding rounds and recommendation updates | Recalc triggers on lesson completion, quiz pass, and track completion, driven from existing `LessonsService` / progress flows and stored learning signals |
</phase_requirements>

## Summary

Phase 4 should be planned as a backend domain foundation, not as a UI feature. The codebase already has the raw signal sources needed for a canonical learner profile: onboarding answers in `OnboardingData`, lesson completion in `UserProgress`, quiz outcomes in `QuizResult`, study duration in `LearningSession`, path completion state in `UserLearningPath.completedAt`, and topic hints in `AIInteractionLog.questionSummary`. What is missing is a single backend-owned projection that turns those fragmented inputs into one reusable learner profile for later personalization features.

The most important planning decision is to keep raw inputs and computed profile state separate. The user already locked this in, and the current codebase strongly supports it. `OnboardingData` is currently a one-row snapshot used directly by onboarding and auth logic, while future rounds need append-style storage and later features need recomputed fields. The clean pattern is: `OnboardingRound` stores immutable round payloads, `LearnerProfile` stores the latest computed profile, and a dedicated service recalculates that projection whenever a qualifying learning event occurs.

The biggest implementation risk is migration blast radius, not the scoring rules. Removing `OnboardingData` affects current onboarding submission, recommendation lookup, and `AuthService.login()` / OAuth “isNewUser” detection because that logic currently checks `user.onboardingData`. If the plan treats this as “just add two Prisma models”, implementation will break auth and onboarding behavior. The planner should explicitly schedule schema migration, data backfill, auth/onboarding refactor, recalc service hooks, and tests as separate tasks.

**Primary recommendation:** Use a new `learner-profile` NestJS module with a dedicated Prisma-backed service, migrate `OnboardingData` into append-only `OnboardingRound`, backfill `LearnerProfile` for already-onboarded users during migration, and trigger synchronous profile recalculation from the existing lesson/quiz/path completion flows.

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| NestJS core (`@nestjs/common`) | repo: 11.0.1, latest verified: 11.1.17 (published 2026-03-16) | Feature modules, DI, controllers, guards, providers | Already the project backend framework; official module/provider/export pattern matches the planned `learner-profile` module |
| Prisma Client (`@prisma/client`) | repo: 7.3.0, latest verified: 7.5.0 (published 2026-03-11) | Schema modeling, migrations, JSON fields, transactions | Already the project ORM; official JSON + transaction support fits round answers and backfill/recalc writes |
| PostgreSQL via Prisma Json fields | current project datastore | Store flexible per-round `{ questionId: answer }` payloads and string-array profile facets | Best fit for heterogeneous onboarding rounds without hand-rolled EAV tables |
| class-validator | repo: 0.14.3, latest verified: 0.15.1 (published 2026-02-26) | DTO validation for the new read endpoint and future internal request DTOs | Already project standard; keeps controller boundary consistent with current NestJS modules |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Nest testing (`@nestjs/testing`) | repo: 11.0.1, latest verified: 11.1.17 (published 2026-03-16) | Unit-test Nest services/controllers with DI | Use for `LearnerProfileService` and controller tests with mocked Prisma and dependent services |
| Jest | repo: 30.0.0, latest verified: 30.3.0 (published 2026-03-10) | Backend unit and e2e runner | Use for all backend regression coverage in this phase |
| Supertest | repo: 7.0.0, latest verified: 7.2.2 (published 2026-01-06) | HTTP-level e2e tests | Use only if the plan adds a narrow protected `/learner-profile/me` endpoint e2e test |
| ts-jest | repo: 29.2.5, latest verified: 29.4.6 (published 2025-12-01) | TypeScript Jest transform | Keep existing backend test pipeline unchanged |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `OnboardingRound.answers` as `Json` | Fully normalized answer tables (`OnboardingAnswer`, `Question`, `Option`) | Better queryability, but too heavy for user-locked “per-round flexible payload” scope |
| Separate `LearnerProfile` projection | Recompute personalization directly from raw tables on every read | Simpler schema, but duplicates logic across onboarding/recommendations/AI and violates the “one reusable learner profile” goal |
| Synchronous recalculation in handlers | Async queue / job worker | Better scalability later, but unnecessary complexity for the locked current scale and request-path requirements |
| Rule-based profile derivation | AI-generated profile assessment | More flexible, but explicitly out of scope and harder to debug or keep deterministic |

**Installation:**
```bash
# No new runtime packages are required for this phase.
# Use the repo's existing NestJS + Prisma + Jest stack.
```

**Version verification:** verified via `npm view` on 2026-03-24.
- `@nestjs/common`: 11.1.17, published 2026-03-16
- `@prisma/client`: 7.5.0, published 2026-03-11
- `class-validator`: 0.15.1, published 2026-02-26
- `@nestjs/testing`: 11.1.17, published 2026-03-16
- `jest`: 30.3.0, published 2026-03-10
- `supertest`: 7.2.2, published 2026-01-06
- `ts-jest`: 29.4.6, published 2025-12-01

Note: the repository currently pins slightly older but compatible minors. This phase does not need a dependency-upgrade task; it should use the existing repo versions unless a separate maintenance phase is planned.

## Architecture Patterns

### Recommended Project Structure
```text
backend/src/modules/
├── learner-profile/
│   ├── learner-profile.module.ts        # Imports AuthModule, exports LearnerProfileService
│   ├── learner-profile.controller.ts    # GET /learner-profile/me
│   ├── learner-profile.service.ts       # createFromRoundOne, getMine, recalculate
│   ├── dto/
│   │   └── index.ts                     # Future-proof DTO barrel if needed
│   └── index.ts                         # Barrel exports for module/service/controller
├── onboarding/
│   ├── onboarding.service.ts            # Refactor from OnboardingData to OnboardingRound
│   └── constants/                       # Round 1 question IDs remain canonical input keys
├── lessons/
│   └── lessons.service.ts               # Calls profile recalc after lesson completion / quiz pass
└── auth/
    └── auth.service.ts                  # Stop deriving isNewUser from removed OnboardingData

backend/prisma/
├── schema.prisma                        # Add LearnerProfile + OnboardingRound, remove OnboardingData
└── migrations/                          # One schema migration plus SQL/data backfill work
```

### Pattern 1: Raw Answers Are Append-Only, Profile Is a Projection
**What:** Persist each onboarding round as its own immutable row in `OnboardingRound`, then compute `LearnerProfile` separately from those raw rows and learning signals.

**When to use:** Always. Do not write computed fields back into round storage and do not read personalization directly from raw answers in downstream features.

**Why this matches the codebase:**
- Current `OnboardingData` is being used as both raw input and personalization input, which is exactly what this phase is fixing.
- Future rounds vary by question set, so Prisma `Json` is a better fit for raw payloads than a fixed-column table.
- Official Prisma guidance supports reading/writing flexible Json payloads directly, while warning that Json fields remain untyped unless you add your own typing discipline.

**Example:**
```typescript
// Source: https://www.prisma.io/docs/orm/prisma-client/special-fields-and-types/working-with-json-fields
await prisma.onboardingRound.create({
  data: {
    userId,
    roundNumber: 1,
    answers: {
      careerGoal: 'FRONTEND',
      priorKnowledge: ['html', 'css'],
      learningBackground: 'SELF_TAUGHT',
      hoursPerWeek: 10,
    },
    completedAt: new Date(),
  },
});
```

### Pattern 2: Dedicated LearnerProfile Module Exporting Its Service
**What:** Add a new NestJS feature module with controller + service, and export `LearnerProfileService` so `LessonsService` and other modules can inject it.

**When to use:** For any cross-feature provider that owns domain rules and must be called from multiple modules.

**Why this matters here:**
- `OnboardingModule` currently does not export anything.
- `LessonsModule` and `ProgressModule` are isolated feature modules.
- Official NestJS guidance is clear: providers are encapsulated unless exported, and consumer modules must import the provider-owning module unless the provider is global.

**Example:**
```typescript
// Source: https://raw.githubusercontent.com/nestjs/docs.nestjs.com/master/content/modules.md
@Module({
  imports: [AuthModule],
  controllers: [LearnerProfileController],
  providers: [LearnerProfileService],
  exports: [LearnerProfileService],
})
export class LearnerProfileModule {}
```

### Pattern 3: Protected Read Endpoint Uses Existing Guard + CurrentUser Decorator
**What:** Implement `GET /api/v1/learner-profile/me` as a protected controller route using `@UseGuards(JwtAuthGuard)` and `@CurrentUser('id')`.

**When to use:** Read-only self-profile access in this phase.

**Why this matches the codebase:**
- Current controllers like `DashboardController`, `LessonsController`, and `ProgressController` already use class-level `JwtAuthGuard`.
- The repo already has a reusable `CurrentUser` param decorator, which is cleaner than manually casting `req.user`.

**Example:**
```typescript
// Source: /home/minhnhut_dev/projects/path-learn/backend/src/common/decorators/current-user.decorator.ts
@Controller('learner-profile')
@UseGuards(JwtAuthGuard)
export class LearnerProfileController {
  constructor(private readonly learnerProfileService: LearnerProfileService) {}

  @Get('me')
  async getMyProfile(@CurrentUser('id') userId: string) {
    return this.learnerProfileService.getMyProfile(userId);
  }
}
```

### Pattern 4: Recalculate Immediately After the Source Write Succeeds
**What:** Keep the source-of-truth write in its owning module, then call `LearnerProfileService.recalculate(userId, event)` immediately after the lesson/quiz/path update succeeds.

**When to use:** After lesson completion, quiz pass, and path completion.

**Why this matters here:**
- `LessonsService.completeLesson()` already has the completion write and path-completion transition.
- `LessonsService.submitQuiz()` already knows whether a quiz passed.
- User decision D-10 explicitly prefers synchronous recalculation rather than a queue.

**Implementation guidance:** keep the profile recalculation transaction short. Official Prisma guidance recommends interactive transactions only when you need conditional read-check-write logic, and to keep them short. Do not mix external network calls or long scans into the same transaction.

**Example:**
```typescript
// Source: /home/minhnhut_dev/projects/path-learn/backend/src/modules/lessons/lessons.service.ts
const updated = await this.prisma.$transaction(async (tx) => {
  const completedProgress = await tx.userProgress.update({
    where: { userId_lessonId: { userId, lessonId: lesson.id } },
    data: { status: ProgressStatus.COMPLETED, completedAt: new Date() },
  });

  await this.advanceToNextLesson(tx, userId, lesson.id, enrollment.learningPathId);
  return completedProgress;
});

await this.learnerProfileService.recalculate(userId, {
  type: 'LESSON_COMPLETED',
  lessonId: lesson.id,
});
```

### Pattern 5: Track Completion Trigger Comes From `UserLearningPath.completedAt`
**What:** Treat “track completion” / “path milestone completion” as a state transition derived from the existing path-progress flow, not as a separate event bus.

**When to use:** After `advanceToNextLesson()` determines there is no next lesson and sets `currentLessonId: null` plus `completedAt`.

**Why this matters here:**
- There is no separate `TrackCompletion` model or event system in the repo.
- The current lessons flow already marks a path complete by updating `UserLearningPath.completedAt`.
- Planning should therefore define the trigger from existing persistence state, not invent new infrastructure.

**Example:**
```typescript
// Source: /home/minhnhut_dev/projects/path-learn/backend/src/modules/lessons/lessons.service.ts
await tx.userLearningPath.update({
  where: { userId_learningPathId: { userId, learningPathId } },
  data: {
    currentLessonId: null,
    completedAt: new Date(),
  },
});
```

### Anti-Patterns to Avoid
- **Using `LearnerProfile` as raw answer storage:** That collapses raw evidence and computed output back into one table and recreates today’s problem.
- **Deleting `OnboardingData` before refactoring auth/onboarding code:** `AuthService.login()` currently includes `onboardingData` to determine `isNewUser`; that will break immediately after schema removal.
- **Scanning the entire user history on every recalc when only one field changed:** User decision D-11 explicitly wants incremental updates; full-history rebuild on every trigger will slow requests unnecessarily.
- **Putting `LearnerProfileService` in a random existing module:** This feature is cross-cutting and needs a clear owner plus explicit exports/imports.
- **Using human-readable labels as answer keys:** Persist stable question IDs / enum values, not UI labels, or later recommendation logic becomes fragile.
- **Returning synthesized empty profiles as if they were real:** For pre-onboarding users, either return a clear not-found/domain error or a deliberately defined empty contract; do not silently fabricate computed fields.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Flexible round answer storage | Custom EAV answer engine or per-question tables for this phase | Prisma `Json` field on `OnboardingRound.answers` | Handles heterogeneous round payloads with less schema churn and matches the locked design |
| Multi-step DB atomicity | Manual rollback logic in service code | Prisma nested writes / `$transaction` | Officially supported atomic operations; easier to reason about and test |
| Auth extraction in new controller | `@Req()` casting boilerplate everywhere | Existing `@CurrentUser()` decorator + `JwtAuthGuard` | Keeps controller boundaries consistent and type-safe within project conventions |
| Profile computation orchestration | Ad-hoc duplicated logic in onboarding, lessons, and future AI/recommendation modules | One exported `LearnerProfileService` | Prevents contradictory personalization rules across features |
| AI-based profile scoring | Prompt-based “smart” assessment layer | Deterministic rule-based thresholds and topic aggregation | Explicitly locked by user decision D-14 and far easier to debug |
| Queue/event framework | New job worker or event bus for this phase | Synchronous service call after source writes | Matches current scale and the user-locked implementation decision |

**Key insight:** The complexity in this domain is consistency, not machine intelligence. The winning plan is to centralize profile rules in one service and centralize raw answers in one append-only round store, not to add more infrastructure.

## Runtime State Inventory

| Category | Items Found | Action Required |
|----------|-------------|------------------|
| Stored data | PostgreSQL `onboarding_data` table exists in the current Prisma schema and initial SQL migration. Existing rows must be migrated into `OnboardingRound` as `roundNumber = 1`. Existing onboarded users also need a matching `LearnerProfile` backfill so `GET /learner-profile/me` works after migration. | Data migration: copy existing `onboarding_data` rows into `onboarding_rounds`, derive initial learner-profile rows from round-1 data, then remove `onboarding_data`. Code edit: switch reads/writes from `OnboardingData` to `OnboardingRound` / `LearnerProfile`. |
| Live service config | None found in repo research. This phase is internal app-domain state only; no evidence of external dashboards, workflow UIs, or hosted service config storing learner-profile identifiers outside git. | None — verified by codebase search and phase scope. |
| OS-registered state | None found. This phase does not rename services or register OS-level jobs. | None — verified by phase scope and codebase inspection. |
| Secrets/env vars | None found for learner-profile or onboarding-round naming. Current env-backed services (DB, auth, AI, payments) do not expose profile-model-specific env keys in researched files. | None for this phase’s domain model. |
| Build artifacts | Generated Prisma client and compiled `backend/dist` artifacts still reference `OnboardingData` after schema/code changes. `backend/dist/src/modules/onboarding/onboarding.service.js` and generated Prisma types will become stale. | Code edit + rebuild: regenerate Prisma client and rebuild backend after schema migration; do not rely on old generated artifacts. |

## Common Pitfalls

### Pitfall 1: Breaking Login/New-User Routing When `OnboardingData` Is Removed
**What goes wrong:** Login and OAuth callback flows start misclassifying users because `AuthService` currently derives `isNewUser` from `user.onboardingData`.
**Why it happens:** The current auth code includes `onboardingData` in the login query and returns `isNewUser: !user.onboardingData`.
**How to avoid:** Plan an auth refactor task alongside the schema migration. Replace that check with the new canonical condition, most likely “has completed round 1” via `OnboardingRound`.
**Warning signs:** Type errors after Prisma generate, failing auth specs, or users being redirected to `/onboarding` unexpectedly after login.

### Pitfall 2: Migrating Raw Answers but Forgetting to Backfill Learner Profiles
**What goes wrong:** Existing users keep their migrated round-1 answers but have no learner profile row, so `/learner-profile/me` returns not found and downstream personalization has no canonical projection.
**Why it happens:** D-04 focuses on creating profile rows when round 1 completes in Phase 5, but migrated historical users have already completed round 1 in the old schema.
**How to avoid:** Make backfill part of the migration plan, not a later enhancement.
**Warning signs:** Production users with `OnboardingRound` data but no `LearnerProfile`, or endpoint behavior differing between old and newly onboarded users.

### Pitfall 3: Storing Unstable Labels Instead of Stable Keys in `answers`
**What goes wrong:** Later recommendation/profile logic has to parse Vietnamese labels like “Tự học” or “Dưới 5 giờ / tuần” instead of canonical keys.
**Why it happens:** JSON storage is flexible, so teams often dump UI-facing labels directly.
**How to avoid:** Persist stable `questionId` keys and enum/value payloads only. Keep labels in frontend/backend constants, not persisted rows.
**Warning signs:** Rule code comparing against localized strings, brittle string matching, or difficulty reusing answers across languages.

### Pitfall 4: Recalc Logic Scans Too Much History Inside the Request Path
**What goes wrong:** Lesson complete or quiz submit endpoints become noticeably slower because recalc performs broad historical aggregation on every event.
**Why it happens:** It is tempting to rebuild the whole profile from scratch after every trigger.
**How to avoid:** Follow locked decision D-11. Use event-specific recalculation helpers and only query the minimum data needed for affected fields.
**Warning signs:** More Prisma queries than the source action itself, large `findMany()` scans on every completion, or request latency spikes.

### Pitfall 5: Treating Track Completion as a Separate Missing System
**What goes wrong:** Planning invents a new event framework or new persistence model for track completion.
**Why it happens:** The repo does not expose a dedicated completion event, so it can look “missing”.
**How to avoid:** Reuse the existing lessons flow and derive the milestone from `UserLearningPath.completedAt` / lesson advancement logic.
**Warning signs:** Proposed tasks creating event buses, message queues, or extra milestone tables without a clear product need.

### Pitfall 6: Weakness/Strength Topic Granularity Becomes Too Noisy
**What goes wrong:** The system generates strengths/weaknesses at lesson-level granularity and produces unstable, contradictory profile facets.
**Why it happens:** `QuizResult` is lesson-scoped, but personalization usually needs coarser signal buckets.
**How to avoid:** Prefer track-level or learning-path-subdomain aggregation first; only go more granular if the planner has clear evidence and tests.
**Warning signs:** Huge arrays of one-off topics, profile changes after every single small quiz, or hard-to-explain AI/recommendation output.

### Pitfall 7: Nest Module Wiring Fails Across Feature Boundaries
**What goes wrong:** `LessonsService` cannot inject `LearnerProfileService`, or tests fail because the new provider is not exported/imported correctly.
**Why it happens:** Nest providers are encapsulated by default unless exported from their owning module.
**How to avoid:** Export `LearnerProfileService` from `LearnerProfileModule` and import that module where the service is consumed.
**Warning signs:** Nest “can’t resolve dependencies” errors or controller/service tests failing before business logic runs.

## Code Examples

Verified patterns from official sources and current codebase:

### Export a Cross-Feature Service From Its Owning Module
```typescript
// Source: https://raw.githubusercontent.com/nestjs/docs.nestjs.com/master/content/modules.md
@Module({
  providers: [LearnerProfileService],
  exports: [LearnerProfileService],
})
export class LearnerProfileModule {}
```

### Test a Service With `Test.createTestingModule()` and Mocked Providers
```typescript
// Source: https://raw.githubusercontent.com/nestjs/docs.nestjs.com/master/content/fundamentals/unit-testing.md
const moduleRef: TestingModule = await Test.createTestingModule({
  providers: [
    LearnerProfileService,
    { provide: PrismaService, useValue: prismaMock },
  ],
}).compile();

const service = moduleRef.get<LearnerProfileService>(LearnerProfileService);
```

### Protect a Self-Service Controller Route With JWT Guard
```typescript
// Source: https://raw.githubusercontent.com/nestjs/docs.nestjs.com/master/content/security/authentication.md
@Controller('learner-profile')
@UseGuards(JwtAuthGuard)
export class LearnerProfileController {
  @Get('me')
  async getMyProfile(@CurrentUser('id') userId: string) {
    return this.learnerProfileService.getMyProfile(userId);
  }
}
```

### Keep Interactive Transactions Short
```typescript
// Source: https://www.prisma.io/docs/orm/prisma-client/queries/transactions
await prisma.$transaction(async (tx) => {
  const round = await tx.onboardingRound.create({ data: roundData });
  await tx.learnerProfile.upsert({
    where: { userId },
    update: profilePatch,
    create: initialProfile,
  });
  return round;
});
```

### Use Current Project Pattern for Protected User-Specific Controllers
```typescript
// Source: /home/minhnhut_dev/projects/path-learn/backend/src/modules/dashboard/dashboard.controller.ts
@Controller('dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardController {
  @Get('overview')
  async getOverview(@CurrentUser('id') userId: string) {
    return this.dashboardService.getOverview(userId);
  }
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| One fixed `OnboardingData` row used as both raw onboarding state and personalization input | Append-only round rows plus computed canonical profile projection | Planned in Phase 4, based on 2026-03-24 decisions | Separates evidence from derived state and enables later rounds without schema churn |
| Onboarding-only personalization snapshot | Recomputed learner profile using onboarding + observed learning signals | Planned in Phase 4 | Downstream recommendations and AI guidance can share one evolving context |
| `@Req()` / ad-hoc JWT user extraction | Shared `@CurrentUser()` decorator pattern | Already present in current codebase | New profile endpoint should follow established controller ergonomics |
| Hand-coded “new user” detection from `OnboardingData` existence | Derived onboarding-round completion status | Required by this phase | Prevents auth from depending on a removed model |

**Deprecated/outdated:**
- `OnboardingData` model: outdated for the locked round-based design and should be replaced after migration.
- Reading personalization directly from onboarding submission rows: outdated because it cannot reconcile new learning signals.
- AI-assessed learner profiling: out of scope for the locked deterministic rules in this phase.

## Open Questions

1. **What exact thresholds should map a learner to beginner/intermediate/advanced?**
   - What we know: user locked rule-based tiers from quiz scores + completion rate; no AI scoring.
   - What's unclear: concrete numeric cutoffs and whether they should include minimum sample size.
   - Recommendation: planner should define explicit threshold constants and include tests around boundary values.

2. **Should strengths/weaknesses aggregate by track or by lesson topic?**
   - What we know: discretion area explicitly allows choosing granularity.
   - What's unclear: whether lesson-level signals are too noisy for useful personalization.
   - Recommendation: start at track-level aggregation because existing path/track structures are stable and easier to explain.

3. **What should `GET /learner-profile/me` return before round 1 exists?**
   - What we know: discretion area allows choosing pre-onboarding behavior.
   - What's unclear: whether downstream phases prefer `404`, a nullable payload, or an explicit “not initialized” shape.
   - Recommendation: return a clear domain-level not-found/empty-state contract and keep it explicit in tests; do not fabricate computed values.

4. **How much AI chat signal should affect `preferredTopics` in Phase 4?**
   - What we know: `AIInteractionLog.questionSummary` exists and is a locked signal source.
   - What's unclear: whether to implement only a lightweight keyword/topic extraction now or simply reserve the field for later enrichment.
   - Recommendation: use a conservative, low-complexity extraction rule or leave AI-chat-derived updates behind a minimal helper so Phase 6 can deepen it safely.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Jest (repo 30.0.0; latest verified 30.3.0) + `@nestjs/testing` |
| Config file | `/home/minhnhut_dev/projects/path-learn/backend/package.json` (`jest` key) |
| Quick run command | `pnpm --filter backend test -- onboarding.service.spec.ts lessons.service.spec.ts auth.service.spec.ts learner-profile.service.spec.ts learner-profile.controller.spec.ts` |
| Full suite command | `pnpm --filter backend test` |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| PROF-01 | Canonical learner profile is readable and combines onboarding + signal-derived fields | unit + controller | `pnpm --filter backend test -- learner-profile.service.spec.ts learner-profile.controller.spec.ts` | ❌ Wave 0 |
| PROF-02 | Onboarding answers persist per round and existing one-row data migrates to round 1 | unit + migration smoke + manual DB verification | `pnpm --filter backend test -- onboarding.service.spec.ts learner-profile.service.spec.ts` | `onboarding.service.spec.ts` ✅ / migration coverage ❌ Wave 0 |
| PROF-03 | Lesson/quiz/path milestones trigger profile recalculation | unit | `pnpm --filter backend test -- lessons.service.spec.ts learner-profile.service.spec.ts` | `lessons.service.spec.ts` ✅ / learner-profile spec ❌ Wave 0 |

### Sampling Rate
- **Per task commit:** `pnpm --filter backend test -- onboarding.service.spec.ts lessons.service.spec.ts auth.service.spec.ts learner-profile.service.spec.ts`
- **Per wave merge:** `pnpm --filter backend test`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `/home/minhnhut_dev/projects/path-learn/backend/src/modules/learner-profile/learner-profile.service.spec.ts` — covers PROF-01 and PROF-03 boundary logic
- [ ] `/home/minhnhut_dev/projects/path-learn/backend/src/modules/learner-profile/learner-profile.controller.spec.ts` — covers protected `/learner-profile/me`
- [ ] Update `/home/minhnhut_dev/projects/path-learn/backend/src/modules/lessons/lessons.service.spec.ts` — assert recalc hook after lesson completion and quiz pass
- [ ] Update `/home/minhnhut_dev/projects/path-learn/backend/src/modules/auth/auth.service.spec.ts` — replace `onboardingData`-based `isNewUser` expectations with onboarding-round-based expectations
- [ ] Migration verification task — no existing automated migration test harness detected; planner should add either SQL smoke verification or a manual DB validation checklist

## Sources

### Primary (HIGH confidence)
- `/home/minhnhut_dev/projects/path-learn/backend/prisma/schema.prisma` - current models for `OnboardingData`, `UserProgress`, `QuizResult`, `LearningSession`, `AIInteractionLog`, and `UserLearningPath`
- `/home/minhnhut_dev/projects/path-learn/backend/src/modules/onboarding/onboarding.service.ts` - current onboarding persistence and recommendation reads from `OnboardingData`
- `/home/minhnhut_dev/projects/path-learn/backend/src/modules/auth/auth.service.ts` - current `isNewUser` dependency on `onboardingData`
- `/home/minhnhut_dev/projects/path-learn/backend/src/modules/lessons/lessons.service.ts` - current lesson completion, quiz submission, and path-completion flow
- `/home/minhnhut_dev/projects/path-learn/backend/src/modules/progress/progress.service.ts` - current learning-session and time-spent signal handling
- `/home/minhnhut_dev/projects/path-learn/backend/src/modules/ai-chat/ai-chat.service.ts` and `/home/minhnhut_dev/projects/path-learn/backend/src/modules/ai-chat/context/ai-context.builder.ts` - current AI chat signal and quiz/progress context usage
- `https://www.prisma.io/docs/orm/prisma-client/special-fields-and-types/working-with-json-fields` - official Json field behavior and caveats
- `https://www.prisma.io/docs/orm/prisma-client/queries/transactions` - official transaction guidance and interactive transaction cautions
- `https://raw.githubusercontent.com/nestjs/docs.nestjs.com/master/content/modules.md` - official module/provider/export guidance
- `https://raw.githubusercontent.com/nestjs/docs.nestjs.com/master/content/security/authentication.md` - official JWT guard and protected-controller guidance
- `https://raw.githubusercontent.com/nestjs/docs.nestjs.com/master/content/fundamentals/unit-testing.md` - official `Test.createTestingModule()` testing guidance

### Secondary (MEDIUM confidence)
- `/home/minhnhut_dev/projects/path-learn/.planning/codebase/ARCHITECTURE.md` - current feature-module and data-flow analysis
- `/home/minhnhut_dev/projects/path-learn/.planning/codebase/CONVENTIONS.md` - current naming, controller/service, and testing conventions
- `/home/minhnhut_dev/projects/path-learn/.planning/codebase/TESTING.md` - current Jest testing patterns and commands

### Tertiary (LOW confidence)
- None.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - based on the repo’s current backend stack plus official Prisma and NestJS documentation and npm registry verification.
- Architecture: HIGH - based on locked phase decisions, current service/controller/module structure, and direct code inspection of onboarding/auth/lessons/progress flows.
- Pitfalls: MEDIUM - most are strongly supported by current code, but exact threshold tuning and topic granularity still require planner decisions.

**Research date:** 2026-03-24
**Valid until:** 2026-04-23