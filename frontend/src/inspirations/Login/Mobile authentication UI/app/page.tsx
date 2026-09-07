'use client';

import React, { useState, useRef } from 'react';
import { Mail, Lock, Eye, EyeOff, Loader2, CheckCircle2, Wifi } from 'lucide-react';

export default function AuthenticationPage() {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [forgotPasswordNotice, setForgotPasswordNotice] = useState(false);
  const [useIframeFallback, setUseIframeFallback] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    setIsLoading(true);
    setIsSuccess(false);

    // Simulate authenticating
    setTimeout(() => {
      setIsLoading(false);
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
      }, 3000);
    }, 1000);
  };

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
        {/* TOP HEADER: 3D Abstract Visual Scene (White/Beige Flowing Ribbon & Floating Spheres) */}
        <div
          id="header-visual-scene"
          className="relative w-full h-[360px] sm:h-[385px] overflow-hidden select-none bg-[#f3ece4] flex-shrink-0"
        >
          {/* Abstract 3D Video Background */}
          {!useIframeFallback ? (
            <video
              ref={videoRef}
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
              {/* Cellular Signal (4 ascending bars) */}
              <div className="flex items-end gap-[1.5px] h-[11px] mr-0.5" aria-label="Cellular signal">
                <span className="w-[3px] h-[3.5px] bg-[#181d27] rounded-[0.5px]" />
                <span className="w-[3px] h-[5.5px] bg-[#181d27] rounded-[0.5px]" />
                <span className="w-[3px] h-[8px] bg-[#181d27] rounded-[0.5px]" />
                <span className="w-[3px] h-[10.5px] bg-[#181d27] rounded-[0.5px]" />
              </div>
              {/* Wi-Fi Icon */}
              <Wifi className="w-[15px] h-[15px] stroke-[2.2] text-[#181d27]" aria-label="Wi-Fi connected" />
              {/* Battery Indicator */}
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

          <form onSubmit={handleSubmit} className="flex flex-col">
            {/* Email Input */}
            <div className="relative mb-3.5">
              <div className="bg-[#f8f9fb] hover:bg-[#f3f4f6] focus-within:bg-white focus-within:ring-2 focus-within:ring-black/[0.08] focus-within:border-black/15 border border-transparent rounded-[20px] h-[54px] px-4 flex items-center gap-3 transition-all">
                <Mail className="w-5 h-5 text-[#9aa2af] stroke-[1.75] flex-shrink-0" />
                <input
                  id="email-input"
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
                  id="password-input"
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
            Don’t have an account?{' '}
            <button
              id="signup-toggle-button"
              type="button"
              onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
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
