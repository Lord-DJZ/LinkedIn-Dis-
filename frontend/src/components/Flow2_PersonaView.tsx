import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import type { CandidateProfile, CandidatePersona } from '../types';
import {
  ArrowUp,
  RefreshCw,
  MapPin,
  Briefcase,
  Sparkles,
  Award,
  Loader2,
  Calendar,
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

  // ── EMPTY STATE (Matching Screenshot 3 Exactly) ──
  const hasDossier = (profile && profile.full_name) || (persona && persona.headline);
  if (!hasDossier) {
    return (
      <div className="min-h-[calc(100vh-65px)] bg-[#f9fafb] flex flex-col items-center justify-center p-6 text-center font-sans antialiased">
        {/* Rounded Food/Avatar Placeholder Illustration */}
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

        {/* Heading */}
        <h2 className="text-2xl font-bold text-gray-900 tracking-tight mb-2">
          No dossier yet
        </h2>

        {/* Subtitle */}
        <p className="text-sm text-gray-500 max-w-sm mx-auto mb-6 leading-relaxed">
          Build your profile manually and we'll generate your candidate persona automatically.
        </p>

        {/* Action Button */}
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

  // ── DOSSIER VIEW (Aesthetic Light Card matching Dullnit design) ──
  const name = profile?.full_name || 'Candidate Persona';
  const headline = persona?.headline || profile?.headline || 'Specialist Professional';
  const location = profile?.location
    ? `${profile.location.city || ''}, ${profile.location.country || ''}`.replace(/^, |, $/g, '')
    : 'Available Worldwide';
  const totalExp = profile?.total_years_experience !== undefined ? `${profile.total_years_experience} Years Exp` : 'Experience verified';
  const seniority = persona?.seniority_level || 'Professional';
  const topSkills = persona?.top_skills || profile?.skills?.map((s: any) => s.normalized_name || s.original_name) || [];
  const summary = persona?.summary || profile?.bio || 'No executive summary provided yet.';

  return (
    <div className="min-h-[calc(100vh-65px)] bg-[#f9fafb] py-10 px-4 sm:px-6 lg:px-8 font-sans antialiased text-gray-900">
      <div className="max-w-4xl mx-auto">
        
        {/* Dossier Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
              AI CANDIDATE DOSSIER
            </div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight mt-1">
              {name}
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {headline}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              disabled={isRegenerating}
              onClick={handleRegenerate}
              className="inline-flex items-center gap-2 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 text-xs font-semibold px-4 py-2 rounded-xl shadow-xs transition cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRegenerating ? 'animate-spin' : ''}`} />
              <span>Regenerate with Gemini</span>
            </button>
            <button
              type="button"
              onClick={onGoToUpload}
              className="inline-flex items-center gap-2 bg-black hover:bg-gray-800 text-white text-xs font-semibold px-4 py-2 rounded-xl shadow-xs transition cursor-pointer"
            >
              <span>Edit Profile</span>
            </button>
          </div>
        </div>

        {/* Identity & Seniority Card */}
        <div className="bg-white rounded-2xl border border-gray-200/80 p-6 sm:p-8 shadow-xs mb-6">
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <span className="inline-flex items-center gap-1.5 bg-black text-white text-xs font-semibold px-3 py-1.5 rounded-full">
              <Award className="w-3.5 h-3.5 text-amber-400" />
              <span>{seniority}</span>
            </span>
            <span className="inline-flex items-center gap-1.5 bg-gray-100 text-gray-700 text-xs font-medium px-3 py-1.5 rounded-full">
              <MapPin className="w-3.5 h-3.5 text-gray-400" />
              <span>{location}</span>
            </span>
            <span className="inline-flex items-center gap-1.5 bg-gray-100 text-gray-700 text-xs font-medium px-3 py-1.5 rounded-full">
              <Briefcase className="w-3.5 h-3.5 text-gray-400" />
              <span>{totalExp}</span>
            </span>
          </div>

          {/* AI Executive Summary */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>Executive Synthesis</span>
            </h3>
            <p className="text-sm text-gray-700 leading-relaxed font-normal bg-gray-50/70 p-4 rounded-xl border border-gray-100">
              {summary}
            </p>
          </div>
        </div>

        {/* Core Stack & Skill Badges */}
        <div className="bg-white rounded-2xl border border-gray-200/80 p-6 sm:p-8 shadow-xs mb-6">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-4">
            Core Technical Skills & Stack
          </h3>
          <div className="flex flex-wrap gap-2">
            {topSkills.map((skill: string) => (
              <span
                key={skill}
                className="bg-gray-100 border border-gray-200 text-gray-800 text-xs font-medium px-3.5 py-1.5 rounded-full"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>

        {/* Work Experience Timeline */}
        {profile?.experiences && profile.experiences.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-200/80 p-6 sm:p-8 shadow-xs mb-6">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-4">
              Career Trajectory
            </h3>
            <div className="space-y-4">
              {profile.experiences.map((exp: any, i: number) => (
                <div key={i} className="border-l-2 border-gray-200 pl-4 py-1">
                  <div className="flex items-center justify-between text-sm font-semibold text-gray-900">
                    <span>{exp.job_title}</span>
                    <span className="text-xs font-normal text-gray-400 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {exp.start_date || 'Past'} — {exp.end_date || (exp.is_current ? 'Present' : 'Completed')}
                    </span>
                  </div>
                  <div className="text-xs font-medium text-gray-500 mt-0.5">{exp.company_name}</div>
                  {exp.description && (
                    <p className="text-xs text-gray-600 mt-2 leading-relaxed">{exp.description}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
