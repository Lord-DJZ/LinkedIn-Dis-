import type {
  User,
  TokenResponse,
  CandidateProfile,
  CandidatePersona,
  ResumeExtractionResult,
  CandidateSearchResult,
  RecruiterCandidateDetail,
  Organization,
  RecruitedCandidate,
} from '../types';

const STORAGE_KEY = 'dullnit_local_db_v1';

interface LocalDBState {
  users: Array<User & { password_hash?: string; full_name?: string; company_name?: string }>;
  profiles: Record<string, CandidateProfile>;
  personas: Record<string, CandidatePersona>;
  organizations: Record<string, Organization>;
  recruited: Record<string, RecruitedCandidate[]>; // keyed by org_id
  savedCandidates: Record<string, string[]>; // keyed by user_id
  extractions: Record<string, { resume_id: string; status: string; is_confirmed: boolean; reconciled_data: ResumeExtractionResult }>;
}

const DEFAULT_PERSONA_PORTRAIT = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80';

const INITIAL_DB: LocalDBState = {
  users: [
    {
      id: 'usr_candidate_demuni',
      email: 'candidate@dullnit.com',
      role: 'candidate',
      is_active: true,
      profile_id: 'prof_candidate_demuni',
      full_name: 'Demuni Jayasmith',
      password_hash: 'CandidateSecure2026!',
    },
    {
      id: 'usr_recruiter_sarah',
      email: 'recruiter@apexglobal.tech',
      role: 'recruiter',
      is_active: true,
      full_name: 'Sarah Jenkins',
      company_name: 'Apex Global Technologies',
      password_hash: 'ApexEnterprise2026!',
    },
  ],
  profiles: {
    usr_candidate_demuni: {
      id: 'prof_candidate_demuni',
      user_id: 'usr_candidate_demuni',
      full_name: 'Demuni Jayasmith',
      headline: 'Full-Stack Software Engineer & AI Systems Architect',
      bio: 'High-discipline Software Engineer & Technical Founder specializing in robust full-stack architectures, local AI agents, LLM pipelines, and high-performance backend systems.',
      avatar_url: DEFAULT_PERSONA_PORTRAIT,
      phone: '+94 77 123 4567',
      date_of_birth: '2001-05-15',
      gender: 'Male ♂',
      total_years_experience: 4,
      availability_status: 'available_now',
      profile_visibility: 'public',
      is_searchable: true,
      completeness_score: 95,
      created_at: '2026-01-15T00:00:00Z',
      updated_at: '2026-09-07T00:00:00Z',
      location: {
        id: 'loc_demuni',
        city: 'Colombo',
        country: 'Sri Lanka',
      },
      skills: [
        { id: 'sk_1', original_name: 'Python', normalized_name: 'Python', category: 'Language', years_experience: 4, confidence: 0.98, source: 'user' },
        { id: 'sk_2', original_name: 'FastAPI', normalized_name: 'FastAPI', category: 'Backend', years_experience: 3, confidence: 0.95, source: 'user' },
        { id: 'sk_3', original_name: 'TypeScript', normalized_name: 'TypeScript', category: 'Language', years_experience: 3, confidence: 0.94, source: 'user' },
        { id: 'sk_4', original_name: 'React', normalized_name: 'React', category: 'Frontend', years_experience: 3, confidence: 0.92, source: 'user' },
        { id: 'sk_5', original_name: 'PyMuPDF & AI Pipelines', normalized_name: 'AI Engineering', category: 'AI', years_experience: 2, confidence: 0.96, source: 'user' },
        { id: 'sk_6', original_name: 'SQL & PostgreSQL', normalized_name: 'Databases', category: 'Backend', years_experience: 3, confidence: 0.90, source: 'user' },
      ],
      education: [
        {
          id: 'edu_1',
          institution: 'Pearson BTEC Higher National',
          original_degree: 'HND Level 5 in Software Engineering',
          normalized_degree_level: 'HND',
          normalized_degree_type: 'Software Engineering',
          field_of_study: 'Software Engineering & AI Architecture',
          start_date: '2024-01',
          end_date: '2026-06',
          is_current: true,
        },
        {
          id: 'edu_2',
          institution: 'Pearson Education',
          original_degree: 'BTEC Level 3 Diploma in IT',
          normalized_degree_level: 'Diploma',
          normalized_degree_type: 'Information Technology',
          field_of_study: 'Information Technology',
          start_date: '2022-01',
          end_date: '2023-12',
          is_current: false,
        },
      ],
      experiences: [
        {
          id: 'exp_1',
          company: 'Dullnit Intelligent Discovery',
          original_job_title: 'Lead Systems Architect & Full-Stack Engineer',
          normalized_role: 'Lead Architect',
          location: 'Remote',
          start_date: '2025-01',
          end_date: 'Present',
          is_current: true,
          description: 'Architected the multimodal candidate discovery platform using FastAPI, React 19, Google Gemini 2.5 Flash, and PostGIS geocoding.',
        },
        {
          id: 'exp_2',
          company: 'Cognitive Matrix AI Solutions',
          original_job_title: 'AI Software Engineer',
          normalized_role: 'AI Engineer',
          location: 'Colombo',
          start_date: '2023-06',
          end_date: '2024-12',
          is_current: false,
          description: 'Designed autonomous agent swarms, vector retrieval pipelines, and distributed data processing pipelines for international enterprise clients.',
        },
      ],
      preferred_roles: [
        { id: 'pr_1', role_title: 'AI Systems Architect', normalized_role: 'AI Engineer' },
        { id: 'pr_2', role_title: 'Senior Software Engineer', normalized_role: 'Full Stack Engineer' },
      ],
    },
  },
  personas: {
    prof_candidate_demuni: {
      id: 'per_demuni',
      candidate_id: 'prof_candidate_demuni',
      headline: 'Strategic AI Systems Builder & High-Discipline Full-Stack Engineer',
      summary: 'Demonstrated excellence across end-to-end AI product development, high-throughput backend APIs, and modern frontends. Relentless focus on technical precision, long-term architecture, and autonomous systems.',
      primary_profession: 'AI Systems Architect & Full-Stack Engineer',
      seniority_level: 'Senior / Lead Builder',
      top_skills: ['Python', 'FastAPI', 'TypeScript', 'React', 'AI Engineering', 'PostGIS', 'SQL'],
      experience_summary: '4+ years of hands-on production engineering in AI systems, agent pipelines, and full-stack platforms.',
      education_summary: 'Pearson HND Level 5 in Software Engineering with distinction in systems architecture.',
      suggested_roles: ['AI Systems Architect', 'Lead Full-Stack Engineer', 'Founding AI Engineer', 'Technical Founder'],
      generated_at: '2026-09-07T00:00:00Z',
    },
  },
  organizations: {
    org_apex: {
      id: 'org_apex',
      name: 'Apex Global Technologies',
      industry: 'Enterprise Software & Cloud Systems',
      description: 'Global provider of high-scale cloud platforms, mission-critical microservices, and autonomous developer tooling.',
      website: 'https://apexglobal.tech',
      created_at: '2025-01-01T00:00:00Z',
      recruited_count: 3,
    },
    org_synth: {
      id: 'org_synth',
      name: 'SynthAI Labs',
      industry: 'Generative AI & Autonomous Agents',
      description: 'Frontier research lab engineering intelligent multi-agent systems and real-time vision-language pipelines.',
      website: 'https://synthailabs.ai',
      created_at: '2025-02-10T00:00:00Z',
      recruited_count: 5,
    },
    org_quantum: {
      id: 'org_quantum',
      name: 'Quantum Leap Systems',
      industry: 'FinTech & High-Frequency Infrastructure',
      description: 'Ultra-low latency trading execution layers, cryptographic security protocols, and real-time distributed data engines.',
      website: 'https://quantumleap.io',
      created_at: '2025-03-01T00:00:00Z',
      recruited_count: 2,
    },
    org_horizon: {
      id: 'org_horizon',
      name: 'Horizon Data Dynamics',
      industry: 'Big Data & Geolocation Analytics',
      description: 'Pioneering geospatial neural mapping, large-scale GIS data clustering, and spatial intelligence platforms.',
      website: 'https://horizondata.tech',
      created_at: '2025-04-15T00:00:00Z',
      recruited_count: 4,
    },
  },
  recruited: {
    org_apex: [
      {
        id: 'rec_1',
        candidate_id: 'prof_candidate_demuni',
        status: 'Shortlisted',
        recruited_role: 'Lead AI Systems Architect',
        notes: 'Top tier match for our multimodal core engine initiative.',
        recruited_at: '2026-09-05T14:30:00Z',
        candidate: {
          id: 'prof_candidate_demuni',
          full_name: 'Demuni Jayasmith',
          headline: 'Full-Stack Software Engineer & AI Systems Architect',
          bio: 'High-discipline Software Engineer & Technical Founder specializing in robust full-stack architectures and local AI.',
          total_years_experience: 4,
          city: 'Colombo',
          country: 'Sri Lanka',
          availability_status: 'available_now',
          skills: [
            { name: 'Python', category: 'Backend', years: 4 },
            { name: 'FastAPI', category: 'Backend', years: 3 },
            { name: 'TypeScript', category: 'Frontend', years: 3 },
            { name: 'AI Engineering', category: 'AI', years: 2 },
          ],
          education: [
            { institution: 'Pearson BTEC', degree: 'HND Level 5 Software Engineering', field: 'Software Engineering', year: '2026' },
          ],
          experiences: [
            { company: 'Dullnit Platform', title: 'Lead Systems Architect', start: '2025-01', end: 'Present', description: 'Architected multimodal discovery platform.' },
          ],
        },
      },
    ],
  },
  savedCandidates: {
    usr_recruiter_sarah: ['prof_candidate_demuni'],
  },
  extractions: {},
};

class LocalStoreEngine {
  private state: LocalDBState;

  constructor() {
    this.state = this.load();
  }

  private load(): LocalDBState {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        return {
          ...INITIAL_DB,
          ...parsed,
          users: [
            ...INITIAL_DB.users,
            ...(parsed.users || []).filter((u: any) => !INITIAL_DB.users.some(iu => iu.id === u.id || iu.email.toLowerCase() === u.email.toLowerCase())),
          ],
          profiles: { ...INITIAL_DB.profiles, ...(parsed.profiles || {}) },
          personas: { ...INITIAL_DB.personas, ...(parsed.personas || {}) },
          organizations: { ...INITIAL_DB.organizations, ...(parsed.organizations || {}) },
          recruited: { ...INITIAL_DB.recruited, ...(parsed.recruited || {}) },
        };
      }
    } catch {
      // ignore
    }
    return JSON.parse(JSON.stringify(INITIAL_DB));
  }

  private save(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    } catch (err) {
      console.warn('Failed to persist to localStorage', err);
    }
  }

  // --- Auth & Users ---

  registerUser(payload: {
    email: string;
    password?: string;
    role?: 'candidate' | 'recruiter';
    full_name?: string;
    company_name?: string;
  }): TokenResponse {
    const emailNorm = payload.email.trim().toLowerCase();
    let existing = this.state.users.find(u => u.email.toLowerCase() === emailNorm);

    const role = payload.role || 'candidate';
    const userId = existing ? existing.id : `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const profileId = `prof_${userId}`;

    if (!existing) {
      existing = {
        id: userId,
        email: emailNorm,
        role,
        is_active: true,
        profile_id: profileId,
        full_name: payload.full_name || (role === 'candidate' ? 'New Candidate' : 'Business Partner'),
        company_name: payload.company_name,
        password_hash: payload.password || 'password123',
      };
      this.state.users.push(existing);
    } else {
      existing.full_name = payload.full_name || existing.full_name;
      if (payload.company_name) existing.company_name = payload.company_name;
      existing.role = role;
    }

    if (role === 'candidate') {
      if (!this.state.profiles[userId]) {
        const newProf: CandidateProfile = {
          id: profileId,
          user_id: userId,
          full_name: existing.full_name || 'Candidate',
          headline: 'Emerging Professional',
          bio: 'Building verified professional credentials and exploring opportunities on Dullnit.',
          avatar_url: DEFAULT_PERSONA_PORTRAIT,
          total_years_experience: 1,
          availability_status: 'available_now',
          profile_visibility: 'public',
          is_searchable: true,
          completeness_score: 50,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          location: { id: `loc_${userId}`, city: 'Global', country: 'Worldwide' },
          skills: [
            { id: `sk_${Date.now()}_1`, original_name: 'Problem Solving', normalized_name: 'Problem Solving', category: 'General', years_experience: 1, confidence: 0.9, source: 'user' },
          ],
          education: [],
          experiences: [],
          preferred_roles: [],
        };
        this.state.profiles[userId] = newProf;
      }

      if (!this.state.personas[profileId]) {
        this.state.personas[profileId] = {
          id: `per_${profileId}`,
          candidate_id: profileId,
          headline: this.state.profiles[userId]?.headline || 'Verified Professional Profile',
          summary: `Verified profile for ${existing.full_name}. Prepared for direct recruitment and opportunity matching.`,
          primary_profession: 'Software & Technology Professional',
          seniority_level: 'Practitioner',
          top_skills: ['Problem Solving'],
          suggested_roles: ['Software Engineer', 'Full-Stack Developer'],
          generated_at: new Date().toISOString(),
        };
      }
    }

    if (role === 'recruiter') {
      const orgId = `org_${userId}`;
      if (!this.state.organizations[orgId]) {
        this.state.organizations[orgId] = {
          id: orgId,
          name: payload.company_name || existing.company_name || 'My Enterprise Space',
          industry: 'Technology & Innovation',
          description: 'Hiring verified tech talent directly through Dullnit Intelligent Workspace.',
          created_at: new Date().toISOString(),
          recruited_count: 0,
        };
      }
    }

    this.save();

    const token = `dullnit_jwt_${userId}_${Date.now()}`;
    return {
      access_token: token,
      token_type: 'bearer',
      role,
      user_id: userId,
      profile_id: profileId,
    };
  }

  authenticateUser(payload: { email: string; password?: string }): TokenResponse {
    const emailNorm = payload.email.trim().toLowerCase();
    const user = this.state.users.find(u => u.email.toLowerCase() === emailNorm);

    if (!user) {
      return this.registerUser({
        email: emailNorm,
        password: payload.password,
        role: emailNorm.includes('recruiter') || emailNorm.includes('apex') ? 'recruiter' : 'candidate',
        full_name: emailNorm.split('@')[0],
      });
    }

    const token = `dullnit_jwt_${user.id}_${Date.now()}`;
    return {
      access_token: token,
      token_type: 'bearer',
      role: user.role,
      user_id: user.id,
      profile_id: user.profile_id || `prof_${user.id}`,
    };
  }

  getCurrentUser(token?: string | null): User {
    if (token && token.startsWith('dullnit_jwt_')) {
      const found = this.state.users.find(u => token.includes(u.id));
      if (found) {
        return {
          id: found.id,
          email: found.email,
          role: found.role,
          is_active: found.is_active,
          profile_id: found.profile_id,
        };
      }
    }
    return {
      id: 'usr_candidate_demuni',
      email: 'candidate@dullnit.com',
      role: 'candidate',
      is_active: true,
      profile_id: 'prof_candidate_demuni',
    };
  }

  // --- Candidate Profile ---

  getProfile(userId: string): CandidateProfile {
    if (this.state.profiles[userId]) {
      return this.state.profiles[userId];
    }
    const byProf = Object.values(this.state.profiles).find(p => p.id === userId || p.user_id === userId);
    if (byProf) return byProf;

    return this.state.profiles['usr_candidate_demuni'];
  }

  updateProfile(userId: string, data: Partial<CandidateProfile>): CandidateProfile {
    const prof = this.getProfile(userId);
    Object.assign(prof, data, { updated_at: new Date().toISOString() });
    this.save();
    return prof;
  }

  addSkill(userId: string, skill: { name: string; category?: string; years_experience?: number }): CandidateProfile {
    const prof = this.getProfile(userId);
    const newSkill = {
      id: `sk_${Date.now()}`,
      original_name: skill.name,
      normalized_name: skill.name,
      category: skill.category || 'General',
      years_experience: skill.years_experience || 2,
      confidence: 0.95,
      source: 'user',
    };
    prof.skills = [...(prof.skills || []).filter(s => s.original_name.toLowerCase() !== skill.name.toLowerCase()), newSkill];
    this.save();
    return prof;
  }

  removeSkill(userId: string, skillId: string): CandidateProfile {
    const prof = this.getProfile(userId);
    prof.skills = (prof.skills || []).filter(s => s.id !== skillId && s.original_name !== skillId && s.normalized_name !== skillId);
    this.save();
    return prof;
  }

  addExperience(userId: string, exp: any): CandidateProfile {
    const prof = this.getProfile(userId);
    const newExp = {
      id: `exp_${Date.now()}`,
      company: exp.company,
      original_job_title: exp.original_job_title || exp.title,
      location: exp.location || 'Remote',
      start_date: exp.start_date || '2024-01',
      end_date: exp.end_date || (exp.is_current ? 'Present' : undefined),
      is_current: !!exp.is_current,
      description: exp.description || '',
    };
    prof.experiences = [newExp, ...(prof.experiences || [])];
    this.save();
    return prof;
  }

  addEducation(userId: string, edu: any): CandidateProfile {
    const prof = this.getProfile(userId);
    const newEdu = {
      id: `edu_${Date.now()}`,
      institution: edu.institution,
      original_degree: edu.original_degree || edu.degree,
      field_of_study: edu.field_of_study || '',
      start_date: edu.start_date || '2022',
      end_date: edu.end_date || '2024',
      is_current: !!edu.is_current,
    };
    prof.education = [newEdu, ...(prof.education || [])];
    this.save();
    return prof;
  }

  // --- Persona Engine ---

  getPersona(candidateId: string): CandidatePersona {
    if (this.state.personas[candidateId]) {
      return this.state.personas[candidateId];
    }
    const prof = this.getProfile(candidateId);
    if (prof && this.state.personas[prof.id]) {
      return this.state.personas[prof.id];
    }
    return this.generatePersona(prof ? prof.id : candidateId);
  }

  generatePersona(candidateId: string): CandidatePersona {
    const prof = this.getProfile(candidateId);
    const skills = prof.skills?.map(s => s.normalized_name || s.original_name) || ['Software Engineering', 'System Architecture'];
    const title = prof.headline || (prof.experiences?.[0]?.original_job_title) || 'Software Systems Builder';

    const persona: CandidatePersona = {
      id: `per_${candidateId}_${Date.now()}`,
      candidate_id: candidateId,
      headline: `${title} | Precision Builder`,
      summary: `${prof.full_name} demonstrates exceptional discipline and capabilities in ${skills.slice(0, 3).join(', ')}. Strong capability to build end-to-end architectures from concept to high-scale deployment.`,
      primary_profession: title,
      seniority_level: (prof.total_years_experience || 3) > 5 ? 'Staff / Principal' : (prof.total_years_experience || 3) > 2 ? 'Senior Engineer' : 'Professional Engineer',
      top_skills: skills.slice(0, 7),
      experience_summary: `${prof.total_years_experience || 3}+ years of proven production experience across modern software environments.`,
      education_summary: prof.education?.[0] ? `${prof.education[0].original_degree} at ${prof.education[0].institution}` : 'Accredited Software Engineering Background',
      suggested_roles: [title, 'Senior Full-Stack Engineer', 'AI Systems Architect', 'Tech Lead'],
      generated_at: new Date().toISOString(),
    };

    this.state.personas[candidateId] = persona;
    this.save();
    return persona;
  }

  // --- Resume Upload & Extraction ---

  uploadResume(file: File): { id: string; file_name: string; status: string } {
    const resumeId = `res_${Date.now()}`;
    const extraction: ResumeExtractionResult = {
      personal_information: {
        full_name: file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '),
        email: 'candidate@dullnit.com',
        phone: '+94 77 123 4567',
        city: 'Colombo',
        country: 'Sri Lanka',
      },
      professional_information: {
        current_title: 'Full-Stack Software Engineer',
        headline: 'AI Systems Architect & Full-Stack Engineer',
        professional_summary: 'Experienced builder skilled in modern frontends, robust backend APIs, and autonomous AI agents.',
        estimated_total_experience_years: 4,
      },
      skills: [
        { original_name: 'Python', normalized_name: 'Python', category: 'Backend', confidence: 0.98, source: 'resume' },
        { original_name: 'TypeScript', normalized_name: 'TypeScript', category: 'Frontend', confidence: 0.95, source: 'resume' },
        { original_name: 'FastAPI', normalized_name: 'FastAPI', category: 'Backend', confidence: 0.94, source: 'resume' },
        { original_name: 'React', normalized_name: 'React', category: 'Frontend', confidence: 0.92, source: 'resume' },
        { original_name: 'SQL', normalized_name: 'SQL', category: 'Database', confidence: 0.90, source: 'resume' },
      ],
      education: [
        {
          institution: 'Pearson BTEC Higher National',
          original_degree: 'HND Level 5 in Software Engineering',
          normalized_degree_level: 'HND',
          field_of_study: 'Software Engineering',
          start_date: '2024-01',
          end_date: '2026-06',
        },
      ],
      certifications: [],
      experience: [
        {
          company: 'Dullnit Intelligent Discovery',
          original_job_title: 'Lead Systems Architect',
          location: 'Remote',
          start_date: '2025-01',
          end_date: 'Present',
          current_position: true,
          description: 'Architected multimodal discovery platform with AI integration and geocoding.',
          identified_skills: ['FastAPI', 'React', 'Gemini AI'],
        },
      ],
      languages: ['English'],
      portfolio_links: ['https://github.com'],
      suggested_roles: ['AI Systems Architect', 'Senior Full-Stack Engineer'],
    };

    this.state.extractions[resumeId] = {
      resume_id: resumeId,
      status: 'completed',
      is_confirmed: false,
      reconciled_data: extraction,
    };
    this.save();

    return {
      id: resumeId,
      file_name: file.name,
      status: 'completed',
    };
  }

  getExtractionReview(resumeId: string) {
    if (this.state.extractions[resumeId]) {
      return this.state.extractions[resumeId];
    }
    return {
      resume_id: resumeId,
      status: 'completed',
      is_confirmed: false,
      reconciled_data: Object.values(this.state.extractions)[0]?.reconciled_data || {
        personal_information: { full_name: 'Verified Candidate' },
        professional_information: { current_title: 'Software Engineer' },
        skills: [{ original_name: 'Python', confidence: 0.95, source: 'resume' }],
        education: [],
        certifications: [],
        experience: [],
        languages: ['English'],
        portfolio_links: [],
        suggested_roles: ['Software Engineer'],
      },
    };
  }

  confirmExtraction(userId: string, _resumeId: string, confirmed: ResumeExtractionResult): CandidateProfile {
    const prof = this.getProfile(userId);
    if (confirmed.personal_information?.full_name) {
      prof.full_name = confirmed.personal_information.full_name;
    }
    if (confirmed.professional_information?.headline) {
      prof.headline = confirmed.professional_information.headline;
    }
    if (confirmed.professional_information?.professional_summary) {
      prof.bio = confirmed.professional_information.professional_summary;
    }
    if (confirmed.skills && confirmed.skills.length > 0) {
      prof.skills = confirmed.skills.map((s, idx) => ({
        id: `sk_ext_${idx}`,
        original_name: s.original_name,
        normalized_name: s.normalized_name || s.original_name,
        category: s.category || 'General',
        years_experience: s.estimated_years || 2,
        confidence: s.confidence || 0.9,
        source: 'resume',
      }));
    }
    if (confirmed.experience && confirmed.experience.length > 0) {
      prof.experiences = confirmed.experience.map((e, idx) => ({
        id: `exp_ext_${idx}`,
        company: e.company,
        original_job_title: e.original_job_title,
        location: e.location || 'Remote',
        start_date: e.start_date || '2024-01',
        end_date: e.end_date || (e.current_position ? 'Present' : undefined),
        is_current: !!e.current_position,
        description: e.description || '',
      }));
    }
    if (confirmed.education && confirmed.education.length > 0) {
      prof.education = confirmed.education.map((edu, idx) => ({
        id: `edu_ext_${idx}`,
        institution: edu.institution,
        original_degree: edu.original_degree,
        field_of_study: edu.field_of_study,
        start_date: edu.start_date,
        end_date: edu.end_date,
        is_current: false,
      }));
    }
    this.save();
    return prof;
  }

  // --- Recruiter Search & Pipeline ---

  searchCandidates(criteria: any): { items: CandidateSearchResult[]; total: number } {
    const list: CandidateSearchResult[] = [
      {
        candidate_id: 'prof_candidate_demuni',
        display_name: 'Demuni Jayasmith',
        headline: 'Lead AI Systems Architect & Senior Full-Stack Engineer',
        summary: 'High-discipline builder specializing in multimodal AI platforms, FastAPI microservices, and React 19 architecture.',
        avatar_url: DEFAULT_PERSONA_PORTRAIT,
        email: 'candidate@dullnit.com',
        phone: '+94 77 123 4567',
        total_years_experience: 4,
        city: 'Colombo',
        country: 'Sri Lanka',
        top_skills: ['Python', 'FastAPI', 'TypeScript', 'React', 'AI Engineering', 'PostGIS'],
        match_score: 96,
        match_reasons: ['Exact match for Python & AI Engineering', 'Full-stack platform architect', 'Top-tier persona match'],
        profile_visibility: 'public',
        availability_status: 'available_now',
      },
      {
        candidate_id: 'prof_alex_vance',
        display_name: 'Alexander Vance',
        headline: 'Staff Cloud Infrastructure & Distributed Systems Engineer',
        summary: 'Deep expertise in Kubernetes, multi-region AWS/GCP clusters, Terraform, and high-throughput Kafka streaming.',
        avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80',
        total_years_experience: 8,
        city: 'Singapore',
        country: 'Singapore',
        top_skills: ['Kubernetes', 'Go', 'AWS', 'Terraform', 'Kafka', 'Distributed Systems'],
        match_score: 91,
        match_reasons: ['8+ years distributed systems', 'Senior cloud lead credentials'],
        profile_visibility: 'public',
        availability_status: 'open_to_offers',
      },
      {
        candidate_id: 'prof_elena_rostova',
        display_name: 'Elena Rostova',
        headline: 'Lead ML Engineer & GenAI Architect',
        summary: 'Specialized in fine-tuning open-weights LLMs, vLLM acceleration, RAG vector pipelines, and multimodal inference.',
        avatar_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80',
        total_years_experience: 6,
        city: 'Berlin',
        country: 'Germany',
        top_skills: ['PyTorch', 'vLLM', 'HuggingFace', 'Python', 'MLOps', 'Vector DBs'],
        match_score: 89,
        match_reasons: ['GenAI production models', 'High efficiency LLM deployment'],
        profile_visibility: 'public',
        availability_status: 'available_now',
      },
      {
        candidate_id: 'prof_marcus_chen',
        display_name: 'Marcus Chen',
        headline: 'Senior Full-Stack Product Engineer',
        summary: 'Product-minded engineer with extensive experience building fast-paced SaaS products, interactive canvases, and design systems.',
        avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80',
        total_years_experience: 5,
        city: 'San Francisco',
        country: 'United States',
        top_skills: ['TypeScript', 'Next.js', 'React', 'Node.js', 'TailwindCSS', 'GraphQL'],
        match_score: 85,
        match_reasons: ['High velocity UI/UX engineering', 'Modern frontend specialist'],
        profile_visibility: 'public',
        availability_status: 'available_now',
      },
    ];

    const q = criteria?.query?.toLowerCase() || '';
    const filtered = q
      ? list.filter(c =>
          c.display_name.toLowerCase().includes(q) ||
          c.headline?.toLowerCase().includes(q) ||
          c.top_skills.some(s => s.toLowerCase().includes(q))
        )
      : list;

    return { items: filtered, total: filtered.length };
  }

  getCandidateDetail(candidateId: string): RecruiterCandidateDetail {
    if (candidateId === 'prof_candidate_demuni' || candidateId.includes('demuni')) {
      const prof = this.getProfile('usr_candidate_demuni');
      const persona = this.getPersona('prof_candidate_demuni');
      return {
        candidate_id: 'prof_candidate_demuni',
        display_name: prof.full_name,
        headline: prof.headline,
        bio: prof.bio,
        avatar_url: prof.avatar_url,
        email: 'candidate@dullnit.com',
        phone: prof.phone,
        total_years_experience: prof.total_years_experience,
        city: prof.location?.city,
        country: prof.location?.country,
        skills: prof.skills.map(s => ({ name: s.normalized_name || s.original_name, years: s.years_experience, category: s.category })),
        education: prof.education.map(e => ({ degree: e.original_degree, institution: e.institution, field: e.field_of_study })),
        experiences: prof.experiences.map(e => ({ title: e.original_job_title, company: e.company, description: e.description })),
        certifications: [],
        preferred_roles: ['AI Systems Architect', 'Senior Full-Stack Engineer'],
        persona,
        profile_visibility: 'public',
      };
    }

    return {
      candidate_id: candidateId,
      display_name: 'Alexander Vance',
      headline: 'Staff Cloud Infrastructure & Distributed Systems Engineer',
      bio: 'Deep expertise in Kubernetes, multi-region AWS/GCP clusters, and distributed systems.',
      avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80',
      email: 'alex.vance@cloudsystems.net',
      total_years_experience: 8,
      city: 'Singapore',
      country: 'Singapore',
      skills: [
        { name: 'Kubernetes', years: 6, category: 'Infrastructure' },
        { name: 'Go', years: 5, category: 'Backend' },
        { name: 'AWS', years: 8, category: 'Cloud' },
      ],
      education: [{ degree: 'B.S. in Computer Science', institution: 'National University of Singapore' }],
      experiences: [{ title: 'Staff Systems Architect', company: 'Global Cloud Mesh', description: 'Architected high-throughput infrastructure.' }],
      certifications: [{ name: 'AWS Certified Solutions Architect Professional' }],
      preferred_roles: ['Staff Cloud Engineer', 'Head of Infrastructure'],
      profile_visibility: 'public',
    };
  }

  // --- Organization Views & Expressions of Interest ---

  exploreOrganizations(): { items: any[]; total: number } {
    const list = Object.values(this.state.organizations);
    return { items: list, total: list.length };
  }

  expressInterest(orgId: string, _message?: string) {
    return {
      success: true,
      message: 'Expression of interest sent directly to organization talent partners.',
      org_id: orgId,
    };
  }

  getRecruitedCandidates(orgId: string = 'org_apex') {
    const items = this.state.recruited[orgId] || [];
    const org = this.state.organizations[orgId] || { name: 'Apex Global Technologies' };
    return {
      organization_id: orgId,
      organization_name: org.name,
      total: items.length,
      items,
    };
  }

  recruitCandidate(data: { candidate_id: string; status?: string; recruited_role?: string; notes?: string }) {
    const orgId = 'org_apex';
    if (!this.state.recruited[orgId]) {
      this.state.recruited[orgId] = [];
    }

    const detail = this.getCandidateDetail(data.candidate_id);
    const existingIdx = this.state.recruited[orgId].findIndex(r => r.candidate_id === data.candidate_id);

    const record: RecruitedCandidate = {
      id: `rec_${Date.now()}`,
      candidate_id: data.candidate_id,
      status: data.status || 'Interviewing',
      recruited_role: data.recruited_role || detail.headline || 'Senior Software Engineer',
      notes: data.notes || 'Recruited via Dullnit Talent Discovery.',
      recruited_at: new Date().toISOString(),
      candidate: {
        id: detail.candidate_id,
        full_name: detail.display_name,
        headline: detail.headline,
        bio: detail.bio,
        total_years_experience: detail.total_years_experience,
        city: detail.city,
        country: detail.country,
        skills: detail.skills,
        education: detail.education,
        experiences: detail.experiences,
        persona: detail.persona,
      },
    };

    if (existingIdx >= 0) {
      this.state.recruited[orgId][existingIdx] = record;
    } else {
      this.state.recruited[orgId].unshift(record);
    }

    this.save();
    return record;
  }

  updateRecruitmentStatus(candidateId: string, data: { status?: string; recruited_role?: string; notes?: string }) {
    const orgId = 'org_apex';
    const list = this.state.recruited[orgId] || [];
    const target = list.find(r => r.candidate_id === candidateId);
    if (target) {
      if (data.status) target.status = data.status;
      if (data.recruited_role) target.recruited_role = data.recruited_role;
      if (data.notes) target.notes = data.notes;
      this.save();
    }
    return target || { success: true };
  }

  removeRecruitedCandidate(candidateId: string) {
    const orgId = 'org_apex';
    if (this.state.recruited[orgId]) {
      this.state.recruited[orgId] = this.state.recruited[orgId].filter(r => r.candidate_id !== candidateId);
      this.save();
    }
    return { success: true };
  }
}

export const localStore = new LocalStoreEngine();
