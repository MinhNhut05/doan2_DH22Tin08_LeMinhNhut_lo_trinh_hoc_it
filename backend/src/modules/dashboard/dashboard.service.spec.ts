// dashboard.service.spec.ts - Unit tests cho DashboardService
//
// Mock: PrismaService (user, userLearningPath, learningSession, aIUsageQuota, trackLesson, userProgress)
// Test: getOverview() — happy path, user not found, empty paths, streak logic, AI quota, divide-by-zero

import { Test, TestingModule } from '@nestjs/testing';
import { UserTier, ProgressStatus } from '@prisma/client';

import { PrismaService } from '../../prisma/index.js';
import { DashboardService } from './dashboard.service.js';

// ── Mock data ──────────────────────────────────────────────────────────────

const mockUserId = 'user-uuid-123';

// Helper: tạo Date cho ngày hôm nay 00:00:00 UTC
function todayUTC(): Date {
  const now = new Date();
  return new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  );
}

// Helper: tạo Date cho N ngày trước 00:00:00 UTC
function daysAgoUTC(n: number): Date {
  const d = todayUTC();
  d.setUTCDate(d.getUTCDate() - n);
  return d;
}

// ── Tests ──────────────────────────────────────────────────────────────────

describe('DashboardService', () => {
  let service: DashboardService;
  let prisma: any;

  beforeEach(async () => {
    jest.clearAllMocks();

    prisma = {
      user: {
        findUnique: jest.fn(),
      },
      userLearningPath: {
        findMany: jest.fn(),
      },
      learningSession: {
        aggregate: jest.fn(),
        findMany: jest.fn(),
      },
      aIUsageQuota: {
        findUnique: jest.fn(),
      },
      trackLesson: {
        count: jest.fn(),
      },
      userProgress: {
        count: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DashboardService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<DashboardService>(DashboardService);
    prisma = module.get(PrismaService);
  });

  // ── getOverview ─────────────────────────────────────────────────────────

  describe('getOverview()', () => {
    // ── 1. Happy path ──────────────────────────────────────────────────

    it('should return full overview with enrolled paths, activity, and quota', async () => {
      // User info
      prisma.user.findUnique.mockResolvedValue({
        displayName: 'Leminho',
        email: 'leminho@test.com',
        tier: UserTier.FREE,
        avatarUrl: 'https://avatar.com/leminho.png',
      });

      // Enrolled paths
      prisma.userLearningPath.findMany.mockResolvedValue([
        {
          learningPathId: 'path-1',
          learningPath: { id: 'path-1', name: 'Frontend', slug: 'frontend' },
          currentLesson: { id: 'lesson-1', title: 'HTML Basics', slug: 'html-basics' },
        },
      ]);

      // Week stats: 3 sessions, 7200 seconds total
      prisma.learningSession.aggregate.mockResolvedValue({
        _sum: { durationSeconds: 7200 },
        _count: { id: 3 },
      });

      // Streak data: hôm nay có session
      prisma.learningSession.findMany.mockResolvedValue([
        { startedAt: todayUTC() },
      ]);

      // AI quota
      prisma.aIUsageQuota.findUnique.mockResolvedValue({
        usedCount: 3,
        maxCount: 10,
      });

      // Path progress: 10 total lessons, 4 completed
      prisma.trackLesson.count.mockResolvedValue(10);
      prisma.userProgress.count.mockResolvedValue(4);

      const result = await service.getOverview(mockUserId);

      // User
      expect(result.user).toEqual({
        displayName: 'Leminho',
        email: 'leminho@test.com',
        tier: 'free',
        avatarUrl: 'https://avatar.com/leminho.png',
      });

      // Enrolled paths
      expect(result.enrolledPaths).toHaveLength(1);
      expect(result.enrolledPaths[0]).toEqual({
        id: 'path-1',
        name: 'Frontend',
        slug: 'frontend',
        progress: 40, // 4/10 * 100
        currentLesson: { id: 'lesson-1', title: 'HTML Basics', slug: 'html-basics' },
        totalLessons: 10,
        completedLessons: 4,
      });

      // Recent activity
      expect(result.recentActivity.totalStudyMinutes).toBe(120); // 7200s / 60
      expect(result.recentActivity.currentStreak).toBeGreaterThanOrEqual(1);
      expect(result.recentActivity.sessionsThisWeek).toBe(3);

      // AI quota
      expect(result.aiQuota).toEqual({
        used: 3,
        limit: 10,
        tier: 'free',
      });
    });

    // ── 2. User không tồn tại ──────────────────────────────────────────

    it('should return default values when user not found', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      prisma.userLearningPath.findMany.mockResolvedValue([]);
      prisma.learningSession.aggregate.mockResolvedValue({
        _sum: { durationSeconds: null },
        _count: { id: 0 },
      });
      prisma.learningSession.findMany.mockResolvedValue([]);
      prisma.aIUsageQuota.findUnique.mockResolvedValue(null);

      const result = await service.getOverview(mockUserId);

      expect(result.user).toBeNull();
      expect(result.enrolledPaths).toEqual([]);
      expect(result.recentActivity).toEqual({
        totalStudyMinutes: 0,
        currentStreak: 0,
        sessionsThisWeek: 0,
      });
      expect(result.aiQuota).toEqual({
        used: 0,
        limit: 10,
        tier: 'free',
      });
    });

    // ── 3. User có nhưng 0 enrolled paths ──────────────────────────────

    it('should return empty enrolledPaths when user has no paths', async () => {
      prisma.user.findUnique.mockResolvedValue({
        displayName: 'Newbie',
        email: 'newbie@test.com',
        tier: UserTier.FREE,
        avatarUrl: null,
      });
      prisma.userLearningPath.findMany.mockResolvedValue([]);
      prisma.learningSession.aggregate.mockResolvedValue({
        _sum: { durationSeconds: 0 },
        _count: { id: 0 },
      });
      prisma.learningSession.findMany.mockResolvedValue([]);
      prisma.aIUsageQuota.findUnique.mockResolvedValue(null);

      const result = await service.getOverview(mockUserId);

      expect(result.user).toBeDefined();
      expect(result.user!.avatarUrl).toBeNull();
      expect(result.enrolledPaths).toEqual([]);
    });

    // ── 4. Streak: hôm nay có session → streak ≥ 1 ────────────────────

    it('should calculate streak starting from today when today has session', async () => {
      prisma.user.findUnique.mockResolvedValue({
        displayName: 'Streak User',
        email: 'streak@test.com',
        tier: UserTier.FREE,
        avatarUrl: null,
      });
      prisma.userLearningPath.findMany.mockResolvedValue([]);
      prisma.learningSession.aggregate.mockResolvedValue({
        _sum: { durationSeconds: 0 },
        _count: { id: 0 },
      });

      // Streak: today + yesterday + 2 days ago → streak = 3
      prisma.learningSession.findMany.mockResolvedValue([
        { startedAt: todayUTC() },
        { startedAt: daysAgoUTC(1) },
        { startedAt: daysAgoUTC(2) },
      ]);

      prisma.aIUsageQuota.findUnique.mockResolvedValue(null);

      const result = await service.getOverview(mockUserId);

      expect(result.recentActivity.currentStreak).toBe(3);
    });

    // ── 5. Streak: yesterday có nhưng today không → streak vẫn giữ ────

    it('should keep streak when yesterday has session but today does not', async () => {
      prisma.user.findUnique.mockResolvedValue({
        displayName: 'Streak User',
        email: 'streak@test.com',
        tier: UserTier.FREE,
        avatarUrl: null,
      });
      prisma.userLearningPath.findMany.mockResolvedValue([]);
      prisma.learningSession.aggregate.mockResolvedValue({
        _sum: { durationSeconds: 0 },
        _count: { id: 0 },
      });

      // No today, but yesterday + 2 days ago → streak = 2
      prisma.learningSession.findMany.mockResolvedValue([
        { startedAt: daysAgoUTC(1) },
        { startedAt: daysAgoUTC(2) },
      ]);

      prisma.aIUsageQuota.findUnique.mockResolvedValue(null);

      const result = await service.getOverview(mockUserId);

      expect(result.recentActivity.currentStreak).toBe(2);
    });

    // ── 6. Streak: cả today lẫn yesterday không có → streak = 0 ───────

    it('should return streak = 0 when neither today nor yesterday has session', async () => {
      prisma.user.findUnique.mockResolvedValue({
        displayName: 'No Streak',
        email: 'nostreak@test.com',
        tier: UserTier.FREE,
        avatarUrl: null,
      });
      prisma.userLearningPath.findMany.mockResolvedValue([]);
      prisma.learningSession.aggregate.mockResolvedValue({
        _sum: { durationSeconds: 0 },
        _count: { id: 0 },
      });

      // Only 3 days ago → no today/yesterday → streak = 0
      prisma.learningSession.findMany.mockResolvedValue([
        { startedAt: daysAgoUTC(3) },
        { startedAt: daysAgoUTC(4) },
      ]);

      prisma.aIUsageQuota.findUnique.mockResolvedValue(null);

      const result = await service.getOverview(mockUserId);

      expect(result.recentActivity.currentStreak).toBe(0);
    });

    // ── 7. AI quota: chưa có record hôm nay → default values ──────────

    it('should return default AI quota when no record exists today', async () => {
      prisma.user.findUnique.mockResolvedValue({
        displayName: 'AI User',
        email: 'ai@test.com',
        tier: UserTier.FREE,
        avatarUrl: null,
      });
      prisma.userLearningPath.findMany.mockResolvedValue([]);
      prisma.learningSession.aggregate.mockResolvedValue({
        _sum: { durationSeconds: 0 },
        _count: { id: 0 },
      });
      prisma.learningSession.findMany.mockResolvedValue([]);
      prisma.aIUsageQuota.findUnique.mockResolvedValue(null);

      const result = await service.getOverview(mockUserId);

      expect(result.aiQuota.used).toBe(0);
      expect(result.aiQuota.limit).toBe(10); // FREE tier default
      expect(result.aiQuota.tier).toBe('free');
    });

    // ── 8. AI quota: có record → dùng values từ record ─────────────────

    it('should use existing quota record values', async () => {
      prisma.user.findUnique.mockResolvedValue({
        displayName: 'Pro User',
        email: 'pro@test.com',
        tier: UserTier.PRO,
        avatarUrl: null,
      });
      prisma.userLearningPath.findMany.mockResolvedValue([]);
      prisma.learningSession.aggregate.mockResolvedValue({
        _sum: { durationSeconds: 0 },
        _count: { id: 0 },
      });
      prisma.learningSession.findMany.mockResolvedValue([]);
      prisma.aIUsageQuota.findUnique.mockResolvedValue({
        usedCount: 25,
        maxCount: 50,
      });

      const result = await service.getOverview(mockUserId);

      expect(result.aiQuota.used).toBe(25);
      expect(result.aiQuota.limit).toBe(50);
      expect(result.aiQuota.tier).toBe('pro');
    });

    // ── 9. Path progress: totalLessons = 0 → progress = 0 ─────────────

    it('should return progress = 0 when path has no lessons (divide by zero guard)', async () => {
      prisma.user.findUnique.mockResolvedValue({
        displayName: 'Edge User',
        email: 'edge@test.com',
        tier: UserTier.FREE,
        avatarUrl: null,
      });
      prisma.userLearningPath.findMany.mockResolvedValue([
        {
          learningPathId: 'path-empty',
          learningPath: { id: 'path-empty', name: 'Empty Path', slug: 'empty-path' },
          currentLesson: null,
        },
      ]);
      prisma.learningSession.aggregate.mockResolvedValue({
        _sum: { durationSeconds: 0 },
        _count: { id: 0 },
      });
      prisma.learningSession.findMany.mockResolvedValue([]);
      prisma.aIUsageQuota.findUnique.mockResolvedValue(null);

      // 0 total lessons, 0 completed → progress should be 0, not NaN/Infinity
      prisma.trackLesson.count.mockResolvedValue(0);
      prisma.userProgress.count.mockResolvedValue(0);

      const result = await service.getOverview(mockUserId);

      expect(result.enrolledPaths[0].progress).toBe(0);
      expect(result.enrolledPaths[0].totalLessons).toBe(0);
      expect(result.enrolledPaths[0].completedLessons).toBe(0);
    });

    // ── 10. Path progress: currentLesson null → trả về null ────────────

    it('should return currentLesson as null when path has no current lesson', async () => {
      prisma.user.findUnique.mockResolvedValue({
        displayName: 'User',
        email: 'user@test.com',
        tier: UserTier.FREE,
        avatarUrl: null,
      });
      prisma.userLearningPath.findMany.mockResolvedValue([
        {
          learningPathId: 'path-1',
          learningPath: { id: 'path-1', name: 'Path 1', slug: 'path-1' },
          currentLesson: null,
        },
      ]);
      prisma.learningSession.aggregate.mockResolvedValue({
        _sum: { durationSeconds: 0 },
        _count: { id: 0 },
      });
      prisma.learningSession.findMany.mockResolvedValue([]);
      prisma.aIUsageQuota.findUnique.mockResolvedValue(null);
      prisma.trackLesson.count.mockResolvedValue(5);
      prisma.userProgress.count.mockResolvedValue(0);

      const result = await service.getOverview(mockUserId);

      expect(result.enrolledPaths[0].currentLesson).toBeNull();
    });

    // ── 11. Default quota by tier: PRO → 50 ────────────────────────────

    it('should return PRO default quota limit (50) when no AI quota record exists', async () => {
      prisma.user.findUnique.mockResolvedValue({
        displayName: 'Pro User',
        email: 'pro@test.com',
        tier: UserTier.PRO,
        avatarUrl: null,
      });
      prisma.userLearningPath.findMany.mockResolvedValue([]);
      prisma.learningSession.aggregate.mockResolvedValue({
        _sum: { durationSeconds: 0 },
        _count: { id: 0 },
      });
      prisma.learningSession.findMany.mockResolvedValue([]);
      prisma.aIUsageQuota.findUnique.mockResolvedValue(null); // no record

      const result = await service.getOverview(mockUserId);

      expect(result.aiQuota.limit).toBe(50); // PRO default
    });

    // ── 12. Default quota by tier: ULTRA → 200 ─────────────────────────

    it('should return ULTRA default quota limit (200) when no AI quota record exists', async () => {
      prisma.user.findUnique.mockResolvedValue({
        displayName: 'Ultra User',
        email: 'ultra@test.com',
        tier: UserTier.ULTRA,
        avatarUrl: null,
      });
      prisma.userLearningPath.findMany.mockResolvedValue([]);
      prisma.learningSession.aggregate.mockResolvedValue({
        _sum: { durationSeconds: 0 },
        _count: { id: 0 },
      });
      prisma.learningSession.findMany.mockResolvedValue([]);
      prisma.aIUsageQuota.findUnique.mockResolvedValue(null);

      const result = await service.getOverview(mockUserId);

      expect(result.aiQuota.limit).toBe(200); // ULTRA default
    });

    // ── 13. displayName fallback: dùng phần trước @ của email ──────────

    it('should fallback displayName to email prefix when displayName is null', async () => {
      prisma.user.findUnique.mockResolvedValue({
        displayName: null,
        email: 'johndoe@gmail.com',
        tier: UserTier.FREE,
        avatarUrl: null,
      });
      prisma.userLearningPath.findMany.mockResolvedValue([]);
      prisma.learningSession.aggregate.mockResolvedValue({
        _sum: { durationSeconds: 0 },
        _count: { id: 0 },
      });
      prisma.learningSession.findMany.mockResolvedValue([]);
      prisma.aIUsageQuota.findUnique.mockResolvedValue(null);

      const result = await service.getOverview(mockUserId);

      expect(result.user!.displayName).toBe('johndoe');
    });

    // ── 14. Week stats: durationSeconds null → totalStudyMinutes = 0 ──

    it('should handle null durationSeconds sum gracefully', async () => {
      prisma.user.findUnique.mockResolvedValue({
        displayName: 'User',
        email: 'user@test.com',
        tier: UserTier.FREE,
        avatarUrl: null,
      });
      prisma.userLearningPath.findMany.mockResolvedValue([]);
      prisma.learningSession.aggregate.mockResolvedValue({
        _sum: { durationSeconds: null }, // no sessions → null
        _count: { id: 0 },
      });
      prisma.learningSession.findMany.mockResolvedValue([]);
      prisma.aIUsageQuota.findUnique.mockResolvedValue(null);

      const result = await service.getOverview(mockUserId);

      expect(result.recentActivity.totalStudyMinutes).toBe(0);
      expect(result.recentActivity.sessionsThisWeek).toBe(0);
    });

    // ── 15. Streak: no sessions at all → streak = 0 ───────────────────

    it('should return streak = 0 when no sessions exist', async () => {
      prisma.user.findUnique.mockResolvedValue({
        displayName: 'New User',
        email: 'new@test.com',
        tier: UserTier.FREE,
        avatarUrl: null,
      });
      prisma.userLearningPath.findMany.mockResolvedValue([]);
      prisma.learningSession.aggregate.mockResolvedValue({
        _sum: { durationSeconds: 0 },
        _count: { id: 0 },
      });
      prisma.learningSession.findMany.mockResolvedValue([]); // empty
      prisma.aIUsageQuota.findUnique.mockResolvedValue(null);

      const result = await service.getOverview(mockUserId);

      expect(result.recentActivity.currentStreak).toBe(0);
    });
  });
});
