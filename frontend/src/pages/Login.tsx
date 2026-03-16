import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import api from '../services/api';
import { useAuthStore } from '../stores/authStore';

// ─── Helper: extract lỗi từ axios response ───────────────────────────────────
type ApiError = { response?: { data?: { error?: { message?: string } } } };
function getErrMsg(err: unknown, fallback: string): string {
  return (err as ApiError)?.response?.data?.error?.message ?? fallback;
}

// ─── OAuth base URL ───────────────────────────────────────────────────────────
const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3002/api/v1';

// ─── Sub-components ───────────────────────────────────────────────────────────

/** Alert box tái sử dụng */
function Alert({ type, msg }: { type: 'error' | 'success' | 'info'; msg: string }) {
  const cls = {
    error: 'bg-red-50 border-red-200 text-red-700',
    success: 'bg-green-50 border-green-200 text-green-700',
    info: 'bg-blue-50 border-blue-200 text-blue-700',
  }[type];
  return (
    <div className={`border rounded-lg px-4 py-3 text-sm mb-4 ${cls}`}>{msg}</div>
  );
}

/** Divider "─── hoặc ───" */
function Divider() {
  return (
    <div className="flex items-center my-5 gap-3">
      <div className="flex-1 h-px bg-gray-200" />
      <span className="text-xs text-gray-400 whitespace-nowrap">hoặc</span>
      <div className="flex-1 h-px bg-gray-200" />
    </div>
  );
}

/** Nút OAuth (Google / GitHub) */
function OAuthButtons() {
  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={() => (window.location.href = `${API_URL}/auth/google`)}
        className="w-full flex items-center justify-center gap-3 border border-gray-300 rounded-lg py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
      >
        {/* Google "G" icon SVG */}
        <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
        Tiếp tục với Google
      </button>

      <button
        type="button"
        onClick={() => (window.location.href = `${API_URL}/auth/github`)}
        className="w-full flex items-center justify-center gap-3 border border-gray-300 rounded-lg py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
      >
        {/* GitHub icon SVG */}
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
        </svg>
        Tiếp tục với GitHub
      </button>
    </div>
  );
}

/** Input password có toggle ẩn/hiện */
function PasswordInput({
  value,
  onChange,
  placeholder,
  show,
  onToggle,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  show: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="relative">
      <input
        type={show ? 'text' : 'password'}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required
        className="w-full border rounded-lg px-4 py-2.5 pr-11 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <button
        type="button"
        onClick={onToggle}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
        aria-label={show ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
      >
        {show ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function AuthPage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);

  // ── Tab chính ─────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');

  // ── Tab Đăng nhập ─────────────────────────────────────────────
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Forgot password flow
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotStep, setForgotStep] = useState<'email' | 'otp' | 'new-password' | 'done'>('email');
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotCode, setForgotCode] = useState('');
  const [forgotNewPassword, setForgotNewPassword] = useState('');
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState('');
  const [showForgotPassword2, setShowForgotPassword2] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState('');
  const [forgotInfo, setForgotInfo] = useState('');

  // ── Tab Đăng ký ───────────────────────────────────────────────
  const [registerStep, setRegisterStep] = useState<'form' | 'verify-otp' | 'done'>('form');
  const [regDisplayName, setRegDisplayName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regShowPassword, setRegShowPassword] = useState(false);
  const [regOtpCode, setRegOtpCode] = useState('');
  const [regLoading, setRegLoading] = useState(false);
  const [regError, setRegError] = useState('');
  const [regInfo, setRegInfo] = useState('');
  const [storedRegEmail, setStoredRegEmail] = useState('');

  // ── Handlers: Login ───────────────────────────────────────────

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError('');
    try {
      const res = await api.post('/auth/login', { email: loginEmail, password: loginPassword });
      const { accessToken, user } = res.data.data;
      setAuth(accessToken, user);
      navigate(user.isNewUser ? '/onboarding' : '/dashboard');
    } catch (err) {
      setLoginError(getErrMsg(err, 'Email hoặc mật khẩu không đúng'));
    } finally {
      setLoginLoading(false);
    }
  }

  // ── Handlers: Forgot password ─────────────────────────────────

  async function handleForgotEmail(e: React.FormEvent) {
    e.preventDefault();
    setForgotLoading(true);
    setForgotError('');
    setForgotInfo('');
    try {
      await api.post('/auth/forgot-password', { email: forgotEmail });
      setForgotInfo('Đã gửi mã OTP đến email của bạn!');
      setForgotStep('otp');
    } catch (err) {
      setForgotError(getErrMsg(err, 'Không thể gửi email. Kiểm tra lại địa chỉ email.'));
    } finally {
      setForgotLoading(false);
    }
  }

  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault();
    if (forgotNewPassword !== forgotConfirmPassword) {
      setForgotError('Mật khẩu xác nhận không khớp');
      return;
    }
    setForgotLoading(true);
    setForgotError('');
    try {
      await api.post('/auth/reset-password', {
        email: forgotEmail,
        code: forgotCode,
        newPassword: forgotNewPassword,
      });
      setForgotStep('done');
    } catch (err) {
      setForgotError(getErrMsg(err, 'Mã OTP không đúng hoặc đã hết hạn'));
    } finally {
      setForgotLoading(false);
    }
  }

  function resetForgotFlow() {
    setShowForgotPassword(false);
    setForgotStep('email');
    setForgotEmail('');
    setForgotCode('');
    setForgotNewPassword('');
    setForgotConfirmPassword('');
    setForgotError('');
    setForgotInfo('');
  }

  // ── Handlers: Register ────────────────────────────────────────

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    if (regPassword !== regConfirmPassword) {
      setRegError('Mật khẩu xác nhận không khớp');
      return;
    }
    setRegLoading(true);
    setRegError('');
    try {
      await api.post('/auth/register', {
        email: regEmail,
        password: regPassword,
        displayName: regDisplayName,
      });
      setStoredRegEmail(regEmail);
      setRegInfo('Đã gửi mã OTP đến email của bạn!');
      setRegisterStep('verify-otp');
    } catch (err) {
      setRegError(getErrMsg(err, 'Đăng ký thất bại. Email có thể đã được dùng.'));
    } finally {
      setRegLoading(false);
    }
  }

  async function handleVerifyRegOtp(e: React.FormEvent) {
    e.preventDefault();
    setRegLoading(true);
    setRegError('');
    try {
      await api.post('/auth/otp/verify', { email: storedRegEmail, code: regOtpCode });
      // Reset toàn bộ register state rồi chuyển sang login
      setRegisterStep('form');
      setRegDisplayName('');
      setRegEmail('');
      setRegPassword('');
      setRegConfirmPassword('');
      setRegOtpCode('');
      setRegInfo('');
      setStoredRegEmail('');
      setActiveTab('login');
      setLoginError('');
      // Hiển thị thông báo thành công phía login tab
      // (dùng loginError với màu xanh sẽ không hợp lý → dùng state riêng)
    } catch (err) {
      setRegError(getErrMsg(err, 'OTP không đúng hoặc đã hết hạn'));
    } finally {
      setRegLoading(false);
    }
  }

  async function handleResendRegOtp() {
    setRegLoading(true);
    setRegError('');
    setRegInfo('');
    try {
      await api.post('/auth/otp/request', { email: storedRegEmail });
      setRegInfo('Đã gửi lại mã OTP!');
    } catch (err) {
      setRegError(getErrMsg(err, 'Không thể gửi lại OTP'));
    } finally {
      setRegLoading(false);
    }
  }

  // ── Shared: switch tab ────────────────────────────────────────

  function handleSwitchTab(tab: 'login' | 'register') {
    setActiveTab(tab);
    // Reset errors khi đổi tab
    setLoginError('');
    setRegError('');
    setRegInfo('');
    resetForgotFlow();
  }

  // ─────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-10">
      <div className="bg-white rounded-2xl shadow-md w-full max-w-sm p-8">

        {/* Logo + subtitle */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-blue-600 tracking-tight">DevPath</h1>
          <p className="text-gray-500 text-sm mt-1">Lộ trình học IT cá nhân hóa</p>
        </div>

        {/* Tab buttons */}
        <div className="flex border-b border-gray-200 mb-6">
          <button
            type="button"
            onClick={() => handleSwitchTab('login')}
            className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
              activeTab === 'login'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Đăng nhập
          </button>
          <button
            type="button"
            onClick={() => handleSwitchTab('register')}
            className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
              activeTab === 'register'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Đăng ký
          </button>
        </div>

        {/* ════════════════════════════════════ TAB: LOGIN */}
        {activeTab === 'login' && (
          <div>
            {!showForgotPassword ? (
              /* ─── Login Form ─── */
              <>
                {loginError && <Alert type="error" msg={loginError} />}

                <form onSubmit={handleLogin} className="space-y-4">
                  <input
                    type="email"
                    placeholder="Email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    required
                    className="w-full border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />

                  <PasswordInput
                    value={loginPassword}
                    onChange={setLoginPassword}
                    placeholder="Mật khẩu"
                    show={showLoginPassword}
                    onToggle={() => setShowLoginPassword((v) => !v)}
                  />

                  <button
                    type="submit"
                    disabled={loginLoading}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg text-sm disabled:opacity-50 transition-colors"
                  >
                    {loginLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
                  </button>
                </form>

                <button
                  type="button"
                  onClick={() => { setShowForgotPassword(true); setLoginError(''); }}
                  className="block w-full text-center text-sm text-blue-600 hover:underline mt-3"
                >
                  Quên mật khẩu?
                </button>

                <Divider />
                <OAuthButtons />
              </>
            ) : (
              /* ─── Forgot Password Flow ─── */
              <div>
                {/* Header */}
                <div className="flex items-center gap-2 mb-5">
                  <button
                    type="button"
                    onClick={resetForgotFlow}
                    className="text-gray-400 hover:text-gray-600 text-xl leading-none"
                    aria-label="Quay lại"
                  >
                    ←
                  </button>
                  <h2 className="font-semibold text-gray-800 text-sm">Quên mật khẩu</h2>
                </div>

                {forgotError && <Alert type="error" msg={forgotError} />}
                {forgotInfo && <Alert type="info" msg={forgotInfo} />}

                {/* Step 1: Nhập email */}
                {forgotStep === 'email' && (
                  <form onSubmit={handleForgotEmail} className="space-y-4">
                    <p className="text-sm text-gray-500">
                      Nhập email của bạn để nhận mã OTP đặt lại mật khẩu.
                    </p>
                    <input
                      type="email"
                      placeholder="Email đã đăng ký"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      required
                      className="w-full border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      type="submit"
                      disabled={forgotLoading}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg text-sm disabled:opacity-50 transition-colors"
                    >
                      {forgotLoading ? 'Đang gửi...' : 'Gửi mã OTP'}
                    </button>
                  </form>
                )}

                {/* Step 2: Nhập OTP */}
                {forgotStep === 'otp' && (
                  <div className="space-y-4">
                    <p className="text-sm text-gray-500">
                      Nhập mã 6 chữ số đã gửi đến <strong>{forgotEmail}</strong>
                    </p>
                    <input
                      type="text"
                      placeholder="000000"
                      value={forgotCode}
                      onChange={(e) => setForgotCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      maxLength={6}
                      className="w-full border rounded-lg px-4 py-2.5 text-center text-lg font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setForgotError('');
                        setForgotStep('new-password');
                      }}
                      disabled={forgotCode.length < 6}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg text-sm disabled:opacity-50 transition-colors"
                    >
                      Xác nhận mã
                    </button>
                  </div>
                )}

                {/* Step 3: Đặt mật khẩu mới */}
                {forgotStep === 'new-password' && (
                  <form onSubmit={handleResetPassword} className="space-y-4">
                    <p className="text-sm text-gray-500">Nhập mật khẩu mới của bạn.</p>
                    <PasswordInput
                      value={forgotNewPassword}
                      onChange={setForgotNewPassword}
                      placeholder="Mật khẩu mới"
                      show={showForgotPassword2}
                      onToggle={() => setShowForgotPassword2((v) => !v)}
                    />
                    <input
                      type={showForgotPassword2 ? 'text' : 'password'}
                      placeholder="Xác nhận mật khẩu mới"
                      value={forgotConfirmPassword}
                      onChange={(e) => setForgotConfirmPassword(e.target.value)}
                      required
                      className="w-full border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      type="submit"
                      disabled={forgotLoading}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg text-sm disabled:opacity-50 transition-colors"
                    >
                      {forgotLoading ? 'Đang đặt lại...' : 'Đặt lại mật khẩu'}
                    </button>
                  </form>
                )}

                {/* Step 4: Done */}
                {forgotStep === 'done' && (
                  <div className="text-center space-y-4">
                    <div className="text-5xl">✅</div>
                    <p className="text-gray-700 font-medium">Đổi mật khẩu thành công!</p>
                    <p className="text-gray-500 text-sm">
                      Bạn có thể đăng nhập với mật khẩu mới.
                    </p>
                    <button
                      type="button"
                      onClick={resetForgotFlow}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg text-sm transition-colors"
                    >
                      Quay lại đăng nhập
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ════════════════════════════════════ TAB: REGISTER */}
        {activeTab === 'register' && (
          <div>
            {regError && <Alert type="error" msg={regError} />}
            {regInfo && <Alert type="info" msg={regInfo} />}

            {/* ─── Step 1: Điền form ─── */}
            {registerStep === 'form' && (
              <>
                <form onSubmit={handleRegister} className="space-y-4">
                  <input
                    type="text"
                    placeholder="Tên hiển thị"
                    value={regDisplayName}
                    onChange={(e) => setRegDisplayName(e.target.value)}
                    required
                    className="w-full border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="email"
                    placeholder="Email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    required
                    className="w-full border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <PasswordInput
                    value={regPassword}
                    onChange={setRegPassword}
                    placeholder="Mật khẩu"
                    show={regShowPassword}
                    onToggle={() => setRegShowPassword((v) => !v)}
                  />
                  <input
                    type={regShowPassword ? 'text' : 'password'}
                    placeholder="Xác nhận mật khẩu"
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    required
                    className="w-full border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="submit"
                    disabled={regLoading}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg text-sm disabled:opacity-50 transition-colors"
                  >
                    {regLoading ? 'Đang đăng ký...' : 'Đăng ký'}
                  </button>
                </form>

                <Divider />
                <OAuthButtons />
              </>
            )}

            {/* ─── Step 2: Nhập OTP xác thực email ─── */}
            {registerStep === 'verify-otp' && (
              <div className="space-y-4">
                <p className="text-sm text-gray-500">
                  Nhập mã 6 chữ số đã gửi đến <strong>{storedRegEmail}</strong>
                </p>
                <form onSubmit={handleVerifyRegOtp} className="space-y-4">
                  <input
                    type="text"
                    placeholder="000000"
                    value={regOtpCode}
                    onChange={(e) => setRegOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    maxLength={6}
                    className="w-full border rounded-lg px-4 py-2.5 text-center text-lg font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="submit"
                    disabled={regLoading || regOtpCode.length < 6}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg text-sm disabled:opacity-50 transition-colors"
                  >
                    {regLoading ? 'Đang xác nhận...' : 'Xác nhận OTP'}
                  </button>
                </form>

                <button
                  type="button"
                  onClick={handleResendRegOtp}
                  disabled={regLoading}
                  className="w-full text-sm text-blue-600 hover:underline disabled:opacity-50"
                >
                  Gửi lại mã
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setRegisterStep('form');
                    setRegOtpCode('');
                    setRegError('');
                    setRegInfo('');
                  }}
                  className="w-full text-sm text-gray-500 hover:text-gray-700"
                >
                  ← Quay lại
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
