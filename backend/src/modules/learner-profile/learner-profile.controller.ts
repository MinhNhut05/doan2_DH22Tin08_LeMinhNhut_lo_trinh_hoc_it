// learner-profile.controller.ts - Protected GET /learner-profile/me endpoint
//
// Single route: GET /api/v1/learner-profile/me
// Returns the canonical learner profile for the authenticated user.
//
// @UseGuards(JwtAuthGuard) at class level = all routes require login.
// @CurrentUser('id') extracts userId from JWT payload.
// TransformInterceptor (global) auto-wraps response into:
//   { success: true, data: {...}, meta: {...} }

import { Controller, Get, UseGuards } from '@nestjs/common';

import { JwtAuthGuard } from '../auth/index.js';
import { CurrentUser } from '../../common/decorators/index.js';
import { LearnerProfileService } from './learner-profile.service.js';

@Controller('learner-profile')
@UseGuards(JwtAuthGuard)
export class LearnerProfileController {
  constructor(
    private readonly learnerProfileService: LearnerProfileService,
  ) {}

  // ── GET /api/v1/learner-profile/me ────────────────────────────────────
  //
  // Returns canonical profile fields + roundsCompleted for the current user.
  // Throws 404 if user has not completed onboarding yet.
  @Get('me')
  async getMyProfile(@CurrentUser('id') userId: string) {
    return this.learnerProfileService.getMyProfile(userId);
  }
}
