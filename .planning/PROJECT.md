# DevPath Learning

## What This Is

DevPath is an AI-assisted personalized learning platform for Vietnamese IT learners. It helps users discover a main learning path, study through lessons, quizzes, and AI chat, then progressively adapt the experience based on their profile and behavior. The current milestone focuses on stabilizing the post-MVP product and laying the foundation for stronger personalization.

## Core Value

Guide each learner to the right next step with a stable, personalized learning experience that matches their goals, current level, and progress.

## Current Milestone: v1.1 Post-MVP Stabilization & Personalization

**Goal:** Make the MVP feel stable in daily use, then add adaptive onboarding and path personalization that guide each learner without locking them into a rigid journey.

**Target features:**
- Fix auth/session refresh issues, Vietnamese text issues, and high-friction product bugs
- Add adaptive multi-round onboarding that uses previous answers and in-app behavior
- Introduce AI-suggested main learning path behavior with secondary learning kept separate from the main journey
- Personalize learning path recommendations and begin using profile context in AI chat
- Add real backend support for leaderboard, notifications, and secure real payment upgrade flow
- Fill critical course content gaps needed for the primary learning flows

## Requirements

### Validated

- ✓ Auth/session refresh issues fixed, enrollment state consistency resolved, Vietnamese UI text across critical screens — Validated in Phase 03
- ✓ Email OTP + OAuth login, JWT session flow, and onboarding redirect are implemented — v1.0
- ✓ Learning path, track, lesson, quiz, and progress foundations are implemented — v1.0
- ✓ AI chat, payment tiers, MoMo/VNPay integration, and subscription basics are implemented — v1.0
- ✓ Admin CRUD foundation and frontend learning/payment/admin surfaces are implemented — v1.0

### Active
- [ ] Add hybrid multi-round onboarding that starts with basic profile and adapts using prior answers and app behavior
- [ ] Let AI suggest a main learning path while keeping off-path learning available as secondary activity
- [ ] Personalize learning path recommendations from onboarding profile and start using that profile in AI chat
- [ ] Add backend-minimum leaderboard (points + rank) and event-driven notifications
- [ ] Support real account-upgrade payment flow with secure backend config and auto-activation on confirmation
- [ ] Fill critical learning content gaps needed for the main path experience

### Out of Scope

- Hard-locking learners so they cannot access content outside their main path — guidance should stay soft
- Full friends/team leaderboard — milestone scope is platform-wide points + rank only
- Fully autonomous AI orchestration for every onboarding round — use bounded adaptive logic first
- Large-scale content expansion beyond the critical gaps needed for the primary path flows
- Mobile app — keep focus on web product stability and personalization

## Context

DevPath already has an MVP across backend and frontend: authentication, onboarding, learning paths, lessons, quizzes, progress tracking, AI chat, payments, and admin pages. Based on the existing roadmap, backend foundation and frontend MVP work are complete, while polish/deploy work and several production-quality issues remain unfinished.

The current product pain points are concentrated in post-MVP behavior: auth refresh/redirect issues, incorrect Vietnamese text, learning-path state that does not reflect a clear main journey, incomplete backend support for leaderboard and notifications, sparse course content in key areas, and a payment upgrade flow that now needs secure real-world configuration.

Primary users remain Vietnamese IT learners who need a guided path into Frontend, Backend, or Fullstack learning. The product direction now shifts from “MVP breadth” to “stable personalized experience.”

## Constraints

- **Tech stack**: Keep the existing monorepo architecture (React/Vite frontend + NestJS backend + Prisma/PostgreSQL) — do not rewrite the platform
- **Auth**: Existing JWT + refresh-cookie flow must be stabilized, not replaced wholesale
- **Payments**: Real payment recipient details must be handled securely in backend configuration and controlled display surfaces, never hardcoded into the client
- **UX language**: Vietnamese-first experience remains the priority; wording quality matters to perceived product quality
- **Milestone strategy**: Stability-first — bug and UX friction reduction come before deeper personalization work

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Treat v1.1 as a stability-first milestone | Existing MVP breadth is already large; user trust now depends on fixing broken or confusing flows | -- Pending |
| Use hybrid multi-round onboarding | Reduce first-session friction while collecting richer learner profile over time | -- Pending |
| Use a soft main-path model | Keep the user guided by one main journey while still allowing optional exploration | -- Pending |
| Let AI suggest the initial main path | Personalization should feel tailored without forcing a hidden auto-assignment | -- Pending |
| Scope leaderboard to points + rank first | Backend completion is needed, but narrow scope keeps the feature shippable | -- Pending |
| Use secure backend-configured real payment setup with auto-activation on confirmation | Support real upgrades without exposing sensitive information or requiring manual activation every time | -- Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd:transition`):
1. Requirements invalidated? -> Move to Out of Scope with reason
2. Requirements validated? -> Move to Validated with phase reference
3. New requirements emerged? -> Add to Active
4. Decisions to log? -> Add to Key Decisions
5. "What This Is" still accurate? -> Update if drifted

**After each milestone** (via `/gsd:complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-03-24 after Phase 03 completion*