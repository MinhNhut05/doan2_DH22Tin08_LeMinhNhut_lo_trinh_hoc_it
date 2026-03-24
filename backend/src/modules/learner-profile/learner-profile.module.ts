// learner-profile.module.ts - Canonical learner-profile feature module
//
// Why export LearnerProfileService?
//   - Cross-module reuse: future modules (onboarding, lessons, recommendations)
//     can inject LearnerProfileService without duplicating profile logic.
//   - NestJS encapsulation: providers are private by default. Without exports,
//     other modules cannot inject this service even if they import this module.
//   - Single owner: D-12 says one dedicated service owns profile rules.
//
// Why import AuthModule?
//   - JwtAuthGuard lives in AuthModule. The controller uses @UseGuards(JwtAuthGuard).
//   - AuthModule exports JwtAuthGuard, so importing AuthModule makes the guard
//     available to LearnerProfileController.

import { Module } from '@nestjs/common';

import { AuthModule } from '../auth/index.js';
import { LearnerProfileController } from './learner-profile.controller.js';
import { LearnerProfileService } from './learner-profile.service.js';

@Module({
  imports: [AuthModule],
  controllers: [LearnerProfileController],
  providers: [LearnerProfileService],
  exports: [LearnerProfileService],
})
export class LearnerProfileModule {}
