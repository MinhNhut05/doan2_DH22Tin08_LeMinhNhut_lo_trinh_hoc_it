---
phase: 5
slug: adaptive-onboarding-baseline-and-resume-flow
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-24
---

# Phase 5 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Backend: Jest 30 + `@nestjs/testing` 11.0.1; Frontend: Vitest 4 + Testing Library 16 + jsdom 29 |
| **Config file** | Backend: `backend/package.json` (`jest` block); Frontend: `frontend/vitest.config.ts` |
| **Quick run command** | `pnpm --dir backend test -- onboarding.service.spec.ts --runInBand && pnpm --dir frontend test:run -- src/pages/Onboarding.test.tsx` |
| **Full suite command** | `pnpm --dir backend test && pnpm --dir frontend test:run` |
| **Estimated runtime** | ~30 seconds |

---

## Sampling Rate

- **After every task commit:** Run `pnpm --dir backend test -- onboarding.service.spec.ts --runInBand`
- **After every plan wave:** Run `pnpm --dir backend test && pnpm --dir frontend test:run`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| TBD | 01 | 1 | ONB-04 | backend service + frontend component | `pnpm --dir backend test -- onboarding.service.spec.ts --runInBand` | Backend ✅ / Frontend ❌ W0 | ⬜ pending |
| TBD | 01 | 1 | ONB-05 | backend service | `pnpm --dir backend test -- onboarding.service.spec.ts --runInBand` | ✅ | ⬜ pending |
| TBD | 01 | 1 | ONB-06 | backend service + frontend component | `pnpm --dir backend test -- onboarding.service.spec.ts --runInBand` | Backend ✅ / Frontend ❌ W0 | ⬜ pending |
| TBD | 01 | 1 | ONB-07 | backend service + frontend component | `pnpm --dir backend test -- onboarding.service.spec.ts --runInBand` | Backend ✅ / Frontend ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `frontend/src/pages/Onboarding.test.tsx` — covers ONB-04, ONB-06, ONB-07 container behavior and confirm flow
- [ ] Expand `backend/src/modules/onboarding/onboarding.service.spec.ts` — add round-2/3 gating, status/resume, and profile-creation assertions
- [ ] Add `backend/src/modules/onboarding/onboarding.controller.spec.ts` if controller branching grows
- [ ] Add shared frontend test helpers for mocked onboarding status/recommendation responses

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Framer Motion round transitions animate smoothly | D-16 | Visual animation quality cannot be asserted programmatically | Navigate through rounds 1→2→3, verify slide/fade animation plays between each transition |
| Stepper component visually indicates current round | D-13 | Visual layout assertion is fragile | Observe stepper highlights current step at each round |
| "Welcome back" card displays correctly on resume | D-11 | Visual/copy verification | Leave onboarding mid-flow, return, verify welcome-back message and "Tiep tuc" button appear |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
