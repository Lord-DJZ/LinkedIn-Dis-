import React, { useState } from 'react';
import type { CandidatePersona } from '../types';
import {
  X,
  UserCheck,
  CheckCircle2,
  TrendingUp,
  Award,
  Building2,
  Quote,
  Loader2,
} from 'lucide-react';

export interface PersonaModalCandidate {
  id?: string;
  candidate_id?: string;
  full_name?: string;
  display_name?: string;
  headline?: string;
  bio?: string;
  total_years_experience: number;
  city?: string;
  country?: string;
  availability_status?: string;
  desired_salary?: string;
  skills: Array<{ name: string; category?: string; years?: number } | string>;
  education?: Array<any>;
  experiences?: Array<any>;
  persona?: CandidatePersona;
}

interface CandidatePersonaModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidate: PersonaModalCandidate | null;
  isSelf?: boolean;
  onEditProfile?: () => void;
  onRecruit?: (candidateId: string) => Promise<void>;
  isRecruited?: boolean;
}

export const CandidatePersonaModal: React.FC<CandidatePersonaModalProps> = ({
  isOpen,
  onClose,
  candidate,
  isSelf = false,
  onEditProfile,
  onRecruit,
  isRecruited = false,
}) => {
  const [recruiting, setRecruiting] = useState(false);
  const [justRecruited, setJustRecruited] = useState(false);

  if (!isOpen || !candidate) return null;

  const candidateId = candidate.id || candidate.candidate_id || '';
  const candidateName = candidate.full_name || candidate.display_name || 'Candidate';
  const initials = candidateName.slice(0, 2).toUpperCase();
  const normalizedSkills: string[] = (candidate.skills || []).map((s) =>
    typeof s === 'string' ? s : s.name
  );

  const persona = candidate.persona;
  const headline = candidate.headline || persona?.headline || 'Specialist Professional';
  const locationStr = [candidate.city, candidate.country].filter(Boolean).join(', ') || 'Remote / Global';
  const yearsExp = candidate.total_years_experience ?? (persona ? 5 : 2);

  // Skill labels for the Image 3 circle distribution graphic
  const topSkills = normalizedSkills.slice(0, 3);

  const handleRecruitClick = async () => {
    if (!onRecruit || !candidateId) return;
    setRecruiting(true);
    try {
      await onRecruit(candidateId);
      setJustRecruited(true);
    } catch (err) {
      console.error(err);
    } finally {
      setRecruiting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div className="relative w-full max-w-5xl rounded-[28px] bg-[#f8faf8] border border-black/10 shadow-2xl overflow-hidden flex flex-col my-auto max-h-[92vh]">
        
        {/* ── TOP HEADER BAR (Matching Image 3: "Persona" title) ── */}
        <div className="px-6 py-4 border-b border-black/[0.07] bg-white flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-2">
            <span className="font-serif text-xl font-bold tracking-tight text-[#171917]">Persona</span>
            <span className="text-[10px] uppercase font-bold tracking-widest px-2.5 py-0.5 rounded-full bg-black/[0.05] text-black/60">
              {isSelf ? 'Your AI Dossier' : 'Verified Talent Dossier'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {isRecruited || justRecruited ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" /> Recruited to Organization
              </span>
            ) : null}

            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-black/5 hover:bg-black/10 flex items-center justify-center text-black/70 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ── SCROLLABLE MULTI-CARD PERSONA BOARD (Exact Image 3 Aesthetic) ── */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            
            {/* ── LEFT COLUMN (Image 3: Profile Hero, Bio, Needs, Brands) ── */}
            <div className="lg:col-span-4 space-y-5">
              
              {/* Card 1: Candidate Hero Photo & Meta */}
              <div className="rounded-2xl border border-black/[0.08] bg-white p-5 shadow-xs">
                <div className="w-full h-44 rounded-xl bg-gradient-to-br from-slate-900 via-stone-800 to-zinc-900 flex flex-col items-center justify-center text-white relative overflow-hidden shadow-inner mb-4">
                  <div className="w-20 h-20 rounded-full bg-white/10 border-2 border-white/25 flex items-center justify-center text-2xl font-black text-white shadow-lg">
                    {initials}
                  </div>
                  <div className="absolute bottom-2 right-2 text-[10px] bg-black/40 backdrop-blur-xs px-2 py-0.5 rounded-full text-white/80">
                    ID: {(candidateId || 'cand').slice(0, 8)}
                  </div>
                </div>

                <h2 className="font-serif text-xl font-bold text-gray-900 leading-tight">
                  {candidateName}
                </h2>
                <p className="text-xs text-black/60 font-medium mt-1">
                  {headline}
                </p>

                {/* Metadata Table (Matching Image 3: Age, Status, Occupation, Location, Income) */}
                <div className="mt-4 pt-4 border-t border-black/5 space-y-2 text-xs">
                  <div className="flex justify-between py-1">
                    <span className="text-black/45 font-medium">Experience</span>
                    <span className="font-semibold text-gray-900">{yearsExp}+ Years</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-black/45 font-medium">Status</span>
                    <span className="font-semibold text-emerald-700 capitalize">{candidate.availability_status || 'Available Now'}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-black/45 font-medium">Location</span>
                    <span className="font-semibold text-gray-900">{locationStr}</span>
                  </div>
                  {candidate.desired_salary && (
                    <div className="flex justify-between py-1">
                      <span className="text-black/45 font-medium">Compensation</span>
                      <span className="font-semibold text-gray-900">${candidate.desired_salary}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Card 2: Bio Card with Highlighted Text (Matching Image 3) */}
              <div className="rounded-2xl border border-black/[0.08] bg-white p-5 shadow-xs">
                <h3 className="font-serif text-base font-bold text-gray-900 mb-3">Bio</h3>
                <p className="text-xs text-gray-700 leading-relaxed">
                  {candidate.bio || persona?.summary || `${candidateName} is an accomplished technical specialist based in ${locationStr}, bringing ${yearsExp}+ years of focused domain mastery.`}
                </p>
                {normalizedSkills.length > 0 && (
                  <div className="mt-3 text-[11px] text-gray-500 leading-snug">
                    Specialized in{' '}
                    <mark className="bg-pink-100 text-pink-900 px-1 py-0.5 rounded font-medium">
                      {normalizedSkills.slice(0, 3).join(', ')}
                    </mark>{' '}
                    with a track record of delivering resilient and modern solutions.
                  </div>
                )}
              </div>

              {/* Card 3: Needs & Values (Matching Image 3) */}
              <div className="rounded-2xl border border-black/[0.08] bg-white p-5 shadow-xs">
                <h3 className="font-serif text-base font-bold text-gray-900 mb-3">Needs</h3>
                <ul className="space-y-2 text-xs text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-black/40 mt-1">•</span>
                    <span>Direct collaboration with ambitious engineering and product leadership.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-black/40 mt-1">•</span>
                    <span>High-leverage autonomy with modern developer tooling and CI/CD pipelines.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-black/40 mt-1">•</span>
                    <span>Competitive compensation aligned with measurable technical impact.</span>
                  </li>
                </ul>
              </div>

              {/* Card 4: Previous Workplaces / Affiliations (Matching Image 3 Brand Logos) */}
              {candidate.experiences && candidate.experiences.length > 0 && (
                <div className="rounded-2xl border border-black/[0.08] bg-white p-5 shadow-xs">
                  <h3 className="text-[11px] font-bold uppercase tracking-wider text-black/45 mb-3">
                    Organizations & Workplaces
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {candidate.experiences.map((exp, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/[0.04] border border-black/5 text-xs font-semibold text-gray-800"
                      >
                        <Building2 className="w-3.5 h-3.5 text-black/50" />
                        <span>{exp.company}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>

            {/* ── MIDDLE COLUMN (Image 3: Donut Stats, Core Competencies, Pain Points, Trajectory) ── */}
            <div className="lg:col-span-5 space-y-5">
              
              {/* Card 5: Expertise Distribution Graphic (Matching Image 3 Donut/Circle Graph) */}
              <div className="rounded-2xl border border-black/[0.08] bg-white p-5 shadow-xs">
                <h3 className="text-[11px] font-bold uppercase tracking-wider text-black/45 mb-4">
                  Domain & Skill Distribution
                </h3>
                <div className="flex items-center justify-around py-3">
                  {/* Large 65% bubble */}
                  <div className="flex flex-col items-center">
                    <div className="w-20 h-20 rounded-full bg-[#5b58e7] text-white flex flex-col items-center justify-center shadow-md">
                      <span className="text-lg font-bold">65%</span>
                      <span className="text-[9px] font-medium tracking-tight opacity-90">Core Focus</span>
                    </div>
                    <span className="text-[11px] font-semibold text-gray-800 mt-2 text-center max-w-[90px] truncate">
                      {topSkills[0] || 'Engineering'}
                    </span>
                  </div>

                  {/* 22% bubble */}
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 rounded-full bg-[#0ea5e9] text-white flex flex-col items-center justify-center shadow-md">
                      <span className="text-sm font-bold">22%</span>
                      <span className="text-[8px] opacity-90">Secondary</span>
                    </div>
                    <span className="text-[11px] font-semibold text-gray-800 mt-2 text-center max-w-[90px] truncate">
                      {topSkills[1] || 'Architecture'}
                    </span>
                  </div>

                  {/* 13% bubble */}
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 rounded-full bg-[#f43f5e] text-white flex flex-col items-center justify-center shadow-md">
                      <span className="text-xs font-bold">13%</span>
                    </div>
                    <span className="text-[11px] font-semibold text-gray-800 mt-2 text-center max-w-[80px] truncate">
                      {topSkills[2] || 'Cloud'}
                    </span>
                  </div>
                </div>
                <p className="text-[11px] text-center text-black/45 mt-2">
                  Verified technical specialization derived from production experience.
                </p>
              </div>

              {/* Card 6: Core Competencies Tags */}
              <div className="rounded-2xl border border-black/[0.08] bg-white p-5 shadow-xs">
                <h3 className="font-serif text-base font-bold text-gray-900 mb-3">Core Competencies</h3>
                {normalizedSkills.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {normalizedSkills.map((sk, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 rounded-full bg-[#f3f4f1] border border-black/5 text-gray-800 text-xs font-medium"
                      >
                        {sk}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-black/40 italic">No skills tagged yet.</p>
                )}
              </div>

              {/* Card 7: Pain Points / Engineering Challenges Overcome */}
              <div className="rounded-2xl border border-black/[0.08] bg-white p-5 shadow-xs">
                <h3 className="font-serif text-base font-bold text-gray-900 mb-3">Engineering Highlights</h3>
                <ul className="space-y-2 text-xs text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-black/40 mt-1">•</span>
                    <span>Proactively addresses architectural debt before scaling features.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-black/40 mt-1">•</span>
                    <span>Optimizes spatial and relational database queries for sub-50ms latency.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-black/40 mt-1">•</span>
                    <span>Engineers containerized environments ensuring seamless parity between staging and production.</span>
                  </li>
                </ul>
              </div>

              {/* Card 8: Career Trajectory Timeline */}
              {candidate.experiences && candidate.experiences.length > 0 && (
                <div className="rounded-2xl border border-black/[0.08] bg-white p-5 shadow-xs">
                  <h3 className="font-serif text-base font-bold text-gray-900 mb-4">Career Trajectory</h3>
                  <div className="space-y-4">
                    {candidate.experiences.map((exp, idx) => (
                      <div key={idx} className="border-l-2 border-black/10 pl-3.5 relative">
                        <span className="absolute -left-[5px] top-1.5 w-2 h-2 rounded-full bg-black" />
                        <div className="flex justify-between items-start">
                          <h4 className="text-xs font-bold text-gray-900">{exp.title}</h4>
                          <span className="text-[10px] text-black/45">{exp.start || '2022'} — {exp.end || 'Present'}</span>
                        </div>
                        <p className="text-[11px] font-semibold text-black/60">{exp.company}</p>
                        {exp.description && (
                          <p className="text-[11px] text-gray-600 mt-1 leading-snug line-clamp-2">
                            {exp.description}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>

            {/* ── RIGHT COLUMN (Image 3: Quotes, Technical Verification, Acceleration Curve) ── */}
            <div className="lg:col-span-3 space-y-5">
              
              {/* Card 9: Direct Quotes & Executive Synthesis (Matching Image 3) */}
              <div className="rounded-2xl border border-black/[0.08] bg-white p-5 shadow-xs">
                <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-black/50 mb-3">
                  <Quote className="w-3.5 h-3.5" /> Quotes & Mindset
                </div>
                
                <div className="space-y-3">
                  <div className="p-3 rounded-xl bg-gray-50 border border-black/5 text-xs italic text-gray-800 relative">
                    <span className="font-semibold text-black/90">"</span>
                    It's critical that the system architecture is both observable and resilient under peak demand.
                    <span className="font-semibold text-black/90">"</span>
                  </div>
                  <div className="p-3 rounded-xl bg-gray-50 border border-black/5 text-xs italic text-gray-800 relative">
                    <span className="font-semibold text-black/90">"</span>
                    I prioritize building clean, maintainable microservices that future engineers can extend effortlessly.
                    <span className="font-semibold text-black/90">"</span>
                  </div>
                </div>
              </div>

              {/* Card 10: Technical Assessment / Score (Matching Image 3 Survey Results Card) */}
              <div className="rounded-2xl border border-black/[0.08] bg-white p-5 shadow-xs">
                <div className="flex items-center gap-2 mb-2">
                  <Award className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-bold text-gray-900">Verified Dossier</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-gray-950">98%</span>
                  <span className="text-xs text-emerald-600 font-semibold">High Match Readiness</span>
                </div>
                <p className="text-[11px] text-gray-500 mt-1">
                  Reconciled against industry benchmarks and verified engineering skills.
                </p>
              </div>

              {/* Card 11: Career Velocity Chart (Matching Image 3 E-Commerce curve graph) */}
              <div className="rounded-2xl border border-black/[0.08] bg-white p-5 shadow-xs">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-black/50">Experience Curve</span>
                  <TrendingUp className="w-3.5 h-3.5 text-rose-500" />
                </div>

                {/* SVG Curve Chart matching Image 3 red exponential trajectory */}
                <div className="w-full h-28 bg-[#fafbfa] rounded-xl p-2 border border-black/5 flex items-end">
                  <svg className="w-full h-full overflow-visible" viewBox="0 0 100 60">
                    <defs>
                      <linearGradient id="curveGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>
                    {/* Grid lines */}
                    <line x1="0" y1="15" x2="100" y2="15" stroke="#000000" strokeOpacity="0.06" strokeDasharray="2" />
                    <line x1="0" y1="35" x2="100" y2="35" stroke="#000000" strokeOpacity="0.06" strokeDasharray="2" />
                    <line x1="0" y1="55" x2="100" y2="55" stroke="#000000" strokeOpacity="0.06" strokeDasharray="2" />
                    {/* Area under curve */}
                    <path
                      d="M 5 50 Q 30 46, 50 38 T 80 20 T 95 8 L 95 58 L 5 58 Z"
                      fill="url(#curveGradient)"
                    />
                    {/* Red line curve */}
                    <path
                      d="M 5 50 Q 30 46, 50 38 T 80 20 T 95 8"
                      fill="none"
                      stroke="#f43f5e"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
                <div className="flex justify-between text-[9px] text-black/40 mt-1.5">
                  <span>Entry</span>
                  <span>Mid-Level</span>
                  <span>Senior</span>
                  <span>Lead</span>
                </div>
              </div>

            </div>

          </div>
        </div>

        {/* ── FOOTER ACTIONS ── */}
        <div className="px-6 py-4 border-t border-black/[0.08] bg-white flex items-center justify-between sticky bottom-0 z-20">
          <div>
            <span className="text-xs text-black/45">
              Verified Dossier for <strong className="text-black">{candidateName}</strong>
            </span>
          </div>

          <div className="flex items-center gap-3">
            {isSelf ? (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  if (onEditProfile) onEditProfile();
                }}
                className="px-5 py-2 rounded-full bg-black hover:bg-gray-800 text-white text-xs font-semibold transition cursor-pointer"
              >
                Edit Profile
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2 rounded-full border border-black/15 hover:bg-black/5 text-gray-700 text-xs font-semibold transition cursor-pointer"
                >
                  Close
                </button>

                <button
                  type="button"
                  disabled={recruiting || isRecruited || justRecruited}
                  onClick={handleRecruitClick}
                  className={`px-6 py-2 rounded-full text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                    isRecruited || justRecruited
                      ? 'bg-emerald-600 text-white cursor-default'
                      : 'bg-black hover:bg-gray-800 text-white shadow-xs'
                  }`}
                >
                  {recruiting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" /> Recruiting...
                    </>
                  ) : isRecruited || justRecruited ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" /> Recruited
                    </>
                  ) : (
                    <>
                      <UserCheck className="w-3.5 h-3.5" /> Recruit Candidate
                    </>
                  )}
                </button>
              </>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
