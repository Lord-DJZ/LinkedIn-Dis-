import React, { useState } from 'react';
import { api } from '../services/api';
import type { User } from '../types';
import { X, Lock, Mail, User as UserIcon, CheckCircle2, AlertCircle } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: User) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [role, setRole] = useState<'candidate' | 'recruiter'>('candidate');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isRegister) {
        await api.register({
          email,
          password,
          role,
          full_name: role === 'candidate' ? fullName || 'New Candidate' : undefined,
        });
      } else {
        await api.login({ email, password });
      }

      const me = await api.getMe();
      onSuccess(me);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (demoEmail: string, demoPass: string) => {
    setError(null);
    setLoading(true);
    try {
      await api.login({ email: demoEmail, password: demoPass });
      const me = await api.getMe();
      onSuccess(me);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content p-6 sm:p-8" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900 font-heading">
              {isRegister ? 'Create an Account' : 'Welcome Back'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {isRegister ? 'Join Dullnit recruitment network' : 'Sign in to access your dashboard'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all"
          >
            <X size={18} />
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-5 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-2">
            <AlertCircle size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Account Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRole('candidate')}
                    className={`py-2 px-3 text-xs font-semibold rounded-lg border text-center transition-all ${
                      role === 'candidate'
                        ? 'bg-blue-50 border-blue-500 text-blue-700 font-bold'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Candidate / Jobseeker
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('recruiter')}
                    className={`py-2 px-3 text-xs font-semibold rounded-lg border text-center transition-all ${
                      role === 'recruiter'
                        ? 'bg-blue-50 border-blue-500 text-blue-700 font-bold'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Recruiter / Employer
                  </button>
                </div>
              </div>

              {role === 'candidate' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Full Name
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Alex Morgan"
                      className="neu-input pl-9 text-sm"
                    />
                    <UserIcon size={16} className="absolute left-3 top-3 text-slate-400" />
                  </div>
                </div>
              )}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="neu-input pl-9 text-sm"
              />
              <Mail size={16} className="absolute left-3 top-3 text-slate-400" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Password
            </label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="neu-input pl-9 text-sm"
              />
              <Lock size={16} className="absolute left-3 top-3 text-slate-400" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full neu-btn neu-btn-primary !py-2.5 mt-2 text-sm font-semibold"
          >
            {loading ? 'Processing...' : isRegister ? 'Register Account' : 'Sign In'}
          </button>
        </form>

        {/* Toggle Mode */}
        <div className="mt-4 text-center">
          <button
            onClick={() => {
              setIsRegister(!isRegister);
              setError(null);
            }}
            className="text-xs font-semibold text-blue-600 hover:underline"
          >
            {isRegister
              ? 'Already have an account? Sign in here'
              : "Don't have an account? Register now"}
          </button>
        </div>

        {/* Quick Demo Logins */}
        <div className="mt-6 pt-5 border-t border-slate-100">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center mb-2.5">
            Instant Seed Demo Logins
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleDemoLogin('recruiter@example.com', 'RecruiterPass123!')}
              disabled={loading}
              className="p-2 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-left transition-all"
            >
              <p className="text-xs font-bold text-slate-800 flex items-center gap-1">
                <CheckCircle2 size={12} className="text-blue-500" />
                Recruiter Demo
              </p>
              <p className="text-[10px] text-slate-500 truncate">recruiter@example.com</p>
            </button>

            <button
              onClick={() => handleDemoLogin('candidate_a@example.com', 'CandidatePass123!')}
              disabled={loading}
              className="p-2 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-left transition-all"
            >
              <p className="text-xs font-bold text-slate-800 flex items-center gap-1">
                <CheckCircle2 size={12} className="text-green-500" />
                Candidate A (Python)
              </p>
              <p className="text-[10px] text-slate-500 truncate">candidate_a@example.com</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
