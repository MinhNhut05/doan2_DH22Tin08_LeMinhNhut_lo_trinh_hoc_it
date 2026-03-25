import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

import api from '../services/api';

export function useConfirmOnboardingPath() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (learningPathId: string) => {
      const res = await api.post('/onboarding/confirm', { learningPathId });
      return res.data.data;
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['onboarding', 'status'] }),
        queryClient.invalidateQueries({ queryKey: ['learner-profile', 'me'] }),
        queryClient.invalidateQueries({ queryKey: ['learning-paths'] }),
      ]);

      navigate('/dashboard', { replace: true });
    },
  });
}
