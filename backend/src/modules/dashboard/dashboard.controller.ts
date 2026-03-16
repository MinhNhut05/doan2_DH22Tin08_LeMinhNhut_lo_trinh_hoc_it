// dashboard.controller.ts - Dashboard endpoints
//
// Controller cho Dashboard overview:
//   - GET /api/v1/dashboard/overview → aggregate data cho trang Dashboard
//
// @UseGuards(JwtAuthGuard) ở class level → tất cả routes cần login.
// @CurrentUser('id') lấy userId từ JWT payload (không dùng @Req()).
// TransformInterceptor (global) tự động wrap response thành:
//   { success: true, data: {...}, meta: {...} }

import { Controller, Get, UseGuards } from '@nestjs/common';

import { JwtAuthGuard } from '../auth/index.js';
import { CurrentUser } from '../../common/decorators/index.js';
import { DashboardService } from './dashboard.service.js';

@Controller('dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  // ── GET /api/v1/dashboard/overview ──────────────────────────────────
  //
  // Trả về tổng hợp data cho Dashboard page:
  //   - user info (displayName, email, tier, avatar)
  //   - enrolledPaths (id, name, slug, progress %, currentLesson)
  //   - recentActivity (totalStudyMinutes, currentStreak, sessionsThisWeek)
  //   - aiQuota (used, limit, tier)
  //
  // TransformInterceptor auto-wrap → frontend nhận { success, data, meta }
  @Get('overview')
  async getOverview(@CurrentUser('id') userId: string) {
    return this.dashboardService.getOverview(userId);
  }
}
