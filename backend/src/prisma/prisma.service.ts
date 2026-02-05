// src/prisma/prisma.service.ts
// PrismaService - Wrapper for Prisma Client with NestJS lifecycle hooks
// Prisma 7 requires an adapter for database connections

import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);
  private readonly pool: Pool;

  constructor() {
    // Prisma 7: Requires adapter for database connection
    // We use @prisma/adapter-pg with node-postgres (pg) driver

    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      throw new Error('DATABASE_URL environment variable is not set');
    }

    // Create a PostgreSQL connection pool
    // Pool manages multiple connections efficiently
    const pool = new Pool({
      connectionString: databaseUrl,
    });

    // Create Prisma adapter for PostgreSQL
    const adapter = new PrismaPg(pool);

    // Initialize PrismaClient with adapter
    super({
      adapter,
      log:
        process.env.NODE_ENV === 'development'
          ? ['query', 'info', 'warn', 'error']
          : ['error'],
    });

    this.pool = pool;
  }

  /**
   * NestJS lifecycle hook - Called when module is initialized
   * Connection is already established through the pool
   */
  async onModuleInit(): Promise<void> {
    // Test connection by running a simple query
    try {
      await this.$queryRaw`SELECT 1`;
      this.logger.log('Database connected successfully');
    } catch (error) {
      this.logger.error('Failed to connect to database', error);
      throw error;
    }
  }

  /**
   * NestJS lifecycle hook - Called when module is being destroyed
   * Clean up both Prisma and the underlying pool
   */
  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
    await this.pool.end(); // Close all pool connections
    this.logger.log('Database disconnected');
  }
}
