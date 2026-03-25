import { useQuery } from '@tanstack/react-query';

import api from '../services/api';

interface OnboardingQuestionOption {
  value: string;
  label: string;
}

export interface OnboardingQuestion {
  id: string;
  question: string;
  type: 'single' | 'multiple';
  options: OnboardingQuestionOption[];
}

export function useOnboardingQuestions(roundNumber: number | null) {
  return useQuery({
    queryKey: ['onboarding', 'questions', roundNumber],
    queryFn: async () => {
      const res = await api.get(`/onboarding/questions/${roundNumber}`);
      return res.data.data as OnboardingQuestion[];
    },
    enabled: roundNumber !== null,
  });
}
