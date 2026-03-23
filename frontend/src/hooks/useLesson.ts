import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import { qk } from '../lib/query/queryKeys';

export interface ExternalLink {
  title: string;
  url: string;
  type: 'documentation' | 'video' | 'tutorial' | 'course' | 'interactive';
}

export interface LessonData {
  id: string;
  title: string;
  slug: string;
  summary: string;
  externalLinks: string;
  estimatedMins: number;
  quiz?: { id: string; title: string } | null;
}

export function useLesson(slug: string | undefined) {
  return useQuery({
    queryKey: qk.lesson(slug ?? ''),
    queryFn: async () => {
      api.post(`/lessons/${slug}/start`).catch(() => {});
      const res = await api.get(`/lessons/${slug}`);
      return res.data.data as LessonData;
    },
    enabled: !!slug,
  });
}
