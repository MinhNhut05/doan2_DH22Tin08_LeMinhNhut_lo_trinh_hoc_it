// src/prisma/prisma.module.ts
// Global module that provides PrismaService throughout the application

import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service.js';

/**
 * @Global() decorator makes this module available everywhere
 * without needing to import it in every module.
 *
 * This is a common pattern for database services since they're
 * used in almost every module.
 */
@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService], // Export so other modules can inject PrismaService
})
export class PrismaModule {}
