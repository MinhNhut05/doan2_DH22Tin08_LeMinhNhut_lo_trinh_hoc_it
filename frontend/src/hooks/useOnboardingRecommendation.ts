import { useQuery } from '@tanstack/react-query';

import api from '../services/api';

export interface OnboardingRecommendation {
  source: 'ai' | 'fallback';
  primaryPath: string;
  learningPathId: string;
  alternativePaths: string[];
  reason: string;
  focusAreas: string[];
  tips: string[];
}

export function useOnboardingRecommendation(enabled: boolean) {
  return useQuery({
    queryKey: ['onboarding', 'recommendation'],
    queryFn: async () => {
      const res = await api.get('/onboarding/recommendation');
      return res.data.data as OnboardingRecommendation;
    },
    enabled,
  });
}
