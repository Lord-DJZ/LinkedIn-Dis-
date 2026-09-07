from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.api.deps import require_candidate, get_current_candidate
from app.models.user import User
from app.models.candidate import CandidateProfile
from app.schemas.candidate import (
    CandidateProfileResponse,
    CandidateProfileUpdate,
    CandidateLocationBase,
    CandidateLocationResponse,
    CandidateEducationCreate,
    CandidateEducationResponse,
    CandidateExperienceCreate,
    CandidateExperienceResponse,
)
from app.schemas.skill import CandidateSkillCreate, CandidateSkillResponse
from app.schemas.persona import CandidatePersonaResponse
from app.schemas.common import MessageResponse
from app.services.profile_service import ProfileService
from app.services.persona_service import PersonaService

router = APIRouter(prefix="/candidates", tags=["Candidate Profile"])


@router.get("/profile", response_model=CandidateProfileResponse)
def get_my_profile(candidate: CandidateProfile = Depends(get_current_candidate)):
    """Get current candidate's profile."""
    return candidate


@router.put("/profile", response_model=CandidateProfileResponse)
def update_my_profile(
    updates: CandidateProfileUpdate,
    user: User = Depends(require_candidate),
    db: Session = Depends(get_db)
):
    """Update profile overview (headline, bio, total experience, visibility)."""
    service = ProfileService(db)
    return service.update_profile(user.id, updates)


@router.put("/location", response_model=CandidateLocationResponse)
def set_location(
    loc: CandidateLocationBase,
    user: User = Depends(require_candidate),
    db: Session = Depends(get_db)
):
    """Set candidate city, country, and geographical coordinates."""
    service = ProfileService(db)
    return service.set_location(user.id, loc)


@router.post("/skills", response_model=CandidateSkillResponse, status_code=status.HTTP_201_CREATED)
def add_skill(
    skill: CandidateSkillCreate,
    user: User = Depends(require_candidate),
    db: Session = Depends(get_db)
):
    """Add a skill to the candidate's profile with automatic normalization."""
    service = ProfileService(db)
    return service.add_skill(user.id, skill)


@router.delete("/skills/{skill_id}", response_model=MessageResponse)
def remove_skill(
    skill_id: str,
    user: User = Depends(require_candidate),
    db: Session = Depends(get_db)
):
    """Remove a skill from the candidate's profile."""
    service = ProfileService(db)
    service.remove_skill(user.id, skill_id)
    return MessageResponse(message="Skill successfully removed.")


@router.post("/education", response_model=CandidateEducationResponse, status_code=status.HTTP_201_CREATED)
def add_education(
    edu: CandidateEducationCreate,
    user: User = Depends(require_candidate),
    db: Session = Depends(get_db)
):
    """Add an education qualification."""
    service = ProfileService(db)
    return service.add_education(user.id, edu)


@router.delete("/education/{education_id}", response_model=MessageResponse)
def remove_education(
    education_id: str,
    user: User = Depends(require_candidate),
    db: Session = Depends(get_db)
):
    """Remove an education record."""
    service = ProfileService(db)
    service.remove_education(user.id, education_id)
    return MessageResponse(message="Education successfully removed.")


@router.post("/experience", response_model=CandidateExperienceResponse, status_code=status.HTTP_201_CREATED)
def add_experience(
    exp: CandidateExperienceCreate,
    user: User = Depends(require_candidate),
    db: Session = Depends(get_db)
):
    """Add an employment experience."""
    service = ProfileService(db)
    return service.add_experience(user.id, exp)


@router.delete("/experience/{experience_id}", response_model=MessageResponse)
def remove_experience(
    experience_id: str,
    user: User = Depends(require_candidate),
    db: Session = Depends(get_db)
):
    """Remove an experience record."""
    service = ProfileService(db)
    service.remove_experience(user.id, experience_id)
    return MessageResponse(message="Experience successfully removed.")


@router.get("/persona", response_model=CandidatePersonaResponse)
def get_persona(
    candidate: CandidateProfile = Depends(get_current_candidate),
    db: Session = Depends(get_db)
):
    """Get the derived Candidate Persona (generates one if missing)."""
    if not candidate.persona:
        return PersonaService.generate_or_update_persona(db, candidate.id)
    return candidate.persona


@router.post("/persona/regenerate", response_model=CandidatePersonaResponse)
def regenerate_persona(
    candidate: CandidateProfile = Depends(get_current_candidate),
    db: Session = Depends(get_db)
):
    """Regenerate candidate persona from current confirmed profile."""
    return PersonaService.generate_or_update_persona(db, candidate.id)
