import React, { useState } from 'react';
import type { CandidatePersona } from '../types';
import { Sparkles, MapPin, Briefcase, RefreshCw, CheckCircle2, Award } from 'lucide-react';

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

  const locationStr = candidateLocation?.city
    ? `${candidateLocation.city}, ${candidateLocation.country || 'Sri Lanka'}`
    : 'Colombo, Sri Lanka';

  const initials = candidateName
    ? candidateName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : 'DJ';

  return (
    <div className="persona-card-container">
      {/* LEFT COLUMN: HERO PORTRAIT & EXECUTIVE QUOTE */}
      <div className="persona-left-hero">
        <div>
          <div className="flex-between mb-4">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 flex items-center gap-1">
              <Sparkles size={12} />
              AI Derived Persona
            </span>
            <span className="text-[10px] font-semibold text-emerald-400 flex items-center gap-1">
              <CheckCircle2 size={12} /> Verified
            </span>
          </div>

          <div className="flex flex-col items-center text-center my-4">
            <div className="persona-portrait-circle">
              {initials}
            </div>
            <h2 className="text-2xl font-black text-white font-heading tracking-tight">
              {candidateName || 'Demuni Jayasmith'}
            </h2>
            <p className="text-xs font-semibold text-blue-300 mt-1">
              {persona?.headline || 'Senior AI & Backend Software Architect'}
            </p>
          </div>

          {/* Executive Elevator Pitch Quote */}
          <div className="persona-quote-text">
            "{persona?.summary || 'Ambitious engineer with proven track record delivering resilient backend APIs and AI systems.'}"
          </div>
        </div>

        {/* Footer actions on left card */}
        <div className="pt-6 border-t border-slate-700/60 mt-6 flex-between">
          <div className="text-[11px] text-slate-400">
            <span>Status: </span>
            <strong className="text-emerald-400 font-bold">Open to Offers</strong>
          </div>
          <button
            onClick={handleRegenerateClick}
            disabled={isRegenerating}
            className="neu-btn !py-1.5 !px-3 text-xs bg-blue-600/80 hover:bg-blue-600 text-white rounded-lg border border-blue-400/30 flex items-center gap-1.5"
            title="Regenerate persona via Gemini"
          >
            <RefreshCw size={12} className={isRegenerating ? 'animate-spin' : ''} />
            <span>{isRegenerating ? 'Synthesizing...' : 'Regenerate'}</span>
          </button>
        </div>
      </div>

      {/* RIGHT COLUMN: CATEGORIZED STRUCTURED ATTRIBUTES */}
      <div className="persona-right-content">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Section 1: Demographics & Seniority */}
          <div>
            <div className="persona-section-header">
              <span className="square-bullet"></span>
              <span>Demographics & Seniority</span>
            </div>
            <div className="space-y-2 text-sm pl-4 border-l border-slate-200">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Estimated Seniority:</span>
                <span className="font-bold text-slate-900 bg-slate-100 px-2.5 py-0.5 rounded text-xs">
                  {persona?.seniority_level || 'Senior / Lead'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Total Experience:</span>
                <span className="font-bold text-slate-900">{totalYearsExp} Years</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Primary Profession:</span>
                <span className="font-bold text-blue-700">{persona?.primary_profession || 'Backend Engineer'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Current Location:</span>
                <span className="font-semibold text-slate-800 flex items-center gap-1">
                  <MapPin size={13} className="text-red-500" />
                  {locationStr}
                </span>
              </div>
            </div>
          </div>

          {/* Section 2: Goals & Target Roles */}
          <div>
            <div className="persona-section-header">
              <span className="square-bullet square-bullet-blue"></span>
              <span>Career Goals & Target Roles</span>
            </div>
            <div className="pl-4 border-l border-slate-200">
              <p className="text-xs text-slate-500 mb-2.5">
                Optimal role matches inferred from confirmed experience:
              </p>
              <div className="flex flex-wrap gap-2">
                {persona?.suggested_roles && persona.suggested_roles.length > 0 ? (
                  persona.suggested_roles.map((role, idx) => (
                    <span
                      key={idx}
                      className="text-xs font-semibold px-3 py-1 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center gap-1"
                    >
                      <Briefcase size={12} className="text-indigo-500" />
                      {role}
                    </span>
                  ))
                ) : (
                  <>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded bg-indigo-50 text-indigo-700 border border-indigo-100">
                      Backend Engineer
                    </span>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded bg-indigo-50 text-indigo-700 border border-indigo-100">
                      AI Systems Engineer
                    </span>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded bg-indigo-50 text-indigo-700 border border-indigo-100">
                      Software Architect
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Core Competencies */}
        <div className="mt-8 pt-6 border-t border-slate-100">
          <div className="persona-section-header">
            <span className="square-bullet square-bullet-green"></span>
            <span>Core Technical Stack</span>
          </div>
          <div className="flex flex-wrap gap-2 mb-6">
            {persona?.top_skills && persona.top_skills.length > 0 ? (
              persona.top_skills.map((skill, idx) => (
                <span key={idx} className="skill-badge">
                  <Award size={13} className="text-blue-500" />
                  <span>{skill}</span>
                </span>
              ))
            ) : (
              ['Python', 'FastAPI', 'PostgreSQL', 'Docker', 'React', 'Redis'].map((s, i) => (
                <span key={i} className="skill-badge">
                  <span>{s}</span>
                </span>
              ))
            )}
          </div>
        </div>

        {/* Section 4: Visual Mastery Meters (Image 4 "Phone usage" inspiration) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-2">
          <div>
            <div className="flex-between text-xs font-semibold text-slate-700 mb-1">
              <span>Backend & APIs</span>
              <span className="text-red-600 font-bold">95%</span>
            </div>
            <div className="meter-track">
              <div className="meter-fill" style={{ width: '95%' }}></div>
            </div>
          </div>

          <div>
            <div className="flex-between text-xs font-semibold text-slate-700 mb-1">
              <span>Database Architecture</span>
              <span className="text-blue-600 font-bold">90%</span>
            </div>
            <div className="meter-track">
              <div className="meter-fill meter-fill-blue" style={{ width: '90%' }}></div>
            </div>
          </div>

          <div>
            <div className="flex-between text-xs font-semibold text-slate-700 mb-1">
              <span>AI & Agents</span>
              <span className="text-emerald-600 font-bold">85%</span>
            </div>
            <div className="meter-track">
              <div className="meter-fill" style={{ width: '85%', background: 'linear-gradient(90deg, #10b981, #34d399)' }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
