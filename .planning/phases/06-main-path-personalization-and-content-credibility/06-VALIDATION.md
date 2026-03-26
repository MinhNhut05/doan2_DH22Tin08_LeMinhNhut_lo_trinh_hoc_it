---
phase: 6
slug: main-path-personalization-and-content-credibility
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-26
---

# Phase 6 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | jest 29.x (backend) / vitest (frontend) |
| **Config file** | `backend/jest.config.ts` / `frontend/vitest.config.ts` |
| **Quick run command** | `cd backend && pnpm test -- --bail` |
| **Full suite command** | `cd backend && pnpm test && cd ../frontend && pnpm test` |
| **Estimated runtime** | ~30 seconds |

---

## Sampling Rate

- **After every task commit:** Run `cd backend && pnpm test -- --bail`
- **After every plan wave:** Run `cd backend && pnpm test && cd ../frontend && pnpm test`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| TBD | TBD | TBD | TBD | TBD | TBD | TBD | TBD |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] Test stubs for recommendation ranking (ONB-08, LP-07)
- [ ] Test stubs for main path management (LP-08, LP-09, LP-10)
- [ ] Test stubs for milestone-triggered rounds (ONB-09, ONB-10)
- [ ] Test stubs for AI context enrichment (AI-08)
- [ ] Test stubs for content gap verification (CONT-01, CONT-02)

*Planner will fill concrete file paths and commands after plans are created.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Recommendation card UX shows profile-linked explanations | ONB-08 | Visual/UX quality | View recommendation screen, verify each card has personalized explanation referencing user's career goal |
| Dashboard main path prominence | LP-08 | Visual layout | View dashboard, verify main path section is prominent at top |
| Non-blocking banner UX | ONB-09 | Visual/interaction | Complete 5 lessons, verify banner appears without blocking, dismiss works |
| AI chat tone matches profile | AI-08 | Subjective quality | Ask AI chat a question, verify response references learner's context |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
