import { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { CandidateDashboard } from './components/CandidateDashboard';
import { RecruiterDashboard } from './components/RecruiterDashboard';
import { AuthModal } from './components/AuthModal';
import { AdminModal } from './components/AdminModal';
import { api } from './services/api';
import type { User } from './types';

export function App() {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<'candidate' | 'recruiter'>('candidate');
  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(false);
  const [isAdminOpen, setIsAdminOpen] = useState<boolean>(false);

  useEffect(() => {
    // Check existing session
    api.getMe()
      .then((userData) => {
        setUser(userData);
        if (userData.role === 'recruiter') {
          setActiveTab('recruiter');
        } else {
          setActiveTab('candidate');
        }
      })
      .catch(() => {
        // Not authenticated
        setUser(null);
      });
  }, []);

  const handleLogout = () => {
    api.clearToken();
    setUser(null);
  };

  const handleAuthSuccess = (authenticatedUser: User) => {
    setUser(authenticatedUser);
    if (authenticatedUser.role === 'recruiter') {
      setActiveTab('recruiter');
    } else {
      setActiveTab('candidate');
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top Glassmorphic Navigation */}
      <Navbar
        user={user}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenAdmin={() => setIsAdminOpen(true)}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <main className="container flex-1">
        {activeTab === 'candidate' ? (
          <CandidateDashboard onOpenAuth={() => setIsAuthOpen(true)} />
        ) : (
          <RecruiterDashboard onOpenAuth={() => setIsAuthOpen(true)} />
        )}
      </main>

      {/* Footer */}
      <footer className="py-6 border-t border-slate-200/60 text-center text-xs text-slate-500 glass-header mt-12">
        <div className="container flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="font-medium text-slate-600">
            Dullnit Talent Platform &bull; Production Backend Architecture &bull; Sri Lanka
          </p>
          <div className="flex items-center gap-4 text-[11px] text-slate-400">
            <span>FastAPI + PostgreSQL + PostGIS</span>
            <span>&bull;</span>
            <span>Gemini AI Structured Output</span>
            <span>&bull;</span>
            <span>PyMuPDF & python-docx</span>
          </div>
        </div>
      </footer>

      {/* Authentication Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={handleAuthSuccess}
      />

      {/* System Diagnostics & Admin Modal */}
      <AdminModal
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
      />
    </div>
  );
}

export default App;
