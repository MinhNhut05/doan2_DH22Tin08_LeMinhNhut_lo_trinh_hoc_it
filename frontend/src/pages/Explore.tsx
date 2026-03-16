import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

// ─── TypeScript Interfaces ────────────────────────────────────────────────────

interface LearningPath {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedHours: number;
  isPublished: boolean;
  order: number;
  _count: { tracks: number };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const difficultyConfig: Record<
  LearningPath['difficulty'],
  { label: string; className: string }
> = {
  beginner:     { label: 'Cơ bản',    className: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
  intermediate: { label: 'Trung cấp', className: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' },
  advanced:     { label: 'Nâng cao',  className: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function Explore() {
  const navigate = useNavigate();

  const [paths, setPaths]       = useState<LearningPath[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const [enrolling, setEnrolling] = useState<Record<string, boolean>>({});
  const [enrolled, setEnrolled]   = useState<Record<string, boolean>>({});

  // Lấy danh sách learning paths khi component mount
  useEffect(() => {
    api
      .get('/learning-paths')
      .then((res) => setPaths(res.data.data))
      .catch(() => setError('Không thể tải danh sách lộ trình. Vui lòng thử lại.'))
      .finally(() => setLoading(false));
  }, []);

  // Đăng ký học một learning path theo slug
  async function handleEnroll(slug: string) {
    setEnrolling((prev) => ({ ...prev, [slug]: true }));
    setError('');

    try {
      await api.post(`/learning-paths/${slug}/enroll`);
      // 201 Created → đăng ký thành công, redirect về dashboard sau 1.5s
      setEnrolled((prev) => ({ ...prev, [slug]: true }));
      setTimeout(() => navigate('/dashboard'), 1500);
    } catch (err: unknown) {
      // Kiểm tra HTTP status từ Axios error
      const status = (err as { response?: { status?: number } })?.response?.status;

      if (status === 409) {
        // Đã đăng ký trước đó → chỉ đánh dấu enrolled, không redirect
        setEnrolled((prev) => ({ ...prev, [slug]: true }));
      } else {
        setError('Đăng ký thất bại. Vui lòng thử lại.');
      }
    } finally {
      setEnrolling((prev) => ({ ...prev, [slug]: false }));
    }
  }

  // ── Loading state ──────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <p className="text-gray-400 dark:text-gray-500">Đang tải...</p>
      </div>
    );
  }

  // ── Main render ────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-10 px-4">
      <div className="max-w-xl mx-auto space-y-6">

        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('/dashboard')}
            className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors flex items-center gap-1"
          >
            ← Dashboard
          </button>
          <h1 className="text-lg font-bold text-gray-800 dark:text-gray-100">Khám phá lộ trình</h1>
          {/* Spacer để căn giữa title */}
          <div className="w-20" />
        </div>

        {/* ── Inline error message ────────────────────────────────────────── */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* ── Empty state ─────────────────────────────────────────────────── */}
        {paths.length === 0 && !error && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm dark:shadow-gray-900/20 p-8 text-center">
            <p className="text-gray-500 dark:text-gray-400">Không có lộ trình nào</p>
          </div>
        )}

        {/* ── Learning path cards (2 cột trên md) ────────────────────────── */}
        {paths.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {paths.map((path) => {
              const diff = difficultyConfig[path.difficulty];
              const isEnrolling = enrolling[path.slug] ?? false;
              const isEnrolled  = enrolled[path.slug]  ?? false;

              return (
                <div key={path.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm dark:shadow-gray-900/20 p-5 flex flex-col gap-3">

                  {/* Icon + tên */}
                  <div className="flex items-start gap-3">
                    {path.icon && (
                      <span className="text-2xl leading-none mt-0.5">{path.icon}</span>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-800 dark:text-gray-100 leading-snug">{path.name}</p>
                      {path.description && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                          {path.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Meta badges */}
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className={`px-2 py-0.5 rounded-full font-medium ${diff.className}`}>
                      {diff.label}
                    </span>
                    <span className="text-gray-400 dark:text-gray-500">
                      ~{path.estimatedHours}h
                    </span>
                    <span className="text-gray-400 dark:text-gray-500">
                      {path._count.tracks} tracks
                    </span>
                  </div>

                  {/* Nút đăng ký */}
                  <button
                    onClick={() => !isEnrolled && handleEnroll(path.slug)}
                    disabled={isEnrolling || isEnrolled}
                    className={`w-full text-sm font-medium py-2.5 rounded-lg transition-colors mt-auto
                      ${isEnrolled
                        ? 'bg-green-50 text-green-700 border border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800 cursor-default'
                        : 'bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-60 disabled:cursor-not-allowed'
                      }`}
                  >
                    {isEnrolling
                      ? 'Đang đăng ký...'
                      : isEnrolled
                      ? '✅ Đã đăng ký'
                      : 'Đăng ký học'}
                  </button>

                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}
