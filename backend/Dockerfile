# ===========================================
# Backend Dockerfile (NestJS) - Monorepo Support
# ===========================================

# Base image
FROM node:20-alpine AS base
WORKDIR /app
RUN apk add --no-cache libc6-compat openssl
RUN corepack enable

# ===========================================
# Development stage
# ===========================================
FROM base AS development
ENV NODE_ENV=development

# Copy workspace config and lock file from root (via build context)
COPY pnpm-lock.yaml pnpm-workspace.yaml ./
COPY backend/package.json ./backend/

# Install dependencies for backend only
WORKDIR /app/backend
RUN pnpm install --frozen-lockfile

# Copy prisma schema for generation
COPY backend/prisma ./prisma/

# Generate Prisma client
RUN npx prisma generate

# Copy source code
COPY backend/ .

# Expose port
EXPOSE 3001

# Start development server
CMD ["pnpm", "run", "start:dev"]

# ===========================================
# Build stage
# ===========================================
FROM base AS builder
ENV NODE_ENV=production
WORKDIR /app

# Copy workspace config and lock file
COPY pnpm-lock.yaml pnpm-workspace.yaml ./
COPY backend/package.json ./backend/

# Install dependencies
WORKDIR /app/backend
RUN pnpm install --frozen-lockfile

# Copy prisma schema
COPY backend/prisma ./prisma/

# Generate Prisma client
RUN npx prisma generate

# Copy source code
COPY backend/ .

# Build application
RUN pnpm run build

# ===========================================
# Production stage
# ===========================================
FROM base AS production
ENV NODE_ENV=production
WORKDIR /app

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nestjs

# Copy necessary files from builder
COPY --from=builder --chown=nestjs:nodejs /app/backend/dist ./dist
COPY --from=builder --chown=nestjs:nodejs /app/backend/node_modules ./node_modules
COPY --from=builder --chown=nestjs:nodejs /app/backend/package.json ./
COPY --from=builder --chown=nestjs:nodejs /app/backend/prisma ./prisma

# Switch to non-root user
USER nestjs

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3001/api/v1/health || exit 1

# Start production server
CMD ["node", "dist/main.js"]
