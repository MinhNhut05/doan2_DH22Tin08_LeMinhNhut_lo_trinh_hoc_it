---
phase: 3
slug: session-reliability-and-vietnamese-ux-baseline
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-23
---

# Phase 3 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | jest 29.x (backend) / vitest (frontend) |
| **Config file** | `backend/jest.config.ts` / `frontend/vitest.config.ts` |
| **Quick run command** | `cd backend && pnpm test -- --bail` / `cd frontend && pnpm test -- --bail` |
| **Full suite command** | `cd backend && pnpm test` / `cd frontend && pnpm test` |
| **Estimated runtime** | ~30 seconds |

---

## Sampling Rate

- **After every task commit:** Run `pnpm test -- --bail`
- **After every plan wave:** Run `pnpm test`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 03-01-01 | 01 | 0 | STAB-01 | integration | `cd frontend && pnpm test -- auth-refresh` | ❌ W0 | ⬜ pending |
| 03-01-02 | 02 | 1 | STAB-02 | integration | `cd frontend && pnpm test -- auth-restore` | ❌ W0 | ⬜ pending |
| 03-02-01 | 03 | 2 | STAB-04 | integration | `cd frontend && pnpm test -- state-consistency` | ❌ W0 | ⬜ pending |
| 03-03-01 | 04 | 2 | STAB-03 | unit | `cd frontend && pnpm test -- vietnamese-ux` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `frontend/src/__tests__/auth-refresh.test.tsx` — stubs for STAB-01
- [ ] `frontend/src/__tests__/auth-restore.test.tsx` — stubs for STAB-02
- [ ] `frontend/src/__tests__/state-consistency.test.tsx` — stubs for STAB-03
- [ ] `frontend/src/__tests__/vietnamese-ux.test.tsx` — stubs for STAB-04
- [ ] Test utilities/fixtures for auth state mocking

*If none: "Existing infrastructure covers all phase requirements."*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Vietnamese diacritics render correctly | STAB-04 | Visual rendering check | Open critical screens, verify diacritics display properly in browser |
| Session persists across browser refresh | STAB-01 | Full browser behavior | Log in, refresh page, verify still logged in |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
