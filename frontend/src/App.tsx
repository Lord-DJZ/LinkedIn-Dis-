import { useState, useEffect } from 'react';
import { api } from './services/api';
import type { User } from './types';
import { LoginView } from './components/LoginView';
import { AppNavbar } from './components/AppNavbar';
import { ProfileDrawer } from './components/ProfileDrawer';
import { Flow1_ProfileForm } from './components/Flow1_ProfileForm';
import { Flow3_RecruiterView } from './components/Flow3_RecruiterView';
import { OrganizationView } from './components/OrganizationView';
import { CompanyDirectoryView } from './components/CompanyDirectoryView';
import { CandidatePersonaModal, type PersonaModalCandidate } from './components/CandidatePersonaModal';
import { FloatingApiHUD } from './components/FloatingApiHUD';
import { CheckCircle2, Loader2, X } from 'lucide-react';

export function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authChecked, setAuthChecked] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'search' | 'organization' | 'explore'>('profile');
  const [isProfileDrawerOpen, setIsProfileDrawerOpen] = useState<boolean>(false);
  const [showTelemetryModal, setShowTelemetryModal] = useState<boolean>(false);

  // Self Persona Board state (Image 3 style)
  const [showSelfPersonaModal, setShowSelfPersonaModal] = useState<boolean>(false);
  const [selfPersonaCandidate, setSelfPersonaCandidate] = useState<PersonaModalCandidate | null>(null);

  // Check existing session on mount
  useEffect(() => {
    (async () => {
      try {
        const token = localStorage.getItem('dullnit_token');
        if (token) {
          const me = await api.getMe();
          setCurrentUser(me);
          if (me.role === 'recruiter') {
            setActiveTab('search');
          } else {
            setActiveTab('profile');
          }
        }
      } catch {
        api.clearToken();
        setCurrentUser(null);
      } finally {
        setAuthChecked(true);
      }
    })();
  }, []);

  // Enforce role-based view separation
  useEffect(() => {
    if (!currentUser) return;
    if (currentUser.role === 'candidate' && (activeTab === 'search' || activeTab === 'organization')) {
      setActiveTab('profile');
    } else if (currentUser.role === 'recruiter' && (activeTab === 'profile' || activeTab === 'explore')) {
      setActiveTab('search');
    }
  }, [currentUser, activeTab]);

  const handleLoginSuccess = (user: User, role: 'candidate' | 'recruiter') => {
    setCurrentUser(user);
    if (role === 'recruiter') {
      setActiveTab('search');
    } else {
      setActiveTab('profile');
    }
  };

  const handleLogout = () => {
    api.clearToken();
    setCurrentUser(null);
    setIsProfileDrawerOpen(false);
    setShowSelfPersonaModal(false);
  };

  const loadSelfPersonaCandidate = async (): Promise<PersonaModalCandidate | null> => {
    try {
      const [pRes, perRes] = await Promise.allSettled([
        api.getMyProfile(),
        api.getPersona(),
      ]);
      const p = pRes.status === 'fulfilled' ? pRes.value : null;
      const per = perRes.status === 'fulfilled' ? perRes.value : undefined;

      if (p && p.full_name) {
        const cand: PersonaModalCandidate = {
          id: p.id,
          full_name: p.full_name,
          headline: p.headline || per?.headline,
          bio: p.bio || per?.summary,
          avatar_url: p.avatar_url,
          total_years_experience: p.total_years_experience ?? 0,
          city: p.location?.city,
          country: p.location?.country,
          availability_status: p.availability_status,
          desired_salary: (p as any).desired_salary ? String((p as any).desired_salary) : undefined,
          skills: p.skills?.map((s: any) => s.normalized_name || s.original_name) || [],
          education: p.education?.map((e: any) => ({
            institution: e.institution,
            degree: e.original_degree || e.normalized_degree_type || '',
            field: e.field_of_study,
            year: e.end_date,
          })) || [],
          experiences: p.experiences?.map((e: any) => ({
            company: e.company,
            title: e.original_job_title || (e as any).title || '',
            start: e.start_date,
            end: e.end_date || (e.is_current ? 'Present' : undefined),
            description: e.description,
          })) || [],
          persona: per,
        };
        setSelfPersonaCandidate(cand);
        return cand;
      }
    } catch (err) {
      console.error(err);
    }
    return null;
  };

  const handleOpenProfileOrPersona = async () => {
    if (!currentUser) return;
    if (currentUser.role === 'candidate') {
      const cand = await loadSelfPersonaCandidate();
      if (cand) {
        setShowSelfPersonaModal(true);
        return;
      }
    }
    setIsProfileDrawerOpen(true);
  };

  if (!authChecked) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#141413]" />
      </div>
    );
  }

  // ── UNREGISTERED / UNLOGGED STATE: RENDER LOGIN PAGE (Image 4 Match) ──
  if (!currentUser) {
    return <LoginView onLoginSuccess={handleLoginSuccess} />;
  }

  const isCandidateBlue = currentUser?.role === 'candidate' && (activeTab === 'profile' || activeTab === 'explore');

  // ── AUTHENTICATED SYSTEM (Claude Warm Stone Aesthetic / Solid Blue SaaS Dashboard) ──
  return (
    <div className={`min-h-screen ${isCandidateBlue ? 'bg-[#1E70F9]' : 'bg-[#FAF7F2]'} font-sans antialiased text-[#141413] flex flex-col selection:bg-[#1E70F9] selection:text-white`}>
      
      {/* ── TOP NAVBAR (Profile, Companies, Search, Pipeline pills) ── */}
      <AppNavbar
        user={currentUser}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenProfileDrawer={handleOpenProfileOrPersona}
        onOpenTelemetry={() => setShowTelemetryModal(true)}
        onLogout={handleLogout}
      />

      {/* ── MAIN CONTENT ROUTER (Role-Separated) ── */}
      <main className="w-full flex-1">
        {/* Candidate Views */}
        {currentUser.role === 'candidate' && (
          <>
            {activeTab === 'profile' && (
              <Flow1_ProfileForm
                onProfileSaved={async () => {
                  const cand = await loadSelfPersonaCandidate();
                  if (cand) {
                    setShowSelfPersonaModal(true);
                  } else {
                    setIsProfileDrawerOpen(true);
                  }
                }}
              />
            )}
            {activeTab === 'explore' && <CompanyDirectoryView />}
          </>
        )}

        {/* Recruiter Views */}
        {currentUser.role === 'recruiter' && (
          <>
            {activeTab === 'search' && (
              <Flow3_RecruiterView
                onGoToOrganization={() => setActiveTab('organization')}
              />
            )}
            {activeTab === 'organization' && (
              <OrganizationView
                onGoToSearch={() => setActiveTab('search')}
              />
            )}
          </>
        )}
      </main>

      {/* ── PROFILE & PERSONA DOSSIER SLIDE-OVER DRAWER (With 1-Click Role Switcher) ── */}
      <ProfileDrawer
        isOpen={isProfileDrawerOpen}
        onClose={() => setIsProfileDrawerOpen(false)}
        currentUser={currentUser}
        onGoToProfileBuilder={() => {
          setActiveTab('profile');
        }}
        onLogout={handleLogout}
        onRoleSwitched={(newUser) => {
          setCurrentUser(newUser);
          setActiveTab(newUser.role === 'recruiter' ? 'search' : 'profile');
        }}
        onOpenPersonaBoard={async () => {
          const cand = await loadSelfPersonaCandidate();
          if (cand) {
            setShowSelfPersonaModal(true);
          }
        }}
      />

      {/* ── CANDIDATE'S OWN PERSONA BOARD (IMAGE 3 MULTI-CARD STYLE) ── */}
      <CandidatePersonaModal
        isOpen={showSelfPersonaModal}
        onClose={() => setShowSelfPersonaModal(false)}
        candidate={selfPersonaCandidate}
        isSelf={true}
        onEditProfile={() => {
          setShowSelfPersonaModal(false);
          setActiveTab('profile');
        }}
      />

      {/* ── SYSTEM ARCHITECTURE & AI TELEMETRY MODAL ── */}
      {showTelemetryModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-[28px] max-w-md w-full p-6 sm:p-7 shadow-2xl border border-[#E8E2D9]">
            <div className="flex justify-between items-center mb-5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#0B0C10] text-white flex items-center justify-center font-bold text-xs shadow-2xs">
                  D
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#141413] leading-tight">Dullnit V1 Architecture</h3>
                  <span className="text-[10px] text-[#736B63] font-semibold uppercase tracking-wider">Claude-Grade System Stack</span>
                </div>
              </div>
              <button 
                type="button" 
                onClick={() => setShowTelemetryModal(false)}
                className="w-7 h-7 rounded-full bg-[#EAE5DE] hover:bg-[#D9D1C7] flex items-center justify-center text-[#141413] transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs mb-6">
              <div className="flex justify-between items-center p-3 bg-[#FAF7F2] rounded-xl border border-[#E8E2D9]">
                <span className="text-[#736B63] font-medium">Backend & Storage</span>
                <span className="font-semibold text-emerald-700 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Hybrid Edge & Local Persistence
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-[#FAF7F2] rounded-xl border border-[#E8E2D9]">
                <span className="text-[#736B63] font-medium">Database Layer</span>
                <span className="font-semibold text-emerald-700 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> SQLite / PostGIS
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-[#FAF7F2] rounded-xl border border-[#E8E2D9]">
                <span className="text-[#736B63] font-medium">AI Intelligence</span>
                <span className="font-semibold text-emerald-700 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Gemini 2.5 Flash
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-[#FAF7F2] rounded-xl border border-[#E8E2D9]">
                <span className="text-[#736B63] font-medium">CV Document Engine</span>
                <span className="font-semibold text-emerald-700 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> PyMuPDF + python-docx
                </span>
              </div>
            </div>

            <div className="flex justify-end">
              <button 
                type="button" 
                className="px-6 py-2.5 bg-[#0B0C10] hover:bg-black text-white rounded-full text-xs font-bold transition active:scale-98 cursor-pointer shadow-sm" 
                onClick={() => setShowTelemetryModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── FLOATING GEMINI API KEY SWAP HUD ── */}
      <FloatingApiHUD />

    </div>
  );
}

export default App;
