import React from 'react';
import type { User } from '../types';
import { Sparkles, User as UserIcon, Search, ShieldCheck, LogOut, LogIn } from 'lucide-react';

interface NavbarProps {
  user: User | null;
  activeTab: 'candidate' | 'recruiter';
  setActiveTab: (tab: 'candidate' | 'recruiter') => void;
  onOpenAuth: () => void;
  onOpenAdmin: () => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  activeTab,
  setActiveTab,
  onOpenAuth,
  onOpenAdmin,
  onLogout,
}) => {
  return (
    <header className="glass-header sticky top-0 z-40 py-3 mb-8">
      <div className="container flex-between">
        {/* Brand */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('candidate')}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center text-white shadow-md">
            <Sparkles size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-heading font-extrabold text-xl tracking-tight text-slate-900">
                Dullnit
              </span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 border border-blue-200">
                v1.0
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">Candidate Discovery & AI Matching</p>
          </div>
        </div>

        {/* Center Tabs */}
        <div className="flex items-center gap-1 bg-slate-100/80 p-1.5 rounded-xl border border-slate-200 shadow-inner">
          <button
            onClick={() => setActiveTab('candidate')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeTab === 'candidate'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <UserIcon size={16} />
            <span>Candidate Portal</span>
          </button>
          <button
            onClick={() => setActiveTab('recruiter')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeTab === 'recruiter'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Search size={16} />
            <span>Recruiter Discovery</span>
          </button>
        </div>

        {/* Right User Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenAdmin}
            title="System & AI Status"
            className="neu-btn neu-btn-secondary !p-2 rounded-lg text-slate-600 hover:text-slate-900"
          >
            <ShieldCheck size={18} />
          </button>

          {user ? (
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-semibold text-slate-800">{user.email}</p>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-blue-50 text-blue-600 border border-blue-100">
                  {user.role}
                </span>
              </div>
              <button
                onClick={onLogout}
                className="neu-btn neu-btn-secondary !py-2 !px-3 text-xs text-red-600 hover:bg-red-50 hover:border-red-200"
              >
                <LogOut size={14} />
                <span>Sign Out</span>
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="neu-btn neu-btn-primary !py-2 !px-4 text-sm"
            >
              <LogIn size={16} />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
