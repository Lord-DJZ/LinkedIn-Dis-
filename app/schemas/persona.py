from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel


class CandidatePersonaResponse(BaseModel):
    id: str
    candidate_id: str
    headline: str
    summary: str
    primary_profession: str
    seniority_level: str
    top_skills: List[str] = []
    experience_summary: Optional[str] = None
    education_summary: Optional[str] = None
    suggested_roles: List[str] = []
    generated_at: datetime

    class Config:
        from_attributes = True
