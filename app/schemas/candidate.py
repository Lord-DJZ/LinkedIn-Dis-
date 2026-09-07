from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel, Field
from app.schemas.skill import CandidateSkillResponse


class CandidateLocationBase(BaseModel):
    city: Optional[str] = None
    country: Optional[str] = None
    postal_code: Optional[str] = None
    latitude: Optional[float] = Field(None, ge=-90.0, le=90.0)
    longitude: Optional[float] = Field(None, ge=-180.0, le=180.0)


class CandidateLocationResponse(CandidateLocationBase):
    id: str

    class Config:
        from_attributes = True


class CandidateEducationCreate(BaseModel):
    institution: str
    original_degree: str
    normalized_degree_level: Optional[str] = None  # bachelor, master, doctorate, diploma, certificate
    normalized_degree_type: Optional[str] = None
    field_of_study: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    is_current: bool = False


class CandidateEducationResponse(CandidateEducationCreate):
    id: str

    class Config:
        from_attributes = True


class CandidateExperienceCreate(BaseModel):
    company: str
    original_job_title: str
    normalized_role: Optional[str] = None
    location: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    is_current: bool = False
    description: Optional[str] = None


class CandidateExperienceResponse(CandidateExperienceCreate):
    id: str

    class Config:
        from_attributes = True


class CandidateCertificationCreate(BaseModel):
    name: str
    issuing_organization: Optional[str] = None
    issue_date: Optional[str] = None
    expiration_date: Optional[str] = None


class CandidateCertificationResponse(CandidateCertificationCreate):
    id: str

    class Config:
        from_attributes = True


class CandidatePreferredRoleCreate(BaseModel):
    role_title: str
    normalized_role: Optional[str] = None


class CandidatePreferredRoleResponse(CandidatePreferredRoleCreate):
    id: str

    class Config:
        from_attributes = True


class CandidateProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    headline: Optional[str] = None
    bio: Optional[str] = None
    total_years_experience: Optional[float] = Field(None, ge=0)
    availability_status: Optional[str] = Field(None, pattern="^(available|open|not_looking)$")
    profile_visibility: Optional[str] = Field(None, pattern="^(public|anonymous|private)$")
    is_searchable: Optional[bool] = None


class CandidateProfileResponse(BaseModel):
    id: str
    user_id: str
    full_name: str
    headline: Optional[str] = None
    bio: Optional[str] = None
    total_years_experience: float
    availability_status: str
    profile_visibility: str
    is_searchable: bool
    completeness_score: int
    created_at: datetime
    updated_at: datetime

    location: Optional[CandidateLocationResponse] = None
    skills: List[CandidateSkillResponse] = []
    education: List[CandidateEducationResponse] = []
    experiences: List[CandidateExperienceResponse] = []
    certifications: List[CandidateCertificationResponse] = []
    preferred_roles: List[CandidatePreferredRoleResponse] = []

    class Config:
        from_attributes = True
