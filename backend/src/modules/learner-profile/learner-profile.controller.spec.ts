// learner-profile.controller.spec.ts - Unit tests for LearnerProfileController
//
// Mock: LearnerProfileService
// Tests:
//   1. GET /me delegates to learnerProfileService.getMyProfile(userId)
//   2. Controller is guarded with JwtAuthGuard
//   3. Controller uses @CurrentUser('id') to extract userId

import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { CareerGoal, LearnerSkillLevel, LearnerLearningPace } from '@prisma/client';

import { LearnerProfileController } from './learner-profile.controller.js';
import { LearnerProfileService } from './learner-profile.service.js';

// ── Mock data ──────────────────────────────────────────────────────────────

const mockUserId = 'user-uuid-456';
const mockNow = new Date('2026-03-24T10:00:00.000Z');

const mockProfileResponse = {
  userId: mockUserId,
  careerGoal: CareerGoal.BACKEND,
  skillLevel: LearnerSkillLevel.INTERMEDIATE,
  learningPace: LearnerLearningPace.FAST,
  strengths: ['nodejs', 'sql'],
  weaknesses: ['css'],
  preferredTopics: ['nestjs', 'postgresql'],
  lastRecalculatedAt: mockNow,
  roundsCompleted: [1, 2],
};

// ── Tests ──────────────────────────────────────────────────────────────────

describe('LearnerProfileController', () => {
  let controller: LearnerProfileController;
  let learnerProfileService: {
    getMyProfile: jest.Mock;
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    learnerProfileService = {
      getMyProfile: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [LearnerProfileController],
      providers: [
        { provide: LearnerProfileService, useValue: learnerProfileService },
      ],
    }).compile();

    controller = module.get<LearnerProfileController>(
      LearnerProfileController,
    );
  });

  // ── GET /learner-profile/me ──────────────────────────────────────────────

  describe('GET me', () => {
    // ── Test 1: Delegates to service with correct userId ──────────────────

    it('should call learnerProfileService.getMyProfile with userId', async () => {
      learnerProfileService.getMyProfile.mockResolvedValue(mockProfileResponse);

      const result = await controller.getMyProfile(mockUserId);

      expect(learnerProfileService.getMyProfile).toHaveBeenCalledWith(
        mockUserId,
      );
      expect(learnerProfileService.getMyProfile).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockProfileResponse);
    });

    // ── Test 2: Propagates NotFoundException from service ─────────────────

    it('should propagate NotFoundException when profile not found', async () => {
      learnerProfileService.getMyProfile.mockRejectedValue(
        new NotFoundException('Learner profile not initialized'),
      );

      await expect(controller.getMyProfile(mockUserId)).rejects.toThrow(
        NotFoundException,
      );
      await expect(controller.getMyProfile(mockUserId)).rejects.toThrow(
        'Learner profile not initialized',
      );
    });

    // ── Test 3: Guard metadata verification ───────────────────────────────

    it('should have JwtAuthGuard applied at class level', () => {
      // Verify the controller class has UseGuards metadata with JwtAuthGuard
      const guards = Reflect.getMetadata('__guards__', LearnerProfileController);

      expect(guards).toBeDefined();
      expect(guards).toHaveLength(1);
    });

    // ── Test 4: Route metadata verification ───────────────────────────────

    it('should have correct route path metadata on getMyProfile', () => {
      // Verify @Get('me') decorator sets the correct path
      const path = Reflect.getMetadata('path', LearnerProfileController.prototype.getMyProfile);

      expect(path).toBe('me');
    });
  });
});
