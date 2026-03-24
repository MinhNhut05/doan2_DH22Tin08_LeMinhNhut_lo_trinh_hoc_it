import { useQuery } from '@tanstack/react-query';

import { qk } from '../lib/query/queryKeys';
import api from '../services/api';
import { useAuthStore } from '../stores/authStore';

/**
 * Fetches the authenticated user's enrolled learning path slugs.
 * Returns a Set<string> for O(1) lookup in Explore cards.
 *
 * Only enabled when user is authenticated (accessToken exists).
 * Auto-invalidated when useEnroll fires because query key
 * ['learning-paths', 'my-enrollments'] is a child of ['learning-paths'].
 */
export function useMyEnrollments() {
  const accessToken = useAuthStore((s) => s.accessToken);

  const query = useQuery({
    queryKey: qk.myEnrollments,
    queryFn: async () => {
      const res = await api.get('/learning-paths/my-enrollments');
      return res.data.data as string[];
    },
    enabled: !!accessToken,
  });

  const enrolledSlugs = new Set(query.data ?? []);

  return { ...query, enrolledSlugs };
}
