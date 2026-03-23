import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import api from '../services/api';
import { vi } from '../strings/vi';

export function useLessonComplete(slug: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const res = await api.post(`/lessons/${slug}/complete`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['progress'] });
      if (slug) {
        queryClient.invalidateQueries({ queryKey: ['lesson', slug] });
      }
      queryClient.invalidateQueries({ queryKey: ['learning-paths'] });
    },
    onError: () => {
      toast.error(vi.lesson.completeError);
    },
  });
}
