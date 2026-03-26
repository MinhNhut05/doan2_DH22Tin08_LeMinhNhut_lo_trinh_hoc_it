# Phase 6: Main Path Personalization and Content Credibility - Context

**Gathered:** 2026-03-26
**Status:** Ready for planning

<domain>
## Phase Boundary

Turn learner profile data into explainable path guidance with top 3 ranked recommendations, establish an explicit main learning path per user with dashboard prioritization, deliver later onboarding rounds (4-5) triggered by lesson milestones, enrich AI chat with profile + main path context, and ensure the Frontend path has credible content without critical gaps.

Requirements: ONB-08, ONB-09, ONB-10, LP-07, LP-08, LP-09, LP-10, AI-08, CONT-01, CONT-02

</domain>

<decisions>
## Implementation Decisions

### Recommendation & Path Selection (LP-07, ONB-08)
- **D-01:** AI generates top 3 ranked learning path recommendations (extends current AI + rule-based fallback pattern). AI prompt updated to return 3 paths instead of 1, each with match score and explanation. Rule-based fallback also returns 3 ranked paths.
- **D-02:** Display as ranked cards — each card shows: path name, difficulty badge, profile-linked explanation (2-3 sentences referencing user's career goal, skill level, and onboarding answers), and match score (%). Top recommendation highlighted as "Goi y hang dau".
- **D-03:** User directly picks one card as main path ("Chon lo trinh nay" button on each card). No separate confirm step needed. Selection calls existing confirmPath flow with chosen learningPathId.
- **D-04:** Explanation is profile-linked: explicitly references user's data. Example: "Ban muon lam Frontend Developer, da biet HTML/CSS co ban — lo trinh nay giup ban nhanh nhat".

### Milestone-triggered Later Rounds (ONB-09, ONB-10)
- **D-05:** Fixed milestone triggers: Round 4 appears after user completes 5 lessons. Round 5 appears after user completes 1 full track.
- **D-06:** Round 4 content — calibration: re-ask career goal confidence, skill self-rating (updated since learning), and learning pace satisfaction. Updates LearnerProfile with recalibrated data.
- **D-07:** Round 5 content — interest expansion: ask about new interest areas discovered while learning, preferred depth (overview vs deep-dive), and whether they want to adjust main path. Updates LearnerProfile.preferredTopics and can trigger main path switch suggestion.
- **D-08:** UX: Non-blocking banner at top of Dashboard: "Da den luc cap nhat ho so!" with "Cap nhat ngay" button and dismiss "X". Does NOT block learning flow.
- **D-09:** Dismissal policy: 3 strikes — user can dismiss 3 times, after which the banner stops appearing for that round. Backend tracks dismissal count per round per user.
- **D-10:** Milestone detection runs synchronously when lesson/track completion is recorded (in ProgressService or LearnerProfileService.recalculate). Sets a flag (e.g., `pendingRound` field) that Dashboard reads to decide whether to show the banner.

### Main Path vs Secondary UX (LP-08, LP-09, LP-10)
- **D-11:** Add `mainLearningPathId` field on `LearnerProfile` model (nullable FK to LearningPath). One explicit main path per user. Set when user confirms recommendation or switches later.
- **D-12:** Dashboard layout: Main path section prominent at top — continue-learning card with next lesson, progress bar, path name + icon. Secondary enrolled paths listed below in a smaller "Cac lo trinh khac" section with basic progress info.
- **D-13:** Continue-learning logic prioritizes main path: Dashboard continue-learning card always shows the next lesson from the main path. Secondary paths show a simpler "Tiep tuc" link.
- **D-14:** Switch main path in Settings/Profile page: section "Lo trinh chinh" with current main path name and "Doi lo trinh" button. Click opens a list of enrolled paths to select from, then confirm. Updates LearnerProfile.mainLearningPathId.
- **D-15:** Learning history (UserProgress, QuizResult) belongs to the user globally, not per-path. Switching main path does NOT delete or hide any prior learning history. All progress remains visible on respective path pages.

### AI Chat Context Enrichment (AI-08)
- **D-16:** AI chat system prompt is enriched with: learnerProfile data (careerGoal, skillLevel, strengths, weaknesses, learningPace) + main path name + current lesson context (existing). Prompt instructs AI to tailor tone and complexity to user's skillLevel and reference their learning goals.
- **D-17:** AiContextBuilder.buildContext updated to read LearnerProfile and mainLearningPathId instead of relying on implicit first-enrollment logic.

### Content Gap Strategy (CONT-01, CONT-02)
- **D-18:** Audit Frontend path (slug: frontend-reactjs) — review 8 tracks and 27 existing lessons for critical gaps where a concept jump is too large or a foundational topic is missing.
- **D-19:** Fill identified gaps with AI-generated content: use existing AI service (ai.service.ts) to generate lesson content (title, summary, markdown content, external links). Content goes through review before setting isPublished=true.
- **D-20:** Scope: Frontend path only in Phase 6. Backend and Fullstack paths remain as-is and will be improved in future phases.
- **D-21:** Content must be sufficient for: recommendation explanations to reference real tracks/lessons, continue-learning to always have a valid next lesson, and early milestone triggers (5 lessons, 1 track) to fire within the first few weeks of study.

### Claude's Discretion
- Exact AI prompt format for generating 3 ranked recommendations (researcher/planner can optimize)
- Match score calculation formula (rule-based + AI hybrid)
- Exact milestone detection implementation (field name, where check runs)
- Dismissal count storage approach (new model vs field on OnboardingRound vs Redis)
- Dashboard component layout details (spacing, card design, responsive behavior)
- AI-generated lesson content quality controls and review workflow
- Which specific gaps exist in Frontend path (audit result determines this)
- Exact Vietnamese wording for banner, button labels, explanations
- AiContextBuilder refactoring approach for profile injection

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Data model
- `backend/prisma/schema.prisma` — LearnerProfile (add mainLearningPathId), UserLearningPath, OnboardingRound, LearningPath, Track, TrackLesson, Lesson, UserProgress models
- `.planning/phases/04-canonical-learner-profile-foundation/04-CONTEXT.md` — Phase 4 decisions on LearnerProfile model (D-01 through D-17), recalculation triggers
- `.planning/phases/05-adaptive-onboarding-baseline-and-resume-flow/05-CONTEXT.md` — Phase 5 decisions on rounds 1-3, multi-round flow, resume detection, LearnerProfile creation from rounds

### Recommendation logic
- `backend/src/modules/onboarding/onboarding.service.ts` — Current single-path recommendation flow (getRecommendation, confirmPath)
- `backend/src/modules/onboarding/recommendation/onboarding-prompt.builder.ts` — Current AI prompt builder (needs update to request 3 ranked paths)
- `backend/src/modules/onboarding/recommendation/onboarding-recommendation.parser.ts` — Current parser (needs update to parse 3 paths)
- `backend/src/modules/onboarding/recommendation/onboarding-recommendation.fallback.ts` — Current rule-based fallback (needs update to return 3 paths)
- `backend/src/modules/onboarding/constants/onboarding-questions.ts` — Round 1 question definitions (pattern for rounds 4-5)

### Dashboard and continue-learning
- `backend/src/modules/dashboard/dashboard.service.ts` — DashboardService.getOverview (needs main path prioritization)
- `backend/src/modules/dashboard/dashboard.controller.ts` — Dashboard endpoints
- `frontend/src/hooks/useDashboard.ts` — Frontend dashboard data hook
- `frontend/src/pages/Dashboard.tsx` — Currently uses enrolledPaths[0] as implicit main path (needs explicit mainPath support)

### AI chat context
- `backend/src/modules/ai-chat/ai-chat.service.ts` — AI chat service
- `backend/src/modules/ai-chat/context/ai-context.builder.ts` — Context builder (currently uses first active enrollment; needs LearnerProfile + mainLearningPathId injection)
- `backend/src/modules/learner-profile/learner-profile.service.ts` — LearnerProfile service (recalculate, getMyProfile)

### Frontend content (seed data)
- `backend/prisma/seed.ts` — Seed data with 27 Frontend lessons across 8 tracks (audit target for gaps)

### Learner profile
- `backend/src/modules/learner-profile/learner-profile.service.ts` — Profile creation (createFromRoundOne), recalculation (lesson/quiz/track events), needs extension for rounds 4-5
- `backend/src/modules/learner-profile/learner-profile.controller.ts` — GET /learner-profile/me

### Progress & milestones
- `backend/src/modules/progress/progress.service.ts` — Lesson completion tracking (milestone detection hook point)
- `backend/src/modules/progress/progress.controller.ts` — Progress endpoints

### Frontend components
- `frontend/src/pages/Settings.tsx` — Settings page (add main path switch section)
- `frontend/src/pages/Explore.tsx` — Explore paths page
- `frontend/src/strings/vi.ts` — Vietnamese string constants
- `frontend/src/components/onboarding/RecommendationPanel.tsx` — Current single-recommendation display (refactor to show 3 ranked cards)

### Conventions
- `.planning/codebase/CONVENTIONS.md` — Naming, DTO, error handling, test patterns
- `.planning/codebase/ARCHITECTURE.md` — Module pattern, data flow, service-controller pattern

### Requirements
- `.planning/REQUIREMENTS.md` — ONB-08, ONB-09, ONB-10, LP-07, LP-08, LP-09, LP-10, AI-08, CONT-01, CONT-02 definitions

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `OnboardingService` (recommendation flow): Already handles AI recommendation + rule-based fallback + confirmPath enrollment. Extend to return 3 ranked paths.
- `OnboardingPromptBuilder`: Existing AI prompt builder. Update prompt template to request 3 paths with explanations and match scores.
- `OnboardingRecommendationParser`: Strict defensive parser. Update to parse array of 3 recommendations.
- `OnboardingRecommendationFallback`: Rule-based fallback. Update to rank all 3 main paths by career goal match.
- `LearnerProfileService`: Has recalculate() for lesson/quiz/track events. Extend to handle rounds 4-5 data and mainLearningPathId management.
- `AiContextBuilder`: Builds system prompt from lesson + user context. Update to inject LearnerProfile data and mainLearningPathId.
- `DashboardService.getOverview()`: Already aggregates enrolled paths + progress. Update to distinguish main vs secondary paths in response.
- `RecommendationPanel.tsx`: Frontend component showing single recommendation. Refactor to display 3 ranked cards.
- `OnboardingRound` Prisma model: Already supports multi-round storage (rounds 1-3). Extend to rounds 4-5 with same pattern.
- Framer Motion: Available for round transition animations (used in Phase 5 onboarding).
- `vi.ts` Vietnamese strings: Established pattern for all user-facing text.

### Established Patterns
- NestJS module pattern: controller + service + DTOs + constants per feature
- AI integration: prompt builder -> aiService.chat -> parser -> fallback (defensive pattern)
- React Query for server state, Zustand for client state
- Response format: `{ success, data, error, meta }`
- Round-based onboarding: sequential rounds, OnboardingRound model, backend enforces order
- Synchronous recalculation on progress events (no async queue)

### Integration Points
- `OnboardingService.getRecommendation()`: Update to return 3 ranked paths instead of 1
- `OnboardingService.confirmPath()`: No change needed — already takes learningPathId and creates enrollment
- `LearnerProfile` schema: Add `mainLearningPathId` FK to LearningPath
- `DashboardService.getOverview()`: Read mainLearningPathId from LearnerProfile, return mainPath separately from secondaryPaths
- `AiContextBuilder.buildContext()`: Inject LearnerProfile fields and main path name into system prompt
- `ProgressService` (lesson/track completion): Add milestone detection for round 4-5 triggers
- `Settings.tsx`: Add "Lo trinh chinh" section with switch functionality
- `Dashboard.tsx`: Refactor to show main path prominently + secondary paths below

</code_context>

<specifics>
## Specific Ideas

- Recommendation cards should feel like choosing a "learning journey" — not a cold list. Each card tells the user WHY this path fits them personally.
- Profile-linked explanation example: "Ban muon lam Frontend Developer, da biet HTML/CSS co ban — lo trinh nay giup ban nhanh nhat"
- Non-blocking banner for later rounds should feel like a gentle nudge, not an interruption. User is in control of their learning flow.
- When switching main path, the transition should feel smooth — no sense of "losing" progress on the old path.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 06-main-path-personalization-and-content-credibility*
*Context gathered: 2026-03-26*
