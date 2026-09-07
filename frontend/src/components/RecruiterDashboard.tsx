import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import type { CandidateSearchResult, RecruiterCandidateDetail } from '../types';
import {
  Search,
  Sparkles,
  MapPin,
  Briefcase,
  Award,
  CheckCircle2,
  X,
  User,
  Sliders,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Bookmark,
  RefreshCw,
  GraduationCap,
} from 'lucide-react';

interface RecruiterDashboardProps {
  onOpenAuth: () => void;
}

export const RecruiterDashboard: React.FC<RecruiterDashboardProps> = ({ onOpenAuth }) => {
  // Natural Language Search State (Image 3 Inspiration)
  const [nlQuery, setNlQuery] = useState<string>('');
  const [isNlSearching, setIsNlSearching] = useState<boolean>(false);
  const [parsedNlCriteria, setParsedNlCriteria] = useState<any | null>(null);

  // Accordion Expand/Collapse States (Image 2 Inspiration)
  const [openAccordions, setOpenAccordions] = useState<Record<string, boolean>>({
    roles: true,
    skills: true,
    experience: true,
    education: false,
    location: true,
  });

  const toggleAccordion = (key: string) => {
    setOpenAccordions((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Deterministic Filters
  const [role, setRole] = useState<string>('');
  const [skillsInput, setSkillsInput] = useState<string>('Python, FastAPI');
  const [minExp, setMinExp] = useState<number>(3);
  const [maxExp, setMaxExp] = useState<number | undefined>(undefined);
  const [degreeLevel, setDegreeLevel] = useState<string>('');
  const [city, setCity] = useState<string>('Colombo');
  const [latitude, setLatitude] = useState<number | undefined>(6.9271);
  const [longitude, setLongitude] = useState<number | undefined>(79.8612);
  const [radiusKm, setRadiusKm] = useState<number | undefined>(30);
  const [availability, setAvailability] = useState<string>('');

  // Results State
  const [results, setResults] = useState<CandidateSearchResult[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Detail Modal State
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(null);
  const [candidateDetail, setCandidateDetail] = useState<RecruiterCandidateDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState<boolean>(false);

  // Saved Candidates List
  const [savedCandidates, setSavedCandidates] = useState<string[]>([]);

  const toggleSaveCandidate = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (savedCandidates.includes(id)) {
      setSavedCandidates(savedCandidates.filter((c) => c !== id));
    } else {
      setSavedCandidates([...savedCandidates, id]);
    }
  };

  const executeSearch = async (overrideCriteria?: any) => {
    setLoading(true);
    setError(null);
    try {
      const skillsArray = skillsInput
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      const criteria = overrideCriteria || {
        required_skills: skillsArray,
        roles: role ? [role] : undefined,
        minimum_experience_years: minExp > 0 ? minExp : undefined,
        maximum_experience_years: maxExp ? maxExp : undefined,
        degree_level: degreeLevel || undefined,
        city: city || undefined,
        latitude: latitude ? Number(latitude) : undefined,
        longitude: longitude ? Number(longitude) : undefined,
        radius_km: radiusKm ? Number(radiusKm) : undefined,
        availability_status: availability || undefined,
        page: 1,
        page_size: 20,
      };

      const res = await api.searchCandidates(criteria);
      setResults(res.items);
      setTotal(res.total);
    } catch (err: any) {
      if (err.message && err.message.includes('401')) {
        setError('Please sign in with a recruiter or admin account to discover candidates.');
      } else {
        setError(err.message || 'Search failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleNlSearchSubmit = async (e?: React.FormEvent, customQuery?: string) => {
    if (e) e.preventDefault();
    const queryToUse = customQuery || nlQuery;
    if (!queryToUse.trim()) return;

    setIsNlSearching(true);
    setError(null);
    try {
      const res = await api.naturalLanguageSearch(queryToUse.trim());
      setResults(res.items);
      setTotal(res.total);
      setParsedNlCriteria(res.parsed_criteria);

      // Populate filters from parsed criteria if available
      if (res.parsed_criteria) {
        if (res.parsed_criteria.required_skills?.length) {
          setSkillsInput(res.parsed_criteria.required_skills.join(', '));
        }
        if (res.parsed_criteria.minimum_experience_years) {
          setMinExp(res.parsed_criteria.minimum_experience_years);
        }
        if (res.parsed_criteria.city) {
          setCity(res.parsed_criteria.city);
        }
      }
    } catch (err: any) {
      setError(err.message || 'AI query parsing failed');
    } finally {
      setIsNlSearching(false);
    }
  };

  const handleSelectCandidate = async (candidateId: string) => {
    setSelectedCandidateId(candidateId);
    setLoadingDetail(true);
    try {
      const detail = await api.getCandidateDetail(candidateId);
      setCandidateDetail(detail);
    } catch (err: any) {
      alert(err.message || 'Failed to load candidate details');
      setSelectedCandidateId(null);
    } finally {
      setLoadingDetail(false);
    }
  };

  useEffect(() => {
    executeSearch();
  }, []);

  const querySuggestions = [
    'Python backend developers in Colombo',
    'FastAPI engineers with 3+ years experience',
    'Lead Software Architect within 30 km',
    'Full Stack React and Node.js engineers',
  ];

  return (
    <div className="space-y-8 pb-20">
      {/* 1. FLOATING GLASS SEARCH BAR (Image 3 Inspiration) */}
      <div className="glass-search-container">
        <form onSubmit={(e) => handleNlSearchSubmit(e)} className="glass-search-bar">
          <Search size={20} className="text-slate-400 shrink-0" />
          <input
            type="text"
            value={nlQuery}
            onChange={(e) => setNlQuery(e.target.value)}
            placeholder="What would you like to find today? (AI search e.g. Python dev in Colombo)"
            className="glass-search-input"
          />
          <div className="flex items-center gap-2">
            <span className="kbd-badge">⌘ + K</span>
            <button
              type="submit"
              disabled={isNlSearching}
              className="neu-btn neu-btn-primary !py-2 !px-4 text-xs font-bold rounded-full"
            >
              <Sparkles size={13} />
              <span>{isNlSearching ? 'Parsing...' : 'Find'}</span>
            </button>
          </div>
        </form>

        {/* Quick Suggestion Chips (Image 3 Inspiration) */}
        <div className="flex flex-wrap items-center justify-center gap-2 mt-3">
          <span className="text-[11px] font-bold text-slate-400 uppercase mr-1">Suggestions:</span>
          {querySuggestions.map((queryText, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setNlQuery(queryText);
                handleNlSearchSubmit(undefined, queryText);
              }}
              className="suggestion-chip"
            >
              <span>{queryText}</span>
              <span className="text-blue-500 font-bold">↗</span>
            </button>
          ))}
        </div>
      </div>

      {/* Parsed AI Criteria Notification */}
      {parsedNlCriteria && (
        <div className="p-3.5 rounded-xl bg-blue-50/90 border border-blue-200 text-xs flex-between">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-blue-600 shrink-0" />
            <span className="font-bold text-blue-900">AI Parsed Filter:</span>
            <span className="font-mono text-blue-700">{JSON.stringify(parsedNlCriteria)}</span>
          </div>
          <button onClick={() => setParsedNlCriteria(null)} className="text-slate-400 hover:text-slate-700">
            <X size={14} />
          </button>
        </div>
      )}

      {/* 2. SPEAKER DIRECTORY LAYOUT: Left Accordion Filters + Right Candidate List (Image 2 Inspiration) */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* LEFT COLUMN: Accordion Filters */}
        <div className="lg:col-span-1 space-y-4">
          <div className="elevated-card p-5">
            <div className="flex-between mb-3 pb-3 border-b border-slate-100">
              <span className="text-sm font-bold text-slate-900 font-heading">Filters</span>
              <button
                onClick={() => {
                  setRole('');
                  setSkillsInput('');
                  setMinExp(0);
                  setMaxExp(undefined);
                  setCity('');
                  setLatitude(undefined);
                  setLongitude(undefined);
                  setRadiusKm(undefined);
                  setAvailability('');
                  executeSearch({});
                }}
                className="text-xs font-semibold text-blue-600 hover:underline"
              >
                Reset all
              </button>
            </div>

            {/* Accordion 1: Target Role */}
            <div>
              <div className="accordion-header" onClick={() => toggleAccordion('roles')}>
                <span className="flex items-center gap-2">
                  <Briefcase size={15} className="text-blue-600" />
                  <span>Role & Focus</span>
                </span>
                {openAccordions.roles ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </div>
              {openAccordions.roles && (
                <div className="py-3">
                  <input
                    type="text"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    placeholder="e.g. Backend Engineer"
                    className="neu-input text-xs"
                  />
                </div>
              )}
            </div>

            {/* Accordion 2: Required Skills */}
            <div>
              <div className="accordion-header" onClick={() => toggleAccordion('skills')}>
                <span className="flex items-center gap-2">
                  <Sparkles size={15} className="text-blue-600" />
                  <span>Required Skills</span>
                </span>
                {openAccordions.skills ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </div>
              {openAccordions.skills && (
                <div className="py-3">
                  <input
                    type="text"
                    value={skillsInput}
                    onChange={(e) => setSkillsInput(e.target.value)}
                    placeholder="Python, FastAPI, Docker"
                    className="neu-input text-xs"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Comma separated list of required skills</p>
                </div>
              )}
            </div>

            {/* Accordion 3: Experience Range */}
            <div>
              <div className="accordion-header" onClick={() => toggleAccordion('experience')}>
                <span className="flex items-center gap-2">
                  <Sliders size={15} className="text-blue-600" />
                  <span>Experience (Years)</span>
                </span>
                {openAccordions.experience ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </div>
              {openAccordions.experience && (
                <div className="py-3 grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] text-slate-500 mb-0.5">Min Years</label>
                    <input
                      type="number"
                      min="0"
                      max="30"
                      value={minExp}
                      onChange={(e) => setMinExp(Number(e.target.value))}
                      className="neu-input text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 mb-0.5">Max Years</label>
                    <input
                      type="number"
                      min="0"
                      max="30"
                      value={maxExp ?? ''}
                      onChange={(e) => setMaxExp(e.target.value ? Number(e.target.value) : undefined)}
                      placeholder="Any"
                      className="neu-input text-xs"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Accordion: Education & Degree */}
            <div>
              <div className="accordion-header" onClick={() => toggleAccordion('education')}>
                <span className="flex items-center gap-2">
                  <GraduationCap size={15} className="text-blue-600" />
                  <span>Education Level</span>
                </span>
                {openAccordions.education ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </div>
              {openAccordions.education && (
                <div className="py-3">
                  <select
                    value={degreeLevel}
                    onChange={(e) => setDegreeLevel(e.target.value)}
                    className="neu-input text-xs"
                  >
                    <option value="">Any Degree Level</option>
                    <option value="bachelor">Bachelor's Degree</option>
                    <option value="master">Master's Degree</option>
                    <option value="doctorate">Doctorate (PhD)</option>
                  </select>
                </div>
              )}
            </div>

            {/* Accordion 4: PostGIS Geographic Proximity */}
            <div>
              <div className="accordion-header" onClick={() => toggleAccordion('location')}>
                <span className="flex items-center gap-2">
                  <MapPin size={15} className="text-red-500" />
                  <span>Location & PostGIS</span>
                </span>
                {openAccordions.location ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </div>
              {openAccordions.location && (
                <div className="py-3 space-y-3">
                  <div>
                    <label className="block text-[10px] text-slate-500 mb-0.5">City</label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="Colombo"
                      className="neu-input text-xs"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      step="any"
                      value={latitude ?? ''}
                      onChange={(e) => setLatitude(Number(e.target.value))}
                      placeholder="Lat (6.92)"
                      className="neu-input text-xs"
                    />
                    <input
                      type="number"
                      step="any"
                      value={longitude ?? ''}
                      onChange={(e) => setLongitude(Number(e.target.value))}
                      placeholder="Lon (79.86)"
                      className="neu-input text-xs"
                    />
                  </div>
                  <div>
                    <div className="flex-between text-[11px] text-slate-600 mb-1">
                      <span>Proximity Radius:</span>
                      <strong className="text-blue-700">{radiusKm || 'Off'} km</strong>
                    </div>
                    <input
                      type="range"
                      min="5"
                      max="150"
                      step="5"
                      value={radiusKm || 30}
                      onChange={(e) => setRadiusKm(Number(e.target.value))}
                      className="w-full accent-blue-600 cursor-pointer"
                    />
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => executeSearch()}
              disabled={loading}
              className="w-full neu-btn neu-btn-primary !py-2.5 mt-3 text-xs font-bold"
            >
              <Search size={14} />
              <span>{loading ? 'Querying...' : 'Apply Filters'}</span>
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN: Candidate Directory Results (Image 2 Inspiration) */}
        <div className="lg:col-span-3 space-y-4">
          <div className="flex-between text-xs text-slate-600 px-1 mb-2">
            <span className="font-bold text-sm text-slate-900">
              All candidates ({total})
            </span>
            <span className="text-[11px] text-slate-400">
              Transparent multi-criteria scoring (0–100 scale)
            </span>
          </div>

          {error ? (
            <div className="elevated-card p-8 text-center">
              <p className="text-sm text-red-600 mb-4">{error}</p>
              <button onClick={onOpenAuth} className="neu-btn neu-btn-primary mx-auto text-xs">
                Sign In As Recruiter
              </button>
            </div>
          ) : loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="elevated-card p-6 animate-pulse space-y-3">
                  <div className="h-5 bg-slate-200 rounded w-1/3"></div>
                  <div className="h-4 bg-slate-100 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          ) : results.length === 0 ? (
            <div className="elevated-card p-12 text-center">
              <User size={40} className="text-slate-300 mx-auto mb-2" />
              <h3 className="text-base font-bold text-slate-800">No Candidates Found</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                No candidates satisfied all hard criteria. Try broadening skill requirements or expanding the radius.
              </p>
            </div>
          ) : (
            <div>
              {results.map((c) => {
                const isHighMatch = c.match_score >= 80;
                const isSaved = savedCandidates.includes(c.candidate_id);
                const initials = c.display_name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .slice(0, 2)
                  .toUpperCase();

                return (
                  <div
                    key={c.candidate_id}
                    onClick={() => handleSelectCandidate(c.candidate_id)}
                    className="candidate-row-card group"
                  >
                    {/* Left Avatar & Candidate Details */}
                    <div className="flex items-start gap-4 flex-1">
                      <div className="candidate-avatar">
                        {initials}
                      </div>

                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                            {c.display_name}
                          </h3>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                            {c.total_years_experience >= 5 ? 'Senior Engineer' : 'Mid-Level'}
                          </span>
                        </div>

                        <p className="text-xs text-slate-600 font-medium">
                          {c.headline || 'Software Engineering Professional'}
                        </p>

                        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 pt-1">
                          <span>{c.total_years_experience} Years Exp</span>
                          <span>&bull;</span>
                          {c.city && <span>{c.city}, {c.country}</span>}
                          {c.distance_km != null && (
                            <>
                              <span>&bull;</span>
                              <span className="font-semibold text-blue-600">
                                📍 {Number(c.distance_km).toFixed(1)} km away
                              </span>
                            </>
                          )}
                        </div>

                        {/* Top Skill Badges */}
                        <div className="flex flex-wrap gap-1.5 pt-2">
                          {c.top_skills.map((skill, idx) => (
                            <span key={idx} className="skill-badge text-[11px]">
                              {skill}
                            </span>
                          ))}
                        </div>

                        {/* Transparent Match Reasons */}
                        {c.match_reasons && c.match_reasons.length > 0 && (
                          <div className="pt-2 flex flex-wrap items-center gap-x-3 text-[11px] text-slate-500">
                            <span className="font-bold text-slate-700">Matched:</span>
                            {c.match_reasons.map((r, idx) => (
                              <span key={idx} className="flex items-center gap-1 text-emerald-700 font-medium">
                                <CheckCircle2 size={11} className="text-emerald-500" />
                                {r}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right Column: Score Badge & Actions */}
                    <div className="flex flex-col items-end gap-3 shrink-0 self-center sm:self-start">
                      <div className={`score-badge ${isHighMatch ? 'score-high' : 'score-mid'}`}>
                        <Award size={14} />
                        <span>{c.match_score}% Match</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={(e) => toggleSaveCandidate(c.candidate_id, e)}
                          className={`neu-btn !py-1.5 !px-3 text-xs rounded-lg border ${
                            isSaved ? 'bg-amber-50 text-amber-700 border-amber-300' : 'neu-btn-secondary'
                          }`}
                        >
                          <Bookmark size={13} className={isSaved ? 'fill-amber-500 text-amber-500' : ''} />
                          <span>{isSaved ? 'Saved' : 'Save'}</span>
                        </button>

                        <button
                          type="button"
                          className="neu-btn neu-btn-primary !py-1.5 !px-3 text-xs rounded-lg"
                        >
                          <span>Dossier</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Recruiter-Safe Candidate Dossier Modal */}
      {selectedCandidateId && (
        <div className="modal-backdrop" onClick={() => setSelectedCandidateId(null)}>
          <div className="modal-dialog p-6 sm:p-8" onClick={(e) => e.stopPropagation()}>
            {loadingDetail ? (
              <div className="text-center py-12">
                <RefreshCw size={24} className="animate-spin text-blue-600 mx-auto mb-2" />
                <p className="text-xs text-slate-500">Loading candidate dossier...</p>
              </div>
            ) : candidateDetail ? (
              <div className="space-y-6">
                <div className="flex-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      Recruiter-Safe Dossier
                    </span>
                    <h2 className="text-xl font-bold text-slate-900 font-heading mt-1">
                      {candidateDetail.display_name}
                    </h2>
                    <p className="text-xs text-slate-500 font-medium">{candidateDetail.headline}</p>
                  </div>
                  <button
                    onClick={() => setSelectedCandidateId(null)}
                    className="w-8 h-8 rounded-full flex-center text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                  >
                    <X size={18} />
                  </button>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-center gap-2">
                  <ShieldCheck size={16} className="text-emerald-600 shrink-0" />
                  <span>
                    Direct contact credentials are protected by candidate privacy settings until mutual interview unlock.
                  </span>
                </div>

                {/* Persona Summary if available */}
                {candidateDetail.persona && (
                  <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-200">
                    <h4 className="text-xs font-bold text-blue-900 font-heading mb-1 flex items-center gap-1.5">
                      <Sparkles size={14} className="text-blue-600" />
                      Candidate Persona Overview
                    </h4>
                    <p className="text-xs text-slate-700 italic leading-relaxed">
                      "{candidateDetail.persona.summary}"
                    </p>
                  </div>
                )}

                {/* Skills */}
                <div>
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Verified Skills
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {candidateDetail.skills.map((sk, idx) => (
                      <span key={idx} className="skill-badge text-xs font-medium">
                        {sk.name} {sk.years ? `(${sk.years}y)` : ''}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Experience */}
                <div>
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Career History
                  </h4>
                  <div className="space-y-3">
                    {candidateDetail.experiences.map((exp, idx) => (
                      <div key={idx} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                        <div className="flex-between font-bold text-slate-800">
                          <span>{exp.title}</span>
                          <span className="text-[10px] text-blue-600">{exp.role}</span>
                        </div>
                        <p className="text-slate-600 font-medium mt-0.5">{exp.company}</p>
                        {exp.description && (
                          <p className="text-slate-500 mt-2 text-[11px] leading-relaxed">
                            {exp.description}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
};
