from typing import List, Optional
from pydantic import BaseModel, Field


class RecruiterSearchRequest(BaseModel):
    role: Optional[str] = None
    required_skills: List[str] = Field(default_factory=list)
    optional_skills: List[str] = Field(default_factory=list)
    min_experience: Optional[float] = Field(None, ge=0)
    max_experience: Optional[float] = Field(None, ge=0)
    education_level: Optional[str] = None  # bachelor, master, doctorate, etc.
    certification: Optional[str] = None
    city: Optional[str] = None
    country: Optional[str] = None
    latitude: Optional[float] = Field(None, ge=-90.0, le=90.0)
    longitude: Optional[float] = Field(None, ge=-180.0, le=180.0)
    radius_km: Optional[float] = Field(None, gt=0)
    availability: Optional[str] = None
    page: int = Field(default=1, ge=1)
    page_size: int = Field(default=20, ge=1, le=100)


class CandidateSearchResult(BaseModel):
    candidate_id: str
    display_name: str
    headline: Optional[str] = None
    summary: Optional[str] = None
    avatar_url: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    date_of_birth: Optional[str] = None
    gender: Optional[str] = None
    total_years_experience: float
    city: Optional[str] = None
    country: Optional[str] = None
    distance_km: Optional[float] = None
    top_skills: List[str] = []
    match_score: float  # 0 - 100
    match_reasons: List[str] = []
    profile_visibility: str
    availability_status: str


class NaturalLanguageSearchRequest(BaseModel):
    query: str = Field(..., min_length=3, max_length=500)
