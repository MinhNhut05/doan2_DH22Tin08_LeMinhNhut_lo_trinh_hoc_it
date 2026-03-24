// learner-profile.service.ts - Canonical learner-profile domain logic
//
// Single source of truth for learner context (D-12, D-17).
// Provides:
//   - getMyProfile(userId): Read canonical profile + completed rounds
//   - createFromRoundOne(userId): Thin helper for Phase 5 profile creation
//
// Why a separate service instead of putting logic in the controller?
//   - Reusable: other modules (onboarding, lessons, recommendations) can
//     inject LearnerProfileService without duplicating business logic
//   - Testable: service can be unit-tested with mocked Prisma
//   - Single owner: profile rules live in one place (D-12)
//
// PrismaModule is @Global() so PrismaService is injected directly.

import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../../prisma/index.js';

@Injectable()
export class LearnerProfileService {
  constructor(private readonly prisma: PrismaService) {}

  // ── getMyProfile ────────────────────────────────────────────────────────
  //
  // Returns the canonical learner profile for a given user.
  //
  // Shape returned:
  //   { userId, careerGoal, skillLevel, learningPace, strengths,
  //     weaknesses, preferredTopics, lastRecalculatedAt, roundsCompleted }
  //
  // roundsCompleted = array of round numbers with non-null completedAt
  // (derived from OnboardingRound, not stored on the profile itself).
  //
  // Throws NotFoundException if the user has no LearnerProfile row,
  // rather than fabricating default data (per research recommendation).
  async getMyProfile(userId: string) {
    // Two parallel queries: profile + completed onboarding rounds
    const [profile, rounds] = await Promise.all([
      this.prisma.learnerProfile.findUnique({
        where: { userId },
      }),
      this.prisma.onboardingRound.findMany({
        where: { userId },
        orderBy: { roundNumber: 'asc' },
        select: { roundNumber: true, completedAt: true },
      }),
    ]);

    // Pre-onboarding users get an explicit error, not fabricated defaults
    if (!profile) {
      throw new NotFoundException('Learner profile not initialized');
    }

    // Only include rounds that are actually completed
    const roundsCompleted = rounds
      .filter((r) => r.completedAt !== null)
      .map((r) => r.roundNumber);

    return {
      userId: profile.userId,
      careerGoal: profile.careerGoal,
      skillLevel: profile.skillLevel,
      learningPace: profile.learningPace,
      strengths: profile.strengths,
      weaknesses: profile.weaknesses,
      preferredTopics: profile.preferredTopics,
      lastRecalculatedAt: profile.lastRecalculatedAt,
      roundsCompleted,
    };
  }

  // ── createFromRoundOne ──────────────────────────────────────────────────
  //
  // Thin helper for profile creation from round 1 onboarding data.
  // Phase 5 will call this after round 1 submission completes.
  // Exists per D-04 even though it may only be used internally at first.
  //
  // Currently a placeholder — Phase 5 will fill in the creation logic
  // that reads round-1 answers and derives initial profile fields.
  async createFromRoundOne(userId: string) {
    // Phase 5 will implement: read OnboardingRound where roundNumber=1,
    // derive careerGoal/skillLevel/learningPace from answers,
    // then upsert LearnerProfile.
    // For now, this method signature exists so the service contract is stable.
    throw new Error(
      `createFromRoundOne not yet implemented for user ${userId}`,
    );
  }
}
