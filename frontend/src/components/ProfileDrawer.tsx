import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import type { User, CandidateProfile, CandidatePersona } from '../types';
import {
  X,
  Sparkles,
  MapPin,
  Briefcase,
  RefreshCw,
  LogOut,
  ArrowUp,
  Edit3,
  Loader2,
  Building2,
} from 'lucide-react';

interface ProfileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  onGoToProfileBuilder: () => void;
  onLogout: () => void;
}

export const ProfileDrawer: React.FC<ProfileDrawerProps> = ({
  isOpen,
  onClose,
  currentUser,
  onGoToProfileBuilder,
  onLogout,
}) => {
  const [profile, setProfile] = useState<CandidateProfile | null>(null);
  const [persona, setPersona] = useState<CandidatePersona | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isRegenerating, setIsRegenerating] = useState<boolean>(false);

  const fetchProfileData = async () => {
    setLoading(true);
    try {
      if (currentUser?.role === 'candidate') {
        const p = await api.getMyProfile();
        setProfile(p);
        try {
          const per = await api.getPersona();
          setPersona(per);
        } catch {
          setPersona(null);
        }
      }
    } catch {
      setProfile(null);
      setPersona(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchProfileData();
    }
  }, [isOpen, currentUser]);

  const handleRegenerate = async () => {
    setIsRegenerating(true);
    try {
      const refreshed = await api.regeneratePersona();
      setPersona(refreshed);
    } catch (e) {
      console.error(e);
    } finally {
      setIsRegenerating(false);
    }
  };

  if (!isOpen) return null;

  const hasDossier = (profile && profile.full_name) || (persona && persona.headline);
  const initials = (profile?.full_name || currentUser?.email || 'U')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
      {/* Dimmed Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity duration-300 cursor-pointer"
        onClick={onClose}
      />

      {/* Drawer Container */}
      <div className="relative w-full max-w-md sm:max-w-lg bg-white h-full shadow-2xl flex flex-col z-50 animate-slide-in-right overflow-hidden">
        
        {/* Header Bar */}
        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white/95 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center font-bold text-sm shadow-xs">
              {initials}
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900 leading-tight">
                {profile?.full_name || currentUser?.email?.split('@')[0] || 'My Account'}
              </h2>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                  {currentUser?.role === 'recruiter' ? (
                    <>
                      <Building2 className="w-3 h-3 text-emerald-600" /> Business Recruiter
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3 h-3 text-blue-600" /> Candidate Talent
                    </>
                  )}
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {loading ? (
            <div className="h-64 flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
          ) : currentUser?.role === 'recruiter' ? (
            /* Recruiter Account Overview */
            <div className="space-y-6">
              <div className="bg-[#f9fafb] rounded-2xl border border-gray-200/80 p-6 text-center">
                <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto mb-3 text-emerald-700">
                  <Building2 className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">Company Portal Active</h3>
                <p className="text-xs text-gray-500 mt-1 max-w-xs mx-auto">
                  You are logged in as an authorized talent recruiter. Search candidates by skill, proximity radius, or natural language.
                </p>
              </div>

              <div className="bg-white rounded-xl border border-gray-200/80 p-4 space-y-3 text-xs">
                <div className="flex justify-between py-1 border-b border-gray-100">
                  <span className="text-gray-500">Account Email</span>
                  <span className="font-semibold text-gray-900">{currentUser?.email}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-100">
                  <span className="text-gray-500">Access Level</span>
                  <span className="font-semibold text-emerald-700">Verified Recruiter</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-gray-500">Spatial Proximity</span>
                  <span className="font-semibold text-gray-900">Enabled (PostGIS)</span>
                </div>
              </div>
            </div>
          ) : !hasDossier ? (
            /* ── EXACT MATCH TO SCREENSHOT 3 (NO DOSSIER YET) ── */
            <div className="flex flex-col items-center justify-center text-center py-8">
              {/* Rounded Food/Avatar Placeholder Illustration from Screenshot 3 */}
              <div className="w-36 h-36 rounded-2xl overflow-hidden border-2 border-dashed border-gray-200 shadow-xs mb-6 mx-auto bg-gray-50 flex items-center justify-center">
                <img
                  src="/no_person_avatar.jpg"
                  alt="No dossier yet"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              </div>

              <h2 className="text-2xl font-bold text-gray-900 tracking-tight mb-2">
                No dossier yet
              </h2>

              <p className="text-sm text-gray-500 max-w-xs mx-auto mb-6 leading-relaxed">
                Build your profile manually and we'll generate your candidate persona automatically.
              </p>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  onGoToProfileBuilder();
                }}
                className="inline-flex items-center gap-2 px-7 py-2.5 rounded-full border-2 border-black bg-transparent text-black text-xs font-bold tracking-wider uppercase hover:bg-black hover:text-white transition-all shadow-xs cursor-pointer"
              >
                <ArrowUp className="w-4 h-4" />
                <span>UPLOAD PROFILE</span>
              </button>
            </div>
          ) : (
            /* ── COMPLETE CANDIDATE PERSONA & DOSSIER VIEW ── */
            <div className="space-y-6">
              
              {/* Profile Card Header */}
              <div className="bg-gradient-to-br from-gray-900 to-black text-white rounded-3xl p-6 shadow-md relative overflow-hidden">
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <span className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-[11px] font-semibold text-emerald-300 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                      {profile?.availability_status || 'Open to Work'}
                    </span>
                    <span className="text-xs text-white/60 font-medium">
                      {persona?.seniority_level || 'Senior Specialist'}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold tracking-tight text-white">
                    {profile?.full_name}
                  </h3>
                  <p className="text-xs text-white/80 mt-1 font-medium">
                    {persona?.headline || profile?.headline || 'High-Caliber Professional'}
                  </p>

                  <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-white/70">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-white/50" />
                      <span>{profile?.location?.city ? `${profile.location.city}, ${profile.location.country}` : 'Global Remote'}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Briefcase className="w-3.5 h-3.5 text-white/50" />
                      <span>{profile?.total_years_experience ?? 4}+ Years Exp</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* AI Persona Dossier & Archetype Card */}
              <div className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-gray-900 font-bold text-sm">
                    <Sparkles className="w-4 h-4 text-purple-600" />
                    <span>AI Dossier & Persona</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleRegenerate}
                    disabled={isRegenerating}
                    title="Regenerate persona via Gemini AI"
                    className="p-1.5 rounded-lg text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isRegenerating ? 'animate-spin text-black' : ''}`} />
                  </button>
                </div>

                {(persona?.primary_profession || (persona as any)?.archetype) && (
                  <div className="bg-purple-50/70 border border-purple-100 rounded-xl p-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 block mb-0.5">
                      Professional Persona & Focus
                    </span>
                    <span className="text-xs font-semibold text-purple-950">
                      {(persona as any)?.archetype || persona?.primary_profession}
                    </span>
                  </div>
                )}

                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">
                    Executive Summary
                  </span>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    {persona?.summary || profile?.bio || 'Professional profile generated from uploaded credentials and experience.'}
                  </p>
                </div>

                {/* Validated Skills Chips */}
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-2">
                    Top Validated Competencies
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {(persona?.top_skills || profile?.skills?.map(s => s.normalized_name || s.original_name) || ['Python', 'FastAPI', 'React']).map((sk, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-full bg-gray-100 border border-gray-200 text-gray-800 text-[11px] font-medium"
                      >
                        {sk}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-2 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onGoToProfileBuilder();
                    }}
                    className="flex-1 py-2.5 px-4 bg-black hover:bg-gray-800 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit Profile Form</span>
                  </button>
                </div>
              </div>

            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-gray-100 bg-gray-50/80 flex items-center justify-between">
          <div className="text-[11px] text-gray-500">
            Signed in as <span className="font-semibold text-gray-800">{currentUser?.email}</span>
          </div>
          <button
            type="button"
            onClick={onLogout}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-red-600 hover:bg-red-50 transition cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>

      </div>
    </div>
  );
};
