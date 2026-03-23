import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import { qk } from '../lib/query/queryKeys';

export interface LessonItem {
  id: string;
  title: string;
  slug: string;
  summary: string;
  estimatedMins: number;
  quiz?: { id: string } | null;
}

export interface TrackLesson {
  order: number;
  lesson: LessonItem;
}

export interface Track {
  id: string;
  name: string;
  isOptional: boolean;
  order: number;
  trackLessons: TrackLesson[];
}

export function useLessonOutline(pathSlug: string | null) {
  return useQuery({
    queryKey: qk.lessonOutline(pathSlug ?? ''),
    queryFn: async () => {
      const res = await api.get(`/learning-paths/${pathSlug}/lessons`);
      return res.data.data as Track[];
    },
    enabled: !!pathSlug,
  });
}
