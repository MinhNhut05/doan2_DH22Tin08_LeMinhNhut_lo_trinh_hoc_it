# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

DevPath is an AI-assisted personalized learning path system for IT learners in Vietnam. It helps users determine where to start, what to learn next, and how ready they are to advance using AI analysis and rule-based validation.

## Tech Stack

- **Frontend**: React 18 + Vite + TypeScript, Zustand (state), React Query (data fetching), Tailwind CSS, react-i18next (VI/EN)
- **Backend**: NestJS + TypeScript, Prisma ORM, PostgreSQL 16, Redis 7
- **AI**: OpenAI/Groq/Anthropic via LangChain.js
- **Infrastructure**: Docker, Vercel (frontend), VPS with Nginx (backend)

## Development Commands

### Docker (Primary Development Method)
```bash
docker-compose up -d                    # Start core services (postgres, redis, backend, frontend)
docker-compose --profile tools up -d    # Include pgAdmin, Redis Commander, Mailhog
docker-compose down                     # Stop all services
docker-compose logs -f backend          # View backend logs
```

### Backend (NestJS - runs on port 3001)
```bash
cd backend
pnpm run start:dev     # Development server with hot reload
pnpm run build         # Production build
pnpm run test          # Run tests
pnpm run lint          # Lint code
npx prisma studio     # Database GUI
npx prisma migrate dev    # Run migrations
npx prisma db seed        # Seed database
```

### Frontend (React + Vite - runs on port 5173)
```bash
cd frontend
pnpm run dev           # Development server
pnpm run build         # Production build
pnpm run preview       # Preview production build
pnpm run lint          # Lint code
```

## Architecture

### Database Schema (Prisma)
The schema is in `prisma/schema.prisma`. Key entities:
- **User/OTPCode/RefreshToken**: Email + OTP authentication with JWT tokens
- **LearningPath/Track/Lesson**: Hierarchical learning structure with prerequisite DAG support
- **TrackLesson**: Junction table allowing lessons to be reused across tracks
- **Quiz/QuizQuestion**: Per-lesson quizzes with pass thresholds and retry limits
- **UserProgress/UserLearningPath/QuizResult**: Progress tracking per user
- **AIInteractionLog/AIUsageQuota**: AI chatbot usage tracking and rate limiting

### Backend Module Structure
Located in `backend/src/modules/`:
- `auth/`: OTP + JWT authentication
- `users/`: User management
- `onboarding/`: Initial user questionnaire
- `learning-paths/`: Learning path CRUD
- `lessons/`: Lesson management
- `quizzes/`: Quiz system
- `progress/`: User progress tracking
- `ai/`: AI chatbot with context injection
- `admin/`: Admin panel endpoints

### Frontend Structure
Located in `frontend/src/`:
- `components/`: Reusable UI components (ui/, layout/, auth/, learning/, chat/)
- `pages/`: Route pages (Landing, Auth, Onboarding, Dashboard, Learning, Admin)
- `stores/`: Zustand stores (authStore, progressStore, chatStore)
- `services/`: API service layer with Axios
- `hooks/`: Custom React hooks

## API Design

- Base URL: `http://localhost:3001/api/v1`
- Uses standardized response format with `success`, `data`, `error`, and `meta` fields
- JWT auth with access token (15min) + refresh token (7 days)
- Rate limiting on all endpoints

## Key Configuration Files

- `.env.example`: All environment variables (copy to `.env`)
- `pnpm-workspace.yaml`: Monorepo workspace configuration
- `docker-compose.yml`: Development services
- `docker-compose.prod.yml`: Production deployment
- `prisma/schema.prisma`: Database schema
- `CONTEXT.md`: Full technical specification document

## Access URLs (Development)

| Service | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:3001/api/v1 |
| pgAdmin | http://localhost:5050 |
| Redis Commander | http://localhost:8081 |
| Mailhog | http://localhost:8025 |
