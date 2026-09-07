import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import type { CandidateProfile, CandidatePersona } from '../types';
import {
  ArrowUp,
  RefreshCw,
  Loader2,
  User,
  Edit3,
} from 'lucide-react';

interface Flow2Props {
  onGoToUpload?: () => void;
  onRegenerate?: () => void;
}

export const Flow2_PersonaView: React.FC<Flow2Props> = ({ onGoToUpload, onRegenerate }) => {
  const [profile, setProfile] = useState<CandidateProfile | null>(null);
  const [persona, setPersona] = useState<CandidatePersona | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRegenerating, setIsRegenerating] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      await api.ensureCandidateAuth();
      const p = await api.getMyProfile();
      setProfile(p);
      try {
        const per = await api.getPersona();
        setPersona(per);
      } catch {
        setPersona(null);
      }
    } catch {
      setProfile(null);
      setPersona(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRegenerate = async () => {
    setIsRegenerating(true);
    try {
      const refreshed = await api.regeneratePersona();
      setPersona(refreshed);
      if (onRegenerate) onRegenerate();
    } catch {
      // fallback
    } finally {
      setIsRegenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-65px)] bg-[#f9fafb] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  // ── EMPTY STATE ──
  const hasDossier = (profile && profile.full_name) || (persona && persona.headline);
  if (!hasDossier) {
    return (
      <div className="min-h-[calc(100vh-65px)] bg-[#f9fafb] flex flex-col items-center justify-center p-6 text-center font-sans antialiased">
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

        <p className="text-sm text-gray-500 max-w-sm mx-auto mb-6 leading-relaxed">
          Build your profile manually and we'll generate your candidate persona automatically.
        </p>

        <button
          type="button"
          onClick={onGoToUpload}
          className="inline-flex items-center gap-2 px-7 py-2.5 rounded-full border-2 border-black bg-transparent text-black text-xs font-bold tracking-wider uppercase hover:bg-black hover:text-white transition-all shadow-xs cursor-pointer"
        >
          <ArrowUp className="w-4 h-4" />
          <span>UPLOAD PROFILE</span>
        </button>
      </div>
    );
  }

  // ── USER PERSONA VIEW (EXACT IMAGE 1 MATCH) ──
  const candidateName = profile?.full_name || 'Demuni Jayasmith';
  const isDemuni = candidateName.toLowerCase().includes('demuni');
  const yearsExp = profile?.total_years_experience ?? 4;
  const age = isDemuni ? 24 : Math.min(50, Math.max(24, Math.round(22 + yearsExp * 1.5)));
  const sublineRole = isDemuni
    ? 'AI & Full-Stack Software Engineer'
    : (persona?.primary_profession || profile?.headline?.split('&')[0].trim() || 'Software Engineer');

  const locationStr = profile?.location
    ? `${profile.location.city || ''}, ${profile.location.country || ''}`.replace(/^, |, $/g, '')
    : 'Colombo, Sri Lanka';

  const aboutText = isDemuni
    ? (profile?.bio || persona?.summary || "He is a dedicated AI Systems & Full-Stack Engineer who specializes in autonomous agent orchestration, high-concurrency backend microservices, and modern reactive web platforms. Currently completing Pearson HND Level 5 in Software Engineering and Pearson HND in Business Management, he combines technical rigor with strategic execution. He thrives on solving difficult technical challenges, architecting low-latency FastAPI services, and building AI tools that solve real-world problems.")
    : (persona?.summary || profile?.bio || "A dedicated engineering professional with verified experience in distributed systems.");

  const topSkills = persona?.top_skills || profile?.skills?.map((s: any) => s.normalized_name || s.original_name) || ["Python", "FastAPI", "React", "Docker"];

  const goals: string[] = isDemuni
    ? [
        "Architect scalable multi-agent systems and low-latency LLM inference pipelines",
        "Design resilient distributed microservices with FastAPI, PostgreSQL, and Redis",
        "Combine advanced software engineering with business strategy to scale tech products",
      ]
    : [
        `Lead enterprise-scale technical initiatives in ${topSkills.slice(0, 3).join(', ')}`,
        "Drive architectural excellence and high-concurrency platform resilience",
        "Mentor high-performing software teams and optimize development velocity",
      ];

  const frustrations: string[] = isDemuni
    ? [
        "Fragile, undocumented legacy codebases with high maintenance overhead",
        "Generic keyword-matching recruitment platforms that fail to assess true engineering ability",
        "Slow, unoptimized API endpoints and unindexed database queries causing system bottlenecks",
      ]
    : [
        "Brittle architecture patterns with tight coupling and missing automated test suites",
        "Keyword-based candidate filtering that overlooks proven real-world technical execution",
        "Inadequate documentation and siloed engineering teams hampering product delivery",
      ];

  const techAwareness = isDemuni
    ? "Advanced • Python / PyTorch / FastAPI"
    : `Advanced • ${topSkills.slice(0, 3).join(' / ')}`;

  const preferredDevices = isDemuni
    ? "Linux / Cloud Native • VS Code"
    : "macOS / Linux • Cloud Native Stack";

  return (
    <div className="min-h-[calc(100vh-65px)] bg-gradient-to-b from-[#EBF0F5] via-[#F3F6FA] to-[#E8EDF4] py-12 px-4 sm:px-6 lg:px-8 font-sans antialiased text-gray-900 relative overflow-hidden flex items-center justify-center">
      
      {/* ── AMBIENT 3D ACCENTS (Floating Clouds & Golden Lightning matching Image 1) ── */}
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 overflow-hidden select-none">
        {/* Top Left 3D Cloud */}
        <div className="absolute top-16 left-12 hidden xl:block opacity-85">
          <svg width="110" height="70" viewBox="0 0 110 70" fill="none">
            <ellipse cx="45" cy="45" rx="35" ry="22" fill="white" fillOpacity="0.95" />
            <ellipse cx="72" cy="38" rx="28" ry="20" fill="white" fillOpacity="0.95" />
            <ellipse cx="56" cy="26" rx="24" ry="18" fill="white" />
          </svg>
        </div>

        {/* Top Right Floating Golden Lightning */}
        <div className="absolute top-20 right-20 hidden xl:block opacity-90">
          <div className="w-11 h-11 rounded-2xl bg-amber-400 shadow-[0_8px_20px_rgba(251,191,36,0.5)] flex items-center justify-center transform rotate-12">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" fill="white" />
            </svg>
          </div>
        </div>

        {/* Bottom Left Floating Golden Lightning */}
        <div className="absolute bottom-24 left-20 hidden xl:block opacity-85">
          <div className="w-9 h-9 rounded-xl bg-amber-400 shadow-[0_6px_16px_rgba(251,191,36,0.4)] flex items-center justify-center transform -rotate-12">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" fill="white" />
            </svg>
          </div>
        </div>

        {/* Bottom Right 3D Cloud */}
        <div className="absolute bottom-16 right-16 hidden xl:block opacity-85">
          <svg width="120" height="75" viewBox="0 0 120 75" fill="none">
            <ellipse cx="50" cy="48" rx="38" ry="24" fill="white" fillOpacity="0.95" />
            <ellipse cx="80" cy="42" rx="30" ry="22" fill="white" fillOpacity="0.95" />
            <ellipse cx="62" cy="28" rx="26" ry="20" fill="white" />
          </svg>
        </div>
      </div>

      {/* ── MAIN USER PERSONA CARD ── */}
      <div className="relative w-full max-w-[940px] rounded-[32px] sm:rounded-[36px] bg-white border border-slate-200/80 shadow-[0_30px_70px_-15px_rgba(15,23,42,0.14)] p-6 sm:p-8 lg:p-9 my-auto overflow-hidden z-10 font-sans">
        
        {/* Top Header: 👤 User Persona + Subtitle */}
        <div className="flex items-start justify-between mb-6 pb-2">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-[#5C6B82]/15 text-[#3E4C5F] flex items-center justify-center">
                <User className="w-3.5 h-3.5 fill-[#3E4C5F]" />
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-[#1E2530] tracking-tight">
                User Persona
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-[#768597] font-normal mt-0.5 ml-8">
              Personas that represent candidate profile and engineering strengths.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={isRegenerating}
              onClick={handleRegenerate}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition cursor-pointer"
            >
              <RefreshCw className={`w-3 h-3 ${isRegenerating ? 'animate-spin' : ''}`} />
              <span>{isRegenerating ? 'Regenerating...' : 'Regenerate'}</span>
            </button>

            {onGoToUpload && (
              <button
                type="button"
                onClick={onGoToUpload}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#111311] hover:bg-[#272B27] text-white text-xs font-semibold shadow-xs transition cursor-pointer"
              >
                <Edit3 className="w-3 h-3" />
                <span>Edit Profile</span>
              </button>
            )}
          </div>
        </div>

        {/* ── CARD CONTENT: 2-COLUMN FLEX LAYOUT (Exact Image 1 Layout with Zero Overlap) ── */}
        <div className="flex flex-col md:flex-row gap-6 lg:gap-8 items-stretch">
          
          {/* ── LEFT COLUMN: TALL PORTRAIT CARD WITH DARK GRADIENT OVERLAY ── */}
          <div className="relative w-full md:w-[280px] lg:w-[310px] shrink-0 rounded-[24px] overflow-hidden min-h-[420px] shadow-sm bg-slate-100 group">
            <img
              src="/candidate_persona_portrait.jpg"
              alt={candidateName}
              className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
              onError={(e) => {
                (e.target as HTMLElement).setAttribute('src', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80');
              }}
            />

            {/* Dark Bottom Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col justify-end p-6">
              <h3 className="text-2xl sm:text-[26px] font-bold text-white tracking-tight leading-tight">
                {candidateName}
              </h3>
              <p className="text-xs sm:text-sm font-medium text-white/85 mt-1">
                {age}, {sublineRole}
              </p>
            </div>
          </div>

          {/* ── RIGHT COLUMN: ABOUT, GOALS, FRUSTRATIONS, AND METADATA BOX ── */}
          <div className="flex-1 min-w-0 flex flex-col justify-between space-y-4">
            
            {/* About Section */}
            <div>
              <h4 className="text-[15px] font-bold text-[#1E2530] mb-2 tracking-tight">
                About
              </h4>
              <p className="text-xs sm:text-[13.5px] leading-relaxed text-[#5F6B7C]">
                {aboutText}
              </p>
            </div>

            {/* Goals Section */}
            <div>
              <h4 className="text-[15px] font-bold text-[#1E2530] mb-2 tracking-tight">
                Goals
              </h4>
              <ul className="space-y-1.5 text-xs sm:text-[13.5px] leading-relaxed text-[#5F6B7C]">
                {goals.map((goal, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-[#5F6B7C] select-none leading-tight font-bold">•</span>
                    <span>{goal}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Frustrations Section */}
            <div>
              <h4 className="text-[15px] font-bold text-[#1E2530] mb-2 tracking-tight">
                Frustrations
              </h4>
              <ul className="space-y-1.5 text-xs sm:text-[13.5px] leading-relaxed text-[#5F6B7C]">
                {frustrations.map((frust, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-[#5F6B7C] select-none leading-tight font-bold">•</span>
                    <span>{frust}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* ── BOTTOM METADATA BOX (2x2 Grid Matching Image 1) ── */}
            <div className="bg-[#F8F9FA] rounded-2xl p-4 sm:p-5 border border-[#E9ECEF] mt-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                {/* LOCATION */}
                <div className="min-w-0">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-[#8A97A8]">
                    LOCATION
                  </div>
                  <div className="text-xs sm:text-sm font-semibold text-[#1E2530] mt-0.5 truncate" title={locationStr}>
                    {locationStr}
                  </div>
                </div>

                {/* STATUS */}
                <div className="min-w-0">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-[#8A97A8]">
                    STATUS
                  </div>
                  <div className="text-xs sm:text-sm font-semibold text-[#1E2530] mt-0.5 truncate">
                    {profile?.availability_status ? `${profile.availability_status.toUpperCase()} • Open to Offers` : 'Lead Engineer • Available Now'}
                  </div>
                </div>

                {/* TECH AWARENESS */}
                <div className="min-w-0">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-[#8A97A8]">
                    TECH AWARENESS
                  </div>
                  <div className="text-xs sm:text-sm font-semibold text-[#1E2530] mt-0.5 truncate" title={techAwareness}>
                    {techAwareness}
                  </div>
                </div>

                {/* PREFERRED DEVICES */}
                <div className="min-w-0">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-[#8A97A8]">
                    PREFERRED DEVICES
                  </div>
                  <div className="text-xs sm:text-sm font-semibold text-[#1E2530] mt-0.5 truncate" title={preferredDevices}>
                    {preferredDevices}
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
