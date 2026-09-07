import React, { useState } from 'react';
import { api } from '../services/api';
import type { User } from '../types';
import { AlertCircle, ArrowRight, BriefcaseBusiness, Check, Eye, EyeOff, Loader2, Sparkles, UserRound } from 'lucide-react';

interface LoginViewProps {
  onLoginSuccess: (user: User, role: 'candidate' | 'recruiter') => void;
}

type AccountRole = 'candidate' | 'recruiter';

export const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess }) => {
  const [selectedRole, setSelectedRole] = useState<AccountRole>('candidate');
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const switchRole = (role: AccountRole) => {
    setSelectedRole(role);
    setError(null);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (mode === 'login') {
        const response = await api.login({ email, password });
        api.setToken(response.access_token);
        const me = await api.getMe();
        const actualRole: AccountRole = me.role === 'recruiter' ? 'recruiter' : 'candidate';
        onLoginSuccess(me, actualRole);
      } else {
        const response = await api.register({
          email,
          password,
          role: selectedRole,
          full_name: fullName || (selectedRole === 'candidate' ? 'New candidate' : 'Business representative'),
          ...(selectedRole === 'recruiter' ? { company_name: companyName || 'My company' } : {}),
        });
        api.setToken(response.access_token);
        const me = await api.getMe();
        onLoginSuccess(me, selectedRole);
      }
    } catch (caughtError: unknown) {
      setError(caughtError instanceof Error ? caughtError.message : 'We could not sign you in. Check your details and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = async (role: AccountRole) => {
    setLoading(true);
    setError(null);
    try {
      if (role === 'candidate') await api.ensureCandidateAuth();
      else await api.ensureRecruiterAuth();
      const me = await api.getMe();
      onLoginSuccess(me, role);
    } catch (caughtError: unknown) {
      setError(caughtError instanceof Error ? caughtError.message : 'The demo account is not available right now.');
    } finally {
      setLoading(false);
    }
  };

  const isCandidate = selectedRole === 'candidate';

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#eef4ee] px-4 py-5 font-sans text-[#151715] sm:px-7 sm:py-7 lg:flex lg:items-center lg:justify-center lg:px-10">
      <div aria-hidden="true" className="pointer-events-none absolute -left-28 -top-28 h-80 w-80 rounded-full bg-white/70 blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute -bottom-40 -right-32 h-[30rem] w-[30rem] rounded-full bg-[#d4e6d4]/80 blur-3xl" />

      <section className="relative mx-auto grid w-full max-w-[1180px] overflow-hidden rounded-[30px] border border-white/80 bg-white/90 shadow-[0_40px_100px_-48px_rgba(27,52,31,0.36)] backdrop-blur-xl lg:grid-cols-[0.88fr_1.12fr]">
        <div className="flex min-h-[690px] flex-col px-7 py-7 sm:px-12 sm:py-10 lg:px-14">
          <header className="flex items-center justify-between">
            <div className="flex items-center gap-2.5" aria-label="Dullnit">
              <span className="grid h-8 w-8 place-items-center rounded-full bg-[#111311] text-[12px] font-bold text-white">D</span>
              <span className="text-[17px] font-bold tracking-[-0.035em]">Dullnit</span>
            </div>
            <span className="inline-flex items-center gap-2 rounded-full bg-[#f3f6f2] px-3 py-1.5 text-[11px] font-semibold text-[#556056]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#67a36e] shadow-[0_0_0_4px_rgba(103,163,110,0.12)]" /> Secure workspace
            </span>
          </header>

          <div className="my-auto py-10">
            <div className="mb-7">
              <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.2em] text-[#708072]">Welcome to Dullnit</p>
              <h1 className="max-w-md text-[38px] font-semibold leading-[1.04] tracking-[-0.055em] text-[#111311] sm:text-[46px]">
                {mode === 'login' ? 'Your next move starts here.' : 'Create your talent space.'}
              </h1>
              <p className="mt-4 max-w-md text-sm leading-6 text-[#68706a]">
                {mode === 'login' ? 'Sign in as a candidate or a business to continue to your private workspace.' : 'Choose how you will use Dullnit, then create your account in a few seconds.'}
              </p>
            </div>

            <div className="mb-6 grid grid-cols-2 gap-1.5 rounded-2xl bg-[#f2f4f1] p-1.5" role="tablist" aria-label="Account type">
              <button type="button" role="tab" aria-selected={isCandidate} onClick={() => switchRole('candidate')} className={`flex min-h-12 items-center justify-center gap-2 rounded-[13px] px-3 text-xs font-semibold transition-all ${isCandidate ? 'bg-white text-[#111311] shadow-[0_2px_10px_rgba(20,30,20,0.08)]' : 'text-[#747b75] hover:text-[#202420]'}`}>
                <UserRound className="h-4 w-4" /> Candidate
              </button>
              <button type="button" role="tab" aria-selected={!isCandidate} onClick={() => switchRole('recruiter')} className={`flex min-h-12 items-center justify-center gap-2 rounded-[13px] px-3 text-xs font-semibold transition-all ${!isCandidate ? 'bg-white text-[#111311] shadow-[0_2px_10px_rgba(20,30,20,0.08)]' : 'text-[#747b75] hover:text-[#202420]'}`}>
                <BriefcaseBusiness className="h-4 w-4" /> Business
              </button>
            </div>

            {error && (
              <div role="alert" className="mb-4 flex items-start gap-2.5 rounded-xl border border-[#efd6d2] bg-[#fff7f5] p-3.5 text-xs leading-5 text-[#9d3f34]">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /><span>{error}</span>
              </div>
            )}

            {/* Quick autofill pill for real credentials */}
            {mode === 'login' && (
              <div className="mb-4 flex items-center justify-between rounded-xl border border-emerald-200/80 bg-emerald-50/60 p-2.5 text-xs text-emerald-950">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                    Real {isCandidate ? 'Candidate' : 'Organization'} Credentials
                  </span>
                  <span className="font-mono text-[11px] text-emerald-900">
                    {isCandidate ? 'candidate@dullnit.com' : 'recruiter@apexglobal.tech'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (isCandidate) {
                      setEmail('candidate@dullnit.com');
                      setPassword('CandidateSecure2026!');
                    } else {
                      setEmail('recruiter@apexglobal.tech');
                      setPassword('ApexEnterprise2026!');
                    }
                  }}
                  className="rounded-lg bg-emerald-700 px-2.5 py-1 text-[11px] font-semibold text-white shadow-xs transition hover:bg-emerald-800"
                >
                  Fill
                </button>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5">
              {mode === 'register' && <label className="block"><span className="sr-only">Full name</span><input required value={fullName} onChange={(event) => setFullName(event.target.value)} placeholder="Full name" autoComplete="name" className="auth-input" /></label>}
              {mode === 'register' && !isCandidate && <label className="block"><span className="sr-only">Company name</span><input required value={companyName} onChange={(event) => setCompanyName(event.target.value)} placeholder="Company name" autoComplete="organization" className="auth-input" /></label>}
              <label className="block"><span className="sr-only">Email address</span><input type="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Email address" autoComplete="email" className="auth-input" /></label>
              <label className="relative block">
                <span className="sr-only">Password</span>
                <input type={showPassword ? 'text' : 'password'} required minLength={8} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Password" autoComplete={mode === 'login' ? 'current-password' : 'new-password'} className="auth-input pr-12" />
                <button type="button" onClick={() => setShowPassword((visible) => !visible)} className="absolute right-4 top-1/2 -translate-y-1/2 rounded-md p-1 text-[#8a918b] transition hover:bg-black/5 hover:text-black" aria-label={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
              </label>

              <div className="flex min-h-6 items-center justify-between px-0.5 text-[11px]">
                <span className="inline-flex items-center gap-1.5 text-[#7a827b]"><Check className="h-3 w-3" /> Encrypted sign-in</span>
                {mode === 'login' && <button type="button" className="font-semibold text-[#47714c] hover:text-[#2c4b30]">Forgot password?</button>}
              </div>

              <button type="submit" disabled={loading} className="group flex h-[52px] w-full items-center justify-center gap-2 rounded-full bg-[#111311] px-6 text-sm font-semibold text-white shadow-[0_8px_24px_rgba(17,19,17,0.16)] transition hover:-translate-y-0.5 hover:bg-[#242824] disabled:cursor-wait disabled:opacity-60">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <>{mode === 'login' ? 'Continue' : 'Create account'}<ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" /></>}
              </button>
            </form>

            <button type="button" onClick={() => { setMode((current) => current === 'login' ? 'register' : 'login'); setError(null); }} className="mx-auto mt-4 block text-xs text-[#707871] transition hover:text-black">
              {mode === 'login' ? <>New to Dullnit? <strong className="font-semibold text-[#1c211d]">Create an account</strong></> : <>Already have an account? <strong className="font-semibold text-[#1c211d]">Sign in</strong></>}
            </button>

            <div className="mt-7 border-t border-black/[0.07] pt-5">
              <div className="mb-3 flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.16em] text-[#929993]"><span>Explore verified accounts</span><span>One-click login</span></div>
              <div className="grid grid-cols-2 gap-2.5">
                <button type="button" disabled={loading} onClick={() => handleQuickDemo('candidate')} className="demo-button" title="Demuni Jayasmith (candidate@dullnit.com)"><Sparkles className="h-3.5 w-3.5 text-emerald-600" /> Candidate demo</button>
                <button type="button" disabled={loading} onClick={() => handleQuickDemo('recruiter')} className="demo-button" title="Apex Global Technologies (recruiter@apexglobal.tech)"><BriefcaseBusiness className="h-3.5 w-3.5 text-blue-600" /> Business demo</button>
              </div>
            </div>
          </div>

          <footer className="flex items-center justify-between text-[10px] text-[#9aa09b]"><span>© 2026 Dullnit</span><a href="mailto:support@dullnit.com" className="transition hover:text-[#344036]">Need help?</a></footer>
        </div>

        <aside className="relative hidden min-h-[690px] p-3 lg:block">
          <div className="relative h-full overflow-hidden rounded-[24px] bg-[#dbe5d9]">
            <img src="/login_hero.jpg" alt="A calm, light-filled workspace with a green plant" className="h-full w-full object-cover transition-transform duration-[1600ms] ease-out hover:scale-[1.025]" />
            <div className="absolute inset-0 bg-gradient-to-b from-black/[0.04] via-transparent to-black/30" />
            <div className="absolute left-7 top-7 inline-flex items-center gap-2 rounded-full border border-white/50 bg-white/70 px-3.5 py-2 text-[11px] font-semibold text-[#324034] shadow-sm backdrop-blur-xl"><span className="h-1.5 w-1.5 rounded-full bg-[#4f8a58]" /> Talent, made human</div>
            <div className="absolute bottom-7 left-7 right-7 rounded-[22px] border border-white/25 bg-[#182019]/55 p-7 text-white shadow-2xl backdrop-blur-2xl">
              <div className="mb-5 flex items-center justify-between"><span className="grid h-9 w-9 place-items-center rounded-full border border-white/25 bg-white/10"><Sparkles className="h-4 w-4" /></span><span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/65">Dullnit intelligence</span></div>
              <h2 className="max-w-md text-[28px] font-medium leading-[1.1] tracking-[-0.045em] text-white">A clearer way to discover talent—and be discovered.</h2>
              <p className="mt-3 max-w-md text-xs leading-5 text-white/72">One private profile. Verified experience. Thoughtful matching powered by your real work.</p>
            </div>
          </div>
        </aside>
      </section>
    </main>
  );
};
