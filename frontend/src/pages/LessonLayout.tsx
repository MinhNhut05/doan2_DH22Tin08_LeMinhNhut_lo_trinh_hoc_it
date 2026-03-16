import { useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import LessonSidebar from '../components/LessonSidebar';

interface Props {
  children: React.ReactNode;
}

export default function LessonLayout({ children }: Props) {
  const { slug } = useParams<{ slug: string }>();
  const [searchParams] = useSearchParams();
  const pathSlug = searchParams.get('path');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar — desktop */}
      <aside className="hidden md:block w-72 border-r bg-white overflow-y-auto shrink-0">
        <LessonSidebar pathSlug={pathSlug} currentLessonSlug={slug ?? ''} />
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div
            className="fixed inset-0 bg-black/30"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="fixed left-0 top-0 bottom-0 w-72 bg-white overflow-y-auto z-50">
            <LessonSidebar pathSlug={pathSlug} currentLessonSlug={slug ?? ''} />
          </aside>
        </div>
      )}

      {/* Main content */}
      <main className="flex-1 min-w-0">
        {/* Mobile toggle button */}
        <button
          className="md:hidden fixed bottom-4 left-4 z-30 bg-blue-600 text-white p-3 rounded-full shadow-lg"
          onClick={() => setSidebarOpen(true)}
        >
          ☰
        </button>
        {children}
      </main>
    </div>
  );
}
