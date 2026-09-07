import React, { useState } from 'react';
import type { CandidatePersona } from '../types';
import { User, RefreshCw } from 'lucide-react';

interface CandidatePersonaCardProps {
  persona: CandidatePersona | null;
  candidateName: string;
  candidateLocation?: { city?: string; country?: string };
  totalYearsExp: number;
  onRegenerate: () => Promise<void>;
}

export const CandidatePersonaCard: React.FC<CandidatePersonaCardProps> = ({
  persona,
  candidateName,
  candidateLocation,
  totalYearsExp,
  onRegenerate,
}) => {
  const [isRegenerating, setIsRegenerating] = useState(false);

  const handleRegenerateClick = async () => {
    setIsRegenerating(true);
    try {
      await onRegenerate();
    } finally {
      setIsRegenerating(false);
    }
  };

  const name = candidateName || 'Demuni Jayasmith';
  const isDemuni = name.toLowerCase().includes('demuni');
  const locationStr = candidateLocation?.city
    ? `${candidateLocation.city}, ${candidateLocation.country || 'Sri Lanka'}`
    : 'Colombo, Sri Lanka';

  const yearsExp = totalYearsExp || 4;
  const age = isDemuni ? 24 : Math.min(50, Math.max(24, Math.round(22 + yearsExp * 1.5)));
  const sublineRole = isDemuni
    ? 'AI & Full-Stack Software Engineer'
    : (persona?.primary_profession || 'Software Engineer');

  const aboutText = isDemuni
    ? (persona?.summary || "He is a dedicated AI Systems & Full-Stack Engineer who specializes in autonomous agent orchestration, high-concurrency backend microservices, and modern reactive web platforms. Currently completing Pearson HND Level 5 in Software Engineering and Pearson HND in Business Management, he combines technical rigor with strategic execution. He thrives on solving difficult technical challenges, architecting low-latency FastAPI services, and building AI tools that solve real-world problems.")
    : (persona?.summary || "A dedicated engineering professional with a proven track record delivering resilient backend systems and AI platforms.");

  const topSkills = persona?.top_skills || ["Python", "FastAPI", "TypeScript", "React", "PostgreSQL", "Docker"];

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
    <div className="relative w-full max-w-[940px] mx-auto rounded-[32px] sm:rounded-[36px] bg-white border border-slate-200/80 shadow-[0_24px_60px_-15px_rgba(15,23,42,0.12)] p-6 sm:p-8 lg:p-9 my-6 overflow-hidden font-sans">
      
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

        <button
          type="button"
          onClick={handleRegenerateClick}
          disabled={isRegenerating}
          className="inline-flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold px-3.5 py-1.5 rounded-full transition cursor-pointer"
        >
          <RefreshCw className={`w-3 h-3 ${isRegenerating ? 'animate-spin' : ''}`} />
          <span>{isRegenerating ? 'Updating...' : 'Regenerate'}</span>
        </button>
      </div>

      {/* ── CARD CONTENT: 2-COLUMN FLEX LAYOUT (Exact Image 1 Layout with Zero Overlap) ── */}
      <div className="flex flex-col md:flex-row gap-6 lg:gap-8 items-stretch">
        
        {/* ── LEFT COLUMN: TALL PORTRAIT CARD WITH DARK GRADIENT OVERLAY ── */}
        <div className="relative w-full md:w-[280px] lg:w-[310px] shrink-0 rounded-[24px] overflow-hidden min-h-[420px] shadow-sm bg-slate-100 group">
          <img
            src="/candidate_persona_portrait.jpg"
            alt={name}
            className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
            onError={(e) => {
              (e.target as HTMLElement).setAttribute('src', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80');
            }}
          />

          {/* Dark Bottom Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col justify-end p-6">
            <h3 className="text-2xl sm:text-[26px] font-bold text-white tracking-tight leading-tight">
              {name}
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
                  Lead Engineer • Available Now
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
  );
};
