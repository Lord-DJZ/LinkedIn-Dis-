from typing import List, Optional
from pydantic import BaseModel, Field


class SkillBase(BaseModel):
    canonical_name: str = Field(..., max_length=100)
    category: Optional[str] = Field("general", max_length=50)


class SkillCreate(SkillBase):
    pass


class SkillAliasCreate(BaseModel):
    alias: str = Field(..., max_length=100)


class SkillResponse(SkillBase):
    id: str
    aliases: List[str] = []

    class Config:
        from_attributes = True


class CandidateSkillCreate(BaseModel):
    name: str = Field(..., description="Skill name (will be normalized)")
    category: Optional[str] = None
    years_experience: Optional[float] = Field(None, ge=0)


class CandidateSkillResponse(BaseModel):
    id: str
    original_name: str
    normalized_name: str
    category: Optional[str] = None
    years_experience: Optional[float] = None
    confidence: float
    source: str

    class Config:
        from_attributes = True
