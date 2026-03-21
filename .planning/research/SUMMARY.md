# Project Research Summary

**Project:** SOHA TRAVEL Program Summarizer
**Domain:** Document-to-Design Automation (PDF/DOCX → AI Summarize → Canva)
**Researched:** 2026-03-22
**Confidence:** HIGH (stack + architecture), MEDIUM (Canva Connect API — limited production examples)

## Executive Summary

SOHA TRAVEL cần một **internal tool** (~5-20 users) để tự động hóa quy trình: nhận file chương trình tour (PDF/DOCX) → AI tóm tắt + apply formatting rules → tạo Canva design → trả về edit link. Không có direct competitor nào làm đúng use case này — unique value nằm ở việc kết hợp **rule engine theo nghiệp vụ cụ thể của SOHA** với Canva editable output.

Stack được recommend là **Next.js 15 (App Router) monolith** chạy trên VPS — đủ mạnh cho scale hiện tại, không cần microservices. Business logic tập trung trong `lib/` (server-side), React UI giao tiếp qua API Routes. Claude API được ưu tiên cho tiếng Việt. Điểm khác biệt kiến trúc quan trọng: **mọi AI và Canva API calls đều chạy server-side** — không bao giờ expose API keys hay tokens ra client.

**Rủi ro lớn nhất:** Canva Connect API có thể yêu cầu approval hoặc Enterprise plan cho private team integrations — nếu không verify ngay từ đầu, toàn bộ Canva integration code viết xong mà không deploy được. Cần build **mock Canva client** từ Phase 1 để pipeline hoạt động độc lập với Canva approval status.

---

## Key Findings

### Recommended Stack

> Chi tiết đầy đủ: [STACK.md](./STACK.md)

Toàn bộ app là **Next.js 15 monolith** — vừa là frontend vừa là backend (API Routes). Không cần backend riêng. Deploy trên VPS (không phải Vercel) để tránh serverless timeout issues khi AI + Canva calls mất 10-30 giây.

**Core technologies:**
- **Next.js 15 (App Router):** Full-stack framework — UI + API Routes trong 1 codebase, Server Actions đơn giản hóa file upload
- **Prisma 6 + PostgreSQL 16:** ORM type-safe, migrations built-in, JSONB cho rule configs
- **next-auth 4:** Session auth, credentials provider cho admin-provisioned accounts
- **pdf-parse + mammoth:** Extract text từ PDF và DOCX (server-side only — dùng Node.js `fs`)
- **@anthropic-ai/sdk:** Claude API cho AI summarization — tốt hơn cho tiếng Việt, structured output qua `tool_use`
- **Tailwind CSS 4 + shadcn/ui:** UI nhanh, components copy-paste vào codebase
- **Zod:** Validate AI output shape, file upload, API request bodies — critical cho reliability

**Không dùng:** Zustand (không cần — React Query + useState đủ), socket.io (polling/SSE đủ), Vercel (timeout issues), pdf2json/docx-parser (unmaintained).

---

### Expected Features

> Chi tiết đầy đủ: [FEATURES.md](./FEATURES.md)

Tool là internal ops tool — không phải SaaS. Feature scope hẹp và cụ thể theo nghiệp vụ SOHA.

**Must have (table stakes — P1):**
- File upload (PDF + DOCX) với Vietnamese encoding support
- Text extraction preview — user confirm file đọc đúng trước khi proceed
- Template selection (4 loại cố định: 1-day tour, 2-day tour, school event, corporate event)
- AI summarization + formatting rules engine (hardcoded v1)
- Summarization preview — user review trước khi push lên Canva
- Canva design creation → return editable link
- User authentication (admin-provisioned accounts, không có public signup)
- Generation history (filename, template type, date, Canva link)
- Error messages rõ ràng theo từng failure point

**Should have (competitive — P2):**
- Admin rule management panel — team lead tự sửa rules không qua dev
- Admin template management — update Canva template IDs khi template thay đổi
- Audience auto-detection — AI detect loại đoàn → suggest đúng template
- Editable summarization preview — chỉnh nhỏ trước generate để giảm Canva API calls thừa

**Defer (v2+):**
- Scanned PDF / OCR support
- Batch upload
- Analytics dashboard
- Email/Slack notification

**Anti-features (đừng build):** Direct PDF export từ app (Canva làm tốt hơn), mobile app, real-time collaboration, public signup, custom template builder trong app, bulk upload.

---

### Architecture Approach

> Chi tiết đầy đủ: [ARCHITECTURE.md](./ARCHITECTURE.md)

Architecture theo kiểu **layered monolith**: React UI → Next.js API Routes → Service Layer (`lib/`) → Prisma + PostgreSQL → External APIs (Claude + Canva). Mỗi tầng có responsibility rõ ràng — API Routes chỉ là thin orchestrator, business logic nằm trong `lib/`.

**Generation pipeline (core flow):**
1. `POST /api/upload` → `fileParser` extract text từ PDF/DOCX → trả về `rawText`
2. Browser hiện text preview, user confirm
3. `POST /api/generate` → `aiSummarizer` call Claude → `rulesEngine` apply rules (greeting, columns, school name) → `canvaClient` duplicate template + autofill → save to DB
4. Browser nhận `editUrl` → hiện "Open in Canva" button

**Major components:**
1. **`lib/parser.ts`** — pdf-parse + mammoth, server-side only, trả về plain text
2. **`lib/ai/summarizer.ts`** — Claude API call với structured output, Zod validation, extract-only prompt
3. **`lib/rules/engine.ts`** — apply SOHA-specific formatting rules (load từ DB hoặc hardcoded v1)
4. **`lib/canva/client.ts`** — OAuth2 token management, duplicate template, autofill, return edit URL
5. **`lib/canva/elementMap.ts`** — constants cho Canva element names theo từng template (single source of truth)

**State management:** React Query cho server state (upload, generate, history) + `useState` cho client state (file selection, template type, current step). Không cần Zustand.

---

### Critical Pitfalls

> Chi tiết đầy đủ: [PITFALLS.md](./PITFALLS.md)

1. **Canva API production access** — Verify Canva developer account và app approval status TRƯỚC KHI viết integration code. Build `lib/canva/mockClient.ts` ngay từ đầu để pipeline hoạt động khi Canva chưa approved. Nếu thấy `403/401` dù token hợp lệ = app vẫn đang ở development mode.

2. **Canva autofill silent failure** — API trả về `200 OK` nhưng design trống nếu element names không khớp chính xác (case-sensitive, space-sensitive). Giải pháp: mở từng Canva template, note exact element names, lưu vào `lib/canva/elementMap.ts`. Test autofill với 1 field trước.

3. **Canva OAuth token expiry** — Access token expire sau 1-2 giờ. Implement `getValidCanvaToken()` wrapper kiểm tra expiry trước mọi Canva API call, proactively refresh khi còn < 5 phút. Build từ đầu, không hotfix sau.

4. **Vietnamese PDF encoding / scanned PDFs** — `pdf-parse` trả về garbled text hoặc empty string với nhiều PDF tiếng Việt. Sau khi extract: kiểm tra text length + có Unicode Vietnamese chars không. Nếu fail → error rõ ràng: *"File PDF không đọc được. Vui lòng dùng DOCX."* Không proceed với text rỗng/sai vào AI (tốn credits, output vô nghĩa).

5. **AI inconsistent output format** — LLM đôi khi wrap JSON trong markdown hoặc thêm preamble text → `JSON.parse()` crash. Giải pháp: dùng Claude `tool_use` (forced structured output) + Zod schema validation. Không dùng raw `JSON.parse()`.

6. **AI hallucination** — LLM thêm chi tiết không có trong file gốc. Giải pháp: prompt phải nói rõ *"Extract only, do NOT invent"* + summarization preview là safeguard quan trọng nhất. Greeting/labels đến từ rules engine, KHÔNG từ LLM.

7. **File size / timeout** — AI + Canva calls có thể mất 20-40s. Trên Vercel Hobby: timeout 10s = chắc chắn fail. Giải pháp: **Deploy VPS** (không có serverless timeout). Limit file size 10MB. Hiện progress indicator step-by-step.

---

## Implications for Roadmap

Dựa trên research, suggested build order theo 6 phases:

### Phase 1: Foundation
**Rationale:** Auth + DB phải có trước mọi thứ khác. Quan trọng hơn: verify Canva API access ngay phase này — nếu Canva không approved thì biết sớm để build mock.
**Delivers:** Next.js setup, Prisma schema + migrations, next-auth login, protected routes, mock Canva client
**Addresses:** User authentication (P1 feature)
**Avoids:** Pitfall #1 — Canva API enterprise/approval requirement

### Phase 2: File Parsing
**Rationale:** File upload + text extraction là entry point của toàn bộ pipeline. Không có text thì không có gì để summarize.
**Delivers:** `/api/upload`, pdf-parse + mammoth integration, Vietnamese encoding validation, text preview UI
**Uses:** pdf-parse, mammoth, react-dropzone, FileDropzone component
**Avoids:** Pitfall #4 — Vietnamese PDF encoding và scanned files

### Phase 3: AI Engine
**Rationale:** Summarization là core value. Cần hoạt động tốt (structured output, Zod validation, anti-hallucination prompt) trước khi gắn Canva.
**Delivers:** `lib/ai/summarizer.ts`, prompt templates, `lib/rules/engine.ts` (hardcoded v1), summarization preview UI
**Uses:** @anthropic-ai/sdk, zod, Claude `tool_use` structured output
**Avoids:** Pitfall #5 (inconsistent output format), Pitfall #6 (hallucination)

### Phase 4: Canva Integration
**Rationale:** Canva integration phụ thuộc vào Phase 3 output. Cần real Canva API access hoặc mock client. Đây là phase rủi ro cao nhất.
**Delivers:** `lib/canva/client.ts`, OAuth2 token management với auto-refresh, autofill payload builder, `elementMap.ts`, generation history save, "Open in Canva" button
**Uses:** axios, Canva Connect API, PostgreSQL (store tokens encrypted)
**Avoids:** Pitfall #2 (element name mismatch), Pitfall #3 (token expiry), Pitfall #7 (timeout — test với VPS)

### Phase 5: Admin Panels
**Rationale:** Admin UI không block v1 launch nhưng nên build sớm vì rules cần update thường xuyên. Hardcoded rules từ Phase 3 → move sang DB.
**Delivers:** Rule CRUD API + UI, template ID management UI, admin route protection
**Addresses:** Admin rule management (P2), admin template management (P2)
**Avoids:** Technical debt — hardcoded rules yêu cầu redeploy mỗi khi update

### Phase 6: Polish + Validation
**Rationale:** Test với real SOHA TRAVEL files, fix edge cases, production readiness.
**Delivers:** Step-by-step progress indicators, specific error messages per failure point, "Looks Done But Isn't" checklist completion, production deployment
**Uses:** SSE hoặc client polling cho progress, VPS deployment với PM2

---

### Phase Ordering Rationale

- **Foundation trước** vì auth guard bảo vệ tất cả routes, Prisma schema define data models cho toàn bộ app, và Canva verification cần happen sớm nhất.
- **File Parsing trước AI Engine** vì AI cần text input — không thể test AI mà không có text.
- **AI Engine trước Canva** vì Canva autofill cần `finalContent` từ rules engine — phải define interface trước khi build Canva integration.
- **Admin Panels sau core pipeline** vì rules có thể hardcode v1, nhưng không nên defer quá lâu vì rules cần cập nhật thường xuyên.
- **Polish cuối** — chỉ khi pipeline đầu đủ mới biết edge cases nào cần handle.

### Research Flags

Phases cần attention đặc biệt trong planning:
- **Phase 4 (Canva Integration):** Confidence MEDIUM — ít real-world examples với Canva Connect API autofill. Cần verify element naming convention với actual templates trước khi write code. Canva approval timeline không predictable.
- **Phase 3 (AI Engine):** Cần test prompt với actual SOHA TRAVEL tour programs để validate Vietnamese quality và output length fit Canva template.

Phases với standard patterns (ít rủi ro):
- **Phase 1 (Foundation):** Next.js + Prisma + next-auth là well-documented patterns.
- **Phase 2 (File Parsing):** pdf-parse + mammoth là straightforward, chỉ cần test với Vietnamese files thực.
- **Phase 5 (Admin Panels):** Standard CRUD — predictable implementation.

---

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Next.js/Prisma/Claude đều là well-documented, widely-used. Compatibility verified. |
| Features | HIGH | Feature scope rõ ràng từ PROJECT.md. Internal tool nên không cần competitor validation nhiều. |
| Architecture | HIGH | Layered monolith pattern standard cho Next.js. Generation pipeline logic straightforward. |
| Canva Integration | MEDIUM | Official docs rõ, nhưng ít public production examples với autofill API. Approval process unclear. |
| Vietnamese PDF Parsing | MEDIUM | Known issues với pdf-parse documented, nhưng cần test với actual SOHA files để confirm. |

**Overall confidence:** HIGH (với caveat: Canva API access phải verify sớm)

### Gaps to Address

- **Canva app approval timeline:** Không biết mất bao lâu. Mitigation: mock client + build Phase 1-3 trước, đừng block pipeline vì Canva.
- **Actual Canva template element names:** Phải mở templates và document element names thực trước Phase 4. Research hiện tại chỉ có example names, không phải tên thật.
- **Vietnamese PDF sample testing:** Cần test với ít nhất 5 real SOHA TRAVEL PDF files trong Phase 2 để validate encoding handling.
- **Claude token usage for Vietnamese:** Vietnamese dùng nhiều tokens hơn English. Cần estimate cost với real tour program files (4 trang ≈ bao nhiêu tokens?).

---

## Sources

### Primary (HIGH confidence)
- Next.js 15 official docs (nextjs.org) — App Router, Route Handlers, FormData handling, `maxDuration` config
- Canva Connect API docs (canva.dev) — OAuth2 flow, autofill API reference, app distribution requirements
- Anthropic SDK docs (docs.anthropic.com) — `tool_use` structured output, token counting for Vietnamese
- Prisma docs (prisma.io) — PostgreSQL setup, connection pooling singleton pattern

### Secondary (MEDIUM confidence)
- next-auth docs (next-auth.js.org) — App Router credentials provider setup
- npm: pdf-parse, mammoth — README và known issues với Vietnamese encoding
- Canva developer community forum — reports của autofill silent failures on element name mismatch

### Tertiary (LOW confidence — cần validate)
- Adjacent tool comparisons (Beautiful.ai, SlidesAI.io, Docupilot, Gamma.app) — feature landscape analysis
- Community reports về Canva private integration plan requirements — chưa verified với SOHA's current Canva plan

---

*Research completed: 2026-03-22*
*Ready for roadmap: yes*
