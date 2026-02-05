import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service.js';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  /**
   * Health check endpoint
   * GET /api/v1/health
   *
   * This endpoint is used to verify:
   * 1. The server is running
   * 2. Database connection is working
   */
  @Get('health')
  async getHealth(): Promise<{ status: string; userCount: number }> {
    return this.appService.getHealth();
  }
}
