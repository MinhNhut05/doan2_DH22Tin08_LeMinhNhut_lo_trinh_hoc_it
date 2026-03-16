// dashboard.module.ts - Dashboard Module
//
// Module tổng hợp data cho trang Dashboard:
//   - Import AuthModule: cần JwtAuthGuard cho authentication
//   - PrismaModule là @Global() → không cần import, inject trực tiếp PrismaService

import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/index.js';
import { DashboardController } from './dashboard.controller.js';
import { DashboardService } from './dashboard.service.js';

@Module({
  imports: [AuthModule],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
