---
phase: 4
slug: canonical-learner-profile-foundation
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-24
---

# Phase 4 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | jest 29.x |
| **Config file** | `backend/jest.config.ts` |
| **Quick run command** | `cd backend && pnpm jest --testPathPattern=learner-profile --no-coverage` |
| **Full suite command** | `cd backend && pnpm test` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `cd backend && pnpm jest --testPathPattern=learner-profile --no-coverage`
- **After every plan wave:** Run `cd backend && pnpm test`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 04-01-01 | 01 | 1 | PROF-01 | unit | `pnpm jest --testPathPattern=learner-profile` | ❌ W0 | ⬜ pending |
| 04-01-02 | 01 | 1 | PROF-01 | migration | `pnpm prisma migrate dev --name check` | ❌ W0 | ⬜ pending |
| 04-02-01 | 02 | 1 | PROF-02 | unit | `pnpm jest --testPathPattern=learner-profile.service` | ❌ W0 | ⬜ pending |
| 04-02-02 | 02 | 1 | PROF-03 | unit | `pnpm jest --testPathPattern=recalculate` | ❌ W0 | ⬜ pending |
| 04-03-01 | 03 | 2 | PROF-02 | integration | `pnpm jest --testPathPattern=learner-profile.controller` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `backend/src/modules/learner-profile/learner-profile.service.spec.ts` — stubs for PROF-02, PROF-03
- [ ] `backend/src/modules/learner-profile/learner-profile.controller.spec.ts` — stubs for PROF-02
- [ ] Test fixtures for mock Prisma data (LearnerProfile, OnboardingRound, UserProgress, QuizResult)

*Existing jest infrastructure covers framework needs — no new installs required.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Migration backward compatibility | PROF-01 | Requires real DB with existing data | Run migration on dev DB with existing onboarding_data rows, verify round 1 created |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
