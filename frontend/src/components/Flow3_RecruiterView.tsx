import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import type { CandidateSearchResult, RecruiterCandidateDetail } from '../types';
import { CandidatePersonaModal } from './CandidatePersonaModal';
import {
  Search,
  MapPin,
  ChevronDown,
  Loader2,
  Building2,
  CheckCircle2,
  Calendar,
  Phone,
  AtSign,
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
    <div className="min-h-[calc(100vh-65px)] bg-[#FAF7F2] px-4 py-8 font-sans text-[#141413] antialiased sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">

        {/* ── TOP HEADER & ORGANIZATION PORTAL LINK ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-7">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EAE5DE] text-[#635B53] text-xs font-semibold uppercase tracking-wider mb-2">
              <Building2 className="w-3.5 h-3.5 text-[#141413]" /> Recruiter Workspace
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#141413]">
              Talent Sourcing & Candidates
            </h1>
            <p className="mt-1 text-sm text-[#736B63]">
              Search verified engineering talent with rich photographic dossier cards.
            </p>
          </div>

          {onGoToOrganization && (
            <button
              type="button"
              onClick={onGoToOrganization}
              className="self-start sm:self-center flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#0B0C10] hover:bg-black active:scale-98 text-xs font-bold text-white shadow-sm transition cursor-pointer shrink-0"
            >
              <Building2 className="w-4 h-4 text-white" />
              <span>Company Pipeline</span>
              {recruitedCount > 0 && (
                <span className="ml-1.5 px-2 py-0.5 rounded-full bg-white/20 text-white text-[11px] font-bold">
                  {recruitedCount}
                </span>
              )}
            </button>
          )}
        </div>

        {/* ── SEARCH BAR ── */}
        <form onSubmit={handleSearchSubmit} className="mb-8">
          <div className="flex items-center gap-3 rounded-full border border-[#E8E2D9] bg-white p-1.5 pl-4 shadow-sm transition focus-within:border-[#141413]/30">
            <Search className="w-4 h-4 text-[#8C827A] shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by skill (FastAPI, PyTorch, React), name, or role..."
              className="w-full bg-transparent text-xs sm:text-sm text-[#141413] placeholder:text-[#A69E95] focus:outline-none font-medium"
            />
            <button
              type="submit"
              disabled={loading}
              className="flex h-10 shrink-0 items-center gap-2 rounded-full bg-[#0B0C10] px-6 text-xs font-bold text-white transition hover:bg-black disabled:opacity-60 active:scale-98 cursor-pointer shadow-xs"
            >
              {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>Search</span>
            </button>
          </div>
        </form>

        {/* ── 2-COLUMN LAYOUT (Filters Sidebar + Image 1 Candidate Cards Grid) ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* ── LEFT SIDEBAR: FILTERS ── */}
          <div className="space-y-6 rounded-[24px] border border-[#E8E2D9] bg-white p-6 shadow-sm lg:col-span-3">
            <div className="flex items-center justify-between border-b border-[#E8E2D9] pb-3">
              <h3 className="font-bold text-xs uppercase tracking-wider text-[#141413]">Filters</h3>
              <span className="text-[11px] text-[#8C827A] font-semibold">{activeFilterCount} active</span>
            </div>

            {/* Radius Slider */}
            <div>
              <div className="flex items-center justify-between text-xs font-semibold text-[#524B43] mb-2">
                <span>Location Radius</span>
                <span className="text-[#141413] font-bold">{radiusKm} km</span>
              </div>
              <input
                type="range"
                min="5"
                max="250"
                step="5"
                value={radiusKm}
                onChange={(e) => setRadiusKm(parseInt(e.target.value))}
                className="w-full accent-[#141413] cursor-pointer"
              />
            </div>

            {/* Role Category */}
            <div>
              <label className="block text-xs font-semibold text-[#524B43] mb-2">
                Role Domain
              </label>
              <div className="relative">
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="w-full bg-white border border-[#E8E2D9] rounded-xl px-3.5 py-2 text-xs text-[#141413] font-medium appearance-none focus:outline-none focus:border-[#141413] transition cursor-pointer pr-9 shadow-2xs"
                >
                  <option value="All roles">All roles</option>
                  <option value="Software Engineer">Software Engineer</option>
                  <option value="Product Designer">Product Designer</option>
                  <option value="Data Scientist">Data Scientist</option>
                  <option value="AI Engineer">AI Engineer</option>
                  <option value="Cloud Architect">Cloud Architect</option>
                  <option value="DevOps Lead">DevOps Lead</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-[#8C827A] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Minimum Experience */}
            <div>
              <label className="block text-xs font-semibold text-[#524B43] mb-2">
                Minimum Experience
              </label>
              <div className="relative">
                <select
                  value={minExp}
                  onChange={(e) => setMinExp(parseInt(e.target.value))}
                  className="w-full bg-white border border-[#E8E2D9] rounded-xl px-3.5 py-2 text-xs text-[#141413] font-medium appearance-none focus:outline-none focus:border-[#141413] transition cursor-pointer pr-9 shadow-2xs"
                >
                  <option value={0}>Any Experience</option>
                  <option value={2}>2+ years</option>
                  <option value={5}>5+ years</option>
                  <option value={8}>8+ years</option>
                  <option value={12}>12+ years</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-[#8C827A] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Reset Filters Button */}
            {activeFilterCount > 0 && (
              <button
                type="button"
                onClick={() => {
                  setRadiusKm(100);
                  setSelectedRole('All roles');
                  setMinExp(0);
                  setSearchQuery('');
                }}
                className="text-xs text-[#8C827A] hover:text-[#141413] font-semibold transition cursor-pointer pt-1 block underline"
              >
                Reset all filters
              </button>
            )}
          </div>

          {/* ── RIGHT MAIN: CANDIDATE PORTRAIT CARDS (IMAGE 1 EXACT MATCH) ── */}
          <div className="lg:col-span-9 space-y-4">
            <div className="flex items-center justify-between px-1">
              <h3 className="font-bold text-sm text-[#141413]">
                Candidates ({totalCount})
              </h3>
              {loading && (
                <span className="text-xs text-[#8C827A] flex items-center gap-1.5 font-medium">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-[#141413]" /> Matching profiles...
                </span>
              )}
            </div>

            {/* Empty State */}
            {candidates.length === 0 && !loading && (
              <div className="rounded-[28px] border border-[#E8E2D9] bg-white p-16 text-center shadow-sm">
                <p className="text-sm text-[#736B63] font-medium">
                  No candidate dossiers found matching your current filter criteria.
                </p>
              </div>
            )}

            {/* ── 3-COLUMN RECRUITER FINDING CARDS (MATCHES IMAGE 1) ── */}
            {candidates.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {candidates.map((c) => {
                  const isRecruited = recruitedIds.has(c.candidate_id);
                  const isFemale = c.gender?.toLowerCase() === 'female';
                  const isMale = c.gender?.toLowerCase() === 'male';
                  const hasPhoto = Boolean(c.avatar_url);

                  // ── CARD VARIANT A: FULL PORTRAIT IMAGE CARD (e.g. Jessica Patrick, David Kim) ──
                  if (hasPhoto) {
                    return (
                      <div
                        key={c.candidate_id}
                        onClick={() => handleOpenCandidateDetail(c.candidate_id)}
                        className="group relative aspect-[3/4] rounded-[28px] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer bg-neutral-900 border border-[#E8E2D9] flex flex-col justify-end p-5 select-none"
                      >
                        {/* Background Portrait Photo */}
                        <img
                          src={c.avatar_url}
                          alt={c.display_name}
                          className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                        />

                        {/* Top-Right Gender Badge (Frosted glass) */}
                        <div className="absolute top-4 right-4 w-7 h-7 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white text-sm font-semibold shadow-xs">
                          {isFemale ? '♀' : isMale ? '♂' : '•'}
                        </div>

                        {/* Bottom Dark Vignette Gradient */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none" />

                        {/* Card Foreground Content */}
                        <div className="relative z-10 text-white">
                          <h4 className="text-lg font-bold tracking-tight text-white leading-tight mb-2">
                            {c.display_name}
                          </h4>

                          <div className="space-y-1 text-xs text-white/90 font-medium mb-3.5">
                            {c.date_of_birth && (
                              <div className="flex items-center gap-2">
                                <Calendar className="w-3.5 h-3.5 text-white/80 shrink-0" />
                                <span>{c.date_of_birth}</span>
                              </div>
                            )}

                            {c.phone && (
                              <div className="flex items-center gap-2">
                                <Phone className="w-3.5 h-3.5 text-white/80 shrink-0" />
                                <span>{c.phone}</span>
                              </div>
                            )}

                            {c.email && (
                              <div className="flex items-center gap-2">
                                <AtSign className="w-3.5 h-3.5 text-white/80 shrink-0" />
                                <span className="truncate">{c.email}</span>
                              </div>
                            )}

                            <div className="flex items-center gap-2">
                              <MapPin className="w-3.5 h-3.5 text-white/80 shrink-0" />
                              <span className="truncate">
                                {c.city ? `${c.city}, ${c.country || 'CA'}` : 'San Jose, CA'}
                              </span>
                            </div>
                          </div>

                          {/* Solid Image 4 Pill Button ("Get in touch") */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRecruitCandidate(c.candidate_id);
                            }}
                            className={`w-full py-2.5 px-4 rounded-full text-xs font-bold transition flex items-center justify-center gap-2 shadow-sm active:scale-98 cursor-pointer ${
                              isRecruited
                                ? 'bg-emerald-600 text-white'
                                : 'bg-[#0B0C10] hover:bg-black text-white'
                            }`}
                          >
                            {isRecruited ? (
                              <>
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-200" /> In Pipeline
                              </>
                            ) : (
                              <>Get in touch</>
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  }

                  // ── CARD VARIANT B: CLEAN WARM IVORY CARD FALLBACK (MATCHES SARAH LOPEZ IN IMAGE 1) ──
                  return (
                    <div
                      key={c.candidate_id}
                      onClick={() => handleOpenCandidateDetail(c.candidate_id)}
                      className="group relative aspect-[3/4] rounded-[28px] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer bg-[#F5EFE6] border border-[#E8E2D9] flex flex-col justify-between p-6 select-none"
                    >
                      {/* Top Header: Name & Gender Badge */}
                      <div className="flex items-start justify-between">
                        <h4 className="text-lg font-bold tracking-tight text-[#141413] leading-tight">
                          {c.display_name}
                        </h4>
                        <div className="w-7 h-7 rounded-full bg-[#EAE5DE] border border-[#D9D1C7] flex items-center justify-center text-[#141413] text-sm font-semibold shadow-2xs">
                          {isFemale ? '♀' : isMale ? '♂' : '•'}
                        </div>
                      </div>

                      {/* Middle Space (Warm Ivory Canvas) */}
                      <div className="flex-1" />

                      {/* Bottom Info Block */}
                      <div>
                        <div className="space-y-1.5 text-xs text-[#524B43] font-medium mb-4">
                          {c.date_of_birth && (
                            <div className="flex items-center gap-2">
                              <Calendar className="w-3.5 h-3.5 text-[#736B63] shrink-0" />
                              <span>{c.date_of_birth}</span>
                            </div>
                          )}

                          {c.phone && (
                            <div className="flex items-center gap-2">
                              <Phone className="w-3.5 h-3.5 text-[#736B63] shrink-0" />
                              <span>{c.phone}</span>
                            </div>
                          )}

                          {c.email && (
                            <div className="flex items-center gap-2">
                              <AtSign className="w-3.5 h-3.5 text-[#736B63] shrink-0" />
                              <span className="truncate">{c.email}</span>
                            </div>
                          )}

                          <div className="flex items-center gap-2">
                            <MapPin className="w-3.5 h-3.5 text-[#736B63] shrink-0" />
                            <span className="truncate">
                              {c.city ? `${c.city}, ${c.country || 'CA'}` : '721 Blossom Hill Rd, San Jose, CA'}
                            </span>
                          </div>
                        </div>

                        {/* Solid Image 4 Pill Button ("Get in touch") */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRecruitCandidate(c.candidate_id);
                          }}
                          className={`w-full py-2.5 px-4 rounded-full text-xs font-bold transition flex items-center justify-center gap-2 shadow-sm active:scale-98 cursor-pointer ${
                            isRecruited
                              ? 'bg-emerald-600 text-white'
                              : 'bg-[#0B0C10] hover:bg-black text-white'
                          }`}
                        >
                          {isRecruited ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-200" /> In Pipeline
                            </>
                          ) : (
                            <>Get in touch</>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

      </div>

      {/* ── CANDIDATE PERSONA / DOSSIER MODAL ── */}
      {selectedCandidate && (
        <CandidatePersonaModal
          isOpen={Boolean(selectedCandidate)}
          onClose={() => setSelectedCandidate(null)}
          candidate={{
            id: selectedCandidate.candidate_id,
            full_name: selectedCandidate.display_name,
            headline: selectedCandidate.headline,
            bio: selectedCandidate.bio,
            total_years_experience: selectedCandidate.total_years_experience,
            city: selectedCandidate.city,
            country: selectedCandidate.country,
            skills: selectedCandidate.skills?.map((s) => s.name) || [],
            education: selectedCandidate.education?.map((e) => ({
              institution: e.institution,
              degree: e.degree,
              field: e.field,
            })) || [],
            experiences: selectedCandidate.experiences?.map((e) => ({
              company: e.company,
              title: e.title,
              description: e.description,
            })) || [],
            persona: selectedCandidate.persona,
          }}
          isSelf={false}
          onRecruit={() => handleRecruitCandidate(selectedCandidate.candidate_id)}
          isRecruited={recruitedIds.has(selectedCandidate.candidate_id)}
        />
      )}

      {detailLoading && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 shadow-2xl flex items-center gap-3 border border-[#E8E2D9]">
            <Loader2 className="w-5 h-5 animate-spin text-[#141413]" />
            <span className="text-xs font-semibold text-[#141413]">Loading verified dossier...</span>
          </div>
        </div>
      )}
    </div>
  );
};
