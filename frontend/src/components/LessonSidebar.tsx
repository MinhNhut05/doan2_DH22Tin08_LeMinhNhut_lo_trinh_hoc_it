import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, ChevronRight } from 'lucide-react';
import api from '../services/api';

// ─── TypeScript Interfaces ────────────────────────────────────────────────────

interface LessonItem {
  id: string;
  title: string;
  slug: string;
  summary: string;
  estimatedMins: number;
}

interface TrackLesson {
  order: number;
  lesson: LessonItem;
}

interface Track {
  id: string;
  name: string;
  isOptional: boolean;
  order: number;
  trackLessons: TrackLesson[];
}

interface Props {
  pathSlug: string | null;
  currentLessonSlug: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function LessonSidebar({ pathSlug, currentLessonSlug }: Props) {
  const navigate = useNavigate();

  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  // Track nào đang mở — mặc định mở track chứa lesson hiện tại
  const [openTracks, setOpenTracks] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!pathSlug) return;

    setLoading(true);
    setError('');

    api
      .get(`/learning-paths/${pathSlug}/lessons`)
      .then((res) => {
        const data: Track[] = res.data.data;
        setTracks(data);

        // Tự động mở track chứa lesson hiện tại
        const initial: Record<string, boolean> = {};
        data.forEach((track) => {
          const hasCurrent = track.trackLessons.some(
            (tl) => tl.lesson.slug === currentLessonSlug,
          );
          initial[track.id] = hasCurrent;
        });
        setOpenTracks(initial);
      })
      .catch(() => setError('Không thể tải danh sách bài học.'))
      .finally(() => setLoading(false));
  }, [pathSlug, currentLessonSlug]);

  // Toggle mở/đóng track
  function toggleTrack(trackId: string) {
    setOpenTracks((prev) => ({ ...prev, [trackId]: !prev[trackId] }));
  }

  // ── Fallback: không có pathSlug ─────────────────────────────────────────────
  if (!pathSlug) {
    return (
      <div className="p-5">
        <p className="text-sm text-gray-400 text-center">
          Chọn lộ trình để xem danh sách bài học
        </p>
      </div>
    );
  }

  // ── Loading state ───────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="p-5">
        <p className="text-sm text-gray-400">Đang tải...</p>
      </div>
    );
  }

  // ── Error state ─────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="p-5">
        <p className="text-sm text-red-500">{error}</p>
      </div>
    );
  }

  // ── Main render ─────────────────────────────────────────────────────────────
  return (
    <div className="py-4">
      {/* Header */}
      <div className="px-4 pb-3 border-b border-gray-100">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
          Danh sách bài học
        </p>
      </div>

      {/* Tracks */}
      <nav className="mt-2">
        {tracks.map((track) => {
          const isOpen = openTracks[track.id] ?? false;

          return (
            <div key={track.id} className="mb-1">
              {/* Track header — collapsible */}
              <button
                onClick={() => toggleTrack(track.id)}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-left hover:bg-gray-50 transition-colors"
              >
                {isOpen ? (
                  <ChevronDown size={14} className="text-gray-400 shrink-0" />
                ) : (
                  <ChevronRight size={14} className="text-gray-400 shrink-0" />
                )}
                <span className="text-sm font-semibold text-gray-700 truncate flex-1">
                  {track.name}
                </span>
                {track.isOptional && (
                  <span className="text-[10px] font-medium bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full shrink-0">
                    optional
                  </span>
                )}
              </button>

              {/* Lesson list */}
              {isOpen && (
                <ul className="pb-1">
                  {track.trackLessons.map((tl) => {
                    const isCurrent = tl.lesson.slug === currentLessonSlug;

                    return (
                      <li key={tl.lesson.id}>
                        <button
                          onClick={() =>
                            navigate(`/lesson/${tl.lesson.slug}?path=${pathSlug}`)
                          }
                          className={`w-full text-left pl-9 pr-4 py-2 text-sm transition-colors ${
                            isCurrent
                              ? 'bg-blue-50 border-l-4 border-blue-600 text-blue-700 font-medium pl-8'
                              : 'text-gray-600 hover:bg-gray-50 border-l-4 border-transparent'
                          }`}
                        >
                          <span className="flex items-center gap-2">
                            {/* Status indicator — placeholder cho tương lai */}
                            <span className="shrink-0">
                              {isCurrent ? '🔵' : '⚪'}
                            </span>
                            <span className="truncate">{tl.lesson.title}</span>
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          );
        })}
      </nav>
    </div>
  );
}
