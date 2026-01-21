# DevPath - Lộ Trình Học Tập Cá Nhân Hóa

> Tạo ngày: 2026-01-21
> Mục tiêu: Contribute vào dự án DevPath

---

## Tổng Quan Đánh Giá

### Điểm mạnh của bạn
| Kỹ năng | Mức độ | Ghi chú |
|---------|--------|---------|
| JavaScript | Advanced | Closures, prototypes, event loop |
| React | Trung bình | Hooks, Context, Router |
| Tailwind CSS | Trung bình | Responsive, dark mode |
| AI/LLM APIs | Đã dùng | Đã gọi API trực tiếp |
| Linux Terminal | Trung bình | Fedora user |

### Cần học thêm
| Kỹ năng | Mức độ hiện tại | Độ ưu tiên |
|---------|-----------------|------------|
| TypeScript | Cơ bản | **Cao** |
| NestJS | Đã nghe | **Cao** |
| Prisma ORM | Chưa biết | **Cao** |
| Zustand | Chưa dùng | **Cao** |
| React Query | Đã nghe | **Cao** |
| Docker | Đã nghe | Trung bình |
| PostgreSQL | Cơ bản | Trung bình |
| Redis | Chưa biết | Trung bình |
| JWT Auth | Đã nghe | Trung bình |
| REST API Design | Đã gọi API | Trung bình |
| Testing | Chưa biết | Thấp |
| i18n | Chưa biết | Thấp |
| CI/CD | Chưa biết | Thấp |

---

## Phase 1: TypeScript Nâng Cao (1-2 tuần)

> **Tại sao quan trọng:** Toàn bộ dự án DevPath dùng TypeScript strict mode. Bạn cần hiểu sâu hơn để đọc và viết code.

### 1.1 Generics
```typescript
// Bạn cần hiểu được code như này trong project:
function createService<T>(config: ServiceConfig): T { }
type ApiResponse<T> = { success: true; data: T } | { success: false; error: Error }
```

**Tài liệu học:**
- [ ] [TypeScript Handbook - Generics](https://www.typescriptlang.org/docs/handbook/2/generics.html)
- [ ] [Matt Pocock - Generics Tutorial](https://www.totaltypescript.com/tutorials/beginners-typescript)

### 1.2 Utility Types
```typescript
// Dự án dùng nhiều utility types:
Partial<User>        // Làm tất cả fields optional
Pick<User, 'id' | 'email'>  // Chọn một số fields
Omit<User, 'password'>      // Bỏ một số fields
Record<string, unknown>     // Object với key-value
```

**Tài liệu học:**
- [ ] [TypeScript Utility Types](https://www.typescriptlang.org/docs/handbook/utility-types.html)
- [ ] Practice: Tạo 5 custom types dùng utility types

### 1.3 Type Guards & Narrowing
```typescript
// Cần cho error handling trong project:
function isApiError(error: unknown): error is ApiError {
  return typeof error === 'object' && error !== null && 'code' in error
}
```

**Tài liệu học:**
- [ ] [TypeScript Narrowing](https://www.typescriptlang.org/docs/handbook/2/narrowing.html)

### 1.4 Decorators (cho NestJS)
```typescript
// NestJS dùng decorators rất nhiều:
@Controller('users')
export class UsersController {
  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id') id: string) { }
}
```

**Tài liệu học:**
- [ ] [TypeScript Decorators](https://www.typescriptlang.org/docs/handbook/decorators.html)
- [ ] [NestJS Custom Decorators](https://docs.nestjs.com/custom-decorators)

---

## Phase 2: Backend với NestJS (2-3 tuần)

> **Tại sao quan trọng:** Backend của DevPath xây dựng hoàn toàn trên NestJS. Đây là framework chính bạn cần master.

### 2.1 NestJS Fundamentals
**Khái niệm cốt lõi:**
```
┌─────────────────────────────────────────────────────┐
│                    Module                            │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  │
│  │ Controller  │→ │   Service   │→ │ Repository  │  │
│  │ (Routes)    │  │ (Logic)     │  │ (Database)  │  │
│  └─────────────┘  └─────────────┘  └─────────────┘  │
└─────────────────────────────────────────────────────┘
```

**Học theo thứ tự:**
1. [ ] **Modules** - Cách tổ chức code
   - Đọc: [NestJS Modules](https://docs.nestjs.com/modules)
   - File tham khảo: `backend/src/app.module.ts`

2. [ ] **Controllers** - Xử lý HTTP requests
   - Đọc: [NestJS Controllers](https://docs.nestjs.com/controllers)
   - File tham khảo: `backend/src/modules/auth/auth.controller.ts`

3. [ ] **Providers/Services** - Business logic
   - Đọc: [NestJS Providers](https://docs.nestjs.com/providers)
   - File tham khảo: `backend/src/modules/auth/auth.service.ts`

4. [ ] **DTOs & Validation** - Data validation
   - Đọc: [NestJS Validation](https://docs.nestjs.com/techniques/validation)
   - Thư viện: class-validator, class-transformer

### 2.2 NestJS Advanced
5. [ ] **Guards** - Authentication/Authorization
   - Đọc: [NestJS Guards](https://docs.nestjs.com/guards)
   - File: `backend/src/common/guards/jwt-auth.guard.ts`

6. [ ] **Interceptors** - Transform responses
   - Đọc: [NestJS Interceptors](https://docs.nestjs.com/interceptors)
   - File: `backend/src/common/interceptors/transform.interceptor.ts`

7. [ ] **Pipes** - Data transformation
   - Đọc: [NestJS Pipes](https://docs.nestjs.com/pipes)

8. [ ] **Exception Filters** - Error handling
   - Đọc: [NestJS Exception Filters](https://docs.nestjs.com/exception-filters)
   - File: `backend/src/common/filters/http-exception.filter.ts`

### 2.3 Bài tập thực hành
- [ ] Tạo một NestJS project mới với CLI
- [ ] Implement một CRUD module đơn giản (không database)
- [ ] Thêm validation với DTOs
- [ ] Thêm một custom guard

---

## Phase 3: Prisma ORM & PostgreSQL (1-2 tuần)

> **Tại sao quan trọng:** DevPath dùng Prisma để quản lý toàn bộ database. Schema phức tạp với nhiều relations.

### 3.1 Prisma Basics
**Schema language:**
```prisma
// Đây là cách định nghĩa models trong DevPath:
model User {
  id        String   @id @default(uuid())
  email     String   @unique
  role      UserRole @default(USER)
  createdAt DateTime @default(now()) @map("created_at")

  // Relations
  userProgress UserProgress[]

  @@map("users")  // Tên table trong database
}
```

**Học:**
- [ ] [Prisma Getting Started](https://www.prisma.io/docs/getting-started)
- [ ] [Prisma Schema Reference](https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference)
- [ ] Đọc kỹ file: `prisma/schema.prisma` trong project

### 3.2 Prisma Client (CRUD)
```typescript
// Cách query trong DevPath:
const user = await prisma.user.findUnique({
  where: { email: 'test@example.com' },
  include: { userProgress: true }
})

const users = await prisma.user.findMany({
  where: { role: 'USER' },
  orderBy: { createdAt: 'desc' },
  take: 10
})
```

**Học:**
- [ ] [Prisma CRUD](https://www.prisma.io/docs/concepts/components/prisma-client/crud)
- [ ] [Prisma Relations](https://www.prisma.io/docs/concepts/components/prisma-client/relation-queries)
- [ ] [Prisma Filtering](https://www.prisma.io/docs/concepts/components/prisma-client/filtering-and-sorting)

### 3.3 Migrations
```bash
# Commands bạn sẽ dùng:
npx prisma migrate dev --name add_user_table  # Tạo migration
npx prisma migrate deploy                      # Apply migrations
npx prisma db seed                             # Seed data
npx prisma studio                              # GUI để xem database
```

**Học:**
- [ ] [Prisma Migrations](https://www.prisma.io/docs/concepts/components/prisma-migrate)

### 3.4 PostgreSQL Nâng Cao
Bạn cần hiểu thêm:
- [ ] **JOINs** - Để hiểu Prisma relations
- [ ] **Indexes** - Để optimize queries
- [ ] **Transactions** - Prisma transactions API

**Tài liệu:**
- [ ] [PostgreSQL Tutorial](https://www.postgresqltutorial.com/)
- [ ] [Prisma Transactions](https://www.prisma.io/docs/concepts/components/prisma-client/transactions)

---

## Phase 4: Frontend State Management (1 tuần)

> **Tại sao quan trọng:** DevPath dùng Zustand + React Query. Khác hoàn toàn với Redux mà bạn có thể đã thấy.

### 4.1 Zustand
**Cách dùng trong DevPath:**
```typescript
// stores/authStore.ts
import { create } from 'zustand'

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  login: (user: User) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  login: (user) => set({ user, isAuthenticated: true }),
  logout: () => set({ user: null, isAuthenticated: false })
}))

// Sử dụng trong component:
const { user, logout } = useAuthStore()
```

**Học:**
- [ ] [Zustand Documentation](https://zustand-demo.pmnd.rs/)
- [ ] [Zustand GitHub Examples](https://github.com/pmndrs/zustand)
- [ ] Practice: Tạo một store đơn giản cho todo app

### 4.2 React Query (TanStack Query)
**Cách dùng trong DevPath:**
```typescript
// Fetching data:
const { data, isLoading, error } = useQuery({
  queryKey: ['user', userId],
  queryFn: () => api.getUser(userId)
})

// Mutations:
const mutation = useMutation({
  mutationFn: (newUser) => api.createUser(newUser),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['users'] })
  }
})
```

**Học:**
- [ ] [TanStack Query Overview](https://tanstack.com/query/latest/docs/react/overview)
- [ ] [Practical React Query](https://tkdodo.eu/blog/practical-react-query) - Blog series rất hay
- [ ] Practice: Convert một component dùng useEffect + useState sang React Query

### 4.3 Kết hợp Zustand + React Query
```
┌─────────────────────────────────────────────────────┐
│                    React App                         │
│                                                      │
│  ┌─────────────────┐    ┌─────────────────────────┐ │
│  │    Zustand      │    │     React Query         │ │
│  │ (Client State)  │    │   (Server State)        │ │
│  │                 │    │                         │ │
│  │ - UI state      │    │ - API data              │ │
│  │ - User prefs    │    │ - Caching               │ │
│  │ - Auth tokens   │    │ - Background refetch    │ │
│  └─────────────────┘    └─────────────────────────┘ │
└─────────────────────────────────────────────────────┘
```

---

## Phase 5: Docker & Development Environment (3-5 ngày)

> **Tại sao quan trọng:** DevPath chạy trên Docker. Bạn cần hiểu để setup môi trường dev.

### 5.1 Docker Concepts
```
┌──────────────────────────────────────────────────────┐
│                    Docker Host                        │
│                                                       │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────────┐ │
│  │  Container  │ │  Container  │ │    Container    │ │
│  │  PostgreSQL │ │    Redis    │ │  NestJS Backend │ │
│  │   :5432     │ │   :6379     │ │     :3001       │ │
│  └──────┬──────┘ └──────┬──────┘ └────────┬────────┘ │
│         │               │                  │          │
│         └───────────────┴──────────────────┘          │
│                   Docker Network                      │
└──────────────────────────────────────────────────────┘
```

**Học:**
- [ ] [Docker Getting Started](https://docs.docker.com/get-started/)
- [ ] Hiểu: Images vs Containers
- [ ] Hiểu: Volumes (persistent data)
- [ ] Hiểu: Networks (container communication)

### 5.2 Docker Compose
```yaml
# Đọc hiểu file docker-compose.yml của project:
services:
  postgres:
    image: postgres:16-alpine
    volumes:
      - postgres_data:/var/lib/postgresql/data

  backend:
    build: ./backend
    depends_on:
      - postgres
    environment:
      DATABASE_URL: postgresql://...
```

**Học:**
- [ ] [Docker Compose Documentation](https://docs.docker.com/compose/)
- [ ] Đọc kỹ: `docker-compose.yml` trong project
- [ ] Practice: `docker-compose up -d`, `docker-compose logs`, `docker-compose down`

### 5.3 Dockerfile Multi-stage Builds
```dockerfile
# Hiểu cách Dockerfile của project hoạt động:
FROM node:20-alpine AS base      # Base image
FROM base AS development         # Dev stage
FROM base AS builder             # Build stage
FROM base AS production          # Prod stage
```

**Học:**
- [ ] [Dockerfile Best Practices](https://docs.docker.com/develop/develop-images/dockerfile_best-practices/)
- [ ] Đọc: `backend/Dockerfile` và `frontend/Dockerfile`

---

## Phase 6: Authentication Flow (3-5 ngày)

> **Tại sao quan trọng:** DevPath dùng OTP + JWT. Bạn cần hiểu flow này để contribute.

### 6.1 JWT Deep Dive
```
┌─────────────────────────────────────────────────────┐
│                  JWT Structure                       │
│                                                      │
│  Header.Payload.Signature                            │
│                                                      │
│  Payload:                                            │
│  {                                                   │
│    "sub": "user-uuid",                              │
│    "email": "user@example.com",                     │
│    "role": "USER",                                  │
│    "iat": 1705654800,    // Issued at               │
│    "exp": 1705655700     // Expires (15 min)        │
│  }                                                   │
└─────────────────────────────────────────────────────┘
```

**Access Token vs Refresh Token:**
| Token | Lifetime | Storage | Purpose |
|-------|----------|---------|---------|
| Access | 15 min | Memory (Zustand) | API requests |
| Refresh | 7 days | HttpOnly Cookie | Get new access token |

**Học:**
- [ ] [JWT.io Introduction](https://jwt.io/introduction)
- [ ] [NestJS Authentication](https://docs.nestjs.com/security/authentication)
- [ ] Đọc: `backend/src/modules/auth/` folder

### 6.2 OTP Flow trong DevPath
```
User                    Backend                 Email Service
  │                        │                         │
  │ POST /auth/otp/request │                         │
  │ {email}                │                         │
  │───────────────────────>│                         │
  │                        │ Generate 6-digit OTP    │
  │                        │ Store in DB (2 min exp) │
  │                        │                         │
  │                        │ Send OTP email          │
  │                        │────────────────────────>│
  │                        │                         │
  │ POST /auth/otp/verify  │                         │
  │ {email, code}          │                         │
  │───────────────────────>│                         │
  │                        │ Verify OTP              │
  │                        │ Create user if new      │
  │                        │ Generate JWT tokens     │
  │<───────────────────────│                         │
  │ {accessToken,          │                         │
  │  refreshToken,         │                         │
  │  user}                 │                         │
```

---

## Phase 7: Redis Caching (2-3 ngày)

> **Tại sao quan trọng:** DevPath dùng Redis cho caching và rate limiting.

### 7.1 Redis Basics
```bash
# Commands cơ bản:
SET user:123 '{"name":"John"}'    # Lưu data
GET user:123                       # Lấy data
SETEX otp:email 120 "123456"      # Lưu với expiration (120s)
DEL user:123                       # Xóa
INCR rate:user:123                # Increment (rate limiting)
```

**Học:**
- [ ] [Redis Getting Started](https://redis.io/docs/getting-started/)
- [ ] [Redis Data Types](https://redis.io/docs/data-types/)

### 7.2 Redis trong NestJS
```typescript
// Cách dùng trong DevPath:
@Injectable()
export class CacheService {
  constructor(private redis: Redis) {}

  async get<T>(key: string): Promise<T | null> {
    const data = await this.redis.get(key)
    return data ? JSON.parse(data) : null
  }

  async set(key: string, value: any, ttlSeconds: number) {
    await this.redis.setex(key, ttlSeconds, JSON.stringify(value))
  }
}
```

---

## Phase 8: Supplementary Skills (Học song song)

### 8.1 REST API Design
**Patterns trong DevPath:**
```
GET    /api/v1/users          # List
GET    /api/v1/users/:id      # Get one
POST   /api/v1/users          # Create
PUT    /api/v1/users/:id      # Update
DELETE /api/v1/users/:id      # Delete

Response format:
{
  "success": true,
  "data": { ... },
  "meta": { "timestamp": "...", "requestId": "..." }
}
```

- [ ] [REST API Best Practices](https://restfulapi.net/)
- [ ] Đọc: `CONTEXT.md` section 5 (API Design)

### 8.2 Testing (Optional nhưng nên học)
- [ ] [Jest Getting Started](https://jestjs.io/docs/getting-started)
- [ ] [NestJS Testing](https://docs.nestjs.com/fundamentals/testing)

### 8.3 i18n với react-i18next
- [ ] [react-i18next Documentation](https://react.i18next.com/)
- [ ] Đọc: `frontend/public/locales/` folder

### 8.4 Git Workflow
```bash
# Feature branch workflow:
git checkout -b feature/add-user-profile
# ... làm changes ...
git add .
git commit -m "feat: add user profile page"
git push origin feature/add-user-profile
# Tạo Pull Request trên GitHub
```

- [ ] [Git Feature Branch Workflow](https://www.atlassian.com/git/tutorials/comparing-workflows/feature-branch-workflow)

---

## Lộ Trình Tổng Hợp

```
Tuần 1-2: TypeScript Nâng Cao
    │
    ▼
Tuần 3-5: NestJS + Prisma
    │
    ▼
Tuần 6: Zustand + React Query
    │
    ▼
Tuần 7: Docker + Auth + Redis
    │
    ▼
Tuần 8+: Bắt đầu Contribute!
```

---

## Checklist Trước Khi Contribute

- [ ] Đọc hiểu `CONTEXT.md` (technical specification)
- [ ] Đọc hiểu `prisma/schema.prisma` (database structure)
- [ ] Chạy được project với Docker (`docker-compose up -d`)
- [ ] Hiểu cấu trúc folder của backend và frontend
- [ ] Tạo được một API endpoint đơn giản trong NestJS
- [ ] Hiểu flow authentication (OTP + JWT)
- [ ] Có thể đọc và debug TypeScript code

---

## Tài Nguyên Bổ Sung

### Khóa học miễn phí
- [The Net Ninja - NestJS](https://www.youtube.com/playlist?list=PL4cUxeGkcC9g8YFseGdkyj9RH9kVs_cMr)
- [Fireship - 100 seconds videos](https://www.youtube.com/c/Fireship) (TypeScript, Docker, Redis)
- [TotalTypeScript - Free Tutorials](https://www.totaltypescript.com/tutorials)

### Documentation chính
- [NestJS Docs](https://docs.nestjs.com/)
- [Prisma Docs](https://www.prisma.io/docs/)
- [TanStack Query Docs](https://tanstack.com/query/latest)
- [Zustand Docs](https://zustand-demo.pmnd.rs/)

### Tools hữu ích
- **Postman/Insomnia** - Test API
- **Prisma Studio** - Database GUI (`npx prisma studio`)
- **pgAdmin** - PostgreSQL GUI (có trong docker-compose)
- **Redis Commander** - Redis GUI (có trong docker-compose)

---

*Good luck! Bạn có nền tảng JavaScript vững, React ổn, và đã dùng AI APIs - đây là lợi thế lớn. Focus vào TypeScript advanced + NestJS trước, còn lại sẽ học nhanh khi cần.*
