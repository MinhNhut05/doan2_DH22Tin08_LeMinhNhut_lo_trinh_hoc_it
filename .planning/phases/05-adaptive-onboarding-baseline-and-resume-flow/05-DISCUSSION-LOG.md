# Phase 5: Adaptive Onboarding Baseline and Resume Flow - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-03-24
**Phase:** 05-adaptive-onboarding-baseline-and-resume-flow
**Areas discussed:** Round Content Design, Multi-Round Flow, Resume Flow UX, Frontend Rework

---

## Round Content Design

### Round 2 Focus
| Option | Description | Selected |
|--------|-------------|----------|
| Career direction | Target role, work environment, timeline | |
| Learning style | Preferred learning format, approach | |
| Both (Recommended) | Career direction + learning style combined in one round | Y |

**User's choice:** Both — career direction + learning style in one round
**Notes:** None

### Round 3 Skill Assessment Method
| Option | Description | Selected |
|--------|-------------|----------|
| Self-rating topics (Recommended) | User rates 1-5 per tech topic | Y |
| Mini quiz | 5-10 quick quiz questions | |
| Project experience | Ask about past projects and tools | |

**User's choice:** Self-rating topics
**Notes:** None

### Questions Per Round
| Option | Description | Selected |
|--------|-------------|----------|
| 3-5 questions (Recommended) | Quick, not tiring, enough data for AI | Y |
| 6-8 questions | More detailed but risk drop-off | |
| 2-3 questions | Fastest possible | |

**User's choice:** 3-5 questions
**Notes:** None

### Answer Format
| Option | Description | Selected |
|--------|-------------|----------|
| Single/Multi choice (Recommended) | Easy to implement and parse, consistent with round 1 | Y |
| Free-text | More flexible but needs AI parsing | |
| Mix: choice + 1-2 open | Mostly choice with optional free-text | |

**User's choice:** Single/Multi choice
**Notes:** None

### Round 2 Specific Questions (Follow-up)
| Option | Description | Selected |
|--------|-------------|----------|
| 4 questions (Recommended) | Target role, work environment, timeline, learning style | Y |
| 5 questions + commitment | Add commitment level question | |
| 3 questions | Drop timeline question | |

**User's choice:** 4 questions
**Notes:** None

### Round 3 Topic Selection
| Option | Description | Selected |
|--------|-------------|----------|
| Dynamic by path (Recommended) | Topics change based on careerGoal from round 1 | Y |
| Fixed for everyone | Same topics regardless of career goal | |
| Hybrid: common + path-specific | 3 shared topics + 2-3 career-specific | |

**User's choice:** Dynamic by path
**Notes:** None

### Rating Scale
| Option | Description | Selected |
|--------|-------------|----------|
| 1-5 with descriptions (Recommended) | Vietnamese labels: Moi bat dau / Biet co ban / Tam duoc / Kha tot / Tu tin | Y |
| 4-level text labels | Non-numeric labels only | |
| 3-level simple | Simplest possible scale | |

**User's choice:** 1-5 with Vietnamese descriptions
**Notes:** None

### Topic Count for Round 3
| Option | Description | Selected |
|--------|-------------|----------|
| 5-6 topics (Recommended) | Covers key areas without overwhelming | Y |
| 3-4 topics | Minimal data for AI | |
| 7-8 topics | More detail but risk fatigue | |

**User's choice:** 5-6 topics
**Notes:** None

---

## Multi-Round Flow

### Round Transition
| Option | Description | Selected |
|--------|-------------|----------|
| Continuous R1->R2->R3 (Recommended) | Auto-advance after each round submit, no dashboard return between | Y |
| Return to dashboard between | User manually clicks to continue | |
| R1 immediate, R2-R3 gradual | R1 required, R2-R3 appear as nudges on dashboard | |

**User's choice:** Continuous flow
**Notes:** None

### Round Order Enforcement
| Option | Description | Selected |
|--------|-------------|----------|
| Strictly sequential (Recommended) | Must complete round N before N+1 | Y |
| Allow skip | User can skip rounds | |
| R1 required, R2-R3 optional | Only R1 mandatory | |

**User's choice:** Strictly sequential
**Notes:** None

### AI Recommendation Timing
| Option | Description | Selected |
|--------|-------------|----------|
| After round 3 (Recommended) | Full data, most accurate | Y |
| After R1 basic + R3 refined | Early preview + refined result | |
| Progressive per round | Update recommendation after each round | |

**User's choice:** After round 3 only
**Notes:** None

### LearnerProfile Creation Timing
| Option | Description | Selected |
|--------|-------------|----------|
| After R1, update gradually (Recommended) | Create basic profile from R1, enrich with R2-R3 data | Y |
| After R3 only | Wait for all data before creating | |
| At registration | Create with defaults on signup | |

**User's choice:** After R1, update gradually
**Notes:** None

---

## Resume Flow UX

### Resume Detection Method
| Option | Description | Selected |
|--------|-------------|----------|
| By completed rounds (Recommended) | Check completedAt on OnboardingRound records | Y |
| By question progress | Track per-question progress within incomplete round | |
| Reset incomplete round | Always restart the unfinished round from beginning | |

**User's choice:** By completed rounds
**Notes:** None

### Resume UI
| Option | Description | Selected |
|--------|-------------|----------|
| Welcome back + continue (Recommended) | Greeting message with "Tiep tuc" button | Y |
| Auto-resume silently | Drop user into round without asking | |
| Dashboard + reminder banner | Show dashboard with onboarding reminder | |

**User's choice:** Welcome back + continue button
**Notes:** None

### Progress Indicator
| Option | Description | Selected |
|--------|-------------|----------|
| 3-step stepper (Recommended) | Visual stepper/dots showing round progress | Y |
| Text only | "Buoc 2 tren 3" text label | |
| Per-question progress bar | Detailed progress within round | |

**User's choice:** 3-step stepper
**Notes:** None

### Past Answers Display
| Option | Description | Selected |
|--------|-------------|----------|
| Don't show (Recommended) | Only show new round questions | Y |
| Collapsible summary | Collapsed summary of previous answers | |
| Allow editing | Let user go back and change previous rounds | |

**User's choice:** Don't show past answers
**Notes:** None

---

## Frontend Rework

### UI Layout
| Option | Description | Selected |
|--------|-------------|----------|
| Single page + stepper (Recommended) | One /onboarding URL, content changes per round, stepper on top | Y |
| Route per round | /onboarding/1, /onboarding/2, /onboarding/3 | |
| Wizard per question | Each question is a separate page, typeform style | |

**User's choice:** Single page + stepper
**Notes:** None

### Confirm Flow Fix
| Option | Description | Selected |
|--------|-------------|----------|
| Confirm + enroll (Recommended) | Show recommendation, confirm button calls POST /confirm, enrolls in path | Y |
| Confirm or choose different | Allow user to pick alternative path | |
| Auto-enroll | Enroll automatically without confirmation | |

**User's choice:** Confirm + enroll
**Notes:** Fixes existing gap where frontend doesn't call /onboarding/confirm

### Round Transition Animation
| Option | Description | Selected |
|--------|-------------|----------|
| Framer Motion (Recommended) | Slide/fade animations, already in project deps | Y |
| No animation | Instant content change | |
| Loading spinner | Spinner between rounds | |

**User's choice:** Framer Motion animations
**Notes:** None

### File Structure
| Option | Description | Selected |
|--------|-------------|----------|
| Split components (Recommended) | Container + RoundOne/Two/Three + Stepper + QuestionCard | Y |
| Single file | Keep one large Onboarding.tsx | |
| You decide | Claude chooses best structure | |

**User's choice:** Split into components
**Notes:** None

---

## Claude's Discretion

- Exact question wording (Vietnamese text in vi.ts)
- Topic-to-careerGoal mapping specifics
- Stepper component visual design
- Framer Motion animation parameters
- Backend endpoint refactoring approach
- Error handling edge cases
- LearnerProfile field computation from round 2/3 answers

## Deferred Ideas

None — discussion stayed within phase scope.
