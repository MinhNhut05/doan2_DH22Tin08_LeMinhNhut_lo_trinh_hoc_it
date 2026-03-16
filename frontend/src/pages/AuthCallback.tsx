import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

// Trang callback sau OAuth (Google / GitHub)
// Backend redirect về: /auth/callback?token=xxx&isNewUser=true
export default function AuthCallback() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const setToken = useAuthStore((s) => s.setToken);

  useEffect(() => {
    const token = params.get('token');
    const isNewUser = params.get('isNewUser') === 'true';
    if (token) {
      setToken(token);
      navigate(isNewUser ? '/onboarding' : '/dashboard', { replace: true });
    } else {
      navigate('/login', { replace: true });
    }
  }, [params, navigate, setToken]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-500">Đang đăng nhập...</p>
    </div>
  );
}
