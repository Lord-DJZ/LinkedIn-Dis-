import { useState, useEffect } from 'react';
import { api } from './services/api';
import type { User } from './types';
import { LoginView } from './components/LoginView';
import { AppNavbar } from './components/AppNavbar';
import { ProfileDrawer } from './components/ProfileDrawer';
import { Flow1_ProfileForm } from './components/Flow1_ProfileForm';
import { Flow2_PersonaView } from './components/Flow2_PersonaView';
import { Flow3_RecruiterView } from './components/Flow3_RecruiterView';
import { CheckCircle2, Loader2 } from 'lucide-react';

export function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authChecked, setAuthChecked] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'persona' | 'search'>('profile');
  const [isProfileDrawerOpen, setIsProfileDrawerOpen] = useState<boolean>(false);
  const [showTelemetryModal, setShowTelemetryModal] = useState<boolean>(false);

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
  };

  if (!authChecked) {
    return (
      <div className="min-h-screen bg-[#f4f6f8] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  // ── UNREGISTERED / UNLOGGED STATE: RENDER LOGIN PAGE (Image 4 Match) ──
  if (!currentUser) {
    return <LoginView onLoginSuccess={handleLoginSuccess} />;
  }

  // ── AUTHENTICATED SYSTEM (Image 1, 2, 3 Match) ──
  return (
    <div className="min-h-screen bg-[#f9fafb] font-sans antialiased text-gray-900 flex flex-col selection:bg-black selection:text-white">
      
      {/* ── TOP NAVBAR (Profile & Search pills in center, Persona in Profile Avatar) ── */}
      <AppNavbar
        user={currentUser}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenProfileDrawer={() => setIsProfileDrawerOpen(true)}
        onOpenTelemetry={() => setShowTelemetryModal(true)}
      />

      {/* ── MAIN CONTENT ROUTER ── */}
      <main className="w-full flex-1">
        {activeTab === 'profile' && (
          <Flow1_ProfileForm
            onProfileSaved={() => {
              // Automatically open the profile drawer so candidate sees their new AI dossier!
              setIsProfileDrawerOpen(true);
            }}
          />
        )}
        {activeTab === 'persona' && (
          <Flow2_PersonaView
            onGoToUpload={() => setActiveTab('profile')}
            onRegenerate={() => {}}
          />
        )}
        {activeTab === 'search' && (
          <Flow3_RecruiterView />
        )}
      </main>

      {/* ── PROFILE & PERSONA DOSSIER SLIDE-OVER DRAWER (Image 2 + Persona) ── */}
      <ProfileDrawer
        isOpen={isProfileDrawerOpen}
        onClose={() => setIsProfileDrawerOpen(false)}
        currentUser={currentUser}
        onGoToProfileBuilder={() => {
          setActiveTab('profile');
        }}
        onLogout={handleLogout}
      />

      {/* ── SYSTEM ARCHITECTURE & AI TELEMETRY MODAL ── */}
      {showTelemetryModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-black/10 animate-fadeIn">
            <div className="flex justify-between items-center mb-5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center font-bold text-xs">
                  D
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900 leading-tight">Dullnit V1 Architecture</h3>
                  <span className="text-[10px] text-gray-400 font-medium">Apple-grade System Stack</span>
                </div>
              </div>
              <button 
                type="button" 
                onClick={() => setShowTelemetryModal(false)}
                className="text-gray-400 hover:text-gray-600 text-lg font-bold leading-none cursor-pointer"
              >
                &times;
              </button>
            </div>

            <div className="space-y-2 text-xs mb-6">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl border border-black/5">
                <span className="text-gray-600 font-medium">Backend Server</span>
                <span className="font-semibold text-emerald-700 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> FastAPI (Port 8000)
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl border border-black/5">
                <span className="text-gray-600 font-medium">Database Layer</span>
                <span className="font-semibold text-emerald-700 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> SQLite / PostGIS
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl border border-black/5">
                <span className="text-gray-600 font-medium">AI Intelligence</span>
                <span className="font-semibold text-emerald-700 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Gemini 2.5 Flash
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl border border-black/5">
                <span className="text-gray-600 font-medium">CV Document Engine</span>
                <span className="font-semibold text-emerald-700 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> PyMuPDF + python-docx
                </span>
              </div>
            </div>

            <div className="flex justify-end">
              <button 
                type="button" 
                className="px-6 py-2 bg-black hover:bg-gray-800 text-white rounded-full text-xs font-semibold transition cursor-pointer" 
                onClick={() => setShowTelemetryModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default App;
