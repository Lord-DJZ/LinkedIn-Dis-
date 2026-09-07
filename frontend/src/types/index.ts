export interface User {
  id: string;
  email: string;
  role: 'candidate' | 'recruiter' | 'admin';
  is_active: boolean;
  profile_id?: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  role: 'candidate' | 'recruiter' | 'admin';
  user_id: string;
  profile_id?: string;
}

export interface CandidateSkill {
  id: string;
  original_name: string;
  normalized_name: string;
  category?: string;
  years_experience?: number;
  confidence: number;
  source: string;
}

export interface CandidateEducation {
  id: string;
  institution: string;
  original_degree: string;
  normalized_degree_level?: string;
  normalized_degree_type?: string;
  field_of_study?: string;
  start_date?: string;
  end_date?: string;
  is_current: boolean;
}

export interface CandidateExperience {
  id: string;
  company: string;
  original_job_title: string;
  normalized_role?: string;
  location?: string;
  start_date?: string;
  end_date?: string;
  is_current: boolean;
  description?: string;
}

export interface CandidateLocation {
  id: string;
  city?: string;
  country?: string;
  postal_code?: string;
  latitude?: number;
  longitude?: number;
}

export interface CandidateProfile {
  id: string;
  user_id: string;
  full_name: string;
  headline?: string;
  bio?: string;
  total_years_experience: number;
  availability_status: string;
  profile_visibility: 'public' | 'anonymous' | 'private';
  is_searchable: boolean;
  completeness_score: number;
  created_at: string;
  updated_at: string;
  location?: CandidateLocation;
  skills: CandidateSkill[];
  education: CandidateEducation[];
  experiences: CandidateExperience[];
  preferred_roles: { id: string; role_title: string; normalized_role?: string }[];
}

export interface CandidatePersona {
  id: string;
  candidate_id: string;
  headline: string;
  summary: string;
  primary_profession: string;
  seniority_level: string;
  top_skills: string[];
  experience_summary?: string;
  education_summary?: string;
  suggested_roles: string[];
  generated_at: string;
}

export interface ResumeExtractionResult {
  personal_information: {
    full_name?: string;
    email?: string;
    phone?: string;
    city?: string;
    country?: string;
  };
  professional_information: {
    current_title?: string;
    headline?: string;
    professional_summary?: string;
    estimated_total_experience_years?: number;
  };
  skills: Array<{
    original_name: string;
    normalized_name?: string;
    category?: string;
    estimated_years?: number;
    confidence: number;
    source: string;
  }>;
  education: Array<{
    institution: string;
    original_degree: string;
    normalized_degree_level?: string;
    normalized_degree_type?: string;
    field_of_study?: string;
    start_date?: string;
    end_date?: string;
  }>;
  certifications: Array<{
    name: string;
    issuing_organization?: string;
    issued_date?: string;
  }>;
  experience: Array<{
    company: string;
    original_job_title: string;
    normalized_role?: string;
    location?: string;
    start_date?: string;
    end_date?: string;
    current_position: boolean;
    description?: string;
    identified_skills?: string[];
  }>;
  languages: any[];
  portfolio_links: string[];
  suggested_roles: string[];
  detected_language?: string;
}

export interface CandidateSearchResult {
  candidate_id: string;
  display_name: string;
  headline?: string;
  summary?: string;
  total_years_experience: number;
  city?: string;
  country?: string;
  distance_km?: number;
  top_skills: string[];
  match_score: number;
  match_reasons: string[];
  profile_visibility: string;
  availability_status: string;
}

export interface RecruiterCandidateDetail {
  candidate_id: string;
  display_name: string;
  headline?: string;
  bio?: string;
  total_years_experience: number;
  city?: string;
  country?: string;
  skills: Array<{ name: string; years?: number; category?: string }>;
  education: Array<{ degree: string; institution: string; field?: string; level?: string }>;
  experiences: Array<{ title: string; company: string; role?: string; duration?: string; description?: string }>;
  certifications: Array<{ name: string; organization?: string }>;
  preferred_roles: string[];
  persona?: CandidatePersona;
  profile_visibility: string;
}

export interface Organization {
  id: string;
  name: string;
  industry?: string;
  description?: string;
  website?: string;
  created_at: string;
  recruited_count?: number;
}

export interface RecruitedCandidate {
  id: string;
  candidate_id: string;
  status: string; // "Recruited", "Shortlisted", "Interviewing", "Offer Extended"
  recruited_role?: string;
  notes?: string;
  recruited_at: string;
  candidate: {
    id: string;
    full_name: string;
    headline?: string;
    bio?: string;
    total_years_experience: number;
    city?: string;
    country?: string;
    availability_status?: string;
    skills: Array<{ name: string; category?: string; years?: number }>;
    education: Array<{ institution: string; degree: string; field?: string; year?: string }>;
    experiences: Array<{ company: string; title: string; start?: string; end?: string; description?: string }>;
    persona?: CandidatePersona;
  };
}

export interface ApiKeyStatus {
  configured: boolean;
  masked_key?: string;
  provider: string;
  model: string;
  fallback_model?: string;
  connected: boolean;
}

export interface ApiKeySwapResult {
  success: boolean;
  configured: boolean;
  masked_key?: string;
  latency_ms: number;
  model: string;
  message: string;
}

