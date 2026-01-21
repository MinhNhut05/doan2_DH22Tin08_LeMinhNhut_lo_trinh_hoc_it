# DevPath - Technical Context Document

> **Version:** 1.0.0
> **Last Updated:** 2025-01-19
> **Author:** DevPath Team
> **Domain:** devpathlearn.com

---

## 1. Project Overview

### 1.1 Vision
DevPath là hệ thống học tập cá nhân hóa dành cho người học IT tại Việt Nam. Hệ thống kết hợp AI-assisted analysis với rule-based validation để giúp người học xác định điểm bắt đầu, lộ trình học tập, và mức độ sẵn sàng tiến lên.

### 1.2 Target Users
- Người Việt Nam muốn học IT (Frontend, Backend, Fullstack)
- Beginners không có background HOẶC người đã có kiến thức một phần
- Người muốn có lộ trình học tập có cấu trúc thay vì tự tìm kiếm rải rác

### 1.3 MVP Scope
**Fully Implemented:**
- Frontend ReactJS Learning Path
- Backend NodeJS Learning Path
- Fullstack (React + NodeJS) Combined Path

**Visible but Not Implemented:**
- Python/AI paths (Coming Soon)

---

## 2. Technology Stack

### 2.1 Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| React | 18.x | UI Library |
| Vite | 5.x | Build Tool |
| TypeScript | 5.x | Type Safety |
| Zustand | 4.x | State Management |
| React Query (TanStack) | 5.x | Server State & Caching |
| react-i18next | 14.x | Internationalization (VI/EN) |
| Tailwind CSS | 3.x | Styling |
| Framer Motion | 11.x | Animations |
| React Router | 6.x | Routing |
| React Hook Form | 7.x | Form Management |
| Zod | 3.x | Schema Validation |

### 2.2 Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | 20.x LTS | Runtime |
| NestJS | 10.x | Framework |
| TypeScript | 5.x | Type Safety |
| Prisma | 5.x | ORM |
| PostgreSQL | 16.x | Database |
| Redis | 7.x | Caching & Rate Limiting |
| Passport | 0.7.x | Authentication |
| JWT | - | Token-based Auth |
| Winston | 3.x | Logging |
| Sentry | - | Error Tracking |

### 2.3 AI/ML
| Technology | Purpose |
|------------|---------|
| OpenAI GPT-4o-mini / Groq Llama | LLM Provider (TBD after testing) |
| LangChain.js | LLM Orchestration |
| pgvector (Phase 2) | Vector Database for RAG |

### 2.4 Infrastructure
| Component | Service | Purpose |
|-----------|---------|---------|
| Frontend Hosting | Vercel | Static site hosting |
| Backend Hosting | VPS (Hetzner/DigitalOcean) | API Server |
| Database | Neon | Serverless PostgreSQL |
| DNS | Cloudflare | DNS + DDoS Protection |
| Email | Resend | Transactional Emails (OTP) |
| CI/CD | GitHub Actions | Automated Deployment |
| Container | Docker | Containerization |

---

## 3. System Architecture

### 3.1 High-Level Architecture
```
┌─────────────────────────────────────────────────────────────────┐
│                         CLOUDFLARE                               │
│                    (DNS + DDoS Protection)                       │
└─────────────────────────────────────────────────────────────────┘
                                │
                ┌───────────────┴───────────────┐
                │                               │
                ▼                               ▼
┌───────────────────────────┐   ┌───────────────────────────────┐
│         VERCEL            │   │            VPS                │
│  ┌─────────────────────┐  │   │  ┌─────────────────────────┐  │
│  │   React Frontend    │  │   │  │   Nginx (Reverse Proxy) │  │
│  │   (Static SPA)      │  │   │  └───────────┬─────────────┘  │
│  └─────────────────────┘  │   │              │                │
│                           │   │  ┌───────────▼─────────────┐  │
│  devpathlearn.com         │   │  │   NestJS API Server     │  │
│                           │   │  │   (PM2 Process Manager) │  │
└───────────────────────────┘   │  └───────────┬─────────────┘  │
                                │              │                │
                                │  api.devpathlearn.com         │
                                └──────────────┼────────────────┘
                                               │
                ┌──────────────────────────────┼──────────────────┐
                │                              │                  │
                ▼                              ▼                  ▼
┌───────────────────────┐  ┌───────────────────────┐  ┌──────────────────┐
│        NEON           │  │     AI PROVIDER       │  │      RESEND      │
│  (PostgreSQL + Redis) │  │  (OpenAI/Groq/Claude) │  │   (Email OTP)    │
└───────────────────────┘  └───────────────────────┘  └──────────────────┘
```

### 3.2 Application Layers
```
┌─────────────────────────────────────────────────────────────────┐
│                      PRESENTATION LAYER                          │
│  React Components │ Pages │ Hooks │ Context                      │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                      APPLICATION LAYER                           │
│  React Query │ Zustand Store │ API Client (Axios)                │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼ HTTP/REST
┌─────────────────────────────────────────────────────────────────┐
│                         API LAYER                                │
│  NestJS Controllers │ Guards │ Interceptors │ Pipes              │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                       SERVICE LAYER                              │
│  Business Logic │ AI Service │ Email Service │ Validation        │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                     DATA ACCESS LAYER                            │
│  Prisma ORM │ Repositories │ Query Builders                      │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                       DATABASE LAYER                             │
│  PostgreSQL (Neon) │ Redis (Caching)                             │
└─────────────────────────────────────────────────────────────────┘
```

---

## 4. Database Schema

### 4.1 Entity Relationship Diagram
```
┌──────────────┐       ┌──────────────────┐       ┌─────────────────┐
│    USER      │       │  LEARNING_PATH   │       │     TRACK       │
├──────────────┤       ├──────────────────┤       ├─────────────────┤
│ id (PK)      │       │ id (PK)          │       │ id (PK)         │
│ email        │       │ name             │       │ learning_path_id│
│ role         │       │ slug             │       │ name            │
│ created_at   │       │ description      │       │ description     │
│ updated_at   │       │ icon             │       │ order           │
│ deleted_at   │       │ difficulty       │       │ is_optional     │
└──────┬───────┘       │ estimated_hours  │       └────────┬────────┘
       │               │ is_published     │                │
       │               └────────┬─────────┘                │
       │                        │                          │
       │    ┌───────────────────┼──────────────────────────┘
       │    │                   │
       │    │                   ▼
       │    │         ┌─────────────────┐      ┌──────────────────────┐
       │    │         │     LESSON      │      │ LESSON_PREREQUISITE  │
       │    │         ├─────────────────┤      ├──────────────────────┤
       │    │         │ id (PK)         │◄────►│ lesson_id (FK)       │
       │    │         │ track_id (FK)   │      │ prerequisite_id (FK) │
       │    │         │ title           │      └──────────────────────┘
       │    │         │ slug            │
       │    │         │ summary         │
       │    │         │ content         │
       │    │         │ external_links  │
       │    │         │ track_order     │
       │    │         │ estimated_mins  │
       │    │         └────────┬────────┘
       │    │                  │
       │    │                  ▼
       │    │         ┌─────────────────┐
       │    │         │      QUIZ       │
       │    │         ├─────────────────┤
       │    │         │ id (PK)         │
       │    │         │ lesson_id (FK)  │
       │    │         │ title           │
       │    │         │ pass_threshold  │
       │    │         │ retry_limit     │
       │    │         │ retry_cooldown  │
       │    │         └────────┬────────┘
       │    │                  │
       │    │                  ▼
       │    │         ┌─────────────────┐
       │    │         │ QUIZ_QUESTION   │
       │    │         ├─────────────────┤
       │    │         │ id (PK)         │
       │    │         │ quiz_id (FK)    │
       │    │         │ question_text   │
       │    │         │ question_type   │
       │    │         │ options (JSON)  │
       │    │         │ correct_answer  │
       │    │         │ explanation     │
       │    │         │ order           │
       │    │         └─────────────────┘
       │    │
       ▼    ▼
┌──────────────────────┐     ┌─────────────────────┐
│ USER_LEARNING_PATH   │     │    USER_PROGRESS    │
├──────────────────────┤     ├─────────────────────┤
│ id (PK)              │     │ id (PK)             │
│ user_id (FK)         │     │ user_id (FK)        │
│ learning_path_id(FK) │     │ lesson_id (FK)      │
│ started_at           │     │ status              │
│ completed_at         │     │ started_at          │
│ current_lesson_id    │     │ completed_at        │
│ ai_recommendations   │     │ time_spent_seconds  │
└──────────────────────┘     └─────────────────────┘
       │
       ▼
┌──────────────────────┐     ┌─────────────────────┐
│    QUIZ_RESULT       │     │  LEARNING_SESSION   │
├──────────────────────┤     ├─────────────────────┤
│ id (PK)              │     │ id (PK)             │
│ user_id (FK)         │     │ user_id (FK)        │
│ quiz_id (FK)         │     │ lesson_id (FK)      │
│ score                │     │ started_at          │
│ passed               │     │ ended_at            │
│ answers (JSON)       │     │ duration_seconds    │
│ attempt_number       │     │ activity_type       │
│ completed_at         │     └─────────────────────┘
└──────────────────────┘
       │
       ▼
┌──────────────────────┐     ┌─────────────────────┐
│ AI_INTERACTION_LOG   │     │   ONBOARDING_DATA   │
├──────────────────────┤     ├─────────────────────┤
│ id (PK)              │     │ id (PK)             │
│ user_id (FK)         │     │ user_id (FK)        │
│ session_context      │     │ career_goal         │
│ question_summary     │     │ prior_knowledge     │
│ response_summary     │     │ learning_background │
│ tokens_used          │     │ time_availability   │
│ model_used           │     │ completed_at        │
│ created_at           │     └─────────────────────┘
└──────────────────────┘
```

### 4.2 Prisma Schema

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ============== ENUMS ==============

enum UserRole {
  USER
  ADMIN
}

enum ProgressStatus {
  NOT_STARTED
  IN_PROGRESS
  COMPLETED
}

enum CareerGoal {
  FRONTEND
  BACKEND
  FULLSTACK
  AI_PYTHON
}

enum LearningBackground {
  NO_BACKGROUND
  SELF_TAUGHT
  BOOTCAMP
  CS_DEGREE
}

enum QuestionType {
  SINGLE_CHOICE
  MULTIPLE_CHOICE
}

enum ActivityType {
  LESSON_VIEW
  QUIZ_ATTEMPT
  AI_CHAT
}

// ============== USER ==============

model User {
  id        String    @id @default(uuid())
  email     String    @unique
  role      UserRole  @default(USER)
  createdAt DateTime  @default(now()) @map("created_at")
  updatedAt DateTime  @updatedAt @map("updated_at")
  deletedAt DateTime? @map("deleted_at")

  // Relations
  onboardingData    OnboardingData?
  userLearningPaths UserLearningPath[]
  userProgress      UserProgress[]
  quizResults       QuizResult[]
  learningSessions  LearningSession[]
  aiInteractionLogs AIInteractionLog[]
  otpCodes          OTPCode[]

  @@map("users")
}

model OTPCode {
  id        String   @id @default(uuid())
  userId    String?  @map("user_id")
  email     String
  code      String
  expiresAt DateTime @map("expires_at")
  attempts  Int      @default(0)
  verified  Boolean  @default(false)
  createdAt DateTime @default(now()) @map("created_at")

  user User? @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([email, code])
  @@map("otp_codes")
}

// ============== ONBOARDING ==============

model OnboardingData {
  id                 String             @id @default(uuid())
  userId             String             @unique @map("user_id")
  careerGoal         CareerGoal         @map("career_goal")
  priorKnowledge     Json               @map("prior_knowledge") // Array of skills
  learningBackground LearningBackground @map("learning_background")
  hoursPerWeek       Int                @map("hours_per_week")
  completedAt        DateTime           @default(now()) @map("completed_at")

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("onboarding_data")
}

// ============== LEARNING PATH ==============

model LearningPath {
  id             String  @id @default(uuid())
  name           String
  slug           String  @unique
  description    String
  icon           String?
  difficulty     String  // beginner, intermediate, advanced
  estimatedHours Int     @map("estimated_hours")
  isPublished    Boolean @default(false) @map("is_published")

  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  // Relations
  tracks            Track[]
  userLearningPaths UserLearningPath[]

  @@map("learning_paths")
}

model Track {
  id             String  @id @default(uuid())
  learningPathId String  @map("learning_path_id")
  name           String
  description    String?
  order          Int
  isOptional     Boolean @default(false) @map("is_optional")

  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  // Relations
  learningPath LearningPath @relation(fields: [learningPathId], references: [id], onDelete: Cascade)
  lessons      Lesson[]

  @@map("tracks")
}

model Lesson {
  id            String  @id @default(uuid())
  trackId       String  @map("track_id")
  title         String
  slug          String  @unique
  summary       String  @db.Text // AI-generated or manually written
  content       String? @db.Text // Extended content if any
  externalLinks Json    @default("[]") @map("external_links") // Array of {title, url, type}
  trackOrder    Int     @map("track_order")
  estimatedMins Int     @map("estimated_mins")

  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  // Relations
  track               Track[]              @relation
  quiz                Quiz?
  userProgress        UserProgress[]
  learningSessions    LearningSession[]
  aiInteractionLogs   AIInteractionLog[]
  prerequisites       LessonPrerequisite[] @relation("LessonPrerequisites")
  prerequisiteFor     LessonPrerequisite[] @relation("PrerequisiteFor")
  userLearningPaths   UserLearningPath[]   @relation("CurrentLesson")

  @@map("lessons")
}

model LessonPrerequisite {
  lessonId       String @map("lesson_id")
  prerequisiteId String @map("prerequisite_id")

  lesson       Lesson @relation("LessonPrerequisites", fields: [lessonId], references: [id], onDelete: Cascade)
  prerequisite Lesson @relation("PrerequisiteFor", fields: [prerequisiteId], references: [id], onDelete: Cascade)

  @@id([lessonId, prerequisiteId])
  @@map("lesson_prerequisites")
}

// ============== QUIZ ==============

model Quiz {
  id            String @id @default(uuid())
  lessonId      String @unique @map("lesson_id")
  title         String
  passThreshold Int    @default(70) @map("pass_threshold") // Percentage
  retryLimit    Int    @default(3) @map("retry_limit") // Per day
  retryCooldown Int    @default(60) @map("retry_cooldown") // Minutes

  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  // Relations
  lesson    Lesson         @relation(fields: [lessonId], references: [id], onDelete: Cascade)
  questions QuizQuestion[]
  results   QuizResult[]

  @@map("quizzes")
}

model QuizQuestion {
  id            String       @id @default(uuid())
  quizId        String       @map("quiz_id")
  questionText  String       @map("question_text") @db.Text
  questionType  QuestionType @default(SINGLE_CHOICE) @map("question_type")
  options       Json         // Array of {id, text}
  correctAnswer Json         @map("correct_answer") // Array of option ids
  explanation   String?      @db.Text
  order         Int

  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  quiz Quiz @relation(fields: [quizId], references: [id], onDelete: Cascade)

  @@map("quiz_questions")
}

// ============== USER PROGRESS ==============

model UserLearningPath {
  id               String    @id @default(uuid())
  userId           String    @map("user_id")
  learningPathId   String    @map("learning_path_id")
  currentLessonId  String?   @map("current_lesson_id")
  startedAt        DateTime  @default(now()) @map("started_at")
  completedAt      DateTime? @map("completed_at")
  aiRecommendations Json?    @map("ai_recommendations") // Initial AI suggestions

  // Relations
  user          User         @relation(fields: [userId], references: [id], onDelete: Cascade)
  learningPath  LearningPath @relation(fields: [learningPathId], references: [id], onDelete: Cascade)
  currentLesson Lesson?      @relation("CurrentLesson", fields: [currentLessonId], references: [id])

  @@unique([userId, learningPathId])
  @@map("user_learning_paths")
}

model UserProgress {
  id               String         @id @default(uuid())
  userId           String         @map("user_id")
  lessonId         String         @map("lesson_id")
  status           ProgressStatus @default(NOT_STARTED)
  startedAt        DateTime?      @map("started_at")
  completedAt      DateTime?      @map("completed_at")
  timeSpentSeconds Int            @default(0) @map("time_spent_seconds")

  // Relations
  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)
  lesson Lesson @relation(fields: [lessonId], references: [id], onDelete: Cascade)

  @@unique([userId, lessonId])
  @@map("user_progress")
}

model QuizResult {
  id            String   @id @default(uuid())
  userId        String   @map("user_id")
  quizId        String   @map("quiz_id")
  score         Int      // Percentage 0-100
  passed        Boolean
  answers       Json     // Array of {questionId, selectedOptions, isCorrect}
  attemptNumber Int      @map("attempt_number")
  completedAt   DateTime @default(now()) @map("completed_at")

  // Relations
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  quiz Quiz @relation(fields: [quizId], references: [id], onDelete: Cascade)

  @@map("quiz_results")
}

model LearningSession {
  id              String       @id @default(uuid())
  userId          String       @map("user_id")
  lessonId        String?      @map("lesson_id")
  activityType    ActivityType @map("activity_type")
  startedAt       DateTime     @default(now()) @map("started_at")
  endedAt         DateTime?    @map("ended_at")
  durationSeconds Int?         @map("duration_seconds")

  // Relations
  user   User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  lesson Lesson? @relation(fields: [lessonId], references: [id])

  @@map("learning_sessions")
}

// ============== AI ==============

model AIInteractionLog {
  id              String   @id @default(uuid())
  userId          String   @map("user_id")
  lessonId        String?  @map("lesson_id")
  sessionContext  String   @map("session_context") // "lesson", "track", "path", "general"
  questionSummary String   @map("question_summary") @db.VarChar(500)
  responseSummary String   @map("response_summary") @db.VarChar(500)
  tokensUsed      Int      @map("tokens_used")
  modelUsed       String   @map("model_used")
  createdAt       DateTime @default(now()) @map("created_at")

  // Relations
  user   User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  lesson Lesson? @relation(fields: [lessonId], references: [id])

  @@map("ai_interaction_logs")
}
```

---

## 5. API Design

### 5.1 Base URL
- **Production:** `https://api.devpathlearn.com/api/v1`
- **Development:** `http://localhost:3001/api/v1`

### 5.2 Response Format
```typescript
// Success Response
{
  "success": true,
  "data": { ... },
  "meta": {
    "timestamp": "2025-01-19T10:00:00Z",
    "requestId": "uuid"
  }
}

// Error Response
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Email is required",
    "details": { ... }
  },
  "meta": {
    "timestamp": "2025-01-19T10:00:00Z",
    "requestId": "uuid"
  }
}
```

### 5.3 API Endpoints

#### Authentication
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/auth/otp/request` | Request OTP code | No |
| POST | `/auth/otp/verify` | Verify OTP & get tokens | No |
| POST | `/auth/refresh` | Refresh access token | Refresh Token |
| POST | `/auth/logout` | Invalidate refresh token | Yes |
| GET | `/auth/me` | Get current user | Yes |

#### Onboarding
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/onboarding/questions` | Get onboarding questions | Yes |
| POST | `/onboarding/submit` | Submit onboarding answers | Yes |
| GET | `/onboarding/recommendation` | Get AI path recommendation | Yes |
| POST | `/onboarding/confirm` | Confirm selected path | Yes |

#### Learning Paths
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/learning-paths` | List all published paths | No |
| GET | `/learning-paths/:slug` | Get path details with tracks | No |
| GET | `/learning-paths/:slug/lessons` | Get all lessons in path | No |
| POST | `/learning-paths/:slug/enroll` | Enroll in learning path | Yes |

#### Lessons
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/lessons/:slug` | Get lesson details | Yes |
| POST | `/lessons/:slug/start` | Mark lesson as started | Yes |
| POST | `/lessons/:slug/complete` | Mark lesson as completed | Yes |
| GET | `/lessons/:slug/quiz` | Get lesson quiz | Yes |

#### Quiz
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/quizzes/:id` | Get quiz with questions | Yes |
| POST | `/quizzes/:id/submit` | Submit quiz answers | Yes |
| GET | `/quizzes/:id/results` | Get user's quiz history | Yes |

#### Progress
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/progress` | Get overall progress | Yes |
| GET | `/progress/path/:pathId` | Get path-specific progress | Yes |
| GET | `/progress/activity` | Get activity data (for graph) | Yes |
| POST | `/progress/session/start` | Start learning session | Yes |
| POST | `/progress/session/end` | End learning session | Yes |

#### AI Chatbot
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/ai/chat` | Send message to AI | Yes |
| GET | `/ai/chat/history` | Get chat history | Yes |
| GET | `/ai/chat/remaining` | Get remaining daily quota | Yes |

#### Admin (Role: ADMIN)
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/admin/learning-paths` | List all paths | Admin |
| POST | `/admin/learning-paths` | Create learning path | Admin |
| PUT | `/admin/learning-paths/:id` | Update learning path | Admin |
| DELETE | `/admin/learning-paths/:id` | Delete learning path | Admin |
| POST | `/admin/tracks` | Create track | Admin |
| PUT | `/admin/tracks/:id` | Update track | Admin |
| DELETE | `/admin/tracks/:id` | Delete track | Admin |
| POST | `/admin/lessons` | Create lesson | Admin |
| PUT | `/admin/lessons/:id` | Update lesson | Admin |
| DELETE | `/admin/lessons/:id` | Delete lesson | Admin |
| POST | `/admin/quizzes` | Create quiz | Admin |
| PUT | `/admin/quizzes/:id` | Update quiz | Admin |
| DELETE | `/admin/quizzes/:id` | Delete quiz | Admin |
| GET | `/admin/users` | List all users | Admin |
| GET | `/admin/analytics` | Get system analytics | Admin |

---

## 6. Authentication Flow

### 6.1 OTP Flow
```
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│  Client  │     │   API    │     │  Resend  │     │  Email   │
└────┬─────┘     └────┬─────┘     └────┬─────┘     └────┬─────┘
     │                │                │                │
     │ POST /auth/otp/request          │                │
     │ {email}        │                │                │
     │───────────────►│                │                │
     │                │                │                │
     │                │ Generate OTP   │                │
     │                │ (6 digits)     │                │
     │                │ Expire: 2 min  │                │
     │                │                │                │
     │                │ Send Email     │                │
     │                │───────────────►│                │
     │                │                │   Deliver      │
     │                │                │───────────────►│
     │                │                │                │
     │◄───────────────│                │                │
     │ {message: "OTP sent"}           │                │
     │                │                │                │
     │ POST /auth/otp/verify           │                │
     │ {email, code}  │                │                │
     │───────────────►│                │                │
     │                │                │                │
     │                │ Verify OTP     │                │
     │                │ Create User    │                │
     │                │ (if not exist) │                │
     │                │                │                │
     │◄───────────────│                │                │
     │ {accessToken,  │                │                │
     │  refreshToken, │                │                │
     │  user}         │                │                │
     │                │                │                │
```

### 6.2 JWT Token Structure
```typescript
// Access Token (15 minutes)
{
  "sub": "user-uuid",
  "email": "user@example.com",
  "role": "USER",
  "type": "access",
  "iat": 1705654800,
  "exp": 1705655700
}

// Refresh Token (7 days)
{
  "sub": "user-uuid",
  "type": "refresh",
  "jti": "unique-token-id", // For revocation
  "iat": 1705654800,
  "exp": 1706259600
}
```

### 6.3 Security Measures
- **Rate Limiting:** Max 5 OTP requests per email per hour
- **Brute Force Prevention:**
  - Max 5 failed attempts → lock 15 minutes
  - Exponential backoff: 1s, 2s, 4s, 8s...
- **OTP Expiry:** 2 minutes
- **Token Storage:**
  - Access Token: Memory (Zustand)
  - Refresh Token: HttpOnly Cookie

---

## 7. AI Integration

### 7.1 Context Injection Strategy (MVP)

```typescript
// AI Context Builder
interface AIContext {
  user: {
    learningPath: string;
    currentTrack: string;
    currentLesson: string;
    completedLessons: string[];
    recentQuizScores: { lesson: string; score: number }[];
  };
  lesson: {
    title: string;
    summary: string;
    keyTopics: string[];
  };
  previousLessons: {
    title: string;
    summary: string;
  }[];
}

// System Prompt Template
const SYSTEM_PROMPT = `
You are a helpful learning assistant for DevPath, an IT learning platform.

CONTEXT:
- User is learning: {{learningPath}}
- Current track: {{currentTrack}}
- Current lesson: {{currentLesson}}

LESSON CONTENT:
{{lessonSummary}}

KEY TOPICS:
{{keyTopics}}

PREVIOUS LESSONS USER COMPLETED:
{{previousLessons}}

RULES:
1. Only answer questions related to the current lesson and previous lessons
2. If asked about topics not yet covered, politely redirect
3. Provide examples when explaining concepts
4. Keep responses concise but helpful
5. Respond in the same language the user uses (Vietnamese or English)

If the user asks something completely unrelated to programming/IT,
politely remind them this is a learning assistant.
`;
```

### 7.2 Rate Limiting
```typescript
// Daily quota per user
const AI_QUOTA = {
  FREE: 10,    // 10 messages/day
  PRO: 100     // Future: Pro tier
};

// Quota reset: 00:00 UTC daily
```

### 7.3 Fallback Strategy
```typescript
// Graceful degradation
try {
  const response = await aiProvider.chat(prompt);
  return response;
} catch (error) {
  if (error.code === 'TIMEOUT' || error.code === 'RATE_LIMIT') {
    return {
      type: 'fallback',
      message: 'Hệ thống AI đang bận. Vui lòng thử lại sau.',
      suggestedActions: [
        'Xem lại nội dung bài học',
        'Thử làm quiz',
        'Đọc tài liệu tham khảo'
      ]
    };
  }
  throw error;
}
```

---

## 8. Rule-based Validation

### 8.1 Rules Configuration
```typescript
// config/learning-rules.json
{
  "quiz": {
    "passThreshold": 70,
    "retryLimit": 3,
    "retryCooldownMinutes": 60
  },
  "progress": {
    "lessonCompletionRequiresQuizPass": true,
    "allowSkipOptionalTracks": true,
    "allowReviewCompletedLessons": true
  },
  "advancement": {
    "requireAllPrerequisites": true,
    "allowAdvancedPlacement": true,
    "advancedPlacementMinScore": 80
  }
}
```

### 8.2 Validation Logic
```typescript
// Rule: Can user access this lesson?
async function canAccessLesson(userId: string, lessonId: string): Promise<{
  allowed: boolean;
  reason?: string;
}> {
  const lesson = await getLesson(lessonId);
  const userProgress = await getUserProgress(userId);

  // Check prerequisites
  for (const prereq of lesson.prerequisites) {
    const prereqProgress = userProgress.find(p => p.lessonId === prereq.id);

    if (!prereqProgress || prereqProgress.status !== 'COMPLETED') {
      return {
        allowed: false,
        reason: `Bạn cần hoàn thành bài "${prereq.title}" trước`
      };
    }

    // Check if quiz was passed
    if (rules.progress.lessonCompletionRequiresQuizPass) {
      const quizResult = await getLatestQuizResult(userId, prereq.quizId);
      if (!quizResult?.passed) {
        return {
          allowed: false,
          reason: `Bạn cần đạt quiz bài "${prereq.title}" (tối thiểu ${rules.quiz.passThreshold}%)`
        };
      }
    }
  }

  return { allowed: true };
}
```

---

## 9. Folder Structure

### 9.1 Frontend (React + Vite)
```
frontend/
├── public/
│   ├── favicon.ico
│   └── locales/
│       ├── vi/
│       │   └── translation.json
│       └── en/
│           └── translation.json
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── vite-env.d.ts
│   │
│   ├── components/
│   │   ├── ui/                    # Reusable UI components
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Loading.tsx
│   │   │   └── index.ts
│   │   ├── layout/
│   │   │   ├── Header.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Footer.tsx
│   │   │   └── DashboardLayout.tsx
│   │   ├── auth/
│   │   │   ├── OTPInput.tsx
│   │   │   └── ProtectedRoute.tsx
│   │   ├── learning/
│   │   │   ├── LessonCard.tsx
│   │   │   ├── ProgressBar.tsx
│   │   │   ├── QuizQuestion.tsx
│   │   │   └── ActivityGraph.tsx
│   │   └── chat/
│   │       ├── ChatWindow.tsx
│   │       ├── ChatMessage.tsx
│   │       └── ChatInput.tsx
│   │
│   ├── pages/
│   │   ├── Landing.tsx
│   │   ├── Auth/
│   │   │   └── Login.tsx
│   │   ├── Onboarding/
│   │   │   ├── index.tsx
│   │   │   ├── Questions.tsx
│   │   │   └── Recommendation.tsx
│   │   ├── Dashboard/
│   │   │   ├── index.tsx
│   │   │   ├── Progress.tsx
│   │   │   └── Settings.tsx
│   │   ├── Learning/
│   │   │   ├── PathOverview.tsx
│   │   │   ├── Lesson.tsx
│   │   │   └── Quiz.tsx
│   │   ├── Admin/
│   │   │   ├── index.tsx
│   │   │   ├── Paths.tsx
│   │   │   ├── Lessons.tsx
│   │   │   └── Users.tsx
│   │   └── NotFound.tsx
│   │
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useProgress.ts
│   │   ├── useQuiz.ts
│   │   └── useChat.ts
│   │
│   ├── stores/
│   │   ├── authStore.ts
│   │   ├── progressStore.ts
│   │   └── chatStore.ts
│   │
│   ├── services/
│   │   ├── api.ts                 # Axios instance
│   │   ├── authService.ts
│   │   ├── learningService.ts
│   │   ├── quizService.ts
│   │   └── aiService.ts
│   │
│   ├── lib/
│   │   ├── utils.ts
│   │   ├── constants.ts
│   │   └── validations.ts
│   │
│   ├── types/
│   │   ├── auth.ts
│   │   ├── learning.ts
│   │   ├── quiz.ts
│   │   └── api.ts
│   │
│   └── styles/
│       └── globals.css
│
├── .env.example
├── .eslintrc.cjs
├── tailwind.config.js
├── tsconfig.json
├── vite.config.ts
└── package.json
```

### 9.2 Backend (NestJS)
```
backend/
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts
│
├── src/
│   ├── main.ts
│   ├── app.module.ts
│   │
│   ├── common/
│   │   ├── decorators/
│   │   │   ├── roles.decorator.ts
│   │   │   └── current-user.decorator.ts
│   │   ├── guards/
│   │   │   ├── jwt-auth.guard.ts
│   │   │   └── roles.guard.ts
│   │   ├── interceptors/
│   │   │   ├── transform.interceptor.ts
│   │   │   └── logging.interceptor.ts
│   │   ├── filters/
│   │   │   └── http-exception.filter.ts
│   │   ├── pipes/
│   │   │   └── validation.pipe.ts
│   │   └── dto/
│   │       └── pagination.dto.ts
│   │
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── auth.module.ts
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── strategies/
│   │   │   │   ├── jwt.strategy.ts
│   │   │   │   └── jwt-refresh.strategy.ts
│   │   │   └── dto/
│   │   │       ├── request-otp.dto.ts
│   │   │       └── verify-otp.dto.ts
│   │   │
│   │   ├── users/
│   │   │   ├── users.module.ts
│   │   │   ├── users.controller.ts
│   │   │   ├── users.service.ts
│   │   │   └── dto/
│   │   │
│   │   ├── onboarding/
│   │   │   ├── onboarding.module.ts
│   │   │   ├── onboarding.controller.ts
│   │   │   ├── onboarding.service.ts
│   │   │   └── dto/
│   │   │
│   │   ├── learning-paths/
│   │   │   ├── learning-paths.module.ts
│   │   │   ├── learning-paths.controller.ts
│   │   │   ├── learning-paths.service.ts
│   │   │   └── dto/
│   │   │
│   │   ├── lessons/
│   │   │   ├── lessons.module.ts
│   │   │   ├── lessons.controller.ts
│   │   │   ├── lessons.service.ts
│   │   │   └── dto/
│   │   │
│   │   ├── quizzes/
│   │   │   ├── quizzes.module.ts
│   │   │   ├── quizzes.controller.ts
│   │   │   ├── quizzes.service.ts
│   │   │   └── dto/
│   │   │
│   │   ├── progress/
│   │   │   ├── progress.module.ts
│   │   │   ├── progress.controller.ts
│   │   │   ├── progress.service.ts
│   │   │   └── dto/
│   │   │
│   │   ├── ai/
│   │   │   ├── ai.module.ts
│   │   │   ├── ai.controller.ts
│   │   │   ├── ai.service.ts
│   │   │   ├── prompts/
│   │   │   │   └── chat-system.prompt.ts
│   │   │   └── dto/
│   │   │
│   │   ├── email/
│   │   │   ├── email.module.ts
│   │   │   ├── email.service.ts
│   │   │   └── templates/
│   │   │       └── otp.template.ts
│   │   │
│   │   └── admin/
│   │       ├── admin.module.ts
│   │       ├── admin.controller.ts
│   │       └── admin.service.ts
│   │
│   ├── config/
│   │   ├── configuration.ts
│   │   ├── learning-rules.json
│   │   └── validation.ts
│   │
│   └── prisma/
│       ├── prisma.module.ts
│       └── prisma.service.ts
│
├── test/
│   ├── app.e2e-spec.ts
│   └── jest-e2e.json
│
├── .env.example
├── .eslintrc.js
├── nest-cli.json
├── tsconfig.json
├── tsconfig.build.json
├── Dockerfile
├── docker-compose.yml
└── package.json
```

---

## 10. Environment Variables

### 10.1 Frontend (.env)
```bash
# API
VITE_API_URL=http://localhost:3001/api/v1

# Feature Flags
VITE_ENABLE_AI_CHAT=true
VITE_ENABLE_ANALYTICS=false
```

### 10.2 Backend (.env)
```bash
# App
NODE_ENV=development
PORT=3001
API_PREFIX=api/v1

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/devpath

# Redis
REDIS_URL=redis://localhost:6379

# JWT
JWT_ACCESS_SECRET=your-access-secret-key
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_SECRET=your-refresh-secret-key
JWT_REFRESH_EXPIRES_IN=7d

# Email (Resend)
RESEND_API_KEY=re_xxxxxxxxxxxxx
EMAIL_FROM=noreply@devpathlearn.com

# AI
AI_PROVIDER=groq  # or openai, anthropic
OPENAI_API_KEY=sk-xxxxxxxxxxxxx
GROQ_API_KEY=gsk_xxxxxxxxxxxxx
AI_MODEL=llama-3.1-70b-versatile  # or gpt-4o-mini

# Rate Limiting
RATE_LIMIT_TTL=60000
RATE_LIMIT_MAX=100

# Sentry
SENTRY_DSN=https://xxxxx@sentry.io/xxxxx
```

---

## 11. Development Phases

### Phase 1: Foundation (Week 1-2)
- [ ] Project setup (Vite + NestJS + Prisma)
- [ ] Database schema & migrations
- [ ] Authentication (OTP + JWT)
- [ ] Basic UI components (Tailwind)
- [ ] Protected routes

### Phase 2: Core Features (Week 3-4)
- [ ] Onboarding flow
- [ ] Learning path CRUD (Admin)
- [ ] Lesson display
- [ ] Quiz system
- [ ] Progress tracking

### Phase 3: AI Integration (Week 5-6)
- [ ] AI service integration
- [ ] Context injection chatbot
- [ ] Rate limiting
- [ ] Chat UI

### Phase 4: Polish (Week 7-8)
- [ ] Activity graph
- [ ] i18n (VI/EN)
- [ ] Error handling
- [ ] Loading states
- [ ] Responsive design

### Phase 5: Deployment (Week 9)
- [ ] VPS setup (Nginx, PM2, SSL)
- [ ] CI/CD pipeline
- [ ] Monitoring (Sentry)
- [ ] Domain configuration

### Phase 6: Content (Week 10+)
- [ ] Create Frontend ReactJS path content
- [ ] AI-assisted summary generation
- [ ] Quiz content creation
- [ ] Testing & QA

---

## 12. Testing Strategy

### 12.1 Unit Tests (Jest)
```typescript
// Focus areas:
- Auth service (OTP generation, verification)
- Quiz scoring logic
- Progress calculation
- Rule validation
- AI context builder
```

### 12.2 Test Coverage Target
- Services: 80%+
- Critical paths: 90%+
- Controllers: 60%+

---

## 13. Deployment Architecture

### 13.1 VPS Setup
```
┌─────────────────────────────────────────────────────────────┐
│                    VPS (Hetzner CX21)                       │
│                    Ubuntu 22.04 LTS                         │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                     Nginx                            │   │
│  │              (Reverse Proxy + SSL)                   │   │
│  │                                                      │   │
│  │  api.devpathlearn.com → localhost:3001              │   │
│  └─────────────────────────────────────────────────────┘   │
│                          │                                  │
│                          ▼                                  │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                    PM2                               │   │
│  │              (Process Manager)                       │   │
│  │                                                      │   │
│  │  ┌─────────────────────────────────────────────┐    │   │
│  │  │           NestJS Application                │    │   │
│  │  │              (Port 3001)                    │    │   │
│  │  └─────────────────────────────────────────────┘    │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                   Docker                             │   │
│  │  ┌─────────────┐  ┌─────────────┐                   │   │
│  │  │    Redis    │  │  (Optional) │                   │   │
│  │  │    :6379    │  │   pgAdmin   │                   │   │
│  │  └─────────────┘  └─────────────┘                   │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 13.2 CI/CD Pipeline (GitHub Actions)
```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Setup pnpm
        uses: pnpm/action-setup@v4
        with:
          version: 9
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'
      - name: Install dependencies
        run: pnpm install --frozen-lockfile
      - name: Run tests
        run: pnpm test

  deploy-frontend:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'

  deploy-backend:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to VPS
        uses: appleboy/ssh-action@v1.0.0
        with:
          host: ${{ secrets.VPS_HOST }}
          username: ${{ secrets.VPS_USER }}
          key: ${{ secrets.VPS_SSH_KEY }}
          script: |
            cd /var/www/devpath-api
            git pull origin main
            pnpm install --frozen-lockfile --prod
            npx prisma migrate deploy
            pm2 restart devpath-api
```

---

## 14. Security Checklist

- [ ] HTTPS everywhere (Let's Encrypt)
- [ ] CORS configured properly
- [ ] Rate limiting on all endpoints
- [ ] Input validation (Zod/class-validator)
- [ ] SQL injection prevention (Prisma)
- [ ] XSS prevention (React escaping)
- [ ] CSRF protection (SameSite cookies)
- [ ] Secrets in environment variables
- [ ] Secure headers (Helmet)
- [ ] Dependency vulnerability scanning

---

## 15. Monitoring & Logging

### 15.1 Logging Format
```typescript
// Winston configuration
{
  level: 'info',
  format: combine(
    timestamp(),
    json()
  ),
  defaultMeta: { service: 'devpath-api' },
  transports: [
    new transports.File({ filename: 'logs/error.log', level: 'error' }),
    new transports.File({ filename: 'logs/combined.log' })
  ]
}
```

### 15.2 Sentry Integration
```typescript
// Track:
- Unhandled exceptions
- API response times > 3s
- AI service failures
- Authentication failures
```

---

## 16. Future Roadmap

### Phase 2 Features
- [ ] RAG-based chatbot (pgvector)
- [ ] Code runner integration
- [ ] Full DAG lesson ordering
- [ ] Payment integration (VNPay/MoMo)
- [ ] Pro tier with unlimited AI chat

### Phase 3 Features
- [ ] Mobile app (React Native)
- [ ] Interview practice mode
- [ ] Community features
- [ ] Mentor matching
- [ ] Certificate generation

---

## 17. Appendix

### 17.1 Sample Learning Path Structure
```json
{
  "name": "Frontend ReactJS Developer",
  "slug": "frontend-reactjs",
  "description": "Lộ trình hoàn chỉnh để trở thành Frontend Developer với ReactJS",
  "difficulty": "beginner",
  "estimatedHours": 120,
  "tracks": [
    {
      "name": "Web Fundamentals",
      "order": 1,
      "lessons": [
        { "title": "HTML Basics", "order": 1 },
        { "title": "CSS Fundamentals", "order": 2 },
        { "title": "CSS Flexbox & Grid", "order": 3 }
      ]
    },
    {
      "name": "JavaScript Core",
      "order": 2,
      "lessons": [
        { "title": "JavaScript Basics", "order": 1 },
        { "title": "DOM Manipulation", "order": 2 },
        { "title": "ES6+ Features", "order": 3 },
        { "title": "Async JavaScript", "order": 4 }
      ]
    },
    {
      "name": "React Fundamentals",
      "order": 3,
      "lessons": [
        { "title": "React Introduction", "order": 1 },
        { "title": "Components & Props", "order": 2 },
        { "title": "State & Lifecycle", "order": 3 },
        { "title": "Hooks", "order": 4 },
        { "title": "Forms & Events", "order": 5 }
      ]
    },
    {
      "name": "React Advanced",
      "order": 4,
      "lessons": [
        { "title": "Context API", "order": 1 },
        { "title": "React Router", "order": 2 },
        { "title": "State Management", "order": 3 },
        { "title": "API Integration", "order": 4 },
        { "title": "Performance Optimization", "order": 5 }
      ]
    },
    {
      "name": "Tools & Deployment",
      "order": 5,
      "isOptional": true,
      "lessons": [
        { "title": "Git & GitHub", "order": 1 },
        { "title": "Build Tools (Vite)", "order": 2 },
        { "title": "Deployment", "order": 3 }
      ]
    }
  ]
}
```

### 17.2 Onboarding Questions
```json
{
  "questions": [
    {
      "id": "career_goal",
      "type": "single_choice",
      "question": "Bạn muốn trở thành?",
      "options": [
        { "value": "FRONTEND", "label": "Frontend Developer" },
        { "value": "BACKEND", "label": "Backend Developer" },
        { "value": "FULLSTACK", "label": "Fullstack Developer" },
        { "value": "AI_PYTHON", "label": "AI/Python Developer", "disabled": true, "badge": "Coming Soon" }
      ]
    },
    {
      "id": "prior_knowledge",
      "type": "multi_choice",
      "question": "Bạn đã biết những gì?",
      "options": [
        { "value": "html", "label": "HTML" },
        { "value": "css", "label": "CSS" },
        { "value": "javascript", "label": "JavaScript" },
        { "value": "react", "label": "React" },
        { "value": "nodejs", "label": "Node.js" },
        { "value": "git", "label": "Git" },
        { "value": "none", "label": "Chưa biết gì", "exclusive": true }
      ]
    },
    {
      "id": "learning_background",
      "type": "single_choice",
      "question": "Background học tập của bạn?",
      "options": [
        { "value": "NO_BACKGROUND", "label": "Chưa có kiến thức IT" },
        { "value": "SELF_TAUGHT", "label": "Tự học qua internet" },
        { "value": "BOOTCAMP", "label": "Đã học qua bootcamp/khóa học" },
        { "value": "CS_DEGREE", "label": "Có bằng CNTT/Khoa học máy tính" }
      ]
    },
    {
      "id": "hours_per_week",
      "type": "single_choice",
      "question": "Bạn có thể dành bao nhiêu giờ/tuần để học?",
      "options": [
        { "value": 5, "label": "5 giờ/tuần" },
        { "value": 10, "label": "10 giờ/tuần" },
        { "value": 20, "label": "20 giờ/tuần" },
        { "value": 40, "label": "40+ giờ/tuần (Full-time)" }
      ]
    }
  ]
}
```

---

**Document End**

*This document serves as the single source of truth for the DevPath project. Update this document whenever significant architectural decisions are made.*
