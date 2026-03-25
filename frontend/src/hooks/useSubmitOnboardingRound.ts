import { useMutation, useQueryClient } from '@tanstack/react-query';

import api from '../services/api';

export interface RoundOneData {
  careerGoal: string;
  priorKnowledge: string[];
  learningBackground: string;
  hoursPerWeek: number;
}

export interface RoundTwoData {
  targetRole: string;
  workEnvironment: string;
  timeline: string;
  learningStyle: string;
}

export interface RoundThreeData {
  skillRatings: Record<string, number>;
}

export type OnboardingRoundPayload = RoundOneData | RoundTwoData | RoundThreeData;

export interface SubmitOnboardingRoundInput {
  round: 1 | 2 | 3;
  data: OnboardingRoundPayload;
}

const ROUND_ENDPOINTS: Record<SubmitOnboardingRoundInput['round'], string> = {
  1: '/onboarding/submit',
  2: '/onboarding/submit/round-two',
  3: '/onboarding/submit/round-three',
};

export function useSubmitOnboardingRound() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ round, data }: SubmitOnboardingRoundInput) => {
      const res = await api.post(ROUND_ENDPOINTS[round], data);
      return res.data.data;
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['onboarding', 'status'] }),
        queryClient.invalidateQueries({ queryKey: ['learner-profile', 'me'] }),
      ]);
    },
  });
}
