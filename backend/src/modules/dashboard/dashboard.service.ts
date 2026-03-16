// dashboard.service.ts - Business logic cho Dashboard Overview
//
// Service tổng hợp data cho trang Dashboard:
//   - User info (displayName, email, tier, avatar)
//   - Enrolled paths + progress %
//   - Recent activity (streak, sessions, study time)
//   - AI quota (used / limit)
//
// Query strategy: 2-phase parallel
//   Phase 1: Promise.all → user, paths, week stats, streak data, AI quota
//   Phase 2: Promise.all → per-path progress (totalLessons + completedLessons)
//
// PrismaModule là @Global() → inject PrismaService trực tiếp qua constructor.

import { Injectable } from '@nestjs/common';
import { ProgressStatus, UserTier } from '@prisma/client';
import { PrismaService } from '../../prisma/index.js';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  // ── getOverview ─────────────────────────────────────────────────────────
  //
  // Aggregate tất cả data cần thiết cho Dashboard page.
  // Trả về: user info, enrolled paths, recent activity, AI quota.
  //
  // 2-phase parallel strategy:
  //   Phase 1: 5 queries chạy song song (không phụ thuộc nhau)
  //   Phase 2: Per-path progress (cần enrolledPaths từ Phase 1)
  async getOverview(userId: string) {
    // ── Tính các mốc thời gian (UTC) ──────────────────────────────────
    const todayUTC = this.getTodayUTC();
    const startOfWeekUTC = this.getStartOfWeekUTC();
    const yearAgoUTC = this.getYearAgoUTC();

    // ── Phase 1: 5 queries chạy song song ─────────────────────────────
    // Promise.all chạy parallel → nhanh hơn sequential queries đáng kể
    const [user, enrolledPaths, weekStats, streakData, aiQuota] =
      await Promise.all([
        // 1. User info: displayName, email, tier, avatarUrl
        this.prisma.user.findUnique({
          where: { id: userId },
          select: {
            displayName: true,
            email: true,
            tier: true,
            avatarUrl: true,
          },
        }),

        // 2. Paths user đã enroll, kèm currentLesson
        this.prisma.userLearningPath.findMany({
          where: { userId },
          include: {
            learningPath: {
              select: { id: true, name: true, slug: true },
            },
            currentLesson: {
              select: { id: true, title: true, slug: true },
            },
          },
        }),

        // 3. Week stats: sessions count + total duration (Monday → now)
        //    aggregate trả về _sum và _count cùng lúc → 1 query thay vì 2
        this.prisma.learningSession.aggregate({
          where: {
            userId,
            startedAt: { gte: startOfWeekUTC },
          },
          _sum: { durationSeconds: true },
          _count: { id: true },
        }),

        // 4. Streak data: tất cả session dates trong 365 ngày
        //    Chỉ select startedAt để minimize data transfer
        this.prisma.learningSession.findMany({
          where: {
            userId,
            startedAt: { gte: yearAgoUTC },
          },
          select: { startedAt: true },
          orderBy: { startedAt: 'desc' },
        }),

        // 5. AI quota hôm nay: findUnique theo compound key userId_date
        //    Nếu chưa có record → null → dùng default
        this.prisma.aIUsageQuota.findUnique({
          where: { userId_date: { userId, date: todayUTC } },
        }),
      ]);

    // Guard: user phải tồn tại (trong thực tế luôn có vì đã qua JWT auth)
    if (!user) {
      return {
        user: null,
        enrolledPaths: [],
        recentActivity: {
          totalStudyMinutes: 0,
          currentStreak: 0,
          sessionsThisWeek: 0,
        },
        aiQuota: { used: 0, limit: 10, tier: 'free' },
      };
    }

    // ── Phase 2: Tính progress cho từng enrolled path ─────────────────
    // Cần enrolledPaths từ Phase 1 → phải chờ Phase 1 xong
    // Promise.all cho N paths chạy song song (N thường < 10)
    const pathsWithProgress = await Promise.all(
      enrolledPaths.map(async (up) => {
        const [totalLessons, completedLessons] = await Promise.all([
          // Tổng lessons trong path (qua Track → TrackLesson)
          this.prisma.trackLesson.count({
            where: { track: { learningPathId: up.learningPathId } },
          }),
          // Lessons user đã COMPLETED trong path này
          this.prisma.userProgress.count({
            where: {
              userId,
              status: ProgressStatus.COMPLETED,
              lesson: {
                trackLessons: {
                  some: { track: { learningPathId: up.learningPathId } },
                },
              },
            },
          }),
        ]);

        // Guard: tránh divide by zero khi path chưa có lesson nào
        const progress =
          totalLessons === 0
            ? 0
            : Math.round((completedLessons / totalLessons) * 100);

        return {
          id: up.learningPath.id,
          name: up.learningPath.name,
          slug: up.learningPath.slug,
          progress,
          currentLesson: up.currentLesson
            ? {
                id: up.currentLesson.id,
                title: up.currentLesson.title,
                slug: up.currentLesson.slug,
              }
            : null,
          totalLessons,
          completedLessons,
        };
      }),
    );

    // ── Build response ────────────────────────────────────────────────
    const currentStreak = this.calculateStreak(
      streakData.map((s) => s.startedAt),
    );

    // totalStudyMinutes: convert seconds → minutes, round
    const totalDurationSeconds = weekStats._sum.durationSeconds ?? 0;
    const totalStudyMinutes = Math.round(totalDurationSeconds / 60);

    // sessionsThisWeek: từ aggregate _count
    const sessionsThisWeek = weekStats._count.id;

    // AI quota: nếu chưa có record hôm nay → default theo tier
    const defaultLimit = this.getDefaultQuotaByTier(user.tier);

    return {
      user: {
        // displayName fallback: lấy phần trước @ của email
        displayName: user.displayName ?? user.email.split('@')[0],
        email: user.email,
        // tier lowercase: FREE → "free", PRO → "pro"
        tier: user.tier.toLowerCase(),
        avatarUrl: user.avatarUrl ?? null,
      },
      enrolledPaths: pathsWithProgress,
      recentActivity: {
        totalStudyMinutes,
        currentStreak,
        sessionsThisWeek,
      },
      aiQuota: {
        used: aiQuota?.usedCount ?? 0,
        limit: aiQuota?.maxCount ?? defaultLimit,
        tier: user.tier.toLowerCase(),
      },
    };
  }

  // ── calculateStreak ─────────────────────────────────────────────────
  //
  // Duolingo-style streak calculation:
  //   - Nếu hôm nay có session → bắt đầu đếm từ today
  //   - Nếu hôm nay chưa có nhưng hôm qua có → streak vẫn giữ (bắt đầu từ yesterday)
  //   - Nếu cả today lẫn yesterday đều không có → streak = 0
  //   - Walk backwards đếm consecutive days
  //
  // Algorithm:
  //   1. Extract unique dates (YYYY-MM-DD UTC) từ session timestamps
  //   2. Xác định start point: today hoặc yesterday
  //   3. Loop: expected date == actual date → streak++, lùi 1 ngày
  private calculateStreak(dates: Date[]): number {
    if (dates.length === 0) return 0;

    // Extract unique dates, đã sort desc từ query
    const uniqueDates = [
      ...new Set(dates.map((d) => d.toISOString().split('T')[0])),
    ];

    const today = this.getTodayUTC().toISOString().split('T')[0];
    const yesterday = new Date(this.getTodayUTC());
    yesterday.setUTCDate(yesterday.getUTCDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    // Xác định starting point
    let expected: string;
    if (uniqueDates[0] === today) {
      // Hôm nay đã có session → bắt đầu từ today
      expected = today;
    } else if (uniqueDates[0] === yesterdayStr || uniqueDates.includes(yesterdayStr)) {
      // Hôm nay chưa có, nhưng hôm qua có → streak vẫn giữ
      expected = yesterdayStr;
    } else {
      // Cả today lẫn yesterday đều không có → streak reset
      return 0;
    }

    // Walk backwards đếm consecutive days
    let streak = 0;
    for (const date of uniqueDates) {
      if (date === expected) {
        streak++;
        // Lùi expected 1 ngày
        const d = new Date(expected + 'T00:00:00.000Z');
        d.setUTCDate(d.getUTCDate() - 1);
        expected = d.toISOString().split('T')[0];
      } else if (date < expected) {
        // Gap > 1 ngày → streak kết thúc
        break;
      }
      // date > expected: skip (shouldn't happen with desc sort)
    }

    return streak;
  }

  // ── getDefaultQuotaByTier ───────────────────────────────────────────
  //
  // Default AI quota limit theo tier:
  //   FREE  → 10 requests/day
  //   PRO   → 50 requests/day
  //   ULTRA → 200 requests/day
  private getDefaultQuotaByTier(tier: UserTier): number {
    const quotaMap: Record<UserTier, number> = {
      [UserTier.FREE]: 10,
      [UserTier.PRO]: 50,
      [UserTier.ULTRA]: 200,
    };
    return quotaMap[tier];
  }

  // ── Date helpers (UTC) ──────────────────────────────────────────────
  //
  // Tất cả dùng UTC để tránh timezone bugs khi server deploy ở tz khác.

  // Trả về Date object cho ngày hôm nay 00:00:00 UTC
  private getTodayUTC(): Date {
    const now = new Date();
    return new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
    );
  }

  // Trả về Date object cho Monday đầu tuần hiện tại 00:00:00 UTC
  // getUTCDay(): 0=Sunday, 1=Monday, ..., 6=Saturday
  // Nếu hôm nay là Sunday (0) → lùi 6 ngày
  // Nếu hôm nay là Monday (1) → lùi 0 ngày
  // Nếu hôm nay là Tuesday (2) → lùi 1 ngày
  // Formula: (day + 6) % 7 → số ngày cần lùi
  private getStartOfWeekUTC(): Date {
    const today = this.getTodayUTC();
    const day = today.getUTCDay();
    const diff = (day + 6) % 7; // Monday = 0, Sunday = 6
    today.setUTCDate(today.getUTCDate() - diff);
    return today;
  }

  // Trả về Date object cho 365 ngày trước 00:00:00 UTC
  private getYearAgoUTC(): Date {
    const today = this.getTodayUTC();
    today.setUTCFullYear(today.getUTCFullYear() - 1);
    return today;
  }
}
