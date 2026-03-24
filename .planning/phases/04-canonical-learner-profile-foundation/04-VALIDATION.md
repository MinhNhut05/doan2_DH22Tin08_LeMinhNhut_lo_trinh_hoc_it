---
phase: 4
slug: canonical-learner-profile-foundation
status: revised
nyquist_compliant: true
wave_0_complete: true
created: 2026-03-24
updated: 2026-03-24
---

# Phase 4 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Jest 29.x + Prisma CLI |
| **Config file** | `/home/minhnhut_dev/projects/path-learn/backend/jest.config.ts` |
| **Quick run command** | `pnpm --filter backend test -- onboarding.service.spec.ts auth.service.spec.ts --runInBand` |
| **Full phase command** | `pnpm --filter backend test -- onboarding.service.spec.ts auth.service.spec.ts learner-profile.service.spec.ts learner-profile.controller.spec.ts lessons.service.spec.ts --runInBand && pnpm --filter backend exec tsc --noEmit` |
| **Estimated runtime** | ~20-45 seconds for phase-targeted checks |

---

## Sampling Rate

- **After each task:** Run that task's `<automated>` command exactly as specified in the active PLAN.
- **After each plan:** Run the plan-level `<verification>` commands from the completed PLAN file.
- **Before `/gsd:verify-work`:** Run the full phase command plus any Prisma validate/generate contract check from Plan 04-01.
- **Max feedback latency:** Keep each task verification under ~60 seconds.

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 04-01-01 | 04-01 | 1 | PROF-02 | schema + migration contract | `pnpm --filter backend exec prisma validate && pnpm --filter backend exec prisma generate && python - <<'PY'\nfrom pathlib import Path\nsql = Path('backend/prisma/migrations/20260324_phase4_canonical_learner_profile/migration.sql').read_text()\nchecks = [\n    'INSERT INTO "onboarding_rounds"',\n    "jsonb_build_object('careerGoal'",\n    'INSERT INTO "learner_profiles"',\n    "CASE WHEN jsonb_array_length(prior_knowledge) >= 4 AND hours_per_week >= 10 THEN 'INTERMEDIATE' ELSE 'BEGINNER' END",\n    "CASE WHEN hours_per_week <= 5 THEN 'SLOW' WHEN hours_per_week >= 15 THEN 'FAST' ELSE 'NORMAL' END",\n    'DROP TABLE "onboarding_data"',\n]\nmissing = [check for check in checks if check not in sql]\nif missing:\n    raise SystemExit(f'Missing migration contract(s): {missing}')\nPY` | ✅ | ⬜ pending |
| 04-01-02 | 04-01 | 1 | PROF-02 | unit | `pnpm --filter backend test -- onboarding.service.spec.ts --runInBand` | ✅ | ⬜ pending |
| 04-01-03 | 04-01 | 1 | PROF-02 | unit | `pnpm --filter backend test -- auth.service.spec.ts --runInBand` | ✅ | ⬜ pending |
| 04-02-01 | 04-02 | 2 | PROF-01 | unit | `pnpm --filter backend test -- learner-profile.service.spec.ts learner-profile.controller.spec.ts --runInBand` | ✅ | ⬜ pending |
| 04-02-02 | 04-02 | 2 | PROF-01 | typecheck | `pnpm --filter backend exec tsc --noEmit` | ✅ | ⬜ pending |
| 04-03-01 | 04-03 | 3 | PROF-03 | unit | `pnpm --filter backend test -- learner-profile.service.spec.ts --runInBand` | ✅ | ⬜ pending |
| 04-03-02 | 04-03 | 3 | PROF-03 | unit | `pnpm --filter backend test -- lessons.service.spec.ts learner-profile.service.spec.ts --runInBand` | ✅ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave and Plan Alignment

| Wave | Plans | Validation Focus |
|------|-------|------------------|
| 1 | `04-01` | Prisma schema/migration contract, onboarding round persistence, auth new-user detection |
| 2 | `04-02` | Learner-profile module/service/controller contract and app wiring |
| 3 | `04-03` | Recalculation rules and lesson/quiz/path trigger wiring |

### Requirement Coverage

- **PROF-01** → Plan `04-02`
- **PROF-02** → Plan `04-01`
- **PROF-03** → Plan `04-03`

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| `GET /api/v1/learner-profile/me` response shape in a running app | PROF-01 | Useful end-to-end confidence beyond unit tests | Start backend, authenticate as a seeded user with a learner profile, request `/api/v1/learner-profile/me`, confirm response wraps canonical fields and excludes raw onboarding `answers` JSON |
| Lesson/quiz/track recalculation flow in an integrated environment | PROF-03 | Confirms synchronous hooks across real module boundaries | Complete a lesson, pass a quiz, and finish a path in dev; inspect learner profile changes after each action |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify commands.
- [x] Sampling continuity maintained across all three plans.
- [x] No Wave 0 scaffolding is required because each plan already includes concrete automated verification.
- [x] No watch-mode flags are used.
- [x] Wave map matches current plan dependencies: `04-01` -> `04-02` -> `04-03`.
- [x] `nyquist_compliant: true` is set in frontmatter.

**Approval:** ready for execution
