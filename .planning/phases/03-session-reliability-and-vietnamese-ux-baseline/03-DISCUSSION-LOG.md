# Phase 3: Session Reliability and Vietnamese UX Baseline - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-03-23
**Phase:** 03-session-reliability-and-vietnamese-ux-baseline
**Areas discussed:** Session Restore UX, Vietnamese Text Strategy, Data Consistency Pattern, Error & Edge Case UX

---

## Session Restore UX

### Boot Screen

| Option | Description | Selected |
|--------|-------------|----------|
| Skeleton trong layout | Giu nguyen layout (Sidebar, Header), chi show skeleton o content area. Da co pattern trong Lesson/Dashboard. | :heavy_check_mark: |
| Full-screen spinner | Man hinh trang voi spinner o giua, giong splash screen. Don gian nhung user khong thay UI gi. | |
| Blank roi render | Khong show gi ca, chi blank cho den khi auth xong. Nhanh nhung co the flicker. | |

**User's choice:** Skeleton trong layout
**Notes:** Recommended option selected. Preserves app structure while loading.

### Refresh Token Failure

| Option | Description | Selected |
|--------|-------------|----------|
| Redirect im lang | Quay ve /login ngay, nhu hien tai. Nhanh, ro rang. | |
| Toast + redirect | Hien toast 'Phien da het han, vui long dang nhap lai' roi redirect sau 2s. | :heavy_check_mark: |
| Dialog confirm | Hien dialog/modal yeu cau confirm truoc khi redirect. Nhu Google docs khi session het. | |

**User's choice:** Toast + redirect
**Notes:** Recommended option. User gets clear feedback before being redirected.

### Multi-tab Handling

| Option | Description | Selected |
|--------|-------------|----------|
| Moi tab tu refresh | Moi tab goi /auth/refresh doc lap khi load. Backend da ho tro token rotation nen safe. | :heavy_check_mark: |
| Sync giua cac tab | Dung BroadcastChannel API de 1 tab refresh, cac tab khac nhan token. Phuc tap hon. | |

**User's choice:** Moi tab tu refresh
**Notes:** Simpler approach. Backend token rotation handles concurrent refreshes.

### Retry on Failure

| Option | Description | Selected |
|--------|-------------|----------|
| Khong retry | Goi /auth/refresh 1 lan duy nhat. Fail = coi nhu session het. | :heavy_check_mark: |
| Retry 1-2 lan | Retry 1-2 lan voi delay ngan (500ms). Phong truong hop network flaky. | |

**User's choice:** Khong retry
**Notes:** Single attempt, fail = session expired.

---

## Vietnamese Text Strategy

### Approach

| Option | Description | Selected |
|--------|-------------|----------|
| Central strings file | Tao file nhu vi.ts chua tat ca strings Vietnamese, import vao components. De QA, khong can library ngoai. | :heavy_check_mark: |
| i18n library (react-i18next) | Dung react-i18next voi 1 locale (vi). Chuan hon, ho tro plurals/interpolation. Nhung nhieu setup hon. | |
| Inline fix tung file | Fix truc tiep tung component: tim string sai dau, sua inline. Nhanh nhat nhung kho maintain. | |

**User's choice:** Central strings file
**Notes:** Simple, maintainable, no external dependency needed.

### Scope

| Option | Description | Selected |
|--------|-------------|----------|
| Tat ca user-facing screens | Login, Dashboard, Explore, Lesson, Settings, Onboarding, Quiz. Fix het mot luot. | :heavy_check_mark: |
| Chi critical screens | Chi Login, Dashboard, Lesson (3 man hinh chinh). Cac man khac fix sau. | |
| Minimum viable | Login + Dashboard. Nhu sau lam dan. | |

**User's choice:** Tat ca user-facing screens
**Notes:** Comprehensive fix matching STAB-03 requirement scope.

### File Structure

| Option | Description | Selected |
|--------|-------------|----------|
| 1 file, chia section | 1 file vi.ts chia theo section (auth, dashboard, lesson...). Don gian, de tim. | :heavy_check_mark: |
| File per page | Moi page 1 file rieng (auth.vi.ts, dashboard.vi.ts...). Modular hon, nhung nhieu file. | |

**User's choice:** 1 file, chia section
**Notes:** Single source of truth for all Vietnamese strings.

### Tone

| Option | Description | Selected |
|--------|-------------|----------|
| Than thien (ban) | Xung 'ban', giong than thien. Vi du: 'Ban chua dang ky lo trinh nao'. | :heavy_check_mark: |
| Trung lap (khong xung ho) | Khong xung ho. Vi du: 'Chua dang ky lo trinh nao'. Trung lap, ngan gon. | |

**User's choice:** Than thien (ban)
**Notes:** Friendly tutor tone, consistent "ban" address across all screens.

---

## Data Consistency Pattern

### State Management

| Option | Description | Selected |
|--------|-------------|----------|
| React Query | Them React Query (TanStack Query) cho server state: auto-cache, invalidation, refetch. Project chua co React Query. | :heavy_check_mark: |
| Zustand store chuyen biet | Tao Zustand store rieng cho progress/enrollment. Manual invalidation khi data thay doi. | |
| Refetch on navigate | Giu nguyen fetch per component, chi them refetch khi navigate. Don gian nhat. | |

**User's choice:** React Query
**Notes:** Strategic adoption. Establishes server state pattern for future phases.

### Invalidation Strategy

| Option | Description | Selected |
|--------|-------------|----------|
| Invalidate on mutation | Sau enroll/complete lesson, invalidate cac query lien quan (dashboard, progress). Data luon fresh. | :heavy_check_mark: |
| Background polling | Moi 30-60s auto refetch. Data co the stale trong khoang thoi gian do. | |
| Refetch on focus/navigate | Khi user navigate giua cac page, refetch data cua page do. | |

**User's choice:** Invalidate on mutation
**Notes:** Event-driven freshness, no unnecessary polling.

### React Query Scope

| Option | Description | Selected |
|--------|-------------|----------|
| Critical flows truoc | Chi cac API lien quan Phase 3: dashboard overview, learning paths, progress, enrollment. Cac page khac migrate dan. | :heavy_check_mark: |
| Toan bo app | Migrate tat ca API calls sang React Query luon. Clean nhung nhieu viec hon. | |
| Chi 2 page chinh | Chi dashboard + explore. Minimum de fix STAB-04. | |

**User's choice:** Critical flows truoc
**Notes:** Focused scope matching phase requirements. Other pages migrate later.

### Zustand vs React Query

| Option | Description | Selected |
|--------|-------------|----------|
| Zustand auth + RQ data | Giu Zustand cho auth (client state), dung React Query cho server data. Tach biet ro rang. | :heavy_check_mark: |
| Chi React Query | Chuyen het sang React Query, bo Zustand luon. Nhung auth store can refactor nhieu. | |

**User's choice:** Zustand auth + RQ data
**Notes:** Clean separation of concerns. Auth = client state, data = server state.

---

## Error & Edge Case UX

### API Error Display

| Option | Description | Selected |
|--------|-------------|----------|
| Toast notification | Toast notification (bottom-right, auto-dismiss). Khong chan UI. | :heavy_check_mark: |
| Inline error banner | Banner do ngay trong page content. Ro rang hon nhung chiem khong gian. | |
| Hon hop ca hai | Ket hop: Toast cho loi nho (network), inline banner cho loi lon (load page fail). | |

**User's choice:** Toast notification
**Notes:** Non-blocking, consistent with session expiry toast pattern.

### Empty State

| Option | Description | Selected |
|--------|-------------|----------|
| Friendly voi CTA | Illustration nho + text huong dan + CTA button. Vi du: 'Ban chua co lo trinh nao' + 'Kham pha ngay'. | :heavy_check_mark: |
| Text don gian | Chi text thong bao don gian, khong CTA. | |

**User's choice:** Friendly voi CTA
**Notes:** Guides user to next action. Reduces dead-end screens.

### Offline Handling

| Option | Description | Selected |
|--------|-------------|----------|
| Toast + auto-retry | Hien toast 'Khong co ket noi mang' va auto-retry khi online lai. | :heavy_check_mark: |
| Persistent banner | Hien banner co dinh o top man hinh cho den khi co mang lai. | |
| Khong xu ly rieng | Khong xu ly dac biet, de cac API call fail binh thuong va hien toast error. | |

**User's choice:** Toast + auto-retry
**Notes:** React Query's built-in online/offline detection supports this natively.

### Loading State

| Option | Description | Selected |
|--------|-------------|----------|
| Skeleton shimmer | Skeleton shimmer giong Facebook/LinkedIn. Da la pattern duoc chon cho boot screen. | :heavy_check_mark: |
| Spinner inline | Spinner nho inline trong content area. | |
| Hon hop | Tuy component: skeleton cho page load, spinner cho action nho. | |

**User's choice:** Skeleton shimmer
**Notes:** Consistent with boot screen pattern (D-01). Unified loading UX.

---

## Claude's Discretion

- Exact skeleton component implementation
- Toast library choice
- Empty state illustration assets
- vi.ts key naming conventions
- React Query configuration details
- Axios interceptor refactoring approach

## Deferred Ideas

None — discussion stayed within phase scope
