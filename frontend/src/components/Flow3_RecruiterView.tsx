import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import type { CandidateSearchResult, RecruiterCandidateDetail } from '../types';
import { CandidatePersonaModal } from './CandidatePersonaModal';
import {
  Search,
  MapPin,
  Briefcase,
  ChevronDown,
  Loader2,
  ExternalLink,
  Building2,
  UserCheck,
  CheckCircle2,
} from 'lucide-react';

interface Flow3Props {
  onGoToOrganization?: () => void;
}

export const Flow3_RecruiterView: React.FC<Flow3Props> = ({ onGoToOrganization }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [radiusKm, setRadiusKm] = useState(100);
  const [selectedRole, setSelectedRole] = useState('All roles');
  const [minExp, setMinExp] = useState(0);

  const [candidates, setCandidates] = useState<CandidateSearchResult[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [activeFilterCount, setActiveFilterCount] = useState(0);

  // Recruited tracking state
  const [recruitedIds, setRecruitedIds] = useState<Set<string>>(new Set());
  const [recruitedCount, setRecruitedCount] = useState(0);

  // Selected candidate detail modal
  const [selectedCandidate, setSelectedCandidate] = useState<RecruiterCandidateDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const fetchRecruitedInfo = async () => {
    try {
      const data = await api.getRecruitedCandidates();
      const ids = new Set<string>((data.items || []).map((r: any) => r.candidate_id));
      setRecruitedIds(ids);
      setRecruitedCount(data.total || data.items?.length || 0);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    fetchRecruitedInfo();
  }, []);

  const handleRecruitCandidate = async (candidateId: string) => {
    try {
      await api.recruitCandidate({ candidate_id: candidateId });
      setRecruitedIds((prev) => new Set([...prev, candidateId]));
      setRecruitedCount((prev) => prev + 1);
    } catch (e) {
      console.error(e);
    }
  };


  // Calculate active filter count
  useEffect(() => {
    let count = 0;
    if (radiusKm !== 100) count++;
    if (selectedRole !== 'All roles') count++;
    if (minExp > 0) count++;
    setActiveFilterCount(count);
  }, [radiusKm, selectedRole, minExp]);

  // Execute Search
  const executeSearch = async () => {
    setLoading(true);
    try {
      await api.ensureRecruiterAuth();
      const criteria: any = {
        radius_km: radiusKm,
        min_experience: minExp > 0 ? minExp : undefined,
      };

      if (selectedRole !== 'All roles') {
        criteria.role = selectedRole;
      }

      if (searchQuery.trim()) {
        criteria.natural_language_query = searchQuery.trim();
        criteria.skills = [searchQuery.trim()];
      }

      const res = await api.searchCandidates(criteria);
      setCandidates(res.items || []);
      setTotalCount(res.total || res.items?.length || 0);
    } catch {
      setCandidates([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  };

  // Trigger search when filters change
  useEffect(() => {
    executeSearch();
  }, [radiusKm, selectedRole, minExp]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeSearch();
  };

  const handleOpenCandidateDetail = async (candidateId: string) => {
    setDetailLoading(true);
    try {
      const detail = await api.getCandidateDetail(candidateId);
      setSelectedCandidate(detail);
    } catch (e) {
      console.error(e);
    } finally {
      setDetailLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-65px)] bg-[#f5f7f4] px-4 py-9 font-sans text-[#171917] antialiased sm:px-6 lg:px-8 lg:py-12">
      <div className="mx-auto max-w-6xl">

        {/* ── TOP SEARCH BAR & ORGANIZATION PORTAL LINK ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-7">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#738075]">Talent search</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-[-0.045em] text-[#151815] sm:text-[40px]">Find the right person.</h1>
            <p className="mt-2 text-sm text-black/55">Search verified candidate profiles by role, skill, experience, or location.</p>
          </div>

          {onGoToOrganization && (
            <button
              type="button"
              onClick={onGoToOrganization}
              className="self-start sm:self-center flex items-center gap-2 px-5 py-2.5 rounded-full border border-black/15 bg-white hover:bg-black/[0.04] text-xs font-semibold text-gray-900 shadow-xs transition cursor-pointer shrink-0"
            >
              <Building2 className="w-4 h-4 text-black" />
              <span>Organization Portal</span>
              {recruitedCount > 0 && (
                <span className="ml-1 px-2 py-0.5 rounded-full bg-black text-white text-[10px] font-bold">
                  {recruitedCount}
                </span>
              )}
            </button>
          )}
        </div>
        <form onSubmit={handleSearchSubmit} className="mb-8">
          <div className="flex items-center gap-3 rounded-[18px] border border-black/[0.08] bg-white p-2 shadow-[0_12px_35px_-28px_rgba(24,35,25,0.4)] transition focus-within:border-black/20">
            <Search className="w-5 h-5 text-gray-400 ml-2.5 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by keyword, skill or role..."
              className="w-full bg-transparent text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none"
            />
            <button
              type="submit"
              disabled={loading}
              className="flex h-11 shrink-0 items-center gap-2 rounded-[13px] bg-[#111311] px-7 text-sm font-semibold text-white transition hover:bg-[#262a26] disabled:opacity-60"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>Search</span>
            </button>
          </div>
        </form>

        {/* ── 2-COLUMN LAYOUT (Filters + Candidate List) ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* ── LEFT SIDEBAR: FILTERS (Matches Screenshot 3 Exactly) ── */}
          <div className="space-y-6 rounded-[22px] border border-black/[0.07] bg-white p-6 shadow-[0_12px_35px_-28px_rgba(24,35,25,0.4)] lg:col-span-4">
            
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <h3 className="font-bold text-sm text-gray-900">Filters</h3>
              <span className="text-xs text-gray-400 font-medium">{activeFilterCount} selected</span>
            </div>

            {/* Filter 1: Radius Slider */}
            <div>
              <div className="flex items-center justify-between text-xs font-semibold text-gray-600 mb-2">
                <span>Radius</span>
                <span className="text-gray-900 font-bold">{radiusKm} km</span>
              </div>
              <input
                type="range"
                min="5"
                max="250"
                step="5"
                value={radiusKm}
                onChange={(e) => setRadiusKm(parseInt(e.target.value))}
                className="w-full accent-black cursor-pointer"
              />
            </div>

            {/* Filter 2: Role category dropdown */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-2">
                Role category
              </label>
              <div className="relative">
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="w-full bg-white border border-black/10 rounded-xl px-4 py-2.5 text-xs text-gray-800 font-medium appearance-none focus:outline-none focus:border-black transition cursor-pointer pr-10"
                >
                  <option value="All roles">All roles</option>
                  <option value="Software Engineer">Software Engineer</option>
                  <option value="Product Designer">Product Designer</option>
                  <option value="Data Scientist">Data Scientist</option>
                  <option value="AI Engineer">AI Engineer</option>
                  <option value="Frontend Developer">Frontend Developer</option>
                  <option value="Backend Developer">Backend Developer</option>
                </select>
                <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Filter 3: Minimum experience dropdown */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-2">
                Minimum experience
              </label>
              <div className="relative">
                <select
                  value={minExp}
                  onChange={(e) => setMinExp(parseInt(e.target.value))}
                  className="w-full bg-white border border-black/10 rounded-xl px-4 py-2.5 text-xs text-gray-800 font-medium appearance-none focus:outline-none focus:border-black transition cursor-pointer pr-10"
                >
                  <option value={0}>0+ years</option>
                  <option value={2}>2+ years</option>
                  <option value={4}>4+ years</option>
                  <option value={6}>6+ years</option>
                  <option value={8}>8+ years</option>
                </select>
                <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Reset Filters */}
            {activeFilterCount > 0 && (
              <button
                type="button"
                onClick={() => {
                  setRadiusKm(100);
                  setSelectedRole('All roles');
                  setMinExp(0);
                  setSearchQuery('');
                }}
                className="text-xs text-gray-500 hover:text-black font-semibold transition cursor-pointer pt-2 block"
              >
                Reset all filters
              </button>
            )}

          </div>

          {/* ── RIGHT COLUMN: CANDIDATES LIST / EMPTY STATE (Matches Screenshot 3) ── */}
          <div className="lg:col-span-8 space-y-4">
            
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-gray-900">
                All candidates ({totalCount})
              </h3>
              {loading && (
                <span className="text-xs text-gray-400 flex items-center gap-1">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> Searching...
                </span>
              )}
            </div>

            {/* If No Candidates: Exact Match to Screenshot 3 */}
            {candidates.length === 0 && !loading && (
              <div className="rounded-[22px] border border-black/[0.07] bg-white p-16 text-center shadow-[0_12px_35px_-28px_rgba(24,35,25,0.4)]">
                <p className="text-sm text-gray-400 font-medium">
                  No candidates match your filters.
                </p>
              </div>
            )}

            {/* If Candidates Exist: Apple-Grade Candidate Cards */}
            {candidates.length > 0 && (
              <div className="bg-white rounded-2xl border border-black/10 divide-y divide-gray-100 shadow-xs overflow-hidden">
                {candidates.map((c) => {
                  const initials = (c.display_name || 'C')
                    .split(' ')
                    .map((s) => s[0])
                    .slice(0, 2)
                    .join('');

                  return (
                    <div
                      key={c.candidate_id}
                      onClick={() => handleOpenCandidateDetail(c.candidate_id)}
                      className="p-5 sm:p-6 hover:bg-black/[0.02] transition cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-full bg-gray-100 border border-black/10 flex items-center justify-center font-bold text-sm text-gray-800 shrink-0 shadow-2xs">
                          {initials}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-base text-gray-900 hover:underline">
                              {c.display_name}
                            </h4>
                            <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">
                              {c.availability_status || 'Open to Work'}
                            </span>
                          </div>
                          <p className="text-xs text-gray-600 font-medium mt-0.5">
                            {c.headline || 'High-Caliber Professional'}
                          </p>

                          <div className="flex items-center gap-4 text-xs text-gray-400 mt-2">
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5" />
                              {c.city ? `${c.city}, ${c.country}` : 'Remote'}
                            </span>
                            <span className="flex items-center gap-1">
                              <Briefcase className="w-3.5 h-3.5" />
                              {c.total_years_experience ?? 0}+ yrs exp
                            </span>
                            {c.distance_km !== undefined && (
                              <span className="text-gray-500 font-medium">
                                • {Math.round(c.distance_km)} km away
                              </span>
                            )}
                          </div>

                          {/* Skill Tags */}
                          {c.top_skills && c.top_skills.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mt-3">
                              {c.top_skills.slice(0, 5).map((s, sIdx) => (
                                <span
                                  key={sIdx}
                                  className="px-2 py-0.5 rounded-md bg-gray-100 text-[11px] font-medium text-gray-700 border border-gray-200"
                                >
                                  {s}
                                </span>
                              ))}
                              {c.top_skills.length > 5 && (
                                <span className="text-[11px] text-gray-400 self-center">
                                  +{c.top_skills.length - 5} more
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="shrink-0 flex items-center gap-2.5 justify-end">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRecruitCandidate(c.candidate_id);
                          }}
                          disabled={recruitedIds.has(c.candidate_id)}
                          className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                            recruitedIds.has(c.candidate_id)
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-default'
                              : 'bg-black hover:bg-gray-800 text-white shadow-xs'
                          }`}
                        >
                          {recruitedIds.has(c.candidate_id) ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Recruited</span>
                            </>
                          ) : (
                            <>
                              <UserCheck className="w-3.5 h-3.5" />
                              <span>Recruit</span>
                            </>
                          )}
                        </button>

                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-gray-900 group-hover:text-black">
                          <span>View Persona</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

          </div>

        </div>

      </div>

      {/* ── IMAGE 3 MULTI-CARD PERSONA BOARD MODAL ── */}
      <CandidatePersonaModal
        isOpen={Boolean(selectedCandidate)}
        onClose={() => setSelectedCandidate(null)}
        candidate={selectedCandidate}
        isSelf={false}
        onRecruit={handleRecruitCandidate}
        isRecruited={Boolean(selectedCandidate && recruitedIds.has(selectedCandidate.candidate_id))}
      />

      {/* ── DETAIL LOADING OVERLAY ── */}
      {detailLoading && (
        <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-xs flex items-center justify-center">
          <div className="bg-white rounded-2xl p-5 shadow-xl flex items-center gap-3 border border-black/10">
            <Loader2 className="w-5 h-5 animate-spin text-black" />
            <span className="text-xs font-semibold text-gray-800">Loading Candidate Dossier...</span>
          </div>
        </div>
      )}

    </div>
  );
};
