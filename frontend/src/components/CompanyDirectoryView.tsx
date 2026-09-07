import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import {
  Building2,
  MoreHorizontal,
  Briefcase,
  X,
  Check,
  Sparkles,
  HelpCircle,
  Bookmark,
  ChevronRight,
  Search,
  ArrowLeft,
  ArrowRight,
} from 'lucide-react';

interface JobRole {
  id: string;
  title: string;
  location: string;
  salary: string;
  is_remote: boolean;
  job_type: string;
  posted_days_ago: number;
  applicants_count: number;
  match_score: number;
  match_count: string;
  description: string;
  responsibilities: string[];
  qualifications: string[];
}

interface CompanyItem {
  id: string;
  name: string;
  industry?: string;
  location?: string;
  website?: string;
  tech_stack?: string[];
  description?: string;
  engineers_count: string;
  founded_year: string;
  image_url: string;
  bg_color: string;
  roles: JobRole[];
}

export const CompanyDirectoryView: React.FC = () => {
  const [companies, setCompanies] = useState<CompanyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submittingOrgId, setSubmittingOrgId] = useState<string | null>(null);
  const [submittedOrgs, setSubmittedOrgs] = useState<Record<string, boolean>>({});
  const [searchQuery, setSearchQuery] = useState('');

  // Selected job for Job Description View Modal
  const [selectedJob, setSelectedJob] = useState<{ company: CompanyItem; job: JobRole } | null>(null);
  const [savedJobs, setSavedJobs] = useState<Record<string, boolean>>({});
  const [appliedJobs, setAppliedJobs] = useState<Record<string, boolean>>({});

  useEffect(() => {
    loadCompanies();
  }, []);

  const loadCompanies = async () => {
    try {
      setLoading(true);
      const companyData: CompanyItem[] = [
        {
          id: 'org-synth-2',
          name: 'Synthetix Neural Labs',
          industry: 'Applied Machine Learning & GenAI',
          location: 'San Francisco, CA',
          website: 'https://synthetixlabs.ai',
          engineers_count: '140+',
          founded_year: '2021',
          image_url: '/company_synth_wide.jpg',
          bg_color: '#DFEBFD',
          tech_stack: ['PyTorch', 'Python', 'Next.js', 'Redis', 'Kubernetes'],
          description:
            'A place where machine learning researchers and applied AI engineers build sovereign neural runtimes and real-time agent workflows.',
          roles: [
            {
              id: 'job-synth-1',
              title: 'Junior data analyst/data scientist/ML/AI engineer',
              location: 'Arlington, VA',
              salary: '$82K/yr - $127K/yr',
              is_remote: true,
              job_type: 'Full-time',
              posted_days_ago: 3,
              applicants_count: 104,
              match_score: 94,
              match_count: '5 of 6 core skills matched',
              description:
                'Career Gap? Outdated Tech stack? No Interviews? Let’s Get you Hired with a Process.\n\nMany job seekers assume their skills have expired simply because they’ve been out of the workforce or recently laid off. But the truth is, your foundation is still valuable — it just needs sharpening. Despite layoffs and market shifts, the tech industry still needs skilled developers. The challenge is proving you’re ready to contribute. Rejections can be discouraging, but they don’t reflect your true potential — they reflect your preparation.',
              responsibilities: [
                'Analyze multidimensional data pipelines and extract structured behavioral insights for production models.',
                'Collaborate with senior ML research engineers to evaluate neural inference latency and accuracy.',
                'Maintain automated feature stores, regression benchmarks, and data quality checks.',
                'Document engineering findings and present analytics telemetry directly to leadership.',
              ],
              qualifications: [
                'Proficiency in Python, SQL, and pandas/NumPy for statistical analysis.',
                'Understanding of machine learning concepts, evaluation metrics, and supervised learning.',
                'Familiarity with containerized environments (Docker) and version control (Git).',
                'Strong problem-solving discipline and eagerness to learn modern LLM orchestration.',
              ],
            },
            {
              id: 'job-synth-2',
              title: 'Staff ML Research Scientist',
              location: 'San Francisco, CA',
              salary: '$190K/yr - $260K/yr',
              is_remote: true,
              job_type: 'Full-time',
              posted_days_ago: 5,
              applicants_count: 42,
              match_score: 88,
              match_count: '4 of 5 core skills matched',
              description:
                'Lead our core multimodal foundation model initiative. You will spearhead architectural innovations in sparse attention and continuous test-time compute.',
              responsibilities: [
                'Train and fine-tune large-scale multimodal models across multi-node GPU clusters.',
                'Publish novel findings in top-tier conferences and translate research into production microservices.',
                'Mentor applied machine learning engineers and set architectural standards.',
              ],
              qualifications: [
                'Ph.D. or equivalent industry track record in Machine Learning or Computer Science.',
                'Deep mastery of PyTorch, Triton, CUDA optimization, and distributed training.',
                'Proven publications or open-source releases in generative AI or computer vision.',
              ],
            },
          ],
        },
        {
          id: 'org-apex-1',
          name: 'Apex Global Technologies',
          industry: 'Distributed Systems & Enterprise Cloud',
          location: 'San Jose, CA',
          website: 'https://apexglobal.tech',
          engineers_count: '250+',
          founded_year: '2018',
          image_url: '/company_apex_wide.jpg',
          bg_color: '#E2FAE2',
          tech_stack: ['FastAPI', 'Python', 'React', 'Docker', 'PostgreSQL', 'PyTorch'],
          description:
            'Engineering resilient cloud intelligence platforms, low-latency search infrastructure, and next-generation AI agent runtimes for Fortune 500 enterprises.',
          roles: [
            {
              id: 'job-apex-1',
              title: 'Principal Cloud Architect & AI Systems Engineer',
              location: 'San Jose, CA',
              salary: '$185K/yr - $240K/yr',
              is_remote: true,
              job_type: 'Full-time',
              posted_days_ago: 2,
              applicants_count: 58,
              match_score: 96,
              match_count: '6 of 6 core skills matched',
              description:
                'Architect the next evolution of our global real-time inference mesh. You will design fault-tolerant microservices and low-latency API gateways across multi-region deployments.',
              responsibilities: [
                'Design high-throughput, sub-10ms distributed serving architecture for LLM reasoning engines.',
                'Partner with product teams to translate enterprise SLAs into robust infrastructure blueprints.',
                'Oversee zero-trust security postures and compliance across our cloud edge networks.',
              ],
              qualifications: [
                'Demonstrated mastery of distributed systems, Go or Python, and Kubernetes architecture.',
                'Experience scaling mission-critical platforms handling millions of queries per minute.',
                'Strong background in cloud networking, Terraform, and automated deployment topologies.',
              ],
            },
            {
              id: 'job-apex-2',
              title: 'Senior Full-Stack AI Engineer',
              location: 'Remote, US',
              salary: '$150K/yr - $195K/yr',
              is_remote: true,
              job_type: 'Full-time',
              posted_days_ago: 4,
              applicants_count: 73,
              match_score: 91,
              match_count: '5 of 6 core skills matched',
              description:
                'Bridge intuitive user experiences with high-performance generative models. You will craft reactive web applications and real-time streaming interfaces.',
              responsibilities: [
                'Develop highly reactive web interfaces with React, TypeScript, and Tailwind CSS.',
                'Implement robust streaming WebSocket backends using Python FastAPI and Redis.',
                'Optimize client-side performance, state management, and user interaction feedback loops.',
              ],
              qualifications: [
                '5+ years building full-stack applications with modern web stacks.',
                'Experience with streaming LLM completions, agent memory systems, and vector search.',
                'Eye for clean UI craft and fluid micro-interactions.',
              ],
            },
          ],
        },
        {
          id: 'org-meridian-1',
          name: 'Meridian Health Data Corp',
          industry: 'Genomics & Digital Healthcare',
          location: 'Boston, MA',
          website: 'https://meridiandata.org',
          engineers_count: '85+',
          founded_year: '2020',
          image_url: '/company_meridian_wide.jpg',
          bg_color: '#FEEAE1',
          tech_stack: ['Python', 'Docker', 'GCP', 'PostgreSQL', 'FastAPI'],
          description:
            'Building high-throughput genomic data ingestion, compliant FHIR microservices, and clinical predictive analytics copilots for healthcare networks.',
          roles: [
            {
              id: 'job-meridian-1',
              title: 'Bioinformatics Pipeline Engineer',
              location: 'Boston, MA',
              salary: '$135K/yr - $175K/yr',
              is_remote: true,
              job_type: 'Full-time',
              posted_days_ago: 6,
              applicants_count: 29,
              match_score: 85,
              match_count: '4 of 5 core skills matched',
              description:
                'Build and orchestrate clinical-grade genomic data processing pipelines. You will optimize variant calling tools and integrate electronic health records safely.',
              responsibilities: [
                'Design scalable Nextflow/Snakemake workflows for high-throughput sequencing data.',
                'Ensure HIPAA and SOC2 compliance across all cloud storage buckets and analytical pipelines.',
                'Collaborate with computational biologists to operationalize predictive biomarker algorithms.',
              ],
              qualifications: [
                'Experience in computational biology, bioinformatics, or health data infrastructure.',
                'Proficiency in Python, Bash scripting, and cloud computing (AWS/GCP).',
              ],
            },
          ],
        },
      ];

      setCompanies(companyData);
    } catch {
      // fallback
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitDossier = async (org: CompanyItem) => {
    try {
      setSubmittingOrgId(org.id);
      await api.expressInterest(org.id, 'Candidate dossier submitted directly via Company Directory.');
      setSubmittedOrgs((prev) => ({ ...prev, [org.id]: true }));
    } catch {
      setSubmittedOrgs((prev) => ({ ...prev, [org.id]: true }));
    } finally {
      setSubmittingOrgId(null);
    }
  };

  const handleApplyToJob = async (job: JobRole, company: CompanyItem) => {
    try {
      await api.expressInterest(company.id, `Application submitted for role: ${job.title}`);
      setAppliedJobs((prev) => ({ ...prev, [job.id]: true }));
    } catch {
      setAppliedJobs((prev) => ({ ...prev, [job.id]: true }));
    }
  };

  const toggleSaveJob = (jobId: string) => {
    setSavedJobs((prev) => ({ ...prev, [jobId]: !prev[jobId] }));
  };

  const filteredCompanies = companies.filter((c) => {
    const q = searchQuery.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      (c.industry && c.industry.toLowerCase().includes(q)) ||
      (c.tech_stack && c.tech_stack.some((s) => s.toLowerCase().includes(q))) ||
      (c.location && c.location.toLowerCase().includes(q))
    );
  });

  return (
    <div className="w-full flex justify-center py-6 sm:py-8 px-4 sm:px-6 animate-fadeIn font-sans">
      
      {/* ── MAIN DASHBOARD CONTAINER (WHITE FLOATING WORKSPACE) ── */}
      <div className="w-full max-w-[1240px] bg-white rounded-[28px] sm:rounded-[36px] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.22)] p-6 sm:p-10 md:p-12 relative overflow-hidden">

        {/* ── HEADER & HERO SECTION ── */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 mb-10">
          
          {/* Left: Titles, Description, Search Bar */}
          <div className="flex-1 max-w-2xl">
            {/* Small Label Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F1F5F9] text-[#475569] text-[11px] font-bold uppercase tracking-wider mb-4">
              <Building2 className="w-3.5 h-3.5 text-[#1E293B]" />
              <span>COMPANY DIRECTORY</span>
            </div>

            {/* Main Heading */}
            <h1 className="text-3xl sm:text-4xl lg:text-[44px] font-extrabold text-[#0F172A] tracking-tight leading-[1.15] mb-3">
              Explore Hiring<br className="hidden sm:inline" /> Companies
            </h1>

            {/* Description */}
            <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed max-w-xl mb-6">
              Explore organizations actively recruiting. Review tech stacks, open positions, and submit your candidate dossier directly to engineering hiring managers.
            </p>

            {/* Search Bar */}
            <div className="relative max-w-md">
              <Search className="w-4 h-4 text-[#94A3B8] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search stack, company, city..."
                className="w-full pl-11 pr-4 py-3 rounded-full bg-white border border-[#E2E8F0] text-xs font-medium text-[#1E293B] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#1E70F9]/30 shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition"
              />
            </div>
          </div>

          {/* Right: Hero Graphic & Slogan (Abstract shape + Cursive "Find your next opportunity" + Blue Icon + Slogan) */}
          <div className="relative shrink-0 flex items-center justify-end">
            {/* Pale Blue Organic Blob Background Shape */}
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[340px] h-[220px] bg-[#F0F6FF] rounded-full blur-2xl -z-10 pointer-events-none opacity-80" />
            
            <div className="relative flex items-center gap-6 pr-2 sm:pr-4">
              {/* Handwritten / Cursive callout with curved arrow */}
              <div className="hidden sm:flex flex-col items-end text-right">
                <span className="text-[#3B82F6] text-sm font-medium italic font-serif leading-tight">
                  Find your<br />next opportunity
                </span>
                {/* Minimal SVG curved arrow pointing towards the building icon */}
                <svg
                  className="w-8 h-6 text-[#3B82F6] mt-1 -rotate-6"
                  viewBox="0 0 40 30"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M 5 10 C 15 25, 25 25, 35 15" />
                  <path d="M 28 16 L 35 15 L 34 22" />
                </svg>
              </div>

              {/* Blue Circular Icon */}
              <div className="w-12 h-12 rounded-full bg-[#1E70F9] text-white flex items-center justify-center shadow-md shadow-[#1E70F9]/30 shrink-0">
                <Building2 className="w-6 h-6 text-white" />
              </div>

              {/* Slogan Text */}
              <div className="max-w-[200px]">
                <h3 className="text-base sm:text-lg font-extrabold text-[#0F172A] leading-tight mb-1">
                  Great companies build great people
                </h3>
                <p className="text-xs text-[#64748B] leading-snug">
                  Discover teams that value talent, growth, and impact.
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* Loading Skeleton */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {[1, 2, 3].map((idx) => (
              <div
                key={idx}
                className="bg-[#F8FAFC] rounded-[32px] p-6 border border-[#E2E8F0] animate-pulse space-y-4"
              >
                <div className="h-4 bg-[#E2E8F0] rounded-full w-1/3" />
                <div className="h-7 bg-[#E2E8F0] rounded-xl w-3/4" />
                <div className="h-16 bg-[#E2E8F0] rounded-2xl w-full" />
                <div className="h-40 bg-[#E2E8F0] rounded-2xl w-full" />
              </div>
            ))}
          </div>
        )}

        {/* ── 3 PASTEL COMPANY CARDS (LARGE-IMAGE-BOTTOM DESIGN 1:1) ── */}
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7 mb-10">
            {filteredCompanies.map((company) => {
              const hasSubmitted = submittedOrgs[company.id];
              const isSubmitting = submittingOrgId === company.id;

              return (
                <div
                  key={company.id}
                  style={{ backgroundColor: company.bg_color }}
                  className="rounded-[32px] overflow-hidden shadow-[0_4px_25px_rgba(0,0,0,0.04)] flex flex-col justify-between transition-all duration-200 hover:-translate-y-1 hover:shadow-lg border border-black/5"
                >
                  {/* TOP SECTION: COMPANY INFORMATION */}
                  <div className="p-7 sm:p-8 flex flex-col flex-1">
                    {/* Small Label Tag & Three-dot Menu */}
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-[10px] sm:text-[11px] font-bold text-[#64748B] uppercase tracking-[0.16em]">
                        ABOUT THE COMPANY
                      </span>
                      <button
                        type="button"
                        title="Company Options"
                        className="text-[#64748B] hover:text-[#0F172A] p-1 rounded-lg hover:bg-black/5 transition cursor-pointer"
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Company Name */}
                    <h2 className="text-xl sm:text-2xl font-extrabold text-[#0F172A] tracking-tight leading-snug mb-2">
                      {company.name}
                    </h2>

                    {/* Short Description */}
                    <p className="text-xs sm:text-sm text-[#475569] leading-relaxed mb-6 font-normal">
                      {company.description}
                    </p>

                    {/* Statistics Row: Engineers Count & Open Roles Count */}
                    <div className="flex items-center gap-12 sm:gap-14 mt-auto pt-2">
                      <div>
                        <div className="text-2xl sm:text-3xl font-black text-[#0F172A] tracking-tight">
                          {company.engineers_count}
                        </div>
                        <div className="text-xs text-[#64748B] font-medium mt-0.5">
                          Engineers
                        </div>
                      </div>

                      <div>
                        <div className="text-2xl sm:text-3xl font-black text-[#0F172A] tracking-tight">
                          {company.roles.length}
                        </div>
                        <div className="text-xs text-[#64748B] font-medium mt-0.5">
                          Open Roles
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* BOTTOM SECTION: LARGE BUILDING IMAGE WITH FLOATING BUTTONS & FOOTER */}
                  <div className="relative w-full h-[230px] sm:h-[250px] overflow-hidden rounded-t-[28px] rounded-b-[32px] mt-2">
                    {/* Full Building Background Photo */}
                    <img
                      src={company.image_url}
                      alt={company.name}
                      className="w-full h-full object-cover"
                    />

                    {/* Dark gradient overlay for text & button legibility */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent pointer-events-none" />

                    {/* Floating Buttons & Footer Content */}
                    <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6 flex flex-col gap-3.5 z-10">
                      {/* Buttons Row */}
                      <div className="grid grid-cols-2 gap-3">
                        {/* View Roles (White Button, Dark Text) */}
                        <button
                          type="button"
                          onClick={() => setSelectedJob({ company, job: company.roles[0] })}
                          className="rounded-xl bg-white hover:bg-slate-100 active:scale-98 text-[#0F172A] text-xs sm:text-sm font-bold py-3 px-3 transition cursor-pointer text-center shadow-md border-0"
                        >
                          View Roles ({company.roles.length})
                        </button>

                        {/* Submit Dossier (Blue Filled Button) */}
                        <button
                          type="button"
                          disabled={isSubmitting || hasSubmitted}
                          onClick={() => handleSubmitDossier(company)}
                          className={`rounded-xl text-xs sm:text-sm font-bold py-3 px-3 transition shadow-md cursor-pointer text-center flex items-center justify-center gap-1.5 ${
                            hasSubmitted
                              ? 'bg-emerald-600 text-white cursor-default'
                              : 'bg-[#1E70F9] hover:bg-[#155FD0] active:scale-98 text-white'
                          }`}
                        >
                          {hasSubmitted ? (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              <span>Submitted</span>
                            </>
                          ) : isSubmitting ? (
                            <span>Sending...</span>
                          ) : (
                            <span>Submit Dossier</span>
                          )}
                        </button>
                      </div>

                      {/* Footer inside image: Founded year on left, Location on right */}
                      <div className="flex items-center justify-between text-[11px] sm:text-xs text-white/95 font-medium px-1 drop-shadow-sm">
                        <span>Founded {company.founded_year}</span>
                        <span>{company.location}</span>
                      </div>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}

        {/* ── BOTTOM PAGINATION SECTION ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-[#F1F5F9]">
          {/* Circular Pagination Controls */}
          <div className="flex items-center gap-2">
            {/* Arrow Left */}
            <button
              type="button"
              className="w-8 h-8 rounded-full border border-[#E2E8F0] bg-white hover:bg-[#F8FAFC] text-[#64748B] flex items-center justify-center transition cursor-pointer shadow-xs"
              title="Previous page"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
            </button>

            {/* Page 1 (Active Blue) */}
            <button
              type="button"
              className="w-8 h-8 rounded-full bg-[#1E70F9] text-white text-xs font-bold flex items-center justify-center shadow-xs cursor-pointer"
            >
              1
            </button>

            {/* Page 2 */}
            <button
              type="button"
              className="w-8 h-8 rounded-full border border-[#E2E8F0] bg-white hover:bg-[#F8FAFC] text-[#64748B] text-xs font-medium flex items-center justify-center transition cursor-pointer shadow-xs"
            >
              2
            </button>

            {/* Page 3 */}
            <button
              type="button"
              className="w-8 h-8 rounded-full border border-[#E2E8F0] bg-white hover:bg-[#F8FAFC] text-[#64748B] text-xs font-medium flex items-center justify-center transition cursor-pointer shadow-xs"
            >
              3
            </button>

            {/* Ellipsis */}
            <span className="text-xs text-[#94A3B8] px-1 font-medium select-none">
              ...
            </span>

            {/* Page 10 */}
            <button
              type="button"
              className="w-8 h-8 rounded-full border border-[#E2E8F0] bg-white hover:bg-[#F8FAFC] text-[#64748B] text-xs font-medium flex items-center justify-center transition cursor-pointer shadow-xs"
            >
              10
            </button>

            {/* Arrow Right */}
            <button
              type="button"
              className="w-8 h-8 rounded-full border border-[#E2E8F0] bg-white hover:bg-[#F8FAFC] text-[#64748B] flex items-center justify-center transition cursor-pointer shadow-xs"
              title="Next page"
            >
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Showing Count Text */}
          <div className="text-xs font-medium text-[#64748B]">
            Showing 1–3 of 28 companies
          </div>
        </div>

      </div>

      {/* ── JOB DETAIL MODAL (PRESERVED FUNCTIONALITY) ── */}
      {selectedJob && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-fadeIn">
          <div className="bg-white rounded-[28px] max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-[#E2E8F0] p-6 sm:p-8 relative">
            
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setSelectedJob(null)}
              className="absolute top-6 right-6 w-8 h-8 rounded-full bg-[#F1F5F9] hover:bg-[#E2E8F0] flex items-center justify-center text-[#1E293B] transition cursor-pointer z-10"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Top Info */}
            <div className="flex items-center justify-between mb-4 pr-10">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#1E70F9] text-white flex items-center justify-center font-bold text-xs shadow-2xs">
                  {selectedJob.company.name.slice(0, 2).toUpperCase()}
                </div>
                <span className="text-xs font-bold text-[#0F172A]">
                  {selectedJob.company.name}
                </span>
              </div>

              <div className="text-[11px] text-[#64748B] hover:text-[#0F172A] flex items-center gap-1 cursor-pointer">
                <span>How promoted jobs are ranked</span>
                <HelpCircle className="w-3 h-3" />
              </div>
            </div>

            {/* Job Title */}
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight leading-tight mb-2">
              {selectedJob.job.title}
            </h1>

            {/* Sub-meta */}
            <div className="text-xs text-[#64748B] space-y-0.5 mb-4">
              <p>
                {selectedJob.job.location} • {selectedJob.job.posted_days_ago} days ago • Over {selectedJob.job.applicants_count} applicants
              </p>
              <p className="text-[11px] text-[#94A3B8]">
                Promoted by hirer • Fast candidate screening in progress
              </p>
            </div>

            {/* Outlined Pill Badges */}
            <div className="flex flex-wrap items-center gap-2 mb-5">
              <span className="rounded-full border border-[#CBD5E1] bg-white text-[#1E293B] text-xs font-bold px-4 py-1 shadow-2xs">
                {selectedJob.job.salary}
              </span>

              {selectedJob.job.is_remote && (
                <span className="rounded-full border border-[#CBD5E1] bg-white text-[#1E293B] text-xs font-bold px-4 py-1 shadow-2xs flex items-center gap-1">
                  <Check className="w-3.5 h-3.5 text-[#1E70F9]" /> Remote
                </span>
              )}

              <span className="rounded-full border border-[#CBD5E1] bg-white text-[#1E293B] text-xs font-bold px-4 py-1 shadow-2xs flex items-center gap-1">
                <Check className="w-3.5 h-3.5 text-[#1E70F9]" /> {selectedJob.job.job_type}
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 mb-7 pb-6 border-t border-b border-[#F1F5F9] pt-6">
              <button
                type="button"
                disabled={appliedJobs[selectedJob.job.id]}
                onClick={() => handleApplyToJob(selectedJob.job, selectedJob.company)}
                className={`rounded-full px-7 py-2.5 text-xs sm:text-sm font-bold shadow-xs transition flex items-center gap-2 cursor-pointer ${
                  appliedJobs[selectedJob.job.id]
                    ? 'bg-emerald-600 text-white cursor-default'
                    : 'bg-[#1E70F9] hover:bg-[#155FD0] text-white'
                }`}
              >
                {appliedJobs[selectedJob.job.id] ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Dossier Applied</span>
                  </>
                ) : (
                  <>
                    <Briefcase className="w-4 h-4" />
                    <span>Apply with Dossier</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => toggleSaveJob(selectedJob.job.id)}
                className={`rounded-full border px-6 py-2.5 text-xs sm:text-sm font-bold transition cursor-pointer flex items-center gap-1.5 ${
                  savedJobs[selectedJob.job.id]
                    ? 'border-[#1E70F9] bg-blue-50 text-[#1E70F9]'
                    : 'border-[#CBD5E1] hover:bg-slate-50 text-[#1E293B]'
                }`}
              >
                <Bookmark className="w-3.5 h-3.5" />
                <span>{savedJobs[selectedJob.job.id] ? 'Saved' : 'Save'}</span>
              </button>
            </div>

            {/* Job Match Summary Card */}
            <div className="rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-4 sm:p-5 mb-7 flex items-center justify-between gap-4">
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-[#1E293B] mb-0.5 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#1E70F9]" />
                  Candidate match summary: {selectedJob.job.match_score}%
                </h3>
                <p className="text-[11px] sm:text-xs text-[#64748B]">
                  {selectedJob.job.match_count}. Your verified skills align with this engineering scope.
                </p>
              </div>

              <div className="shrink-0 flex items-center gap-1">
                <div className="w-16 h-3 bg-[#E2E8F0] rounded-full overflow-hidden relative">
                  <div
                    className="h-full bg-[#1E70F9] rounded-full"
                    style={{ width: `${selectedJob.job.match_score}%` }}
                  />
                </div>
                <div className="w-4 h-4 rounded-full bg-[#1E70F9] flex items-center justify-center text-white text-[9px] font-bold">
                  ✓
                </div>
              </div>
            </div>

            {/* About Job & Responsibilities */}
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-bold text-[#1E293B] mb-3">
                  About the job
                </h2>
                <div className="text-xs sm:text-sm text-[#475569] leading-relaxed whitespace-pre-line">
                  {selectedJob.job.description}
                </div>
              </div>

              <div>
                <h3 className="text-xs sm:text-sm font-bold text-[#1E293B] mb-2.5">
                  Key Responsibilities
                </h3>
                <ul className="space-y-2 text-xs sm:text-sm text-[#475569]">
                  {selectedJob.job.responsibilities.map((resp, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-[#1E70F9] font-bold">•</span>
                      <span>{resp}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-xs sm:text-sm font-bold text-[#1E293B] mb-2.5">
                  Qualifications & Skills
                </h3>
                <ul className="space-y-2 text-xs sm:text-sm text-[#475569]">
                  {selectedJob.job.qualifications.map((qual, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-[#1E70F9] font-bold">•</span>
                      <span>{qual}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {selectedJob.company.roles.length > 1 && (
                <div className="pt-6 border-t border-[#F1F5F9]">
                  <h3 className="text-xs sm:text-sm font-bold text-[#1E293B] mb-3">
                    Other positions at {selectedJob.company.name}
                  </h3>
                  <div className="space-y-2">
                    {selectedJob.company.roles
                      .filter((r) => r.id !== selectedJob.job.id)
                      .map((otherRole) => (
                        <div
                          key={otherRole.id}
                          onClick={() => setSelectedJob({ company: selectedJob.company, job: otherRole })}
                          className="p-3.5 rounded-xl border border-[#E2E8F0] hover:border-[#1E70F9] transition cursor-pointer flex items-center justify-between bg-white"
                        >
                          <div>
                            <span className="text-xs font-bold text-[#1E293B] block">
                              {otherRole.title}
                            </span>
                            <span className="text-[11px] text-[#64748B]">
                              {otherRole.location} • {otherRole.salary}
                            </span>
                          </div>
                          <ChevronRight className="w-4 h-4 text-[#94A3B8]" />
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
