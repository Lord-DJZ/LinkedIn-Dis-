from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.api.deps import require_recruiter
from app.models.user import User, RecruiterProfile
from app.models.candidate import CandidateProfile
from app.schemas.candidate import CandidateProfileResponse
from app.schemas.persona import CandidatePersonaResponse
from app.core.errors import EntityNotFoundException, ForbiddenException

router = APIRouter(prefix="/recruiters", tags=["Recruiter Operations"])


class RecruiterProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    company_name: Optional[str] = None
    department: Optional[str] = None
    contact_phone: Optional[str] = None


class RecruiterCandidateDetailResponse(BaseModel):
    candidate_id: str
    display_name: str
    headline: Optional[str] = None
    bio: Optional[str] = None
    total_years_experience: float
    city: Optional[str] = None
    country: Optional[str] = None
    skills: List[Dict[str, Any]] = []
    education: List[Dict[str, Any]] = []
    experiences: List[Dict[str, Any]] = []
    certifications: List[Dict[str, Any]] = []
    preferred_roles: List[str] = []
    persona: Optional[CandidatePersonaResponse] = None
    profile_visibility: str




@router.get("/profile")
def get_recruiter_profile(user: User = Depends(require_recruiter)):
    """Get recruiter profile details."""
    return user.recruiter_profile


@router.put("/profile")
def update_recruiter_profile(
    updates: RecruiterProfileUpdate,
    user: User = Depends(require_recruiter),
    db: Session = Depends(get_db)
):
    """Update recruiter company and contact information."""
    rec: RecruiterProfile = user.recruiter_profile
    if updates.full_name is not None:
        rec.full_name = updates.full_name
    if updates.company_name is not None:
        rec.company_name = updates.company_name
    if updates.department is not None:
        rec.department = updates.department
    if updates.contact_phone is not None:
        rec.contact_phone = updates.contact_phone

    db.commit()
    db.refresh(rec)
    return rec


@router.get("/candidates/{candidate_id}", response_model=RecruiterCandidateDetailResponse)
def get_candidate_for_recruiter(
    candidate_id: str,
    user: User = Depends(require_recruiter),
    db: Session = Depends(get_db)
):
    """
    View candidate professional details.
    Protects candidate privacy: redacts private contact details for anonymous profiles.
    Does NOT expose raw resume documents.
    """
    cand = db.query(CandidateProfile).filter(CandidateProfile.id == candidate_id).first()
    if not cand:
        raise EntityNotFoundException("CandidateProfile", candidate_id)

    if cand.profile_visibility == "private":
        raise ForbiddenException("This candidate profile has been marked private.")

    display_name = cand.full_name
    if cand.profile_visibility == "anonymous":
        display_name = f"Anonymous Professional ({cand.headline or 'Engineer'})"

    persona_resp = None
    if cand.persona:
        persona_resp = CandidatePersonaResponse.model_validate(cand.persona)

    return RecruiterCandidateDetailResponse(
        candidate_id=cand.id,
        display_name=display_name,
        headline=cand.headline,
        bio=cand.bio,
        total_years_experience=cand.total_years_experience,
        city=cand.location.city if cand.location else None,
        country=cand.location.country if cand.location else None,
        skills=[{"name": s.normalized_name, "years": s.years_experience, "category": s.category} for s in cand.skills],
        education=[{"degree": e.original_degree, "institution": e.institution, "field": e.field_of_study, "level": e.normalized_degree_level} for e in cand.education],
        experiences=[{"title": x.original_job_title, "company": x.company, "role": x.normalized_role, "duration": f"{x.start_date or ''} - {x.end_date or 'Present'}", "description": x.description} for x in cand.experiences],
        certifications=[{"name": c.name, "organization": c.issuing_organization} for c in cand.certifications],
        preferred_roles=[r.normalized_role or r.role_title for r in cand.preferred_roles],
        persona=persona_resp,
        profile_visibility=cand.profile_visibility
    )
