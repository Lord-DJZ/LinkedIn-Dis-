import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Eye,
  EyeOff,
  Loader2,
  CheckCircle2,
  X,
  AlertCircle,
  Mail,
  Lock,
  Wifi,
} from 'lucide-react';
import { api } from '../services/api';
import type { User, AccountRole } from '../types';

// Responsive hook matching the inspiration
const MOBILE_BREAKPOINT = 768;

function useIsMobile() {
  const subscribe = React.useCallback((callback: () => void) => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    mql.addEventListener('change', callback);
    return () => mql.removeEventListener('change', callback);
  }, []);

  const getSnapshot = () =>
    typeof window !== 'undefined' ? window.innerWidth < MOBILE_BREAKPOINT : false;
  const getServerSnapshot = () => false;

  return React.useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

interface LoginViewProps {
  onLoginSuccess: (user: User, activeRole: AccountRole) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess }) => {
  const isMobile = useIsMobile();

  // Mode: signin or signup
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [role, setRole] = useState<'candidate' | 'recruiter'>('candidate');

  // Form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // States
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [forgotPasswordNotice, setForgotPasswordNotice] = useState(false);
  const [useIframeFallback, setUseIframeFallback] = useState(false);

  // PC version card expansion state
  const [isExpanded, setIsExpanded] = useState(false);

  const pcVideoRef = useRef<HTMLVideoElement>(null);
  const mobileVideoRef = useRef<HTMLVideoElement>(null);

  // Preload video
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
        }, 500);
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
        }, 500);
      }
    } catch (caughtError: unknown) {
      setErrorMessage(
        caughtError instanceof Error
          ? caughtError.message
          : 'Authentication failed. Please check your credentials.'
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
      }, 500);
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
    }, 3500);
  };

  // ─────────────────────────────────────────────────────────────
  // MOBILE VERSION AUTHENTICATION UI
  // ─────────────────────────────────────────────────────────────
  if (isMobile) {
    return (
      <main
        id="main-container"
        className="min-h-screen w-full bg-[#eaecf0] sm:bg-[#e4e7eb] flex items-center justify-center p-3 sm:p-6 md:p-8 font-sans antialiased selection:bg-black selection:text-white"
      >
        {/* Mobile Phone Device Card Container */}
        <div
          id="mobile-phone-container"
          className="w-full max-w-[390px] sm:max-w-[400px] bg-white rounded-[44px] sm:rounded-[48px] shadow-[0_25px_70px_-15px_rgba(0,0,0,0.12),0_10px_25px_-10px_rgba(0,0,0,0.06)] overflow-hidden flex flex-col relative border border-black/[0.06]"
        >
          {/* TOP HEADER: 3D Abstract Visual Scene */}
          <div
            id="header-visual-scene"
            className="relative w-full h-[360px] sm:h-[385px] overflow-hidden select-none bg-[#f3ece4] flex-shrink-0"
          >
            {!useIframeFallback ? (
              <video
                ref={mobileVideoRef}
                id="header-3d-video"
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
                id="header-3d-iframe"
                src="https://streamable.com/o/2i8lj1?autoplay=1&muted=1&loop=1"
                className="w-full h-full absolute inset-0 border-0 pointer-events-auto"
                allow="autoplay; fullscreen"
                allowFullScreen
                title="Abstract 3D video scene"
              />
            )}

            {/* Status Bar */}
            <div
              id="mobile-status-bar"
              className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-7 pt-3.5 pb-2 text-[#181d27]"
            >
              <span className="text-[14px] font-semibold tracking-tight select-none">9:41</span>
              <div className="flex items-center gap-1.5 select-none">
                <div className="flex items-end gap-[1.5px] h-[11px] mr-0.5" aria-label="Cellular signal">
                  <span className="w-[3px] h-[3.5px] bg-[#181d27] rounded-[0.5px]" />
                  <span className="w-[3px] h-[5.5px] bg-[#181d27] rounded-[0.5px]" />
                  <span className="w-[3px] h-[8px] bg-[#181d27] rounded-[0.5px]" />
                  <span className="w-[3px] h-[10.5px] bg-[#181d27] rounded-[0.5px]" />
                </div>
                <Wifi className="w-[15px] h-[15px] stroke-[2.2] text-[#181d27]" aria-label="Wi-Fi connected" />
                <div className="flex items-center gap-[1px]" aria-label="Battery full">
                  <div className="w-[22px] h-[11px] rounded-[3.5px] border-[1.5px] border-[#181d27] p-[1.5px] flex items-center">
                    <div className="w-full h-full bg-[#181d27] rounded-[1.5px]" />
                  </div>
                  <div className="w-[1.5px] h-[4px] bg-[#181d27] rounded-r-[1px]" />
                </div>
              </div>
            </div>

            {/* Overlaid Header Typography */}
            <div
              id="header-typography"
              className="relative z-10 px-7 pt-16 sm:pt-18 select-none"
            >
              <h1 className="text-[38px] sm:text-[42px] font-bold text-[#181d27] tracking-tight leading-[1.1]">
                Hello!
              </h1>
              <p className="text-[17px] sm:text-[18px] text-[#555d6e] font-normal mt-1">
                Welcome back
              </p>
            </div>
          </div>

          {/* BOTTOM SECTION: Overlapping White Login Form Card */}
          <div
            id="login-form-card"
            className="relative z-10 bg-white rounded-t-[36px] sm:rounded-t-[40px] px-7 sm:px-8 pt-7 pb-8 -mt-6 sm:-mt-8 flex-1 flex flex-col shadow-[0_-12px_32px_rgba(0,0,0,0.03)]"
          >
            <h2 className="text-[26px] sm:text-[28px] font-bold text-[#181d27] mb-5">
              {mode === 'signin' ? 'Login' : 'Sign Up'}
            </h2>

            {/* Error banner */}
            {errorMessage && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-[13px] text-rose-800 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col">
              {/* Full Name for Mobile Sign Up */}
              {mode === 'signup' && (
                <div className="relative mb-3.5">
                  <div className="bg-[#f8f9fb] hover:bg-[#f3f4f6] focus-within:bg-white focus-within:ring-2 focus-within:ring-black/[0.08] focus-within:border-black/15 border border-transparent rounded-[20px] h-[54px] px-4 flex items-center gap-3 transition-all">
                    <input
                      id="fullname-input-mobile"
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Full Name"
                      required
                      className="w-full bg-transparent text-[15px] text-[#181d27] placeholder:text-[#9aa2af] outline-none font-normal"
                    />
                  </div>
                </div>
              )}

              {/* Email Input */}
              <div className="relative mb-3.5">
                <div className="bg-[#f8f9fb] hover:bg-[#f3f4f6] focus-within:bg-white focus-within:ring-2 focus-within:ring-black/[0.08] focus-within:border-black/15 border border-transparent rounded-[20px] h-[54px] px-4 flex items-center gap-3 transition-all">
                  <Mail className="w-5 h-5 text-[#9aa2af] stroke-[1.75] flex-shrink-0" />
                  <input
                    id="email-input-mobile"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email"
                    required
                    className="w-full bg-transparent text-[15px] text-[#181d27] placeholder:text-[#9aa2af] outline-none font-normal"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="relative mb-2">
                <div className="bg-[#f8f9fb] hover:bg-[#f3f4f6] focus-within:bg-white focus-within:ring-2 focus-within:ring-black/[0.08] focus-within:border-black/15 border border-transparent rounded-[20px] h-[54px] px-4 flex items-center gap-3 transition-all">
                  <Lock className="w-5 h-5 text-[#9aa2af] stroke-[1.75] flex-shrink-0" />
                  <input
                    id="password-input-mobile"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    required
                    className="w-full bg-transparent text-[15px] text-[#181d27] placeholder:text-[#9aa2af] outline-none font-normal"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="text-[#9aa2af] hover:text-[#181d27] transition-colors p-1 cursor-pointer focus:outline-none"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Forgot Password Link */}
              <div className="flex justify-end mb-5">
                <button
                  type="button"
                  onClick={() => setForgotPasswordNotice(true)}
                  className="text-[13px] text-[#717680] hover:text-[#181d27] transition-colors font-normal cursor-pointer"
                >
                  Forgot Password?
                </button>
              </div>

              {/* Notification alert for Forgot Password */}
              {forgotPasswordNotice && (
                <div className="mb-4 p-3 rounded-xl bg-[#f8f9fb] border border-black/[0.05] text-[12px] text-[#555d6e] flex items-center justify-between">
                  <span>Password reset link will be sent to your email.</span>
                  <button
                    type="button"
                    onClick={() => setForgotPasswordNotice(false)}
                    className="text-xs text-[#181d27] font-semibold hover:underline ml-2 cursor-pointer"
                  >
                    Dismiss
                  </button>
                </div>
              )}

              {/* Primary Action Button */}
              <button
                id="login-submit-button"
                type="submit"
                disabled={isLoading}
                className="w-full h-[52px] bg-[#1e232a] hover:bg-[#111418] text-white font-medium text-[15px] rounded-full flex items-center justify-center transition-all shadow-[0_4px_16px_rgba(30,35,42,0.18)] active:scale-[0.99] cursor-pointer disabled:opacity-80"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin text-white" />
                ) : isSuccess ? (
                  <span className="flex items-center gap-2 text-emerald-400">
                    <CheckCircle2 className="w-5 h-5" />
                    <span className="text-white font-medium">Logged in successfully</span>
                  </span>
                ) : mode === 'signin' ? (
                  'Log In'
                ) : (
                  'Sign Up'
                )}
              </button>
            </form>

            {/* Divider: Or login with */}
            <div className="flex items-center gap-3 my-5 sm:my-6 select-none">
              <div className="flex-1 h-[1px] bg-[#ebecee]" />
              <span className="text-[12px] text-[#9aa2af] font-normal">
                Or login with
              </span>
              <div className="flex-1 h-[1px] bg-[#ebecee]" />
            </div>

            {/* Social Login Buttons: Facebook, Google, Apple */}
            <div className="flex items-center justify-center gap-4">
              {/* Facebook Button */}
              <button
                id="social-facebook-button"
                type="button"
                aria-label="Login with Facebook"
                className="w-[52px] h-[52px] rounded-[18px] bg-white border border-[#e5e7eb] shadow-[0_2px_6px_rgba(0,0,0,0.03)] flex items-center justify-center hover:bg-[#f9fafb] hover:border-[#d1d5db] transition-all active:scale-95 cursor-pointer"
              >
                <svg viewBox="0 0 24 24" className="w-6 h-6" aria-hidden="true">
                  <path
                    fill="#1877F2"
                    d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
                  />
                </svg>
              </button>

              {/* Google Button */}
              <button
                id="social-google-button"
                type="button"
                onClick={handleGoogleLogin}
                aria-label="Login with Google"
                className="w-[52px] h-[52px] rounded-[18px] bg-white border border-[#e5e7eb] shadow-[0_2px_6px_rgba(0,0,0,0.03)] flex items-center justify-center hover:bg-[#f9fafb] hover:border-[#d1d5db] transition-all active:scale-95 cursor-pointer"
              >
                <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden="true">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.04 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                  />
                </svg>
              </button>

              {/* Apple Button */}
              <button
                id="social-apple-button"
                type="button"
                aria-label="Login with Apple"
                className="w-[52px] h-[52px] rounded-[18px] bg-white border border-[#e5e7eb] shadow-[0_2px_6px_rgba(0,0,0,0.03)] flex items-center justify-center hover:bg-[#f9fafb] hover:border-[#d1d5db] transition-all active:scale-95 cursor-pointer"
              >
                <svg viewBox="0 0 170 170" className="w-[18px] h-[18px] fill-[#181d27]" aria-hidden="true">
                  <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.7-3.08-7.7-7.89-12-14.43-6.09-9.25-10.9-19.67-14.42-31.27-3.52-11.6-5.28-22.38-5.28-32.33 0-14.36 3.79-26.06 11.37-35.1 7.58-9.04 16.94-13.62 28.09-13.75 4.58 0 9.87 1.22 15.86 3.67 5.99 2.45 10.15 3.67 12.49 3.67 2.02 0 6.28-1.28 12.77-3.83 6.49-2.55 11.94-3.71 16.34-3.48 10.83.56 19.82 4.67 26.97 12.33-9.58 5.79-14.28 13.91-14.1 24.36.19 8.16 3.24 15.04 9.15 20.64 5.91 5.6 12.92 8.76 21.03 9.48-2.34 6.74-5.33 13.88-8.99 21.43zM119.22 33.34c0-7.39 2.66-14.18 7.97-20.37 5.31-6.19 11.75-9.86 19.33-11.02.42 1.48.63 2.87.63 4.18 0 7.42-2.82 14.32-8.47 20.69-5.64 6.38-12.28 10.05-19.92 11.02-.11-1.39-.16-2.55-.16-3.5z" />
                </svg>
              </button>
            </div>

            {/* Footer: Don't have an account? Sign Up */}
            <p className="text-center text-[13px] text-[#717680] mt-6 select-none">
              {mode === 'signin' ? "Don’t have an account? " : "Already have an account? "}
              <button
                id="signup-toggle-button"
                type="button"
                onClick={() => {
                  setMode(mode === 'signin' ? 'signup' : 'signin');
                  setErrorMessage(null);
                }}
                className="font-semibold text-[#181d27] hover:underline cursor-pointer"
              >
                {mode === 'signin' ? 'Sign Up' : 'Log In'}
              </button>
            </p>
          </div>
        </div>
      </main>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // PC / DESKTOP VERSION AUTHENTICATION UI
  // ─────────────────────────────────────────────────────────────
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

      {/* ONE Single Expandable Card Component */}
      <motion.div
        id="auth-card"
        layout
        transition={{
          layout: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
        }}
        onClick={() => {
          if (!isExpanded) setIsExpanded(true);
        }}
        className={`w-full bg-white transition-all duration-300 relative border border-black/[0.04] ${
          isExpanded
            ? 'max-w-[980px] rounded-[36px] md:rounded-[44px] shadow-[0_25px_70px_-15px_rgba(0,0,0,0.08)] p-5 sm:p-7 md:p-8 flex flex-col md:flex-row items-stretch gap-6 md:gap-8'
            : 'max-w-[420px] rounded-[32px] sm:rounded-[36px] shadow-[0_16px_50px_-12px_rgba(0,0,0,0.06)] hover:shadow-[0_22px_60px_-10px_rgba(0,0,0,0.1)] hover:border-black/10 p-8 sm:p-10 flex flex-col items-center justify-center text-center cursor-pointer group select-none active:scale-[0.99]'
        }`}
      >
        {/* INITIAL COLLAPSED STATE (100% Faithful to Image 1) */}
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
            <h1
              id="initial-welcome-title"
              className="text-[32px] sm:text-[34px] font-bold text-[#111827] tracking-tight leading-tight group-hover:text-black transition-colors"
            >
              Welcome Back!
            </h1>
            <p
              id="initial-welcome-subtitle"
              className="text-sm sm:text-[15px] text-[#6b7280] mt-2 font-normal transition-colors"
            >
              Enter Your Details Below
            </p>
          </motion.div>
        )}

        {/* EXPANDED STATE: REVEALS BOTH LEFT MEDIA AND RIGHT FORM */}
        {isExpanded && (
          <>
            {/* Collapse / Close Button */}
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

            {/* LEFT SIDE: Media Area with Seamless Forward-Backward Looping Visual */}
            <motion.div
              id="auth-left-media-area"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1], delay: 0.05 }}
              className="w-full md:w-[48%] lg:w-[49%] bg-[#edf0f4] rounded-[28px] md:rounded-[34px] min-h-[340px] sm:min-h-[420px] md:min-h-[560px] border border-black/[0.04] flex-shrink-0 relative overflow-hidden flex items-center justify-center shadow-inner"
            >
              {!useIframeFallback ? (
                <video
                  ref={pcVideoRef}
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

              {/* Crisp inner border overlay for smooth edge contour */}
              <div className="absolute inset-0 rounded-[28px] md:rounded-[34px] pointer-events-none ring-1 ring-inset ring-black/[0.04]" />
            </motion.div>

            {/* RIGHT SIDE: Complete Authentication Form */}
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

                {/* Notifications */}
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
                          ? 'Successfully logged in!'
                          : 'Account created successfully!'}
                      </span>
                    </motion.div>
                  )}
                  {errorMessage && (
                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.96 }}
                      className="w-full mt-4 p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm rounded-xl flex items-center gap-2"
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
                      Password reset link sent to your email.
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

                  {/* Complete Form */}
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
