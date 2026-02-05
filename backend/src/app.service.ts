import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service.js';

@Injectable()
export class AppService {
  // Inject PrismaService through constructor
  // This is Dependency Injection pattern in NestJS
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Health check endpoint that verifies database connection
   * Returns user count to confirm DB is working
   */
  async getHealth(): Promise<{ status: string; userCount: number }> {
    const userCount = await this.prisma.user.count();
    return {
      status: 'ok',
      userCount,
    };
  }
}
