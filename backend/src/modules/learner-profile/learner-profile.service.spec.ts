import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import {
  CareerGoal,
  LearnerLearningPace,
  LearnerSkillLevel,
  LearningBackground,
  ProgressStatus,
} from '@prisma/client';

import { PrismaService } from '../../prisma/index.js';
import { LearnerProfileService } from './learner-profile.service.js';

const mockUserId = 'user-123';

describe('LearnerProfileService', () => {
  let service: LearnerProfileService;
  let prisma: any;

  beforeEach(async () => {
    jest.clearAllMocks();

    prisma = {
      learnerProfile: {
        findUnique: jest.fn(),
        update: jest.fn(),
        upsert: jest.fn(),
      },
      onboardingRound: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
      },
      lesson: {
        findUnique: jest.fn(),
      },
      userProgress: {
        findUnique: jest.fn(),
        count: jest.fn(),
      },
      quizResult: {
        findMany: jest.fn(),
      },
      track: {
        findMany: jest.fn(),
      },
      aIInteractionLog: {
        findMany: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LearnerProfileService,
        {
          provide: PrismaService,
          useValue: prisma,
        },
      ],
    }).compile();

    service = module.get<LearnerProfileService>(LearnerProfileService);
    prisma = module.get(PrismaService);
  });

  describe('getMyProfile', () => {
    it('returns the canonical profile plus completed rounds', async () => {
      prisma.learnerProfile.findUnique.mockResolvedValue({
        userId: mockUserId,
        careerGoal: CareerGoal.FRONTEND,
        skillLevel: LearnerSkillLevel.BEGINNER,
        learningPace: LearnerLearningPace.NORMAL,
        strengths: ['html'],
        weaknesses: ['sql'],
        preferredTopics: ['frontend'],
        lastRecalculatedAt: new Date('2026-03-20T10:00:00.000Z'),
      });
      prisma.onboardingRound.findMany.mockResolvedValue([
        { roundNumber: 1, completedAt: new Date('2026-03-20T09:00:00.000Z') },
        { roundNumber: 2, completedAt: new Date('2026-03-20T09:05:00.000Z') },
        { roundNumber: 3, completedAt: null },
      ]);

      const result = await service.getMyProfile(mockUserId);

      expect(result).toEqual({
        userId: mockUserId,
        careerGoal: CareerGoal.FRONTEND,
        skillLevel: LearnerSkillLevel.BEGINNER,
        learningPace: LearnerLearningPace.NORMAL,
        strengths: ['html'],
        weaknesses: ['sql'],
        preferredTopics: ['frontend'],
        lastRecalculatedAt: new Date('2026-03-20T10:00:00.000Z'),
        roundsCompleted: [1, 2],
      });
    });

    it('throws NotFoundException when the learner profile is missing', async () => {
      prisma.learnerProfile.findUnique.mockResolvedValue(null);
      prisma.onboardingRound.findMany.mockResolvedValue([]);

      await expect(service.getMyProfile(mockUserId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('createFromRoundOne', () => {
    const buildRoundOne = (overrides?: Partial<Record<string, unknown>>) => ({
      id: 'round-1',
      userId: mockUserId,
      roundNumber: 1,
      answers: {
        careerGoal: CareerGoal.FRONTEND,
        priorKnowledge: ['html', 'css'],
        learningBackground: LearningBackground.SELF_TAUGHT,
        hoursPerWeek: 12,
        ...overrides,
      },
      completedAt: new Date('2026-03-20T09:00:00.000Z'),
      createdAt: new Date('2026-03-20T09:00:00.000Z'),
    });

    it('creates BEGINNER skill level when self-taught knowledge is under five items', async () => {
      prisma.onboardingRound.findUnique.mockResolvedValue(buildRoundOne());
      prisma.learnerProfile.upsert.mockResolvedValue({ id: 'profile-1' });

      await service.createFromRoundOne(mockUserId);

      expect(prisma.learnerProfile.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId: mockUserId },
          create: expect.objectContaining({
            skillLevel: LearnerSkillLevel.BEGINNER,
          }),
        }),
      );
    });

    it('creates INTERMEDIATE skill level when learning background is CS_DEGREE', async () => {
      prisma.onboardingRound.findUnique.mockResolvedValue(
        buildRoundOne({ learningBackground: LearningBackground.CS_DEGREE }),
      );
      prisma.learnerProfile.upsert.mockResolvedValue({ id: 'profile-1' });

      await service.createFromRoundOne(mockUserId);

      expect(prisma.learnerProfile.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          create: expect.objectContaining({
            skillLevel: LearnerSkillLevel.INTERMEDIATE,
          }),
        }),
      );
    });

    it('creates INTERMEDIATE skill level when prior knowledge has at least five items', async () => {
      prisma.onboardingRound.findUnique.mockResolvedValue(
        buildRoundOne({
          priorKnowledge: ['html', 'css', 'javascript', 'typescript', 'react'],
        }),
      );
      prisma.learnerProfile.upsert.mockResolvedValue({ id: 'profile-1' });

      await service.createFromRoundOne(mockUserId);

      expect(prisma.learnerProfile.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          create: expect.objectContaining({
            skillLevel: LearnerSkillLevel.INTERMEDIATE,
          }),
        }),
      );
    });

    it('creates FAST learning pace when hoursPerWeek is at least 20', async () => {
      prisma.onboardingRound.findUnique.mockResolvedValue(
        buildRoundOne({ hoursPerWeek: 20 }),
      );
      prisma.learnerProfile.upsert.mockResolvedValue({ id: 'profile-1' });

      await service.createFromRoundOne(mockUserId);

      expect(prisma.learnerProfile.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          create: expect.objectContaining({
            learningPace: LearnerLearningPace.FAST,
          }),
        }),
      );
    });

    it('creates SLOW learning pace when hoursPerWeek is below 10', async () => {
      prisma.onboardingRound.findUnique.mockResolvedValue(
        buildRoundOne({ hoursPerWeek: 5 }),
      );
      prisma.learnerProfile.upsert.mockResolvedValue({ id: 'profile-1' });

      await service.createFromRoundOne(mockUserId);

      expect(prisma.learnerProfile.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          create: expect.objectContaining({
            learningPace: LearnerLearningPace.SLOW,
          }),
        }),
      );
    });

    it('throws NotFoundException when round 1 does not exist', async () => {
      prisma.onboardingRound.findUnique.mockResolvedValue(null);

      await expect(service.createFromRoundOne(mockUserId)).rejects.toThrow(
        NotFoundException,
      );
      expect(prisma.learnerProfile.upsert).not.toHaveBeenCalled();
    });
  });

  describe('updateFromRoundThree', () => {
    const existingProfile = {
      userId: mockUserId,
      strengths: ['html'],
    };

    it('sets skillLevel to ADVANCED when average rating is at least 4', async () => {
      prisma.onboardingRound.findUnique.mockResolvedValue({
        answers: { skillRatings: { html_css: 4, javascript: 4, react: 5, git_basics: 4 } },
      });
      prisma.learnerProfile.findUnique.mockResolvedValue(existingProfile);
      prisma.learnerProfile.update.mockResolvedValue({});

      await service.updateFromRoundThree(mockUserId);

      expect(prisma.learnerProfile.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            skillLevel: LearnerSkillLevel.ADVANCED,
          }),
        }),
      );
    });

    it('sets skillLevel to BEGINNER when average rating is below 2.5', async () => {
      prisma.onboardingRound.findUnique.mockResolvedValue({
        answers: { skillRatings: { html_css: 1, javascript: 2, react: 2, git_basics: 2 } },
      });
      prisma.learnerProfile.findUnique.mockResolvedValue(existingProfile);
      prisma.learnerProfile.update.mockResolvedValue({});

      await service.updateFromRoundThree(mockUserId);

      expect(prisma.learnerProfile.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            skillLevel: LearnerSkillLevel.BEGINNER,
          }),
        }),
      );
    });

    it('adds topics with rating at least 4 into strengths using underscore replacement', async () => {
      prisma.onboardingRound.findUnique.mockResolvedValue({
        answers: { skillRatings: { html_css: 4, javascript: 5, react: 3 } },
      });
      prisma.learnerProfile.findUnique.mockResolvedValue(existingProfile);
      prisma.learnerProfile.update.mockResolvedValue({});

      await service.updateFromRoundThree(mockUserId);

      expect(prisma.learnerProfile.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            strengths: expect.arrayContaining(['html', 'html css', 'javascript']),
          }),
        }),
      );
    });

    it('adds topics with rating at most 2 into weaknesses using underscore replacement', async () => {
      prisma.onboardingRound.findUnique.mockResolvedValue({
        answers: { skillRatings: { html_css: 1, javascript: 2, react: 4 } },
      });
      prisma.learnerProfile.findUnique.mockResolvedValue(existingProfile);
      prisma.learnerProfile.update.mockResolvedValue({});

      await service.updateFromRoundThree(mockUserId);

      expect(prisma.learnerProfile.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            weaknesses: expect.arrayContaining(['html css', 'javascript']),
          }),
        }),
      );
    });
  });

  describe('recalculate', () => {
    it('updates learning pace after LESSON_COMPLETED based on actual study time', async () => {
      prisma.learnerProfile.findUnique.mockResolvedValue({ userId: mockUserId });
      prisma.lesson.findUnique.mockResolvedValue({ estimatedMins: 10 });
      prisma.userProgress.findUnique.mockResolvedValue({ timeSpentSeconds: 300 });
      prisma.learnerProfile.update.mockResolvedValue({});

      await service.recalculate(mockUserId, {
        type: 'LESSON_COMPLETED',
        lessonId: 'lesson-1',
      });

      expect(prisma.learnerProfile.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            learningPace: LearnerLearningPace.FAST,
          }),
        }),
      );
    });

    it('updates preferred topics after TRACK_COMPLETED using track names and AI logs', async () => {
      prisma.learnerProfile.findUnique.mockResolvedValue({
        userId: mockUserId,
        preferredTopics: ['react'],
      });
      prisma.track.findMany.mockResolvedValue([
        { name: 'Backend APIs' },
        { name: 'SQL Basics' },
      ]);
      prisma.aIInteractionLog.findMany.mockResolvedValue([
        { questionSummary: 'nodejs, caching', sessionContext: 'lesson' },
      ]);
      prisma.learnerProfile.update.mockResolvedValue({});

      await service.recalculate(mockUserId, {
        type: 'TRACK_COMPLETED',
        learningPathId: 'path-1',
      });

      expect(prisma.learnerProfile.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            preferredTopics: expect.arrayContaining([
              'react',
              'backend apis',
              'sql basics',
              'nodejs',
              'caching',
            ]),
          }),
        }),
      );
    });

    it('updates skill level after QUIZ_PASSED based on passed quiz averages', async () => {
      prisma.learnerProfile.findUnique.mockResolvedValue({ userId: mockUserId });
      prisma.quizResult.findMany.mockResolvedValue([
        {
          score: 95,
          quiz: {
            lesson: {
              trackLessons: [{ track: { name: 'React' } }],
            },
          },
        },
        {
          score: 92,
          quiz: {
            lesson: {
              trackLessons: [{ track: { name: 'React' } }],
            },
          },
        },
      ]);
      prisma.userProgress.count.mockResolvedValue(10);
      prisma.learnerProfile.update.mockResolvedValue({});

      await service.recalculate(mockUserId, {
        type: 'QUIZ_PASSED',
        quizId: 'quiz-1',
        lessonId: 'lesson-1',
      });

      expect(prisma.learnerProfile.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            skillLevel: LearnerSkillLevel.ADVANCED,
            strengths: expect.arrayContaining(['React']),
          }),
        }),
      );
    });

    it('returns quietly when recalculation is triggered before profile initialization', async () => {
      prisma.learnerProfile.findUnique.mockResolvedValue(null);

      await expect(
        service.recalculate(mockUserId, {
          type: 'LESSON_COMPLETED',
          lessonId: 'lesson-1',
        }),
      ).resolves.toBeUndefined();
      expect(prisma.learnerProfile.update).not.toHaveBeenCalled();
    });
  });
});
