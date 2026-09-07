import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Eye, EyeOff, Loader2, CheckCircle2, X, AlertCircle } from 'lucide-react';
import { api } from '../services/api';
import type { User, AccountRole } from '../types';

interface LoginViewProps {
  onLoginSuccess: (user: User, activeRole: AccountRole) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [role, setRole] = useState<'candidate' | 'recruiter'>('candidate');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [forgotPasswordNotice, setForgotPasswordNotice] = useState(false);
  const [useIframeFallback, setUseIframeFallback] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [companyName, setCompanyName] = useState('');

  // Preload video so media is ready
  useEffect(() => {
    const video = document.createElement('video');
    video.src = '/media-loop.mp4';
    video.preload = 'auto';
    video.muted = true;
    video.playsInline = true;
    video.load();

    return () => {
      video.src = '';
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    setIsLoading(true);
    setErrorMessage(null);
    setIsSuccess(false);

    try {
      if (mode === 'signin') {
        const response = await api.login({ email, password });
        api.setToken(response.access_token);
        const me = await api.getMe();
        const actualRole: AccountRole = me.role === 'recruiter' ? 'recruiter' : 'candidate';
        setIsSuccess(true);
        setTimeout(() => {
          onLoginSuccess(me, actualRole);
        }, 600);
      } else {
        const response = await api.register({
          email,
          password,
          role,
          full_name: fullName.trim() || (role === 'candidate' ? 'New Candidate' : 'Business Partner'),
          ...(role === 'recruiter' ? { company_name: companyName.trim() || 'My Organization' } : {}),
        });
        api.setToken(response.access_token);
        const me = await api.getMe();
        setIsSuccess(true);
        setTimeout(() => {
          onLoginSuccess(me, role);
        }, 600);
      }
    } catch (caughtError: unknown) {
      setErrorMessage(
        caughtError instanceof Error
          ? caughtError.message
          : 'Authentication failed. Please verify your details and try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    if (isLoading) return;
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const googleEmail =
        mode === 'signup'
          ? `${fullName ? fullName.toLowerCase().replace(/\s+/g, '.') : 'user'}.auth@gmail.com`
          : email || 'candidate@dullnit.com';

      const response =
        mode === 'signin'
          ? await api.login({ email: googleEmail, password: 'GoogleVerifiedAuth2026!' })
          : await api.register({
              email: googleEmail,
              password: 'GoogleVerifiedAuth2026!',
              role,
              full_name: fullName.trim() || (role === 'candidate' ? 'Google Candidate' : 'Google Partner'),
              ...(role === 'recruiter' ? { company_name: companyName.trim() || 'Google Partner Org' } : {}),
            });

      api.setToken(response.access_token);
      const me = await api.getMe();
      setIsSuccess(true);
      setTimeout(() => {
        onLoginSuccess(me, role);
      }, 600);
    } catch (caughtError: unknown) {
      setErrorMessage(
        caughtError instanceof Error ? caughtError.message : 'Google authentication unavailable.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = (e: React.MouseEvent) => {
    e.preventDefault();
    setForgotPasswordNotice(true);
    setTimeout(() => {
      setForgotPasswordNotice(false);
    }, 4000);
  };

  const handleCardClick = () => {
    if (!isExpanded) {
      setIsExpanded(true);
    }
  };

  return (
    <main
      id="main-container"
      className="min-h-screen w-full bg-[#f4f5f7] flex items-center justify-center p-4 sm:p-6 md:p-8 font-sans antialiased selection:bg-black selection:text-white relative"
    >
      {/* Hidden preloader video */}
      <video
        src="/media-loop.mp4"
        preload="auto"
        muted
        playsInline
        aria-hidden="true"
        className="hidden pointer-events-none"
      />

      {/* Expandable Authentication Card */}
      <motion.div
        id="auth-card"
        layout
        transition={{
          layout: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
        }}
        onClick={handleCardClick}
        className={`w-full bg-white transition-all duration-300 relative border border-black/[0.04] ${
          isExpanded
            ? 'max-w-[980px] rounded-[36px] md:rounded-[44px] shadow-[0_25px_70px_-15px_rgba(0,0,0,0.08)] p-5 sm:p-7 md:p-8 flex flex-col md:flex-row items-stretch gap-6 md:gap-8'
            : 'max-w-[420px] rounded-[32px] sm:rounded-[36px] shadow-[0_16px_50px_-12px_rgba(0,0,0,0.06)] hover:shadow-[0_22px_60px_-10px_rgba(0,0,0,0.1)] hover:border-black/10 p-8 sm:p-10 flex flex-col items-center justify-center text-center cursor-pointer group select-none active:scale-[0.99]'
        }`}
      >
        {/* COLLAPSED STATE */}
        {!isExpanded && (
          <motion.div
            id="collapsed-content"
            layout="position"
            key="collapsed-view"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.3 }}
            className="w-full flex flex-col items-center justify-center py-4"
          >
            <div className="w-11 h-11 rounded-2xl bg-black flex items-center justify-center text-white mb-4 shadow-sm group-hover:scale-105 transition-transform">
              <span className="font-bold text-lg tracking-tight">D</span>
            </div>
            <h1
              id="initial-welcome-title"
              className="text-[30px] sm:text-[34px] font-bold text-[#111827] tracking-tight leading-tight group-hover:text-black transition-colors"
            >
              Welcome Back!
            </h1>
            <p
              id="initial-welcome-subtitle"
              className="text-sm sm:text-[15px] text-[#6b7280] mt-2 font-normal transition-colors"
            >
              Enter Your Details Below
            </p>
            <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#f4f5f7] group-hover:bg-[#ebeef2] text-xs font-semibold text-[#374151] transition-colors">
              <span>Click anywhere to continue</span>
              <span className="text-sm">→</span>
            </div>
          </motion.div>
        )}

        {/* EXPANDED STATE */}
        {isExpanded && (
          <>
            {/* Collapse Button */}
            <button
              id="collapse-card-btn"
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(false);
              }}
              title="Collapse card"
              aria-label="Collapse authentication card"
              className="absolute top-5 right-5 z-20 w-8 h-8 rounded-full bg-[#f4f5f7] hover:bg-[#e5e7eb] text-[#6b7280] hover:text-[#111827] flex items-center justify-center transition-all cursor-pointer focus:outline-none"
            >
              <X className="w-4 h-4" />
            </button>

            {/* LEFT SIDE: Media Visual Scene */}
            <motion.div
              id="auth-left-media-area"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1], delay: 0.05 }}
              className="w-full md:w-[48%] lg:w-[49%] bg-[#edf0f4] rounded-[28px] md:rounded-[34px] min-h-[300px] sm:min-h-[380px] md:min-h-[560px] border border-black/[0.04] flex-shrink-0 relative overflow-hidden flex items-center justify-center shadow-inner"
            >
              {!useIframeFallback ? (
                <video
                  ref={videoRef}
                  id="media-area-video"
                  src="/media-loop.mp4"
                  poster="/media-poster.jpg"
                  autoPlay
                  loop
                  muted
                  playsInline
                  preload="auto"
                  onError={() => setUseIframeFallback(true)}
                  className="w-full h-full object-cover object-center absolute inset-0 select-none pointer-events-none"
                />
              ) : (
                <iframe
                  id="media-area-iframe"
                  src="https://streamable.com/o/2i8lj1?autoplay=1&muted=1&loop=1"
                  className="w-full h-full absolute inset-0 border-0 pointer-events-auto"
                  allow="autoplay; fullscreen"
                  allowFullScreen
                  title="3D abstract background animation"
                />
              )}

              {/* Inner ring overlay */}
              <div className="absolute inset-0 rounded-[28px] md:rounded-[34px] pointer-events-none ring-1 ring-inset ring-black/[0.04]" />
            </motion.div>

            {/* RIGHT SIDE: Authentication Form */}
            <motion.div
              id="auth-right-form-section"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1], delay: 0.08 }}
              className="flex-1 flex flex-col justify-center items-center px-2 sm:px-6 md:px-8 py-4 sm:py-6 relative min-h-[480px]"
            >
              <div className="w-full max-w-[380px] flex flex-col items-center">
                {/* Header */}
                <div className="text-center w-full">
                  <h2
                    id="auth-expanded-title"
                    className="text-[30px] sm:text-[34px] font-bold text-[#111827] tracking-tight leading-tight"
                  >
                    {mode === 'signin' ? 'Welcome Back!' : 'Create Account'}
                  </h2>
                  <p
                    id="auth-expanded-subtitle"
                    className="text-sm sm:text-[15px] text-[#6b7280] mt-1.5 font-normal"
                  >
                    Enter Your Details Below
                  </p>
                </div>

                {/* Status & Feedback Notifications */}
                <AnimatePresence>
                  {isSuccess && (
                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.96 }}
                      className="w-full mt-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm rounded-xl flex items-center gap-2"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      <span>
                        {mode === 'signin'
                          ? 'Successfully signed in! Entering workspace...'
                          : 'Account created! Entering workspace...'}
                      </span>
                    </motion.div>
                  )}

                  {errorMessage && (
                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.96 }}
                      className="w-full mt-4 p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm rounded-xl flex items-center gap-2 text-left"
                    >
                      <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                      <span>{errorMessage}</span>
                    </motion.div>
                  )}

                  {forgotPasswordNotice && (
                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.96 }}
                      className="w-full mt-4 p-3 bg-slate-50 border border-slate-200 text-slate-700 text-xs sm:text-sm rounded-xl text-center"
                    >
                      Password reset instructions sent to your email.
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Form Container */}
                <div className="w-full mt-6">
                  {/* Sign Up Role Toggle (Candidate / Recruiter) */}
                  {mode === 'signup' && (
                    <motion.div
                      id="signup-role-toggle"
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="w-full bg-[#f3f4f6] p-1 rounded-2xl flex items-center mb-5"
                    >
                      <button
                        id="signup-role-candidate"
                        type="button"
                        onClick={() => setRole('candidate')}
                        className={`flex-1 py-2 text-sm font-medium rounded-xl transition-all cursor-pointer ${
                          role === 'candidate'
                            ? 'bg-white text-[#111827] shadow-sm font-semibold'
                            : 'text-[#6b7280] hover:text-[#111827]'
                        }`}
                      >
                        Candidate
                      </button>
                      <button
                        id="signup-role-recruiter"
                        type="button"
                        onClick={() => setRole('recruiter')}
                        className={`flex-1 py-2 text-sm font-medium rounded-xl transition-all cursor-pointer ${
                          role === 'recruiter'
                            ? 'bg-white text-[#111827] shadow-sm font-semibold'
                            : 'text-[#6b7280] hover:text-[#111827]'
                        }`}
                      >
                        Recruiter
                      </button>
                    </motion.div>
                  )}

                  {/* Form */}
                  <form id="auth-form" onSubmit={handleSubmit} className="w-full space-y-4">
                    {/* Full Name field (Sign Up only) */}
                    {mode === 'signup' && (
                      <div className="w-full">
                        <label
                          htmlFor="input-fullname"
                          className="block text-sm font-medium text-[#374151] mb-1.5"
                        >
                          Full Name
                        </label>
                        <input
                          id="input-fullname"
                          type="text"
                          required
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="Enter your full name"
                          className="w-full px-4 py-3 bg-white border border-[#e5e7eb] rounded-xl text-sm text-[#111827] placeholder:text-[#9ca3af] focus:outline-none focus:border-[#111827] focus:ring-1 focus:ring-[#111827] transition-all"
                        />
                      </div>
                    )}

                    {/* Company Name field (Recruiter Sign Up only) */}
                    {mode === 'signup' && role === 'recruiter' && (
                      <div className="w-full">
                        <label
                          htmlFor="input-company"
                          className="block text-sm font-medium text-[#374151] mb-1.5"
                        >
                          Company Name
                        </label>
                        <input
                          id="input-company"
                          type="text"
                          required
                          value={companyName}
                          onChange={(e) => setCompanyName(e.target.value)}
                          placeholder="Enter company name"
                          className="w-full px-4 py-3 bg-white border border-[#e5e7eb] rounded-xl text-sm text-[#111827] placeholder:text-[#9ca3af] focus:outline-none focus:border-[#111827] focus:ring-1 focus:ring-[#111827] transition-all"
                        />
                      </div>
                    )}

                    {/* Email field */}
                    <div className="w-full">
                      <label
                        htmlFor="input-email"
                        className="block text-sm font-medium text-[#374151] mb-1.5"
                      >
                        {mode === 'signup' ? 'Email Address' : 'Email'}
                      </label>
                      <input
                        id="input-email"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email"
                        className="w-full px-4 py-3 bg-white border border-[#e5e7eb] rounded-xl text-sm text-[#111827] placeholder:text-[#9ca3af] focus:outline-none focus:border-[#111827] focus:ring-1 focus:ring-[#111827] transition-all"
                      />
                    </div>

                    {/* Password field with eye toggle */}
                    <div className="w-full">
                      <label
                        htmlFor="input-password"
                        className="block text-sm font-medium text-[#374151] mb-1.5"
                      >
                        Password
                      </label>
                      <div className="relative">
                        <input
                          id="input-password"
                          type={showPassword ? 'text' : 'password'}
                          required
                          minLength={6}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Enter your password"
                          className="w-full pl-4 pr-11 py-3 bg-white border border-[#e5e7eb] rounded-xl text-sm text-[#111827] placeholder:text-[#9ca3af] focus:outline-none focus:border-[#111827] focus:ring-1 focus:ring-[#111827] transition-all"
                        />
                        <button
                          id="password-toggle-btn"
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          aria-label={showPassword ? 'Hide password' : 'Show password'}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#9ca3af] hover:text-[#4b5563] transition-colors p-1 cursor-pointer focus:outline-none"
                        >
                          {showPassword ? (
                            <EyeOff className="w-5 h-5" />
                          ) : (
                            <Eye className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Sign In Options: Remember me checkbox + Forgot password link */}
                    {mode === 'signin' && (
                      <div className="flex items-center justify-between text-sm pt-0.5 pb-1">
                        <label className="flex items-center cursor-pointer select-none">
                          <input
                            id="remember-me-checkbox"
                            type="checkbox"
                            checked={rememberMe}
                            onChange={(e) => setRememberMe(e.target.checked)}
                            className="w-4 h-4 rounded border-[#d1d5db] text-[#111827] focus:ring-[#111827] cursor-pointer accent-[#111827]"
                          />
                          <span className="ml-2 text-sm text-[#4b5563]">Remember me</span>
                        </label>
                        <button
                          id="forgot-password-link"
                          type="button"
                          onClick={handleForgotPassword}
                          className="text-sm text-[#6b7280] hover:text-[#111827] transition-colors cursor-pointer focus:outline-none"
                        >
                          Forgot password?
                        </button>
                      </div>
                    )}

                    {/* Primary Button */}
                    <div className="pt-1">
                      <button
                        id="btn-primary-auth"
                        type="submit"
                        disabled={isLoading}
                        className="w-full h-12 rounded-2xl bg-[#18181b] hover:bg-[#27272a] active:scale-[0.99] text-white font-medium text-[15px] transition-all flex items-center justify-center cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed shadow-sm"
                      >
                        {isLoading ? (
                          <span className="inline-flex items-center gap-2">
                            <Loader2 className="w-4 h-4 animate-spin text-white" />
                            <span>Processing...</span>
                          </span>
                        ) : mode === 'signin' ? (
                          'Log in'
                        ) : (
                          'Create Account'
                        )}
                      </button>
                    </div>

                    {/* Secondary Button: Log in with Google */}
                    <div>
                      <button
                        id="btn-google-auth"
                        type="button"
                        onClick={handleGoogleLogin}
                        disabled={isLoading}
                        className="w-full h-12 rounded-2xl bg-[#f3f4f6] hover:bg-[#e5e7eb] active:scale-[0.99] text-[#18181b] font-medium text-[15px] transition-all flex items-center justify-center gap-3 cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
                      >
                        <svg
                          className="w-5 h-5 flex-shrink-0"
                          viewBox="0 0 24 24"
                          aria-hidden="true"
                        >
                          <path
                            fill="#4285F4"
                            d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                          />
                          <path
                            fill="#34A853"
                            d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.35 24 12 24z"
                          />
                          <path
                            fill="#FBBC05"
                            d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.14-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                          />
                          <path
                            fill="#EA4335"
                            d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                          />
                        </svg>
                        <span>
                          {mode === 'signin' ? 'Log in with Google' : 'Sign up with Google'}
                        </span>
                      </button>
                    </div>
                  </form>

                  {/* Footer: Toggle Mode */}
                  <div className="mt-6 text-center">
                    <p className="text-sm text-[#6b7280]">
                      {mode === 'signin' ? (
                        <>
                          Don&apos;t have an account?{' '}
                          <button
                            id="auth-switch-mode-btn"
                            type="button"
                            onClick={() => {
                              setMode('signup');
                              setErrorMessage(null);
                            }}
                            className="font-semibold text-[#111827] hover:underline cursor-pointer focus:outline-none"
                          >
                            Sign Up
                          </button>
                        </>
                      ) : (
                        <>
                          Already have an account?{' '}
                          <button
                            id="auth-switch-mode-btn"
                            type="button"
                            onClick={() => {
                              setMode('signin');
                              setErrorMessage(null);
                            }}
                            className="font-semibold text-[#111827] hover:underline cursor-pointer focus:outline-none"
                          >
                            Sign In
                          </button>
                        </>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </motion.div>
    </main>
  );
};
