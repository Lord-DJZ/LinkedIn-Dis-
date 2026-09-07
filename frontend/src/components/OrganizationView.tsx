import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import type { Organization, RecruitedCandidate } from '../types';
import { CandidatePersonaModal } from './CandidatePersonaModal';
import {
  Building2,
  Users,
  Search,
  MapPin,
  Calendar,
  Trash2,
  ExternalLink,
  Edit3,
  Loader2,
} from 'lucide-react';

interface OrganizationViewProps {
  onGoToSearch: () => void;
}

export const OrganizationView: React.FC<OrganizationViewProps> = ({ onGoToSearch }) => {
  const [org, setOrg] = useState<Organization | null>(null);
  const [recruitedList, setRecruitedList] = useState<RecruitedCandidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCandidate, setSelectedCandidate] = useState<any | null>(null);
  const [isEditingOrg, setIsEditingOrg] = useState(false);

  // Edit organization form state
  const [orgName, setOrgName] = useState('');
  const [orgIndustry, setOrgIndustry] = useState('');
  const [orgDesc, setOrgDesc] = useState('');

  const loadOrgData = async () => {
    setLoading(true);
    try {
      const orgData = await api.getOrganization();
      setOrg(orgData);
      setOrgName(orgData.name || '');
      setOrgIndustry(orgData.industry || '');
      setOrgDesc(orgData.description || '');

      const recruitedData = await api.getRecruitedCandidates();
      setRecruitedList(recruitedData.items || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrgData();
  }, []);

  const handleUpdateOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const updated = await api.updateOrganization({
        name: orgName,
        industry: orgIndustry,
        description: orgDesc,
      });
      setOrg(updated);
      setIsEditingOrg(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleStatusChange = async (candidateId: string, newStatus: string) => {
    try {
      await api.updateRecruitmentStatus(candidateId, { status: newStatus });
      setRecruitedList((prev) =>
        prev.map((r) =>
          r.candidate_id === candidateId ? { ...r, status: newStatus } : r
        )
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleRemove = async (candidateId: string) => {
    if (!confirm('Are you sure you want to remove this candidate from your recruited roster?')) return;
    try {
      await api.removeRecruitedCandidate(candidateId);
      setRecruitedList((prev) => prev.filter((r) => r.candidate_id !== candidateId));
      if (org) {
        setOrg({ ...org, recruited_count: Math.max(0, (org.recruited_count || 1) - 1) });
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-[calc(100vh-65px)] bg-[rgb(176,55,5)] px-4 py-9 font-sans text-[#171917] antialiased sm:px-6 lg:px-8 lg:py-12">
      <div className="mx-auto w-full max-w-6xl">
        
        {/* ── ORGANIZATION HEADER ── */}
        <div className="mb-8 rounded-[24px] border border-black/[0.08] bg-white p-6 sm:p-8 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
            <div className="flex items-start sm:items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-black text-white flex items-center justify-center shadow-xs shrink-0">
                <Building2 className="w-7 h-7 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
                    {org?.name || 'My Organization'}
                  </h1>
                  <button
                    type="button"
                    onClick={() => setIsEditingOrg(!isEditingOrg)}
                    className="p-1 rounded-full text-black/40 hover:text-black hover:bg-black/5 transition cursor-pointer"
                    title="Edit Organization Details"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-xs text-black/55 mt-1 max-w-xl leading-relaxed">
                  {org?.description || 'Building high-performance teams with verified technical candidates.'}
                </p>
                <div className="flex items-center gap-4 text-xs font-semibold text-black/50 mt-2">
                  <span>Industry: <strong className="text-black">{org?.industry || 'Technology'}</strong></span>
                  <span>•</span>
                  <span>Team Size: <strong className="text-emerald-700">{recruitedList.length} Recruited</strong></span>
                </div>
              </div>
            </div>

            {/* Quick Action: Recruit People */}
            <button
              type="button"
              onClick={onGoToSearch}
              className="rounded-full bg-black hover:bg-gray-800 text-white px-6 py-2.5 text-xs font-semibold shadow-xs transition flex items-center gap-2 cursor-pointer shrink-0 self-start sm:self-center"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Recruit More Talent</span>
            </button>
          </div>

          {/* Edit Form Drawer / Toggle */}
          {isEditingOrg && (
            <form onSubmit={handleUpdateOrg} className="mt-6 pt-6 border-t border-black/5 space-y-4 max-w-xl animate-fadeIn">
              <h3 className="text-xs font-bold uppercase tracking-wider text-black/60">Edit Organization Profile</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-black/60 mb-1">Organization Name</label>
                  <input
                    type="text"
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    className="w-full bg-white border border-black/15 rounded-lg px-3 py-2 text-xs text-gray-900"
                    placeholder="e.g. Acme Tech Labs"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-black/60 mb-1">Industry</label>
                  <input
                    type="text"
                    value={orgIndustry}
                    onChange={(e) => setOrgIndustry(e.target.value)}
                    className="w-full bg-white border border-black/15 rounded-lg px-3 py-2 text-xs text-gray-900"
                    placeholder="e.g. AI & Cloud Software"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-black/60 mb-1">Mission / Description</label>
                <textarea
                  value={orgDesc}
                  onChange={(e) => setOrgDesc(e.target.value)}
                  rows={2}
                  className="w-full bg-white border border-black/15 rounded-lg px-3 py-2 text-xs text-gray-900"
                  placeholder="Describe your organization's mission and team culture..."
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="px-5 py-2 rounded-full bg-black text-white text-xs font-semibold hover:bg-gray-800 transition cursor-pointer"
                >
                  Save Details
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditingOrg(false)}
                  className="px-4 py-2 rounded-full border border-black/15 text-xs text-black/70 hover:bg-black/5 transition cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>

        {/* ── RECRUITED TALENT ROSTER ── */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-gray-900">
                Recruited People ({recruitedList.length})
              </h2>
              <p className="text-xs text-black/50 mt-0.5">
                Engineers, architects, and technical talent currently recruited to your organization.
              </p>
            </div>
          </div>

          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center text-center">
              <Loader2 className="w-8 h-8 animate-spin text-black mb-3" />
              <p className="text-xs text-black/50 font-medium">Loading organization roster...</p>
            </div>
          ) : recruitedList.length === 0 ? (
            /* Empty State (Clean real data - No fake cards!) */
            <div className="rounded-2xl border-2 border-dashed border-black/10 bg-white p-12 text-center">
              <div className="w-14 h-14 rounded-2xl bg-black/[0.04] text-black/50 flex items-center justify-center mx-auto mb-4">
                <Users className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-gray-900">No Candidates Recruited Yet</h3>
              <p className="text-xs text-black/50 mt-1 max-w-md mx-auto leading-relaxed">
                Your organization roster is empty. Go to Talent Search to explore real candidate profiles, review their AI Dossiers, and recruit them into your team.
              </p>
              <button
                type="button"
                onClick={onGoToSearch}
                className="mt-5 inline-flex items-center gap-2 rounded-full bg-black hover:bg-gray-800 text-white px-6 py-2.5 text-xs font-semibold shadow-xs transition cursor-pointer"
              >
                <Search className="w-3.5 h-3.5" />
                <span>Browse Candidates in Search</span>
              </button>
            </div>
          ) : (
            /* Recruited Candidates List */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recruitedList.map((item) => {
                const c = item.candidate;
                const initials = (c.full_name || 'C').slice(0, 2).toUpperCase();

                return (
                  <div
                    key={item.id}
                    className="rounded-2xl border border-black/[0.08] bg-white p-5 shadow-xs flex flex-col justify-between hover:border-black/[0.15] transition"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-full bg-black text-white flex items-center justify-center text-sm font-bold shadow-xs">
                            {initials}
                          </div>
                          <div>
                            <h3 className="text-sm font-bold text-gray-950 leading-tight">
                              {c.full_name}
                            </h3>
                            <p className="text-[11px] text-black/60 font-medium mt-0.5 line-clamp-1">
                              {item.recruited_role || c.headline || 'Technical Specialist'}
                            </p>
                          </div>
                        </div>

                        {/* Status Select */}
                        <select
                          value={item.status}
                          onChange={(e) => handleStatusChange(item.candidate_id, e.target.value)}
                          className="text-[11px] font-semibold bg-[#f4f6f3] border border-black/10 rounded-full px-2.5 py-1 text-gray-800 cursor-pointer focus:outline-none"
                        >
                          <option value="Recruited">Recruited / Hired</option>
                          <option value="Interviewing">Interviewing</option>
                          <option value="Shortlisted">Shortlisted</option>
                          <option value="Offer Extended">Offer Extended</option>
                        </select>
                      </div>

                      <div className="flex items-center gap-3 text-[11px] text-black/45 mb-4">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" /> {c.city ? `${c.city}, ${c.country}` : 'Remote'}
                        </span>
                        <span>•</span>
                        <span>{c.total_years_experience ?? 0}+ Yrs Exp</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" /> {new Date(item.recruited_at).toLocaleDateString()}
                        </span>
                      </div>

                      {/* Skill tags */}
                      {c.skills && c.skills.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-4">
                          {c.skills.slice(0, 4).map((sk: any, i: number) => (
                            <span
                              key={i}
                              className="px-2.5 py-0.5 rounded-full bg-black/[0.04] text-gray-700 text-[10px] font-medium"
                            >
                              {typeof sk === 'string' ? sk : sk.name}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="pt-3 border-t border-black/5 flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => setSelectedCandidate(c)}
                        className="text-xs font-semibold text-black hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>View Persona Board</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleRemove(item.candidate_id)}
                        className="text-red-500 hover:text-red-700 p-1.5 rounded-lg hover:bg-red-50 transition cursor-pointer"
                        title="Remove from Organization"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>

      {/* ── PERSONA BOARD MODAL (Image 3 Style) ── */}
      {selectedCandidate && (
        <CandidatePersonaModal
          isOpen={Boolean(selectedCandidate)}
          onClose={() => setSelectedCandidate(null)}
          candidate={selectedCandidate}
          isRecruited={true}
        />
      )}
    </div>
  );
};
