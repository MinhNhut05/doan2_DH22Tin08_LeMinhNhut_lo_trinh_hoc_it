// learner-profile.service.spec.ts - Unit tests for LearnerProfileService
//
// Mock: PrismaService (learnerProfile, onboardingRound)
// Tests:
//   1. getMyProfile returns canonical profile fields + roundsCompleted
//   2. getMyProfile throws NotFoundException when profile row is missing
//   3. getMyProfile only includes completed rounds (non-null completedAt)
//   4. LearnerProfileService is exported from LearnerProfileModule

import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { CareerGoal, LearnerSkillLevel, LearnerLearningPace } from '@prisma/client';

import { PrismaService } from '../../prisma/index.js';
import { LearnerProfileService } from './learner-profile.service.js';
import { LearnerProfileModule } from './learner-profile.module.js';

// ── Mock data ──────────────────────────────────────────────────────────────

const mockUserId = 'user-uuid-123';
const mockNow = new Date('2026-03-24T10:00:00.000Z');

const mockProfile = {
  id: 'profile-uuid-1',
  userId: mockUserId,
  careerGoal: CareerGoal.FRONTEND,
  skillLevel: LearnerSkillLevel.BEGINNER,
  learningPace: LearnerLearningPace.NORMAL,
  strengths: ['html', 'css'],
  weaknesses: ['javascript'],
  preferredTopics: ['react', 'typescript'],
  lastRecalculatedAt: mockNow,
  createdAt: mockNow,
  updatedAt: mockNow,
};

const mockRounds = [
  { roundNumber: 1, completedAt: new Date('2026-03-20T08:00:00.000Z') },
  { roundNumber: 2, completedAt: new Date('2026-03-22T12:00:00.000Z') },
];

// ── Tests ──────────────────────────────────────────────────────────────────

describe('LearnerProfileService', () => {
  let service: LearnerProfileService;
  let prisma: any;

  beforeEach(async () => {
    jest.clearAllMocks();

    prisma = {
      learnerProfile: {
        findUnique: jest.fn(),
      },
      onboardingRound: {
        findMany: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LearnerProfileService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<LearnerProfileService>(LearnerProfileService);
    prisma = module.get(PrismaService);
  });

  // ── getMyProfile ─────────────────────────────────────────────────────────

  describe('getMyProfile()', () => {
    // ── Test 1: Happy path — returns canonical profile + roundsCompleted ──

    it('should return canonical profile fields and roundsCompleted', async () => {
      prisma.learnerProfile.findUnique.mockResolvedValue(mockProfile);
      prisma.onboardingRound.findMany.mockResolvedValue(mockRounds);

      const result = await service.getMyProfile(mockUserId);

      // Verify returned shape matches the canonical contract
      expect(result).toEqual({
        userId: mockUserId,
        careerGoal: CareerGoal.FRONTEND,
        skillLevel: LearnerSkillLevel.BEGINNER,
        learningPace: LearnerLearningPace.NORMAL,
        strengths: ['html', 'css'],
        weaknesses: ['javascript'],
        preferredTopics: ['react', 'typescript'],
        lastRecalculatedAt: mockNow,
        roundsCompleted: [1, 2],
      });

      // Verify Prisma was called with correct params
      expect(prisma.learnerProfile.findUnique).toHaveBeenCalledWith({
        where: { userId: mockUserId },
      });
      expect(prisma.onboardingRound.findMany).toHaveBeenCalledWith({
        where: { userId: mockUserId },
        orderBy: { roundNumber: 'asc' },
        select: { roundNumber: true, completedAt: true },
      });
    });

    // ── Test 2: NotFoundException when no profile row exists ──────────────

    it('should throw NotFoundException when no LearnerProfile row exists', async () => {
      prisma.learnerProfile.findUnique.mockResolvedValue(null);
      prisma.onboardingRound.findMany.mockResolvedValue([]);

      await expect(service.getMyProfile(mockUserId)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.getMyProfile(mockUserId)).rejects.toThrow(
        'Learner profile not initialized',
      );
    });

    // ── Test 3: Only includes rounds with non-null completedAt ───────────

    it('should only include completed rounds in roundsCompleted', async () => {
      prisma.learnerProfile.findUnique.mockResolvedValue(mockProfile);
      prisma.onboardingRound.findMany.mockResolvedValue([
        { roundNumber: 1, completedAt: new Date('2026-03-20T08:00:00.000Z') },
        { roundNumber: 2, completedAt: null }, // Not completed yet
        { roundNumber: 3, completedAt: new Date('2026-03-24T10:00:00.000Z') },
      ]);

      const result = await service.getMyProfile(mockUserId);

      // Round 2 should be excluded because completedAt is null
      expect(result.roundsCompleted).toEqual([1, 3]);
    });

    // ── Test 4: Empty rounds when user has profile but no rounds ─────────

    it('should return empty roundsCompleted when no rounds exist', async () => {
      prisma.learnerProfile.findUnique.mockResolvedValue(mockProfile);
      prisma.onboardingRound.findMany.mockResolvedValue([]);

      const result = await service.getMyProfile(mockUserId);

      expect(result.roundsCompleted).toEqual([]);
    });

    // ── Test 5: Does not leak raw answers or internal fields ─────────────

    it('should not include raw answers or internal profile fields', async () => {
      prisma.learnerProfile.findUnique.mockResolvedValue(mockProfile);
      prisma.onboardingRound.findMany.mockResolvedValue(mockRounds);

      const result = await service.getMyProfile(mockUserId);

      // D-01: raw answers stay in round storage, not in the profile response
      expect(result).not.toHaveProperty('answers');
      expect(result).not.toHaveProperty('id');
      expect(result).not.toHaveProperty('createdAt');
      expect(result).not.toHaveProperty('updatedAt');
    });
  });

  // ── Module export test ────────────────────────────────────────────────────

  describe('module exports', () => {
    it('should be exported from LearnerProfileModule for cross-module reuse', () => {
      // Verify the module metadata declares LearnerProfileService in exports.
      // We check @Module() metadata directly to avoid pulling in AuthModule's
      // full dependency tree (MailerModule, ConfigService, etc.) in a unit test.
      const moduleExports = Reflect.getMetadata('exports', LearnerProfileModule);

      expect(moduleExports).toBeDefined();
      expect(moduleExports).toContain(LearnerProfileService);
    });
  });
});
