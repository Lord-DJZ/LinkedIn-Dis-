import React from 'react';
import type { User } from '../types';
import { Search, ShieldCheck, User as UserIcon, FileText } from 'lucide-react';

interface AppNavbarProps {
  user: User | null;
  activeTab: 'profile' | 'search' | 'organization';
  setActiveTab: (tab: 'profile' | 'search' | 'organization') => void;
  onOpenProfileDrawer: () => void;
  onOpenTelemetry: () => void;
}

export const AppNavbar: React.FC<AppNavbarProps> = ({
  user,
  activeTab,
  setActiveTab,
  onOpenProfileDrawer,
  onOpenTelemetry,
}) => {
  const initials = (user?.email?.split('@')[0]?.slice(0, 2) || 'D').toUpperCase();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-black/[0.06] bg-[#f5f7f4]/85 px-4 backdrop-blur-2xl sm:px-8 lg:px-12">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between">
        {/* Left: Brand Logo */}
        <div
          className="flex items-center gap-2.5 cursor-pointer select-none"
          onClick={() => setActiveTab('profile')}
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#111311] text-xs font-bold text-white shadow-xs">
            D
          </div>
          <span className="font-bold text-base tracking-tight text-gray-900">
            Dullnit
          </span>
        </div>

        {/* Center: Clean 2-Pill Navigation (Profile & Search) */}
        <nav
          className="flex items-center gap-1 rounded-full bg-[#eef0ec] p-1 border border-black/5 shrink-0"
          aria-label="Primary navigation"
        >
          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`flex items-center gap-1.5 rounded-full px-5 py-1.5 text-xs font-medium transition-all whitespace-nowrap cursor-pointer select-none ${
              activeTab === 'profile'
                ? 'bg-[#111311] text-white shadow-xs font-semibold'
                : 'text-[#556056] hover:text-[#111311] hover:bg-black/5'
            }`}
            aria-current={activeTab === 'profile' ? 'page' : undefined}
          >
            <FileText className="h-3.5 w-3.5" />
            <span>Profile</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('search')}
            className={`flex items-center gap-1.5 rounded-full px-5 py-1.5 text-xs font-medium transition-all whitespace-nowrap cursor-pointer select-none ${
              activeTab === 'search' || activeTab === 'organization'
                ? 'bg-[#111311] text-white shadow-xs font-semibold'
                : 'text-[#556056] hover:text-[#111311] hover:bg-black/5'
            }`}
            aria-current={activeTab === 'search' ? 'page' : undefined}
          >
            <Search className="h-3.5 w-3.5" />
            <span>Search</span>
          </button>
        </nav>

        {/* Right: Telemetry & Profile Avatar Icon */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Telemetry status button */}
          <button
            type="button"
            onClick={onOpenTelemetry}
            title="Architecture & AI Telemetry"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-black/[0.06] bg-[#f5f6f4] text-[#737a74] transition hover:bg-[#ecefeb] hover:text-black cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4" />
          </button>

          {/* Profile Avatar Button (Clicking opens the Persona & Dossier Drawer!) */}
          <button
            type="button"
            onClick={onOpenProfileDrawer}
            title="Candidate Persona & Profile Dossier"
            className="group relative flex h-9 w-9 items-center justify-center rounded-full bg-[#111311] text-[10px] font-bold text-white shadow-sm transition hover:scale-[1.03] cursor-pointer"
          >
            {user ? initials : <UserIcon className="w-4 h-4" />}
            {/* Subtle online badge */}
            <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-[#75aa79] ring-2 ring-white"></span>
          </button>
        </div>
      </div>
    </header>
  );
};

