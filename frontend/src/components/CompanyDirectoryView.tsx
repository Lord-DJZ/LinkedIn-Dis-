import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import {
  Building2,
  MoreHorizontal,
  Briefcase,
  X,
  Check,
  Sparkles,
  Bookmark,
  ChevronRight,
  Search,
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  ThumbsUp,
  ThumbsDown,
  Globe,
  MapPin,
  Calendar,
  Users,
} from 'lucide-react';

interface JobRole {
  id: string;
  title: string;
  location: string;
  salary: string;
  is_remote: boolean;
  job_type: string;
  posted_time: string;
  posted_days_ago: number;
  applicants_count: number;
  match_score: number;
  match_count: string;
  matched_skills: string[];
  description: string;
  why_join_us: string[];
  responsibilities: string[];
  qualifications: string[];
  benefits: string[];
}

interface CompanyItem {
  id: string;
  name: string;
  industry: string;
  location: string;
  website: string;
  tech_stack: string[];
  description: string;
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

  // Selected job for Job Description View Modal (Jobright Inspiration Match)
  const [selectedJob, setSelectedJob] = useState<{ company: CompanyItem; job: JobRole } | null>(null);
  const [savedJobs, setSavedJobs] = useState<Record<string, boolean>>({});
  const [appliedJobs, setAppliedJobs] = useState<Record<string, boolean>>({});
  const [showMatchDetails, setShowMatchDetails] = useState(false);
  const [feedbackGiven, setFeedbackGiven] = useState<'helpful' | 'not_helpful' | null>(null);

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
              title: 'Junior Data Analyst / Data Scientist / ML AI Engineer',
              location: 'San Francisco, CA (or Remote)',
              salary: '$82K/yr - $127K/yr',
              is_remote: true,
              job_type: 'Full-time',
              posted_time: '2 hours ago',
              posted_days_ago: 3,
              applicants_count: 104,
              match_score: 94,
              match_count: '5 of 6 core skills matched',
              matched_skills: ['Python', 'SQL', 'Machine Learning', 'Data Pipelines', 'Model Evaluation'],
              description:
                'Synthetix Neural Labs is building autonomous AI agent runtimes that transform how enterprise engineering teams deploy and optimize deep neural models. As an AI Engineer, Entry Level / Junior Data Analyst, you will contribute directly to the development, evaluation, and deployment of neural features used by production engineering teams.',
              why_join_us: [
                'Build real, production AI agents used by Fortune 500 enterprises.',
                'High ownership culture with direct mentorship from founding research scientists.',
                'Work with multi-node GPU clusters and modern open-weights foundation models.',
              ],
              responsibilities: [
                'Analyze multidimensional data pipelines and extract structured behavioral insights for production models.',
                'Collaborate with senior ML research engineers to evaluate neural inference latency and accuracy.',
                'Maintain automated feature stores, regression benchmarks, and data quality checks.',
                'Document engineering findings and present analytics telemetry directly to leadership.',
              ],
              qualifications: [
                'Proficiency in Python, SQL, and pandas/NumPy for statistical data analysis.',
                'Solid grasp of supervised machine learning concepts and model evaluation metrics.',
                'Familiarity with containerized environments (Docker) and version control (Git).',
                'Strong problem-solving discipline and eagerness to master modern LLM orchestration.',
              ],
              benefits: [
                'Comprehensive medical, dental, and vision health coverage (100% employer paid).',
                '$3,500 annual continuous learning, books, and technical conference stipend.',
                'Flexible remote workstation equipment allowance with top-tier hardware.',
                '401(k) retirement plan with 5% immediate company matching.',
                'Generous paid time off (PTO) and flexible working hours.',
              ],
            },
            {
              id: 'job-synth-2',
              title: 'Staff ML Research Scientist',
              location: 'San Francisco, CA',
              salary: '$190K/yr - $260K/yr',
              is_remote: true,
              job_type: 'Full-time',
              posted_time: '5 hours ago',
              posted_days_ago: 5,
              applicants_count: 42,
              match_score: 88,
              match_count: '4 of 5 core skills matched',
              matched_skills: ['PyTorch', 'Distributed Training', 'CUDA', 'Transformer Architecture'],
              description:
                'Lead our core multimodal foundation model initiative. You will spearhead architectural innovations in sparse attention and continuous test-time compute across multi-node clusters.',
              why_join_us: [
                'Directly shape foundational neural model architectures with massive compute allocations.',
                'Publish novel findings in top-tier machine learning conferences (NeurIPS, ICML, ICLR).',
                'Competitive founding-tier equity package and significant strategic autonomy.',
              ],
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
              benefits: [
                'Top-tier executive health benefits, dental, and vision for you and dependents.',
                'Uncapped computational compute budget on dedicated H100/H200 GPU clusters.',
                'Comprehensive 401(k) matching and annual performance equity refreshers.',
                'Unlimited paid time off and quarterly wellness sabbaticals.',
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
              posted_time: '1 day ago',
              posted_days_ago: 2,
              applicants_count: 58,
              match_score: 96,
              match_count: '6 of 6 core skills matched',
              matched_skills: ['FastAPI', 'Kubernetes', 'Distributed Systems', 'Python', 'Docker', 'PostgreSQL'],
              description:
                'Architect the next evolution of our global real-time inference mesh. You will design fault-tolerant microservices and low-latency API gateways across multi-region deployments.',
              why_join_us: [
                'Architect cloud systems processing billions of daily transactions for global enterprises.',
                'Modern zero-legacy microservices stack with continuous automated deployment.',
                'Lucrative base salary, equity incentives, and comprehensive family benefits.',
              ],
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
              benefits: [
                'Platinum healthcare coverage with zero in-network deductible.',
                'Generous employee equity participation plan with quarterly liquidity windows.',
                'Annual remote home office refresh stipend and cellular reimbursement.',
                'Comprehensive family leave and backup childcare benefits.',
              ],
            },
            {
              id: 'job-apex-2',
              title: 'Senior Full-Stack AI Engineer',
              location: 'Remote, US',
              salary: '$150K/yr - $195K/yr',
              is_remote: true,
              job_type: 'Full-time',
              posted_time: '2 days ago',
              posted_days_ago: 4,
              applicants_count: 73,
              match_score: 91,
              match_count: '5 of 6 core skills matched',
              matched_skills: ['React', 'TypeScript', 'Tailwind CSS', 'FastAPI', 'Redis'],
              description:
                'Bridge intuitive user experiences with high-performance generative models. You will craft reactive web applications and real-time streaming interfaces.',
              why_join_us: [
                'Craft state-of-the-art interactive AI products with immediate user adoption.',
                'Full technical latitude on frontend frameworks, animations, and design tokens.',
                'Work alongside world-class designers and backend distributed systems architects.',
              ],
              responsibilities: [
                'Develop highly reactive web interfaces with React, TypeScript, and Tailwind CSS.',
                'Implement robust streaming WebSocket backends using Python FastAPI and Redis.',
                'Optimize client-side performance, state management, and user interaction feedback loops.',
              ],
              qualifications: [
                '5+ years building full-stack applications with modern web stacks.',
                'Experience with streaming LLM completions, agent memory systems, and vector search.',
                'Eye for clean UI craft, typography, and fluid micro-interactions.',
              ],
              benefits: [
                'Full medical, dental, and optical insurance coverage with HSA contribution.',
                'Flexible working hours across all US time zones.',
                '$2,500 personal development and continuing education fund.',
                'Paid team offsites twice a year in scenic locations.',
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
              posted_time: '3 hours ago',
              posted_days_ago: 6,
              applicants_count: 29,
              match_score: 85,
              match_count: '4 of 5 core skills matched',
              matched_skills: ['Bioinformatics', 'Python', 'Nextflow', 'Cloud Computing (AWS/GCP)'],
              description:
                'Build and orchestrate clinical-grade genomic data processing pipelines. You will optimize variant calling tools and integrate electronic health records safely.',
              why_join_us: [
                'Apply your engineering skills directly to life-saving clinical healthcare applications.',
                'Collaborate directly with renowned geneticists, computational biologists, and oncologists.',
                'Modern cloud native infrastructure handling millions of genome sequence variants.',
              ],
              responsibilities: [
                'Design scalable Nextflow/Snakemake workflows for high-throughput sequencing data.',
                'Ensure HIPAA and SOC2 compliance across all cloud storage buckets and analytical pipelines.',
                'Collaborate with computational biologists to operationalize predictive biomarker algorithms.',
              ],
              qualifications: [
                'Experience in computational biology, bioinformatics, or health data infrastructure.',
                'Proficiency in Python, Bash scripting, and cloud computing (AWS/GCP).',
                'Working understanding of variant calling algorithms and clinical data security.',
              ],
              benefits: [
                'Premier healthcare, vision, and dental plans with minimal copayments.',
                'Flexible hybrid or 100% remote working options.',
                'Tuition reimbursement program and conference sponsorships.',
                'Generous PTO, family sick leave, and matching charitable contributions.',
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
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[340px] h-[220px] bg-[#F0F6FF] rounded-full blur-2xl -z-10 pointer-events-none opacity-80" />
            
            <div className="relative flex items-center gap-6 pr-2 sm:pr-4">
              <div className="hidden sm:flex flex-col items-end text-right">
                <span className="text-[#3B82F6] text-sm font-medium italic font-serif leading-tight">
                  Find your<br />next opportunity
                </span>
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

              <div className="w-12 h-12 rounded-full bg-[#1E70F9] text-white flex items-center justify-center shadow-md shadow-[#1E70F9]/30 shrink-0">
                <Building2 className="w-6 h-6 text-white" />
              </div>

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

                    <h2 className="text-xl sm:text-2xl font-extrabold text-[#0F172A] tracking-tight leading-snug mb-2">
                      {company.name}
                    </h2>

                    <p className="text-xs sm:text-sm text-[#475569] leading-relaxed mb-6 font-normal">
                      {company.description}
                    </p>

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
                    <img
                      src={company.image_url}
                      alt={company.name}
                      className="w-full h-full object-cover"
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent pointer-events-none" />

                    <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6 flex flex-col gap-3.5 z-10">
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedJob({ company, job: company.roles[0] });
                            setShowMatchDetails(false);
                            setFeedbackGiven(null);
                          }}
                          className="rounded-xl bg-white hover:bg-slate-100 active:scale-98 text-[#0F172A] text-xs sm:text-sm font-bold py-3 px-3 transition cursor-pointer text-center shadow-md border-0"
                        >
                          View Roles ({company.roles.length})
                        </button>

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
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="w-8 h-8 rounded-full border border-[#E2E8F0] bg-white hover:bg-[#F8FAFC] text-[#64748B] flex items-center justify-center transition cursor-pointer shadow-xs"
              title="Previous page"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              className="w-8 h-8 rounded-full bg-[#1E70F9] text-white text-xs font-bold flex items-center justify-center shadow-xs cursor-pointer"
            >
              1
            </button>

            <button
              type="button"
              className="w-8 h-8 rounded-full border border-[#E2E8F0] bg-white hover:bg-[#F8FAFC] text-[#64748B] text-xs font-medium flex items-center justify-center transition cursor-pointer shadow-xs"
            >
              2
            </button>

            <button
              type="button"
              className="w-8 h-8 rounded-full border border-[#E2E8F0] bg-white hover:bg-[#F8FAFC] text-[#64748B] text-xs font-medium flex items-center justify-center transition cursor-pointer shadow-xs"
            >
              3
            </button>

            <span className="text-xs text-[#94A3B8] px-1 font-medium select-none">
              ...
            </span>

            <button
              type="button"
              className="w-8 h-8 rounded-full border border-[#E2E8F0] bg-white hover:bg-[#F8FAFC] text-[#64748B] text-xs font-medium flex items-center justify-center transition cursor-pointer shadow-xs"
            >
              10
            </button>

            <button
              type="button"
              className="w-8 h-8 rounded-full border border-[#E2E8F0] bg-white hover:bg-[#F8FAFC] text-[#64748B] flex items-center justify-center transition cursor-pointer shadow-xs"
              title="Next page"
            >
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="text-xs font-medium text-[#64748B]">
            Showing 1–3 of 28 companies
          </div>
        </div>

      </div>

      {/* ═══════════════════════════════════════════════════════════════════
          JOB DETAILS PAGE / VIEW (EXACT 1:1 INSPIRATION IMAGE MATCH)
          - White centered container, generous spacing, clean typography
          - Company logo & name top row with options and close button
          - Large bold Job Title with verification badge
          - Metadata: Location • Posted time • Applicant information
          - Small rounded tags/pills: [✓ Remote]  [✓ Full-time]  [$82K - $127K]
          - Action buttons: [ Apply with Dossier ]  [ Save ]
          - AI Match Highlight Card: "Your profile and resume match the required qualifications well"
            with overlapping avatars, "✦ Show match details", progress breakdown, and feedback
          - Clean content sections:
            - About the Job & Why Join Us
            - Key Responsibilities
            - Required Skills & Qualifications
            - Featured Benefits
            - Company Information card
      ═══════════════════════════════════════════════════════════════════ */}
      {selectedJob && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-fadeIn"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedJob(null);
          }}
        >
          <div className="bg-white rounded-[24px] sm:rounded-[32px] max-w-2xl sm:max-w-3xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-[#E5E7EB] p-6 sm:p-10 relative text-[#111827] font-sans">
            
            {/* ── TOP BAR: COMPANY LOGO / AVATAR + COMPANY NAME + ACTIONS ── */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                {/* Company Logo Badge */}
                <div className="w-8 h-8 rounded-full bg-[#10B981] text-white flex items-center justify-center font-bold text-xs shadow-2xs shrink-0">
                  <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                  </svg>
                </div>
                <span className="text-sm sm:text-base font-bold text-[#111827]">
                  {selectedJob.company.name}
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  title="More options"
                  className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-[#6B7280] transition cursor-pointer"
                >
                  <MoreHorizontal className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedJob(null)}
                  title="Close job details"
                  className="w-8 h-8 rounded-full bg-[#F3F4F6] hover:bg-[#E5E7EB] flex items-center justify-center text-[#4B5563] hover:text-[#111827] transition cursor-pointer ml-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* ── JOB TITLE WITH VERIFICATION BADGE ── */}
            <div className="flex items-center gap-2 mt-2 mb-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111827] tracking-tight leading-tight">
                {selectedJob.job.title}
              </h1>
              <span title="Verified Employer Role" className="inline-flex items-center"><ShieldCheck className="w-5 h-5 text-[#6B7280] shrink-0" /></span>
            </div>

            {/* ── METADATA LINE: LOCATION • POSTED TIME • APPLICANTS ── */}
            <div className="text-xs sm:text-sm text-[#6B7280] flex flex-wrap items-center gap-x-1.5 gap-y-1 mb-1">
              <span>{selectedJob.job.location}</span>
              <span>•</span>
              <span className="text-[#059669] font-semibold">{selectedJob.job.posted_time}</span>
              <span>•</span>
              <span>{selectedJob.job.applicants_count} people clicked apply</span>
            </div>

            <div className="text-[11px] sm:text-xs text-[#9CA3AF] mb-4">
              Promoted by hirer • Responses managed via Dullnit Verified Candidate Dossier
            </div>

            {/* ── SMALL ROUNDED TAGS / PILLS ── */}
            <div className="flex flex-wrap items-center gap-2 mb-6">
              {selectedJob.job.is_remote && (
                <span className="rounded-full border border-[#D1D5DB] bg-white text-[#374151] text-xs font-semibold px-3.5 py-1 shadow-2xs flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-[#374151] stroke-[2.5]" /> Remote
                </span>
              )}

              <span className="rounded-full border border-[#D1D5DB] bg-white text-[#374151] text-xs font-semibold px-3.5 py-1 shadow-2xs flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-[#374151] stroke-[2.5]" /> {selectedJob.job.job_type}
              </span>

              <span className="rounded-full border border-[#D1D5DB] bg-white text-[#374151] text-xs font-semibold px-3.5 py-1 shadow-2xs">
                {selectedJob.job.salary}
              </span>
            </div>

            {/* ── ACTION BUTTONS: PRIMARY APPLY & SECONDARY SAVE ── */}
            <div className="flex items-center gap-3 mb-8">
              {/* Primary: Apply with Dossier */}
              <button
                type="button"
                disabled={appliedJobs[selectedJob.job.id]}
                onClick={() => handleApplyToJob(selectedJob.job, selectedJob.company)}
                className={`rounded-full px-6 sm:px-7 py-2.5 text-sm font-bold shadow-xs transition flex items-center gap-2 cursor-pointer active:scale-98 ${
                  appliedJobs[selectedJob.job.id]
                    ? 'bg-emerald-600 text-white cursor-default'
                    : 'bg-[#1E70F9] hover:bg-[#155FD0] text-white'
                }`}
              >
                {appliedJobs[selectedJob.job.id] ? (
                  <>
                    <Check className="w-4 h-4 stroke-[2.5]" />
                    <span>Dossier Applied</span>
                  </>
                ) : (
                  <>
                    <Briefcase className="w-4 h-4" />
                    <span>Apply with Dossier</span>
                  </>
                )}
              </button>

              {/* Secondary: Save (White background, blue outline) */}
              <button
                type="button"
                onClick={() => toggleSaveJob(selectedJob.job.id)}
                className={`rounded-full border px-6 sm:px-7 py-2.5 text-sm font-bold transition cursor-pointer flex items-center gap-1.5 active:scale-98 ${
                  savedJobs[selectedJob.job.id]
                    ? 'border-[#1E70F9] bg-blue-50/80 text-[#1E70F9]'
                    : 'border-[#1E70F9] bg-white hover:bg-blue-50/40 text-[#1E70F9]'
                }`}
              >
                <Bookmark className="w-3.5 h-3.5" />
                <span>{savedJobs[selectedJob.job.id] ? 'Saved' : 'Save'}</span>
              </button>
            </div>

            {/* ── AI MATCH CARD (EXACT INSPIRATION IMAGE 2 REPRODUCTION) ── */}
            <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5 sm:p-6 mb-8 shadow-xs">
              
              {/* Top Row: Headline + Overlapping Avatars */}
              <div className="flex items-start justify-between gap-4 mb-4">
                <h3 className="text-base sm:text-lg font-bold text-[#111827] leading-snug max-w-md">
                  Your profile and resume <span className="text-[#059669]">match</span> the required qualifications well
                </h3>

                {/* Overlapping Avatars Graphic */}
                <div className="relative shrink-0 flex items-center">
                  <div className="w-8 h-8 rounded-full bg-[#10B981] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                    <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                    </svg>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-[#1F2937] text-white flex items-center justify-center font-bold text-xs border-2 border-white -ml-3 mt-3 shadow-xs overflow-hidden">
                    <span>CA</span>
                  </div>
                </div>
              </div>

              {/* Show Match Details Button */}
              <button
                type="button"
                onClick={() => setShowMatchDetails(!showMatchDetails)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-[#E5E7EB] bg-white hover:bg-slate-50 text-xs sm:text-sm font-semibold text-[#1F2937] shadow-xs cursor-pointer transition mb-4"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                <span>{showMatchDetails ? 'Hide match details' : 'Show match details'}</span>
              </button>

              {/* Expandable Match Details Drawer */}
              {showMatchDetails && (
                <div className="rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] p-4 sm:p-5 mb-4 animate-fadeIn space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#1E293B]">
                      Verified Skills Alignment ({selectedJob.job.match_score}%)
                    </span>
                    <span className="text-xs font-bold text-[#059669]">
                      {selectedJob.job.match_count}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full h-2.5 bg-[#E2E8F0] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#059669] rounded-full transition-all duration-500"
                      style={{ width: `${selectedJob.job.match_score}%` }}
                    />
                  </div>

                  {/* Skills Pill Cloud */}
                  <div className="pt-2">
                    <span className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider block mb-2">
                      Matching Qualifications in Your Dossier:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedJob.job.matched_skills.map((skill, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-0.5 rounded-full bg-[#ECFDF5] border border-[#A7F3D0] text-[#065F46] text-xs font-medium flex items-center gap-1"
                        >
                          <Check className="w-3 h-3 text-[#059669]" /> {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Bottom Beta Feedback Bar */}
              <div className="flex items-center justify-between pt-3 border-t border-[#F3F4F6] text-xs text-[#9CA3AF]">
                <span>BETA • Is this information helpful?</span>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setFeedbackGiven('helpful')}
                    className={`p-1 rounded hover:bg-slate-100 transition cursor-pointer ${
                      feedbackGiven === 'helpful' ? 'text-[#059669] font-bold' : 'text-[#6B7280]'
                    }`}
                    title="Yes, helpful"
                  >
                    <ThumbsUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setFeedbackGiven('not_helpful')}
                    className={`p-1 rounded hover:bg-slate-100 transition cursor-pointer ${
                      feedbackGiven === 'not_helpful' ? 'text-red-500 font-bold' : 'text-[#6B7280]'
                    }`}
                    title="Not helpful"
                  >
                    <ThumbsDown className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

            </div>

            {/* ── SECTION 1: ABOUT THE JOB ── */}
            <div className="space-y-6 text-[#374151] text-sm sm:text-[15px] leading-relaxed">
              <div>
                <h2 className="text-xl font-bold text-[#111827] mb-3">
                  About the job
                </h2>
                <p className="whitespace-pre-line text-[#4B5563]">
                  {selectedJob.job.description}
                </p>
              </div>

              {/* Why Join Us */}
              {selectedJob.job.why_join_us && selectedJob.job.why_join_us.length > 0 && (
                <div>
                  <h3 className="text-base font-bold text-[#111827] mb-2.5">
                    Why Join Us
                  </h3>
                  <ul className="space-y-2">
                    {selectedJob.job.why_join_us.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-[#4B5563]">
                        <span className="text-[#111827] font-bold select-none">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <hr className="border-[#F3F4F6] my-6" />

              {/* ── SECTION 2: KEY RESPONSIBILITIES ── */}
              <div>
                <h2 className="text-xl font-bold text-[#111827] mb-3">
                  Key Responsibilities
                </h2>
                <ul className="space-y-2.5">
                  {selectedJob.job.responsibilities.map((resp, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-[#4B5563]">
                      <span className="text-[#111827] font-bold select-none">•</span>
                      <span>{resp}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <hr className="border-[#F3F4F6] my-6" />

              {/* ── SECTION 3: REQUIRED SKILLS & QUALIFICATIONS ── */}
              <div>
                <h2 className="text-xl font-bold text-[#111827] mb-3">
                  Required Skills & Qualifications
                </h2>
                <ul className="space-y-2.5">
                  {selectedJob.job.qualifications.map((qual, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-[#4B5563]">
                      <span className="text-[#111827] font-bold select-none">•</span>
                      <span>{qual}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <hr className="border-[#F3F4F6] my-6" />

              {/* ── SECTION 4: FEATURED BENEFITS ── */}
              <div>
                <h2 className="text-xl font-bold text-[#111827] mb-3">
                  Featured Benefits
                </h2>
                <ul className="space-y-2.5">
                  {selectedJob.job.benefits.map((benefit, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-[#4B5563]">
                      <span className="text-[#059669] font-bold select-none">✓</span>
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <hr className="border-[#F3F4F6] my-6" />

              {/* ── SECTION 5: COMPANY INFORMATION ── */}
              <div>
                <h2 className="text-xl font-bold text-[#111827] mb-4">
                  Company Information
                </h2>
                <div className="rounded-2xl border border-[#E5E7EB] bg-[#F9FAFB] p-5 sm:p-6 space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-extrabold text-[#111827]">
                        {selectedJob.company.name}
                      </h3>
                      <p className="text-xs text-[#6B7280] mt-0.5">
                        {selectedJob.company.industry}
                      </p>
                    </div>

                    <a
                      href={selectedJob.company.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-semibold text-[#1E70F9] hover:underline"
                    >
                      <span>Visit website</span>
                      <Globe className="w-3.5 h-3.5" />
                    </a>
                  </div>

                  <p className="text-xs sm:text-sm text-[#4B5563] leading-relaxed">
                    {selectedJob.company.description}
                  </p>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-3 border-t border-[#E5E7EB] text-xs">
                    <div className="flex items-center gap-2 text-[#4B5563]">
                      <Users className="w-4 h-4 text-[#6B7280]" />
                      <span>{selectedJob.company.engineers_count} Engineers</span>
                    </div>

                    <div className="flex items-center gap-2 text-[#4B5563]">
                      <Calendar className="w-4 h-4 text-[#6B7280]" />
                      <span>Founded {selectedJob.company.founded_year}</span>
                    </div>

                    <div className="flex items-center gap-2 text-[#4B5563]">
                      <MapPin className="w-4 h-4 text-[#6B7280]" />
                      <span>{selectedJob.company.location}</span>
                    </div>
                  </div>

                  <div className="pt-2">
                    <span className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider block mb-2">
                      Primary Engineering Stack:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedJob.company.tech_stack.map((tech, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-0.5 rounded-lg bg-white border border-[#E5E7EB] text-[#374151] text-xs font-medium"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Other Roles at this company */}
              {selectedJob.company.roles.length > 1 && (
                <div className="pt-4">
                  <h3 className="text-base font-bold text-[#111827] mb-3">
                    Other positions at {selectedJob.company.name}
                  </h3>
                  <div className="space-y-2">
                    {selectedJob.company.roles
                      .filter((r) => r.id !== selectedJob.job.id)
                      .map((otherRole) => (
                        <div
                          key={otherRole.id}
                          onClick={() => {
                            setSelectedJob({ company: selectedJob.company, job: otherRole });
                            setShowMatchDetails(false);
                            setFeedbackGiven(null);
                          }}
                          className="p-3.5 rounded-xl border border-[#E5E7EB] hover:border-[#1E70F9] transition cursor-pointer flex items-center justify-between bg-white shadow-2xs hover:shadow-xs"
                        >
                          <div>
                            <span className="text-xs sm:text-sm font-bold text-[#111827] block">
                              {otherRole.title}
                            </span>
                            <span className="text-[11px] text-[#6B7280]">
                              {otherRole.location} • {otherRole.salary}
                            </span>
                          </div>
                          <ChevronRight className="w-4 h-4 text-[#9CA3AF]" />
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
