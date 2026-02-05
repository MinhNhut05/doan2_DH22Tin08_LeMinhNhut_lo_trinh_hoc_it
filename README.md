# DevPath Learning

AI-assisted personalized learning path for IT learners in Vietnam.

## About

DevPath is a learning platform that helps Vietnamese IT learners find their personalized learning path. The system uses AI to:

- **Assess current skills** - Determine where you should start based on your existing knowledge
- **Recommend learning paths** - Suggest what to learn next based on your goals and progress
- **Track readiness** - Evaluate when you're ready to advance to more complex topics
- **Provide AI tutoring** - Answer questions and explain concepts during learning

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| Frontend | React 18, Vite, TypeScript, Tailwind CSS, Zustand, React Query |
| Backend | NestJS, TypeScript, Prisma ORM |
| Database | PostgreSQL 16, Redis 7 |
| AI | LangChain.js (OpenAI/Groq/Anthropic) |
| Infrastructure | Docker, Vercel, VPS with Nginx |

## Getting Started

```bash
# Clone and install dependencies
git clone https://github.com/your-username/devpath-learning.git
cd devpath-learning
pnpm install

# Start with Docker (recommended)
docker-compose up -d

# Or run manually
cd backend && pnpm run start:dev   # Backend on :3001
cd frontend && pnpm run dev        # Frontend on :5173
```

## Documentation

- [Technical Context](./CONTEXT.md) - Full technical specification
- [Wireframes](./docs/WIREFRAMES.md) - UI/UX designs
- [Progress Tracking](./TRACKPAD.md) - Learning progress log

## Author

| Info | Detail |
|------|--------|
| Name | Lê Minh Nhựt |
| Student ID | 225523 |
| Class | DH22TIN08 |
