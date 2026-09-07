from typing import Any, Dict, List, Optional
from datetime import datetime
from pydantic import BaseModel, Field


class ExtractedPersonalInfo(BaseModel):
    full_name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    city: Optional[str] = None
    country: Optional[str] = None
    avatar_url: Optional[str] = None
    date_of_birth: Optional[str] = None
    gender: Optional[str] = None


class ExtractedProfessionalInfo(BaseModel):
    current_title: Optional[str] = None
    headline: Optional[str] = None
    professional_summary: Optional[str] = None
    estimated_total_experience_years: Optional[float] = 0.0


class ExtractedSkillItem(BaseModel):
    original_name: str
    normalized_name: Optional[str] = None
    category: Optional[str] = "general"
    estimated_years: Optional[float] = None
    confidence: float = 1.0
    source: str = "llm"


class ExtractedEducationItem(BaseModel):
    institution: str
    original_degree: str
    normalized_degree_level: Optional[str] = None
    normalized_degree_type: Optional[str] = None
    field_of_study: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None


class ExtractedExperienceItem(BaseModel):
    company: str
    original_job_title: str
    normalized_role: Optional[str] = None
    location: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    current_position: bool = False
    description: Optional[str] = None
    identified_skills: List[str] = []


class ExtractedCertificationItem(BaseModel):
    name: str
    issuing_organization: Optional[str] = None
    issued_date: Optional[str] = None
    expiration_date: Optional[str] = None


class ExtractedLanguageItem(BaseModel):
    language: str
    proficiency: Optional[str] = "Professional"


class ResumeExtractionResult(BaseModel):
    personal_information: ExtractedPersonalInfo = Field(default_factory=ExtractedPersonalInfo)
    professional_information: ExtractedProfessionalInfo = Field(default_factory=ExtractedProfessionalInfo)
    skills: List[ExtractedSkillItem] = []
    education: List[ExtractedEducationItem] = []
    certifications: List[ExtractedCertificationItem] = []
    experience: List[ExtractedExperienceItem] = []
    languages: List[ExtractedLanguageItem] = []
    portfolio_links: List[str] = []
    suggested_roles: List[str] = []
    detected_language: Optional[str] = "en"


class ResumeUploadResponse(BaseModel):
    id: str
    file_name: str
    file_size: int
    mime_type: str
    status: str
    created_at: datetime

    class Config:
        from_attributes = True


class ResumeStatusResponse(BaseModel):
    id: str
    status: str
    file_name: str
    error_message: Optional[str] = None
    created_at: datetime
    updated_at: datetime


class ResumeExtractionReviewResponse(BaseModel):
    resume_id: str
    status: str
    is_confirmed: bool
    reconciled_data: ResumeExtractionResult
    rule_based_data: Optional[Dict[str, Any]] = None
    llm_data: Optional[Dict[str, Any]] = None
    candidate_edits: Optional[Dict[str, Any]] = None


class ResumeEditRequest(BaseModel):
    reconciled_data: ResumeExtractionResult


class ResumeConfirmRequest(BaseModel):
    """Candidate submits confirmed data to overwrite/update their authoritative profile."""
    confirmed_data: ResumeExtractionResult
