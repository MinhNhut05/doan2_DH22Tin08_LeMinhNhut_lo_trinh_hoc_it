# Phase 4: Canonical Learner Profile Foundation - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md -- this log preserves the alternatives considered.

**Date:** 2026-03-24
**Phase:** 04-canonical-learner-profile-foundation
**Areas discussed:** Profile data model, Round-based storage, Recalculation triggers, Signal composition

---

## Profile Data Model

### Q1: Profile data organization

| Option | Description | Selected |
|--------|-------------|----------|
| Separate model (Recommended) | Create LearnerProfile separate from OnboardingData. Profile holds computed/aggregated fields. OnboardingData keeps raw answers. | :heavy_check_mark: |
| Extend OnboardingData | Add computed columns to existing OnboardingData. Simpler but mixes raw + computed. | |
| Json column on User | Json column in User model. Flexible but hard to query and validate. | |

**User's choice:** Separate model (Recommended)
**Notes:** Clean separation of concerns -- raw answers vs computed profile.

### Q2: Profile fields scope

| Option | Description | Selected |
|--------|-------------|----------|
| Learning-focused (Recommended) | careerGoal, skillLevel (computed), learningPace, strengths[], weaknesses[], preferredTopics[] | :heavy_check_mark: |
| Learning + behavioral | Above + motivationLevel, engagementScore, riskOfDropout | |
| Minimal core only | Only careerGoal, skillLevel, preferredTopics[] | |

**User's choice:** Learning-focused (Recommended)
**Notes:** Focused on learning-relevant fields, no behavioral analytics at this stage.

### Q3: Profile versioning

| Option | Description | Selected |
|--------|-------------|----------|
| Single row, overwrite (Recommended) | 1 row/user, update in-place with lastRecalculatedAt timestamp. Simple, easy to query. | :heavy_check_mark: |
| Versioned snapshots | Each recalc inserts new row with version number. Full history but complex. | |
| Current + history table | 1 current row + separate history table for snapshots when needed. | |

**User's choice:** Single row, overwrite (Recommended)
**Notes:** No need for profile history tracking at this stage.

### Q4: Profile creation timing

| Option | Description | Selected |
|--------|-------------|----------|
| Created at first onboarding (Recommended) | 1:1 with User. Created when user completes onboarding round 1 (Phase 5 calls creation). | :heavy_check_mark: |
| Created at registration | Empty profile created at signup, filled gradually. | |
| Lazy creation on first read | Created on-demand when any feature first reads profile. | |

**User's choice:** Created at first onboarding (Recommended)
**Notes:** Profile requires onboarding data to be meaningful.

---

## Round-based Storage

### Q5: Round storage approach

| Option | Description | Selected |
|--------|-------------|----------|
| New OnboardingRound table (Recommended) | New model: userId + roundNumber + answers (Json) + completedAt. Multiple rows per user. | :heavy_check_mark: |
| Extend OnboardingData + round column | Keep OnboardingData, add round column, allow multiple rows. Remove @unique(userId). | |
| Single Json column for all rounds | Store all rounds in one Json column. Flexible but can't query individual rounds. | |

**User's choice:** New OnboardingRound table (Recommended)
**Notes:** Clean break from legacy flat structure.

### Q6: Legacy data migration

| Option | Description | Selected |
|--------|-------------|----------|
| Migrate & deprecate (Recommended) | Migrate existing OnboardingData to OnboardingRound (round=1). Remove OnboardingData model. | :heavy_check_mark: |
| Keep both tables | Keep legacy OnboardingData alongside new OnboardingRound. | |
| Drop & restart | Delete OnboardingData entirely, force re-onboarding. | |

**User's choice:** Migrate & deprecate (Recommended)
**Notes:** Clean migration preserving existing user data.

### Q7: Answer format per round

| Option | Description | Selected |
|--------|-------------|----------|
| Json answers per round (Recommended) | Each round stores answers as Json: { questionId: answer }. Flexible per-round questions. | :heavy_check_mark: |
| Typed columns per round | Each round has typed columns (e.g., round 1 has careerGoal). Strict but rigid. | |
| Hybrid typed + Json | Common fields as typed columns + Json for round-specific questions. | |

**User's choice:** Json answers per round (Recommended)
**Notes:** Flexible enough for varying question sets across rounds.

### Q8: Phase 4 scope for round storage

| Option | Description | Selected |
|--------|-------------|----------|
| Model only in Phase 4 (Recommended) | Phase 4 creates model + migration. Phase 5 implements submit/resume logic. | :heavy_check_mark: |
| Model + basic CRUD | Phase 4 creates model + basic create/read endpoints. Phase 5 adds resume. | |
| Full round management | Phase 4 implements everything including round management. | |

**User's choice:** Model only in Phase 4 (Recommended)
**Notes:** Clean phase boundary -- data model foundation in P4, business logic in P5.

---

## Recalculation Triggers

### Q9: Trigger events

| Option | Description | Selected |
|--------|-------------|----------|
| Lesson + Quiz + Track completion (Recommended) | Recalc on: lesson done, quiz pass, track completion. 3 clear events. | :heavy_check_mark: |
| Lesson completion only | Only on lesson completion. Simplest. | |
| Every learning activity | Every activity: lesson view, quiz attempt, AI chat. Detailed but noisy. | |

**User's choice:** Lesson + Quiz + Track completion (Recommended)
**Notes:** Meaningful learning milestones, not noise from every activity.

### Q10: Execution model

| Option | Description | Selected |
|--------|-------------|----------|
| Synchronous in-request (Recommended) | Recalc runs in request handler after saving progress. Simple, no queue needed. | :heavy_check_mark: |
| Async via event queue | Emit event, process in background. Doesn't block request but needs event system. | |
| Scheduled batch recalc | Cron job runs periodically for users with new activity. | |

**User's choice:** Synchronous in-request (Recommended)
**Notes:** Acceptable latency at current scale, avoids infrastructure complexity.

### Q11: Recalculation scope

| Option | Description | Selected |
|--------|-------------|----------|
| Incremental update (Recommended) | Only update fields affected by triggering event. | :heavy_check_mark: |
| Full recompute every time | Read all signals and recompute entire profile. Consistent but slower. | |
| Hybrid: incremental + periodic full | Normal = incremental; full recompute at major milestones (track completion). | |

**User's choice:** Incremental update (Recommended)
**Notes:** Efficient, only touches what changed.

### Q12: Service architecture

| Option | Description | Selected |
|--------|-------------|----------|
| Dedicated ProfileService (Recommended) | New LearnerProfileService in learner-profile module. Other services call it. Single responsibility. | :heavy_check_mark: |
| Inline in each trigger service | Recalc logic spread across ProgressService, QuizService, etc. | |
| Event-based decoupled | NestJS EventEmitter: services emit events, ProfileService listens and recalcs. | |

**User's choice:** Dedicated ProfileService (Recommended)
**Notes:** Clean single-responsibility service.

---

## Signal Composition

### Q13: Signal sources

| Option | Description | Selected |
|--------|-------------|----------|
| Lesson completion patterns | Completion count, speed, order (sequential vs jumping). | :heavy_check_mark: |
| Quiz performance | Scores, retry count, pass rate, topic strengths/weaknesses. | :heavy_check_mark: |
| Time & frequency | Study time/day, session frequency, time per lesson. | :heavy_check_mark: |
| AI chat topics | Questions asked, topics discussed, AI usage frequency. | :heavy_check_mark: |

**User's choice:** All 4 signal sources selected.
**Notes:** Comprehensive profile built from all available learning data.

### Q14: SkillLevel computation

| Option | Description | Selected |
|--------|-------------|----------|
| Rule-based tiers (Recommended) | Quiz scores + completion rate determine tier. >80% quiz avg + >70% done = intermediate. | :heavy_check_mark: |
| Weighted composite score | Weighted from multiple signals (quiz 40%, completion 30%, etc). Flexible but hard to tune. | |
| Let AI assess later | Keep raw data, Phase 6 AI evaluates level on demand. | |

**User's choice:** Rule-based tiers (Recommended)
**Notes:** Deterministic, debuggable, no AI dependency for core profile.

### Q15: Strengths/weaknesses identification

| Option | Description | Selected |
|--------|-------------|----------|
| Quiz topic analysis (Recommended) | High quiz pass rate on topic = strength. Low = weakness. Topic mapped from track/lesson. | :heavy_check_mark: |
| Multi-signal analysis | Combine quiz + completion speed + AI chat patterns for richer analysis. | |
| Defer to AI in Phase 6 | Store raw data only, let AI analyze in Phase 6. | |

**User's choice:** Quiz topic analysis (Recommended)
**Notes:** Clear, data-driven identification from quiz performance per topic.

### Q16: LearningPace computation

| Option | Description | Selected |
|--------|-------------|----------|
| Actual vs estimated time (Recommended) | Compare actual lesson time vs estimatedMins. Faster = fast pace, slower = slow. | :heavy_check_mark: |
| Weekly throughput vs declared | Lessons/week compared to onboarding hoursPerWeek. | |
| Use onboarding answer as-is | Keep hoursPerWeek from onboarding, don't recompute. | |

**User's choice:** Actual vs estimated time (Recommended)
**Notes:** Dynamic, adapts to real behavior vs static onboarding answer.

### Q17: API surface for Phase 4

| Option | Description | Selected |
|--------|-------------|----------|
| Read-only API + internal recalc (Recommended) | GET /learner-profile/me + internal recalculate method. Phase 5-6 adds more endpoints. | :heavy_check_mark: |
| Full CRUD API | GET/POST/PATCH profile. User can edit directly. | |
| No API in Phase 4 | Model + service only, no HTTP endpoint. | |

**User's choice:** Read-only API + internal recalc (Recommended)
**Notes:** Minimal surface for Phase 4, extensible for future phases.

---

## Claude's Discretion

- Exact rule thresholds for skillLevel tiers
- Prisma migration naming and ordering
- Internal method signatures and error handling
- Edge case handling for pre-onboarding profile reads
- Topic granularity for strengths/weaknesses

## Deferred Ideas

None -- discussion stayed within phase scope.
