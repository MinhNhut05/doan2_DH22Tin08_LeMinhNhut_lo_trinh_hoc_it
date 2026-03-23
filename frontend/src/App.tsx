import { Route, Routes, Navigate } from 'react-router-dom';
import AdminGuard from './components/AdminGuard';
import ProtectedRoute from './components/ProtectedRoute';
import AppLayout from './components/layout/AppLayout';
import AdminAIContent from './pages/admin/AdminAIContent';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminLayout from './pages/admin/AdminLayout';
import AdminLearningPaths from './pages/admin/AdminLearningPaths';
import AdminLessons from './pages/admin/AdminLessons';
import AdminQuizzes from './pages/admin/AdminQuizzes';
import AdminTracks from './pages/admin/AdminTracks';
import AdminUsers from './pages/admin/AdminUsers';
import AiChat from './pages/AiChat';
import AuthCallback from './pages/AuthCallback';
import Dashboard from './pages/Dashboard';
import Explore from './pages/Explore';
import Lesson from './pages/Lesson';
import LessonLayout from './pages/LessonLayout';
import Landing from './pages/Landing';
import AuthPage from './pages/Login';
import Onboarding from './pages/Onboarding';
import PaymentResult from './pages/PaymentResult';
import Plans from './pages/Plans';
import Quiz from './pages/Quiz';
import Settings from './pages/Settings';
import { useAuthStore } from './stores/authStore';

export default function App() {
  const token = useAuthStore((s) => s.accessToken);
  const isLoading = useAuthStore((s) => s.isLoading);

  return (
    <Routes>
      <Route
        path="/"
        element={
          isLoading ? <Landing /> : token ? <Navigate to="/dashboard" replace /> : <Landing />
        }
      />
      <Route
        path="/login"
        element={
          isLoading ? <AuthPage /> : token ? <Navigate to="/dashboard" replace /> : <AuthPage />
        }
      />
      <Route path="/auth/callback" element={<AuthCallback />} />

      <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />

      <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/ai-chat" element={<AiChat />} />
        <Route path="/explore" element={<Explore />} />
        <Route path="/lesson/:slug/quiz" element={<Quiz />} />
        <Route path="/lesson/:slug" element={<LessonLayout><Lesson /></LessonLayout>} />
        <Route path="/plans/result" element={<PaymentResult />} />
        <Route path="/plans" element={<Plans />} />
        <Route path="/settings" element={<Settings />} />
      </Route>

      <Route path="/admin" element={<AdminGuard><AdminLayout /></AdminGuard>}>
        <Route index element={<AdminDashboard />} />
        <Route path="learning-paths" element={<AdminLearningPaths />} />
        <Route path="tracks" element={<AdminTracks />} />
        <Route path="lessons" element={<AdminLessons />} />
        <Route path="quizzes" element={<AdminQuizzes />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="ai-content" element={<AdminAIContent />} />
      </Route>

      <Route
        path="*"
        element={
          isLoading ? null : <Navigate to={token ? '/dashboard' : '/'} replace />
        }
      />
    </Routes>
  );
}
