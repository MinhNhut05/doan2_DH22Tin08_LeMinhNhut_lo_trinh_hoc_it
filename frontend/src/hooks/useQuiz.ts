import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import { qk } from '../lib/query/queryKeys';

export interface QuizOption {
  id: string;
  text: string;
}

export interface QuizQuestion {
  id: string;
  questionText: string;
  questionType: 'SINGLE_CHOICE' | 'MULTIPLE_CHOICE';
  options: QuizOption[];
  order: number;
}

export interface QuizData {
  id: string;
  title: string;
  description: string | null;
  passThreshold: number;
  retryLimit: number;
  questions: QuizQuestion[];
}

export function useQuiz(lessonSlug: string | undefined) {
  return useQuery({
    queryKey: qk.quiz(lessonSlug ?? ''),
    queryFn: async () => {
      const res = await api.get(`/lessons/${lessonSlug}/quiz`);
      return (res.data?.data ?? res.data) as QuizData;
    },
    enabled: !!lessonSlug,
  });
}
