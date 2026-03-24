# Phase 5: Adaptive Onboarding Baseline and Resume Flow - Context

**Gathered:** 2026-03-24
**Status:** Ready for planning

<domain>
## Phase Boundary

Deliver resumable early onboarding rounds (3 rounds) that capture the learner's baseline profile. Round 1 already exists (basic profile info). This phase adds round 2 (career direction + learning style) and round 3 (skill self-assessment), wires the multi-round flow end-to-end, implements resume detection for users who leave mid-flow, creates LearnerProfile from round 1 answers, and fixes the frontend confirm gap. AI recommendation runs only after round 3 completion.

</domain>

<decisions>
## Implementation Decisions

### Round Content Design
- **D-01:** Round 2 covers both career direction and learning style in one round: target role (junior/intern/freelance), work environment (startup/corporate/remote), timeline to reach goal, and preferred learning style (video/text/hands-on).
- **D-02:** Round 3 is a skill self-assessment: user rates 5-6 tech topics on a 1-5 scale with Vietnamese descriptions (1=Moi bat dau, 2=Biet co ban, 3=Tam duoc, 4=Kha tot, 5=Tu tin).
- **D-03:** Round 3 topics are dynamic — selected based on the user's careerGoal from round 1 (e.g., Frontend goal shows HTML/CSS, JavaScript, React; Backend goal shows Node.js, SQL, API design). The topic mapping logic lives in backend constants.
- **D-04:** Each round has 3-5 questions. Answer format is single-choice or multi-choice (consistent with round 1). No free-text fields.
- **D-05:** Round 2 answers stored as Json in OnboardingRound model: `{ targetRole, workEnvironment, timeline, learningStyle }`. Round 3 stored as: `{ skillRatings: { topicSlug: number }[] }`.

### Multi-Round Flow
- **D-06:** Flow is continuous: R1 -> R2 -> R3 without returning to dashboard between rounds. After R3 completion, AI recommendation runs, then user confirms path.
- **D-07:** Rounds are strictly sequential — must complete round N before starting round N+1. Backend enforces this by checking previous round's completedAt.
- **D-08:** AI recommendation runs only after round 3 (all 3 rounds of data available). The existing recommendation endpoint is updated to require round 3 completion.
- **D-09:** LearnerProfile is created after round 1 completion (implement `createFromRoundOne`). Profile is progressively updated after round 2 and round 3 with richer data (e.g., round 2 adds learningPace context, round 3 refines skillLevel and strengths/weaknesses from self-ratings).

### Resume Flow
- **D-10:** Resume detection checks OnboardingRound records with `completedAt` not null. If round 1 done but round 2 missing -> resume from round 2. If rounds 1-2 done but round 3 missing -> resume from round 3.
- **D-11:** When user returns to /onboarding, show a "Welcome back" message with a "Tiep tuc" (Continue) button that takes them directly to the next incomplete round.
- **D-12:** No display of previous round answers on resume. User only sees the new round's questions.
- **D-13:** Progress is shown via a 3-step stepper at the top of the onboarding page, indicating which round the user is currently on.

### Frontend Architecture
- **D-14:** Single page layout at /onboarding — content changes per round, URL stays the same. Stepper component at top shows current round progress.
- **D-15:** Refactor Onboarding.tsx into container + child components: RoundOne, RoundTwo, RoundThree (each renders its own questions), plus shared components Stepper and QuestionCard.
- **D-16:** Round transitions use Framer Motion (already in project dependencies) for slide/fade animations between rounds.
- **D-17:** Fix the confirm gap: after AI recommendation is shown, user clicks "Xac nhan" (Confirm) which calls POST /onboarding/confirm with the recommended learningPathId, creating UserLearningPath enrollment, then navigates to dashboard.

### Claude's Discretion
- Exact question wording for round 2 and round 3 (Vietnamese text in vi.ts)
- Topic-to-careerGoal mapping specifics (which topics show for which goals)
- Stepper component visual design details
- Framer Motion animation parameters (duration, easing)
- Backend endpoint refactoring approach (extend existing vs new endpoints)
- Error handling for edge cases (e.g., user tries to access round 3 before completing round 2)
- How LearnerProfile fields map from round 2/3 answers (exact computation rules)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Data model
- `backend/prisma/schema.prisma` -- OnboardingRound model (userId, roundNumber, answers Json, completedAt), LearnerProfile model, UserLearningPath model
- `.planning/phases/04-canonical-learner-profile-foundation/04-CONTEXT.md` -- Phase 4 decisions on profile model (D-01 through D-17)

### Existing onboarding backend
- `backend/src/modules/onboarding/onboarding.service.ts` -- Current round 1 submit, recommendation (AI + fallback), and confirmPath logic
- `backend/src/modules/onboarding/onboarding.controller.ts` -- Existing endpoints: GET /questions, POST /submit, GET /recommendation, POST /confirm
- `backend/src/modules/onboarding/constants/onboarding-questions.ts` -- Round 1 question definitions
- `backend/src/modules/onboarding/recommendation/` -- Prompt builder, parser, fallback for AI recommendation
- `backend/src/modules/onboarding/dto/submit-onboarding.dto.ts` -- Round 1 DTO validation
- `backend/src/modules/onboarding/dto/confirm-path.dto.ts` -- Confirm path DTO

### Learner profile
- `backend/src/modules/learner-profile/learner-profile.service.ts` -- getMyProfile (implemented), createFromRoundOne (placeholder), recalculate (implemented)
- `backend/src/modules/learner-profile/learner-profile.controller.ts` -- GET /learner-profile/me

### Auth integration
- `backend/src/modules/auth/auth.service.ts` -- isNewUser detection based on completed round 1
- `backend/src/modules/auth/auth.controller.ts` -- OAuth callback redirects with isNewUser param

### Existing frontend
- `frontend/src/pages/Onboarding.tsx` -- Current single-round UI (needs refactor to multi-round)
- `frontend/src/pages/AuthCallback.tsx` -- Reads isNewUser and redirects to /onboarding
- `frontend/src/pages/Login.tsx` -- Redirects new users to /onboarding
- `frontend/src/stores/authStore.ts` -- Zustand auth store with isNewUser flag
- `frontend/src/services/api.ts` -- Axios instance with auth interceptor and token refresh
- `frontend/src/strings/vi.ts` -- Vietnamese string constants

### Conventions
- `.planning/codebase/CONVENTIONS.md` -- Naming, DTO, error handling, test patterns
- `.planning/codebase/ARCHITECTURE.md` -- Module pattern, data flow

### Requirements
- `.planning/REQUIREMENTS.md` -- ONB-04, ONB-05, ONB-06, ONB-07 definitions

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `OnboardingService`: Already handles round 1 submit, AI recommendation (with parser + fallback), and confirmPath enrollment. Extend for rounds 2-3.
- `OnboardingRound` Prisma model: Already supports multi-round with compound unique (userId, roundNumber) and Json answers field. No schema changes needed.
- `LearnerProfileService.createFromRoundOne()`: Placeholder exists, needs implementation.
- `LearnerProfileService.recalculate()`: Already implemented for lesson/quiz/track events. Can be extended or paralleled for onboarding round updates.
- `ONBOARDING_QUESTIONS` constant: Pattern for static question definitions. Extend with ROUND_2_QUESTIONS and ROUND_3_QUESTIONS.
- `OnboardingPromptBuilder`: Builds AI prompts from round 1 answers. Update to include round 2-3 data for richer recommendations.
- `OnboardingRecommendationFallback`: Rule-based fallback when AI fails. Update to use round 2-3 data.
- `Framer Motion`: Already in project dependencies for animations.
- `QuestionCard`-like patterns in Onboarding.tsx: Selection buttons for single/multi choice answers.

### Established Patterns
- Backend: NestJS module pattern (controller + service + DTOs), class-validator for validation, Prisma ORM, JWT auth guards
- Frontend: React functional components + useState/useEffect, Zustand for auth, axios wrapper with interceptor, Vietnamese strings in vi.ts
- AI integration: prompt builder -> aiService.chat -> parser -> fallback (defensive pattern)
- Response format: `{ success, data, error, meta }`

### Integration Points
- `OnboardingService.submitAnswers()`: Currently only handles round 1. Needs to accept roundNumber parameter and validate sequential completion.
- `OnboardingService.getRecommendation()`: Currently reads only round 1. Update to require round 3 and read all 3 rounds.
- `LearnerProfileService.createFromRoundOne()`: Called after round 1 submit to create initial profile.
- Profile update after round 2/3: New methods or extend recalculate to handle onboarding round events.
- Frontend Onboarding.tsx: Complete refactor needed — from single-round to multi-round container with child components.
- Frontend confirm flow: Must call POST /onboarding/confirm (currently only navigates to dashboard).

</code_context>

<specifics>
## Specific Ideas

No specific requirements — open to standard approaches following existing NestJS and React patterns.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 05-adaptive-onboarding-baseline-and-resume-flow*
*Context gathered: 2026-03-24*
