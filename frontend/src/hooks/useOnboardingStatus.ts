import { useQuery } from '@tanstack/react-query';

import api from '../services/api';

export interface OnboardingStatus {
  completedRounds: number[];
  nextRound: number | null;
  resumeAvailable: boolean;
  canRequestRecommendation: boolean;
  hasConfirmedPath: boolean;
}

export function useOnboardingStatus() {
  return useQuery({
    queryKey: ['onboarding', 'status'],
    queryFn: async () => {
      const res = await api.get('/onboarding/status');
      return res.data.data as OnboardingStatus;
    },
  });
}
