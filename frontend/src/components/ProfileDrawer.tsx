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
  Repeat,
  FileText,
} from 'lucide-react';

interface ProfileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  onGoToProfileBuilder: () => void;
  onLogout: () => void;
  onOpenPersonaBoard?: () => void;
  onRoleSwitched?: (user: User) => void;
}

export const ProfileDrawer: React.FC<ProfileDrawerProps> = ({
  isOpen,
  onClose,
  currentUser,
  onGoToProfileBuilder,
  onLogout,
  onOpenPersonaBoard,
  onRoleSwitched,
}) => {
  const [profile, setProfile] = useState<CandidateProfile | null>(null);
  const [persona, setPersona] = useState<CandidatePersona | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isRegenerating, setIsRegenerating] = useState<boolean>(false);
  const [isSwitchingRole, setIsSwitchingRole] = useState<boolean>(false);

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

  const handleToggleRole = async () => {
    if (!currentUser) return;
    const targetRole = currentUser.role === 'candidate' ? 'recruiter' : 'candidate';
    setIsSwitchingRole(true);
    try {
      const switched = await api.switchRole(targetRole);
      const updatedUser: User = {
        id: currentUser.id,
        email: switched.email || currentUser.email,
        role: targetRole,
        is_active: true,
      };
      if (onRoleSwitched) {
        onRoleSwitched(updatedUser);
      }
      onClose();
    } catch (err) {
      console.error('Role switch error:', err);
    } finally {
      setIsSwitchingRole(false);
    }
  };

  if (!isOpen) return null;

  const hasDossier = (profile && profile.full_name) || (persona && persona.headline);
  const initials = (profile?.full_name || currentUser?.email || 'U')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end animate-fadeIn">
      {/* Dimmed Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity duration-300 cursor-pointer"
        onClick={onClose}
      />

      {/* Drawer Container (Claude warm stone) */}
      <div className="relative w-full max-w-md sm:max-w-lg bg-[#FAF7F2] h-full shadow-2xl flex flex-col z-50 animate-slide-in-right overflow-hidden border-l border-[#E8E2D9]">
        
        {/* Header Bar */}
        <div className="p-6 border-b border-[#E8E2D9] flex items-center justify-between bg-white sticky top-0 z-10 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#0B0C10] text-white flex items-center justify-center font-bold text-sm shadow-xs">
              {initials}
            </div>
            <div>
              <h2 className="text-base font-bold text-[#141413] leading-tight">
                {profile?.full_name || currentUser?.email?.split('@')[0] || 'My Account'}
              </h2>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-[#736B63]">
                  {currentUser?.role === 'recruiter' ? (
                    <>
                      <Building2 className="w-3 h-3 text-[#141413]" /> Recruiter Workspace
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3 h-3 text-[#141413]" /> Candidate Dossier
                    </>
                  )}
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#EAE5DE] hover:bg-[#D9D1C7] flex items-center justify-center text-[#141413] transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* ── 1-CLICK ROLE SWITCHER (Candidate <-> Recruiter) ── */}
          <div className="bg-white rounded-2xl border border-[#E8E2D9] p-4 flex items-center justify-between shadow-2xs">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#736B63] block">
                Platform Workspace
              </span>
              <span className="text-xs font-bold text-[#141413] capitalize">
                {currentUser?.role} Role
              </span>
            </div>
            <button
              type="button"
              onClick={handleToggleRole}
              disabled={isSwitchingRole}
              className="px-4 py-2 rounded-full bg-[#0B0C10] hover:bg-black text-white text-xs font-bold transition active:scale-98 shadow-xs cursor-pointer flex items-center gap-1.5"
            >
              <Repeat className={`w-3.5 h-3.5 ${isSwitchingRole ? 'animate-spin' : ''}`} />
              <span>Switch to {currentUser?.role === 'candidate' ? 'Recruiter' : 'Candidate'}</span>
            </button>
          </div>

          {loading ? (
            <div className="h-64 flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-[#8C827A]" />
            </div>
          ) : currentUser?.role === 'recruiter' ? (
            /* Recruiter Workspace Details */
            <div className="space-y-5">
              <div className="bg-white rounded-2xl border border-[#E8E2D9] p-6 text-center shadow-xs">
                <div className="w-14 h-14 rounded-2xl bg-[#FAF7F2] border border-[#E8E2D9] flex items-center justify-center mx-auto mb-3 text-[#141413]">
                  <Building2 className="w-7 h-7" />
                </div>
                <h3 className="text-base font-bold text-[#141413]">Recruiter Workspace Active</h3>
                <p className="text-xs text-[#736B63] mt-1 max-w-xs mx-auto leading-relaxed">
                  Authorized to source talent, view candidate portrait cards, and manage recruited pipelines.
                </p>
              </div>

              <div className="bg-white rounded-2xl border border-[#E8E2D9] p-4 space-y-3 text-xs shadow-2xs">
                <div className="flex justify-between py-1 border-b border-[#E8E2D9]">
                  <span className="text-[#736B63]">Account</span>
                  <span className="font-semibold text-[#141413]">{currentUser?.email}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#E8E2D9]">
                  <span className="text-[#736B63]">Access Level</span>
                  <span className="font-semibold text-[#141413]">Recruiter Portal</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-[#736B63]">Proximity Engine</span>
                  <span className="font-semibold text-[#141413]">Active</span>
                </div>
              </div>
            </div>
          ) : !hasDossier ? (
            /* Empty Dossier View */
            <div className="flex flex-col items-center justify-center text-center py-8">
              <div className="w-24 h-24 rounded-3xl bg-white border border-[#E8E2D9] shadow-xs mb-4 flex items-center justify-center text-[#8C827A]">
                <FileText className="w-10 h-10" />
              </div>

              <h2 className="text-xl font-bold text-[#141413] tracking-tight mb-1">
                No resume dossier yet
              </h2>

              <p className="text-xs text-[#736B63] max-w-xs mx-auto mb-6 leading-relaxed">
                Build your profile or upload your CV to generate your candidate persona.
              </p>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  onGoToProfileBuilder();
                }}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#0B0C10] hover:bg-black text-white text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-98"
              >
                <ArrowUp className="w-4 h-4" />
                <span>Build Profile Form</span>
              </button>
            </div>
          ) : (
            /* Complete Candidate Dossier View */
            <div className="space-y-5">
              {/* Profile Card Header */}
              <div className="bg-[#141413] text-white rounded-3xl p-6 shadow-md relative overflow-hidden">
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <span className="px-3 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-[11px] font-semibold text-emerald-300 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                      {profile?.availability_status || 'available'}
                    </span>
                    <span className="text-xs text-white/70 font-medium">
                      {persona?.seniority_level || 'Senior Specialist'}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold tracking-tight text-white">
                    {profile?.full_name}
                  </h3>
                  <p className="text-xs text-white/80 mt-1 font-medium">
                    {persona?.headline || profile?.headline || 'High-Caliber Professional'}
                  </p>

                  <div className="mt-4 pt-4 border-t border-white/15 flex items-center justify-between text-xs text-white/80">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-white/60" />
                      <span>{profile?.location?.city ? `${profile.location.city}, ${profile.location.country}` : 'Global Remote'}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Briefcase className="w-3.5 h-3.5 text-white/60" />
                      <span>{profile?.total_years_experience ?? 4}+ Years Exp</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* AI Persona Dossier & Archetype Card */}
              <div className="bg-white rounded-2xl border border-[#E8E2D9] p-5 shadow-2xs space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[#141413] font-bold text-sm">
                    <Sparkles className="w-4 h-4 text-[#141413]" />
                    <span>AI Dossier & Persona</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleRegenerate}
                    disabled={isRegenerating}
                    title="Regenerate persona via Gemini AI"
                    className="p-1.5 rounded-lg text-[#736B63] hover:text-[#141413] hover:bg-[#FAF7F2] transition cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isRegenerating ? 'animate-spin text-[#141413]' : ''}`} />
                  </button>
                </div>

                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#736B63] block mb-1.5">
                    Executive Summary
                  </span>
                  <p className="text-xs text-[#524B43] leading-relaxed">
                    {persona?.summary || profile?.bio || 'Professional profile generated from uploaded credentials.'}
                  </p>
                </div>

                {/* Validated Skills Chips */}
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#736B63] block mb-2">
                    Top Competencies
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {(persona?.top_skills || profile?.skills?.map(s => s.normalized_name || s.original_name) || ['Python', 'FastAPI', 'React']).map((sk, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 rounded-full bg-[#FAF7F2] border border-[#E8E2D9] text-[#141413] text-[11px] font-medium"
                      >
                        {sk}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Actions (Solid buttons) */}
                <div className="pt-2 flex flex-col gap-2">
                  {onOpenPersonaBoard && (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onOpenPersonaBoard();
                      }}
                      className="w-full py-2.5 px-4 bg-[#0B0C10] hover:bg-black text-white rounded-full text-xs font-bold flex items-center justify-center gap-2 transition active:scale-98 cursor-pointer shadow-xs"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                      <span>View Persona Board</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onGoToProfileBuilder();
                    }}
                    className="w-full py-2.5 px-4 bg-white border border-[#E8E2D9] hover:bg-[#FAF7F2] text-[#141413] rounded-full text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer"
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
        <div className="p-4 border-t border-[#E8E2D9] bg-white flex items-center justify-between">
          <div className="text-[11px] text-[#736B63]">
            Signed in as <span className="font-semibold text-[#141413]">{currentUser?.email}</span>
          </div>
          <button
            type="button"
            onClick={onLogout}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-red-600 hover:bg-red-50 transition cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>

      </div>
    </div>
  );
};
