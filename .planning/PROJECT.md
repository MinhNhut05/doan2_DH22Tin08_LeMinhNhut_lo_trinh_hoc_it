# SOHA Program Summarizer

## What This Is

A web app for SOHA TRAVEL team to automatically convert detailed tour/event programs (PDF/DOCX) into beautiful, condensed Canva designs. Users upload a program file, choose a template, and get a Canva edit link with a summarized version — ready for sharing with clients and partners.

## Core Value

Turn a 4-page detailed program into a polished 1-2 page Canva design in seconds, with correct formatting rules applied automatically.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] Upload PDF/DOCX files and extract program content
- [ ] AI + rule-based engine to summarize/condense programs
- [ ] Company formatting rules applied automatically (audience type, day/session layout, school names)
- [ ] Multiple fixed Canva templates (1-day tour, 2-day tour, school event, corporate event)
- [ ] Create Canva designs via Canva Connect API from templates
- [ ] Return editable Canva link to user
- [ ] Admin panel to manage summarization rules
- [ ] Admin panel to manage Canva templates
- [ ] User authentication with account provisioning
- [ ] History of generated designs per user

### Out of Scope

- Mobile app — web-first, responsive enough for desktop use
- Direct PDF/image export from web app — users edit and export from Canva
- Real-time collaboration — each user generates independently
- Public registration — accounts are provisioned by admin only

## Context

**Company:** SOHA TRAVEL — tour/event organizer in Vietnam
**Problem:** Team manually creates condensed program summaries in Canva for every tour/event. This is repetitive and time-consuming.
**Users:** Internal team members (operations, sales, coordinators) — ~5-20 people
**Source files:** Detailed tour programs in PDF or DOCX format (typically 2-6 pages)
**Output:** Canva designs following fixed templates with auto-applied rules

**Key formatting rules (examples):**
- School events (tieu hoc, THCS, THPT): greeting = "Quy thay co va cac ban hoc sinh" + include school name
- Corporate/group events: greeting = "Quy khach" or "Quy doan"
- 1-day programs: columns = "Buoi sang" / "Buoi chieu"
- 2-day programs: columns = "Ngay 1" / "Ngay 2"
- Menu section included in output design

**Canva integration:** Uses Canva Connect API to duplicate templates and fill in content. Users get a direct edit link to customize further if needed.

## Constraints

- **Tech stack**: Next.js full-stack (API Routes + React frontend) — simple deployment, user already knows React
- **Canva API**: Must use Canva Connect API — requires Canva developer account and app approval
- **AI provider**: LLM for content summarization (Claude or GPT API) — combined with rule-based logic
- **File parsing**: Must handle both PDF and DOCX extraction accurately (Vietnamese text)
- **Authentication**: Simple account system (admin provisions accounts, no public signup)
- **Deployment**: VPS or Vercel — team internal tool, no heavy traffic expected

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Next.js full-stack over NestJS + React | Simpler architecture for internal tool, 1 app to deploy, API Routes sufficient | -- Pending |
| Canva Connect API over image generation | User wants editable Canva links, not static images | -- Pending |
| AI + rules hybrid over pure AI | Rules ensure consistency (greeting format, layout), AI handles summarization | -- Pending |
| Admin-provisioned accounts over public signup | Internal company tool, controlled access | -- Pending |

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
*Last updated: 2026-03-22 after initialization*
