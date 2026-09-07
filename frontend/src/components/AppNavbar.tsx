import React from 'react';
import type { User } from '../types';
import { Sliders, FileText, Building2, Search, Briefcase, LogOut } from 'lucide-react';

interface AppNavbarProps {
  user: User | null;
  activeTab: 'profile' | 'search' | 'organization' | 'explore';
  setActiveTab: (tab: 'profile' | 'search' | 'organization' | 'explore') => void;
  onOpenProfileDrawer: () => void;
  onOpenTelemetry: () => void;
  onLogout?: () => void;
}

export const AppNavbar: React.FC<AppNavbarProps> = ({
  user,
  activeTab,
  setActiveTab,
  onOpenProfileDrawer,
  onOpenTelemetry,
  onLogout,
}) => {
  // Compute user initials (default to 'CA' if candidate or based on email/name)
  const initials = (
    user?.role === 'candidate'
      ? (user?.full_name ? user.full_name.split(' ').map(n => n[0]).join('').slice(0, 2) : 'CA')
      : (user?.full_name ? user.full_name.split(' ').map(n => n[0]).join('').slice(0, 2) : 'RE')
  ).toUpperCase() || 'CA';

  const isRecruiter = user?.role === 'recruiter';

  return (
    <header className="sticky top-0 z-40 w-full pt-4 pb-2 sm:pt-5 sm:pb-3 px-3 sm:px-6 flex justify-center pointer-events-none bg-transparent">
      {/* Centered Floating Pill Navigation Container */}
      <div
        id="pill-navbar"
        className="pointer-events-auto flex items-center justify-between w-full max-w-[960px] h-[64px] sm:h-[68px] bg-white rounded-full px-4 sm:px-6 shadow-[0_12px_36px_-6px_rgba(0,0,0,0.06),0_4px_12px_-2px_rgba(0,0,0,0.03)] border border-black/[0.04] select-none transition-all"
      >
        {/* Left Section: Minimal Brand Symbol Only (No text, no letters) */}
        <div
          id="navbar-brand-symbol"
          onClick={() => setActiveTab(isRecruiter ? 'search' : 'profile')}
          className="flex items-center justify-center cursor-pointer transition-transform hover:scale-105 pl-1 sm:pl-2"
          title="Dullnit"
        >
          <svg
            viewBox="0 0 28 28"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-6 h-6 sm:w-[26px] sm:h-[26px] text-[#111827]"
            aria-hidden="true"
          >
            <path
              d="M8.2 17.5C6.3 17.5 4.8 16 4.8 14C4.8 12.1 6.3 10.5 8.2 10.5C10.5 10.5 12.6 12.7 14 14C15.4 15.3 17.5 17.5 19.8 17.5C21.7 17.5 23.2 16 23.2 14C23.2 12.1 21.7 10.5 19.8 10.5C17.5 10.5 15.4 12.7 14 14C12.6 15.3 10.5 17.5 8.2 17.5Z"
              stroke="currentColor"
              strokeWidth="3.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              transform="rotate(-15 14 14)"
            />
          </svg>
        </div>

        {/* Center / Navigation Section */}
        <nav
          id="navbar-items"
          className="flex items-center gap-1 sm:gap-2"
          aria-label="Primary navigation"
        >
          {!isRecruiter ? (
            /* CANDIDATE NAVIGATION: Profile & Companies */
            <>
              {/* Profile Tab */}
              <button
                id="nav-tab-profile"
                type="button"
                onClick={() => setActiveTab('profile')}
                className={`flex items-center gap-2 px-4 py-2 sm:px-5 sm:py-2.5 rounded-full text-[13.5px] sm:text-[14px] transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === 'profile'
                    ? 'bg-[#c5f5b2] text-[#111827] font-semibold shadow-2xs'
                    : 'text-[#374151] hover:text-[#111827] hover:bg-black/[0.03] font-medium'
                }`}
                aria-current={activeTab === 'profile' ? 'page' : undefined}
              >
                <FileText className="w-4 h-4 stroke-[1.9] flex-shrink-0" />
                <span>Profile</span>
              </button>

              {/* Companies Tab */}
              <button
                id="nav-tab-companies"
                type="button"
                onClick={() => setActiveTab('explore')}
                className={`flex items-center gap-2 px-4 py-2 sm:px-5 sm:py-2.5 rounded-full text-[13.5px] sm:text-[14px] transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === 'explore'
                    ? 'bg-[#c5f5b2] text-[#111827] font-semibold shadow-2xs'
                    : 'text-[#374151] hover:text-[#111827] hover:bg-black/[0.03] font-medium'
                }`}
                aria-current={activeTab === 'explore' ? 'page' : undefined}
              >
                <Building2 className="w-4 h-4 stroke-[1.9] flex-shrink-0" />
                <span>Companies</span>
              </button>
            </>
          ) : (
            /* RECRUITER NAVIGATION: Search & Pipeline */
            <>
              {/* Search Tab */}
              <button
                id="nav-tab-search"
                type="button"
                onClick={() => setActiveTab('search')}
                className={`flex items-center gap-2 px-4 py-2 sm:px-5 sm:py-2.5 rounded-full text-[13.5px] sm:text-[14px] transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === 'search'
                    ? 'bg-[#c5f5b2] text-[#111827] font-semibold shadow-2xs'
                    : 'text-[#374151] hover:text-[#111827] hover:bg-black/[0.03] font-medium'
                }`}
                aria-current={activeTab === 'search' ? 'page' : undefined}
              >
                <Search className="w-4 h-4 stroke-[1.9] flex-shrink-0" />
                <span>Search</span>
              </button>

              {/* Pipeline / Companies Tab */}
              <button
                id="nav-tab-pipeline"
                type="button"
                onClick={() => setActiveTab('organization')}
                className={`flex items-center gap-2 px-4 py-2 sm:px-5 sm:py-2.5 rounded-full text-[13.5px] sm:text-[14px] transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === 'organization'
                    ? 'bg-[#c5f5b2] text-[#111827] font-semibold shadow-2xs'
                    : 'text-[#374151] hover:text-[#111827] hover:bg-black/[0.03] font-medium'
                }`}
                aria-current={activeTab === 'organization' ? 'page' : undefined}
              >
                <Briefcase className="w-4 h-4 stroke-[1.9] flex-shrink-0" />
                <span>Companies</span>
              </button>
            </>
          )}
        </nav>

        {/* Right Section: Divider, Settings, Log out, Profile Avatar with Online dot */}
        <div id="navbar-right-section" className="flex items-center gap-2 sm:gap-2.5">
          {/* Vertical divider line */}
          <div className="h-5 w-[1px] bg-[#e5e7eb] mx-0.5 sm:mx-1" />

          {/* Settings / Filters button */}
          <button
            id="nav-btn-settings"
            type="button"
            onClick={onOpenTelemetry}
            title="Settings & System Status"
            aria-label="Settings and System Architecture"
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#f3f4f6] hover:bg-[#e5e7eb] text-[#1f2937] flex items-center justify-center transition-colors cursor-pointer"
          >
            <Sliders className="w-4 h-4 stroke-[1.8]" />
          </button>

          {/* Log out Button */}
          {onLogout && (
            <button
              id="nav-btn-logout"
              type="button"
              onClick={onLogout}
              title="Log out"
              aria-label="Log out of session"
              className="h-9 sm:h-10 px-3 sm:px-4 rounded-full bg-[#f3f4f6] hover:bg-[#e5e7eb] text-[#1f2937] text-[13.5px] font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5 stroke-[2] flex-shrink-0" />
              <span className="hidden sm:inline">Log out</span>
            </button>
          )}

          {/* User Profile Avatar with Online Status Indicator */}
          <button
            id="nav-btn-profile-avatar"
            type="button"
            onClick={onOpenProfileDrawer}
            title="User Profile & Persona"
            aria-label="Open profile drawer"
            className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#111827] text-white flex items-center justify-center text-[12px] sm:text-[13px] font-bold tracking-tight transition-transform hover:scale-105 cursor-pointer shadow-xs ml-0.5"
          >
            <span>{initials}</span>
            {/* Green Online Status Indicator Dot */}
            <span
              className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-[#10b981] border-2 border-white"
              aria-label="Online status: active"
            />
          </button>
        </div>
      </div>
    </header>
  );
};
