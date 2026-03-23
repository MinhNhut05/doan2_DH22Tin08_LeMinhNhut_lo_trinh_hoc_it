import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import api from '../services/api';
import { vi } from '../strings/vi';

export interface GradedAnswer {
  questionId: string;
  selected: string[];
  correct: string[];
  isCorrect: boolean;
  explanation: string | null;
}

export interface QuizResult {
  score: number;
  passed: boolean;
  totalQuestions: number;
  correctCount: number;
  passThreshold: number;
  answers: GradedAnswer[];
}

export function useQuizSubmit(lessonSlug: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (answers: Record<string, string[]>) => {
      const res = await api.post(`/lessons/${lessonSlug}/quiz/submit`, { answers });
      return (res.data?.data ?? res.data) as QuizResult;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['progress'] });
    },
    onError: () => {
      toast.error(vi.quiz.submitError);
    },
  });
}
