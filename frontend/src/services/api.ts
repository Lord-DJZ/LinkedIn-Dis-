import type {
  TokenResponse,
  User,
  CandidateProfile,
  CandidatePersona,
  ResumeExtractionResult,
  CandidateSearchResult,
  RecruiterCandidateDetail,
} from '../types';

const API_BASE_URL = 'http://localhost:8000/api/v1';

class ApiService {
  private getToken(): string | null {
    return localStorage.getItem('dullnit_token');
  }

  setToken(token: string) {
    localStorage.setItem('dullnit_token', token);
  }

  clearToken() {
    localStorage.removeItem('dullnit_token');
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      ...(options.headers as Record<string, string> || {}),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    if (!(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: 'Network request failed' }));
      throw new Error(errorData.detail || `Request failed with status ${response.status}`);
    }

    return response.json();
  }

  // Auth
  async register(data: any): Promise<TokenResponse> {
    const res = await this.request<TokenResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    this.setToken(res.access_token);
    return res;
  }

  async login(data: any): Promise<TokenResponse> {
    const res = await this.request<TokenResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    this.setToken(res.access_token);
    return res;
  }

  async getMe(): Promise<User> {
    return this.request<User>('/auth/me');
  }

  async ensureCandidateAuth(): Promise<string> {
    const existing = this.getToken();
    if (existing) {
      try {
        const me = await this.getMe();
        if (me.role === 'candidate') {
          return existing;
        }
      } catch {
        this.clearToken();
      }
    }
    // Auto login real candidate or register
    try {
      const res = await this.login({
        email: 'candidate@dullnit.com',
        password: 'CandidateSecure2026!',
      });
      return res.access_token;
    } catch {
      const reg = await this.register({
        email: 'candidate@dullnit.com',
        password: 'CandidateSecure2026!',
        role: 'candidate',
        full_name: 'Demuni Jayasmith',
      });
      return reg.access_token;
    }
  }

  async ensureRecruiterAuth(): Promise<string> {
    const existing = this.getToken();
    if (existing) {
      try {
        const me = await this.getMe();
        if (me.role === 'recruiter') {
          return existing;
        }
      } catch {
        this.clearToken();
      }
    }
    // Auto login real organization recruiter
    try {
      const res = await this.login({
        email: 'recruiter@apexglobal.tech',
        password: 'ApexEnterprise2026!',
      });
      return res.access_token;
    } catch {
      const reg = await this.register({
        email: 'recruiter@apexglobal.tech',
        password: 'ApexEnterprise2026!',
        role: 'recruiter',
        full_name: 'Sarah Jenkins',
        company_name: 'Apex Global Technologies',
      });
      return reg.access_token;
    }
  }

  // Candidate Profile
  async getMyProfile(): Promise<CandidateProfile> {
    return this.request<CandidateProfile>('/candidates/profile');
  }

  async updateProfile(data: any): Promise<CandidateProfile> {
    return this.request<CandidateProfile>('/candidates/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async setLocation(data: any): Promise<any> {
    return this.request('/candidates/location', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async addSkill(name: string, category?: string, years?: number): Promise<any> {
    return this.request('/candidates/skills', {
      method: 'POST',
      body: JSON.stringify({ name, category, years_experience: years }),
    });
  }

  async removeSkill(skillId: string): Promise<any> {
    return this.request(`/candidates/skills/${skillId}`, {
      method: 'DELETE',
    });
  }

  async addExperience(exp: {
    company: string;
    original_job_title: string;
    location?: string;
    start_date?: string;
    end_date?: string;
    is_current?: boolean;
    description?: string;
  }): Promise<any> {
    return this.request('/candidates/experience', {
      method: 'POST',
      body: JSON.stringify(exp),
    });
  }

  async addEducation(edu: {
    institution: string;
    original_degree: string;
    field_of_study?: string;
    start_date?: string;
    end_date?: string;
    is_current?: boolean;
  }): Promise<any> {
    return this.request('/candidates/education', {
      method: 'POST',
      body: JSON.stringify(edu),
    });
  }

  async getPersona(): Promise<CandidatePersona> {
    return this.request<CandidatePersona>('/candidates/persona');
  }

  async regeneratePersona(): Promise<CandidatePersona> {
    return this.request<CandidatePersona>('/candidates/persona/regenerate', {
      method: 'POST',
    });
  }

  // Resumes
  async uploadResume(file: File): Promise<{ id: string; file_name: string; status: string }> {
    const formData = new FormData();
    formData.append('file', file);
    return this.request('/resumes/upload?process_now=true', {
      method: 'POST',
      body: formData,
    });
  }

  async getResumeStatus(resumeId: string): Promise<any> {
    return this.request(`/resumes/${resumeId}/status`);
  }

  async getExtractionReview(resumeId: string): Promise<{
    resume_id: string;
    status: string;
    is_confirmed: boolean;
    reconciled_data: ResumeExtractionResult;
  }> {
    return this.request(`/resumes/${resumeId}/extraction`);
  }

  async updateExtraction(resumeId: string, reconciled_data: ResumeExtractionResult): Promise<any> {
    return this.request(`/resumes/${resumeId}/extraction`, {
      method: 'PATCH',
      body: JSON.stringify({ reconciled_data }),
    });
  }

  async confirmExtraction(resumeId: string, confirmed_data: ResumeExtractionResult): Promise<CandidateProfile> {
    return this.request<CandidateProfile>(`/resumes/${resumeId}/confirm`, {
      method: 'POST',
      body: JSON.stringify({ confirmed_data }),
    });
  }

  // Recruiter Search
  async searchCandidates(criteria: any): Promise<{ items: CandidateSearchResult[]; total: number }> {
    return this.request('/search/candidates', {
      method: 'POST',
      body: JSON.stringify(criteria),
    });
  }

  async naturalLanguageSearch(query: string): Promise<{
    items: CandidateSearchResult[];
    total: number;
    parsed_criteria: any;
  }> {
    return this.request('/search/candidates/nl', {
      method: 'POST',
      body: JSON.stringify({ query }),
    });
  }

  async getCandidateDetail(candidateId: string): Promise<RecruiterCandidateDetail> {
    return this.request<RecruiterCandidateDetail>(`/recruiters/candidates/${candidateId}`);
  }

  // Admin
  async getSystemStatus(): Promise<any> {
    return this.request('/admin/system/status');
  }

  // Organization & Recruitment
  async getOrganization(): Promise<any> {
    return this.request('/organization');
  }

  async updateOrganization(data: any): Promise<any> {
    return this.request('/organization', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async getRecruitedCandidates(): Promise<{ organization_id: string; organization_name: string; total: number; items: any[] }> {
    return this.request('/organization/recruited');
  }

  async recruitCandidate(data: { candidate_id: string; status?: string; recruited_role?: string; notes?: string }): Promise<any> {
    return this.request('/organization/recruit', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateRecruitmentStatus(candidateId: string, data: { status?: string; recruited_role?: string; notes?: string }): Promise<any> {
    return this.request(`/organization/recruit/${candidateId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async removeRecruitedCandidate(candidateId: string): Promise<any> {
    return this.request(`/organization/recruit/${candidateId}`, {
      method: 'DELETE',
    });
  }

  // Role Switching
  async switchRole(targetRole: 'candidate' | 'recruiter'): Promise<{ access_token: string; token_type: string; role: string; email: string }> {
    const res = await this.request<any>('/auth/switch-role', {
      method: 'POST',
      body: JSON.stringify({ target_role: targetRole }),
    });
    if (res.access_token) {
      this.setToken(res.access_token);
    }
    return res;
  }

  // Company Directory & Expression of Interest (Candidate View)
  async exploreOrganizations(): Promise<{ items: any[]; total: number }> {
    return this.request('/organization/explore');
  }

  async expressInterest(orgId: string, message?: string): Promise<any> {
    return this.request(`/organization/${orgId}/express-interest`, {
      method: 'POST',
      body: JSON.stringify({ message }),
    });
  }

  // AI Configuration & API Key
  async getApiKeyStatus(): Promise<any> {
    return this.request('/admin/api-key');
  }

  async testAndSaveApiKey(apiKey: string): Promise<any> {
    return this.request('/admin/api-key/test-and-save', {
      method: 'POST',
      body: JSON.stringify({ api_key: apiKey }),
    });
  }
}

export const api = new ApiService();

