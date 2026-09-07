import type { User } from '../types';
import { Search, Sliders, User as UserIcon, FileText, Building2, Briefcase, LogOut } from 'lucide-react';

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
  const initials = (user?.email?.split('@')[0]?.slice(0, 2) || 'D').toUpperCase();
  const isRecruiter = user?.role === 'recruiter';

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#E8E2D9] bg-[#FAF7F2]/90 px-4 backdrop-blur-2xl sm:px-8 lg:px-12 shadow-2xs">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between">
        {/* Left: Brand Logo (Claude warm aesthetic) */}
        <div
          className="flex items-center gap-2.5 cursor-pointer select-none"
          onClick={() => setActiveTab(isRecruiter ? 'search' : 'profile')}
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#141413] text-xs font-bold text-white shadow-2xs">
            D
          </div>
          <span className="font-bold text-base tracking-tight text-[#141413]">
            Dullnit
          </span>
          <span className="hidden sm:inline-block text-[10px] font-semibold px-2 py-0.5 rounded-md bg-[#EAE5DE] text-[#635B53] border border-[#D9D1C7]">
            {isRecruiter ? 'Recruiter' : 'Candidate'}
          </span>
        </div>

        {/* Center: Tactile Pill Navigation (Image 2 Match & Strict Role RBAC) */}
        <nav
          className="flex items-center gap-1 rounded-full bg-[#EAE5DE] p-1 border border-[#D9D1C7] shrink-0 shadow-2xs"
          aria-label="Primary navigation"
        >
          {!isRecruiter ? (
            /* CANDIDATE TABS: Profile Dossier & Explore Companies */
            <>
              <button
                type="button"
                onClick={() => setActiveTab('profile')}
                className={`flex items-center gap-2 rounded-full px-5 py-1.5 text-xs font-medium transition-all whitespace-nowrap cursor-pointer select-none ${
                  activeTab === 'profile'
                    ? 'bg-white text-[#141413] shadow-xs font-bold'
                    : 'text-[#736B63] hover:text-[#141413] hover:bg-white/40'
                }`}
                aria-current={activeTab === 'profile' ? 'page' : undefined}
              >
                <FileText className="h-3.5 w-3.5" />
                <span>Profile</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('explore')}
                className={`flex items-center gap-2 rounded-full px-5 py-1.5 text-xs font-medium transition-all whitespace-nowrap cursor-pointer select-none ${
                  activeTab === 'explore'
                    ? 'bg-white text-[#141413] shadow-xs font-bold'
                    : 'text-[#736B63] hover:text-[#141413] hover:bg-white/40'
                }`}
                aria-current={activeTab === 'explore' ? 'page' : undefined}
              >
                <Building2 className="h-3.5 w-3.5" />
                <span>Companies</span>
              </button>
            </>
          ) : (
            /* RECRUITER TABS: Talent Sourcing & Company Pipeline */
            <>
              <button
                type="button"
                onClick={() => setActiveTab('search')}
                className={`flex items-center gap-2 rounded-full px-5 py-1.5 text-xs font-medium transition-all whitespace-nowrap cursor-pointer select-none ${
                  activeTab === 'search'
                    ? 'bg-white text-[#141413] shadow-xs font-bold'
                    : 'text-[#736B63] hover:text-[#141413] hover:bg-white/40'
                }`}
                aria-current={activeTab === 'search' ? 'page' : undefined}
              >
                <Search className="h-3.5 w-3.5" />
                <span>Search</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('organization')}
                className={`flex items-center gap-2 rounded-full px-5 py-1.5 text-xs font-medium transition-all whitespace-nowrap cursor-pointer select-none ${
                  activeTab === 'organization'
                    ? 'bg-white text-[#141413] shadow-xs font-bold'
                    : 'text-[#736B63] hover:text-[#141413] hover:bg-white/40'
                }`}
                aria-current={activeTab === 'organization' ? 'page' : undefined}
              >
                <Briefcase className="h-3.5 w-3.5" />
                <span>Pipeline</span>
              </button>
            </>
          )}
        </nav>

        {/* Right: Telemetry & Profile Avatar Icon */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Telemetry status button (Solid clean stone, no AI transparency) */}
          <button
            type="button"
            onClick={onOpenTelemetry}
            title="System Telemetry & Architecture"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-[#E8E2D9] bg-white text-[#141413] transition hover:bg-[#F4EFEA] cursor-pointer shadow-2xs"
          >
            <Sliders className="w-4 h-4 text-[#141413]" />
          </button>

          {/* Logout Button (Quick access for candidate & recruiter demo) */}
          {onLogout && (
            <button
              type="button"
              onClick={onLogout}
              title="Log out"
              className="flex h-9 items-center gap-1.5 px-3.5 rounded-full border border-[#E8E2D9] bg-white hover:bg-[#F4EFEA] hover:border-[#141413]/30 text-xs font-semibold text-[#635B53] hover:text-[#141413] transition cursor-pointer shadow-2xs"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Log out</span>
            </button>
          )}

          {/* Profile Avatar Button (Clicking opens the Persona & Role Switcher Drawer) */}
          <button
            type="button"
            onClick={onOpenProfileDrawer}
            title="Account & Role Switcher"
            className="group relative flex h-9 w-9 items-center justify-center rounded-full bg-[#0B0C10] hover:bg-black text-[11px] font-bold text-white shadow-2xs transition hover:scale-[1.03] cursor-pointer"
          >
            {user ? initials : <UserIcon className="w-4 h-4" />}
            {/* Online badge */}
            <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-white"></span>
          </button>
        </div>
      </div>
    </header>
  );
};
