# Phase 6: Main Path Personalization and Content Credibility - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-03-26
**Phase:** 06-main-path-personalization-and-content-credibility
**Areas discussed:** Recommendation & path selection, Milestone-triggered rounds, Main path vs secondary UX, Content gap strategy

---

## Recommendation & Path Selection

### Q1: Top 3 recommendations display format

| Option | Description | Selected |
|--------|-------------|----------|
| Ranked cards | Each path gets a card: name, difficulty badge, explanation (2-3 sentences), match score (%). #1 highlighted as "Goi y hang dau" | ✓ |
| Comparison table | 3-column comparison: name, difficulty, match %, explanation per column. User clicks to select. | |
| You decide | Let Claude decide the layout. | |

**User's choice:** Ranked cards
**Notes:** None

### Q2: Explanation detail level

| Option | Description | Selected |
|--------|-------------|----------|
| Profile-linked | "Ban muon lam Frontend Developer, da biet HTML/CSS co ban — lo trinh nay giup ban nhanh nhat" — references profile data directly. | ✓ |
| Generic reason | "Lo trinh Frontend ReactJS phu hop voi muc tieu va trinh do cua ban" — generic, no specific data exposed. | |
| Score + bullets | "Phu hop 92%" + 2-3 bullet points explaining why. | |

**User's choice:** Profile-linked
**Notes:** None

### Q3: Path selection flow

| Option | Description | Selected |
|--------|-------------|----------|
| Direct pick | User clicks "Chon lo trinh nay" on desired card. No extra step. | ✓ |
| Pick + confirm step | User picks one, then sees confirm screen: "Ban chon [path]. Xac nhan?" with Confirm/Back buttons. | |
| Pick or browse all | User can pick from 3 recommendations OR browse all paths to choose a different one. | |

**User's choice:** Direct pick
**Notes:** None

### Q4: Recommendation logic source

| Option | Description | Selected |
|--------|-------------|----------|
| AI + fallback | AI generates recommendations (current pattern extended) + rule-based fallback. AI explains 3 paths instead of 1. | ✓ |
| Pure rule-based | Map career goal + skill level to ranked paths. No AI call, faster, more predictable. | |
| You decide | Let Claude decide. | |

**User's choice:** AI + fallback
**Notes:** None

---

## Milestone-triggered Rounds

### Q1: Milestone triggers

| Option | Description | Selected |
|--------|-------------|----------|
| Fixed milestones | Round 4 after 5 completed lessons, Round 5 after 1 completed track. Fixed, easy to implement. | ✓ |
| Progress-based % | Round 4 at 20% main path done, Round 5 at 50% done. More flexible but more complex. | |
| You decide | Let Claude decide milestone logic. | |

**User's choice:** Fixed milestones
**Notes:** None

### Q2: Prompt UX

| Option | Description | Selected |
|--------|-------------|----------|
| Non-blocking banner | Banner at top of Dashboard: "Da den luc cap nhat ho so!" with "Cap nhat ngay" and dismiss button. Does not block learning. | ✓ |
| Modal prompt | Modal popup when entering Dashboard. Must choose "Lam ngay" or "Bo qua". More attention-forcing. | |
| Notification only | Notification in notification list (passive, if Phase 7 exists). | |

**User's choice:** Non-blocking banner
**Notes:** None

### Q3: Dismissal policy

| Option | Description | Selected |
|--------|-------------|----------|
| 3 dismissals then stop | Dismiss once = reappears next visit. After 3 dismissals = stops showing for that round. | ✓ |
| Persistent until done | Always shows every Dashboard visit until user completes the round. | |
| You decide | Let Claude decide. | |

**User's choice:** 3 dismissals then stop
**Notes:** None

### Q4: Round 4-5 content

| Option | Description | Selected |
|--------|-------------|----------|
| Calibration + interest | R4: re-ask career goal confidence, skill re-rating, learning pace satisfaction. R5: new interest areas, preferred depth, main path adjustment. | ✓ |
| Skills + career review | R4: skill re-assessment (like R3 but post-learning). R5: career goal refinement (change direction?). | |
| You decide | Let Claude decide specific content. | |

**User's choice:** Calibration + interest
**Notes:** None

---

## Main Path vs Secondary UX

### Q1: Main path storage

| Option | Description | Selected |
|--------|-------------|----------|
| Field on LearnerProfile | Add `mainLearningPathId` on LearnerProfile. Simple, 1:1 with user. | ✓ |
| isMain on enrollment | Add `isMain` boolean on UserLearningPath. Toggle on switch. Query more complex but closer to enrollment data. | |
| You decide | Let Claude decide. | |

**User's choice:** Field on LearnerProfile
**Notes:** None

### Q2: Dashboard layout

| Option | Description | Selected |
|--------|-------------|----------|
| Main prominent + secondary below | Main path gets large section at top (continue-learning card, progress bar, next lesson). Secondary paths in smaller "Cac lo trinh khac" section below. | ✓ |
| Tab-based | Two tabs: "Lo trinh chinh" and "Lo trinh khac". Default opens main tab. | |
| You decide | Let Claude decide layout. | |

**User's choice:** Main prominent + secondary below
**Notes:** None

### Q3: Switch main path location

| Option | Description | Selected |
|--------|-------------|----------|
| In Settings/Profile | Settings page has "Lo trinh chinh" section with "Doi lo trinh" button. Opens enrolled path list to select. | ✓ |
| Dashboard dropdown | On Dashboard, icon next to main path name. Click opens dropdown of enrolled paths. | |
| From Explore page | On Explore, enrolled paths show "Dat lam lo trinh chinh" button. | |

**User's choice:** In Settings/Profile
**Notes:** None

### Q4: Learning history on switch

| Option | Description | Selected |
|--------|-------------|----------|
| Keep all history | All UserProgress and QuizResult stays. History is user-global, not path-specific. Old progress visible on secondary paths. | ✓ |
| You decide | Let Claude decide. | |

**User's choice:** Keep all history
**Notes:** Already how the DB works — progress is tied to user+lesson, not user+path.

---

## Content Gap Strategy

### Q1: Gap audit approach

| Option | Description | Selected |
|--------|-------------|----------|
| Audit + fill gaps | Review 8 tracks + 27 lessons for critical gaps. If found, add new lessons to fill. | ✓ |
| 27 is enough | No new content needed. Focus on personalization logic. | |
| You decide | Let Claude audit and decide. | |

**User's choice:** Audit + fill gaps
**Notes:** None

### Q2: Content creation method

| Option | Description | Selected |
|--------|-------------|----------|
| AI-generated + review | Use AI service to generate lesson content. Admin reviews before publishing. | ✓ |
| Manual writing | Hand-write each lesson. High quality but time-consuming. | |
| Curated links only | Lessons contain summary + external links only. No original content. | |

**User's choice:** AI-generated + review
**Notes:** None

### Q3: Content scope

| Option | Description | Selected |
|--------|-------------|----------|
| Frontend only | Only ensure Frontend path (frontend-reactjs) has credible content. Backend/Fullstack improve later. | ✓ |
| All 3 paths | Ensure all 3 main paths have sufficient content. | |
| You decide | Let Claude decide. | |

**User's choice:** Frontend only
**Notes:** None

### Q4: AI chat context enrichment level

| Option | Description | Selected |
|--------|-------------|----------|
| Profile + main path | Inject learnerProfile (career goal, skill level, strengths, weaknesses) + main path name + current lesson. AI tailors tone and complexity. | ✓ |
| Main path only | Only add main path name to context. Simpler. | |
| You decide | Let Claude decide context depth. | |

**User's choice:** Profile + main path
**Notes:** None

---

## Claude's Discretion

- AI prompt format for 3 ranked recommendations
- Match score calculation formula
- Milestone detection implementation details
- Dismissal count storage approach
- Dashboard component layout details
- AI-generated lesson quality controls
- Specific Frontend path gaps (audit determines)
- Vietnamese wording details
- AiContextBuilder refactoring approach

## Deferred Ideas

None — discussion stayed within phase scope.
