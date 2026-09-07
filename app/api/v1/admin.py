from typing import Any, Dict, List
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.api.deps import require_admin
from app.models.user import User
from app.models.skill import Skill, SkillAlias
from app.models.candidate import CandidateProfile
from app.schemas.skill import SkillCreate, SkillResponse, SkillAliasCreate
from app.ai.factory import LLMProviderFactory
from app.core.config import settings
from app.core.errors import EntityNotFoundException, DuplicateEntityException

router = APIRouter(prefix="/admin", tags=["Admin & System"])


@router.get("/skills", response_model=List[SkillResponse])
def list_skills(user: User = Depends(require_admin), db: Session = Depends(get_db)):
    """List all canonical skills and their configured aliases."""
    skills = db.query(Skill).all()
    results = []
    for s in skills:
        results.append(SkillResponse(
            id=s.id,
            canonical_name=s.canonical_name,
            category=s.category,
            aliases=[a.alias for a in s.aliases]
        ))
    return results


@router.post("/skills", response_model=SkillResponse, status_code=status.HTTP_201_CREATED)
def create_skill(
    skill_in: SkillCreate,
    user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Add a new canonical skill to the taxonomy."""
    existing = db.query(Skill).filter(Skill.canonical_name == skill_in.canonical_name).first()
    if existing:
        raise DuplicateEntityException("Skill", "canonical_name", skill_in.canonical_name)

    skill = Skill(
        canonical_name=skill_in.canonical_name,
        category=skill_in.category
    )
    db.add(skill)
    db.commit()
    db.refresh(skill)
    return SkillResponse(
        id=skill.id,
        canonical_name=skill.canonical_name,
        category=skill.category,
        aliases=[]
    )


@router.post("/skills/{skill_id}/aliases", response_model=SkillResponse)
def add_skill_alias(
    skill_id: str,
    alias_in: SkillAliasCreate,
    user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Map a new alias to an existing canonical skill."""
    skill = db.query(Skill).filter(Skill.id == skill_id).first()
    if not skill:
        raise EntityNotFoundException("Skill", skill_id)

    existing_alias = db.query(SkillAlias).filter(SkillAlias.alias == alias_in.alias).first()
    if existing_alias:
        raise DuplicateEntityException("SkillAlias", "alias", alias_in.alias)

    alias = SkillAlias(skill_id=skill.id, alias=alias_in.alias)
    db.add(alias)
    db.commit()
    db.refresh(skill)

    return SkillResponse(
        id=skill.id,
        canonical_name=skill.canonical_name,
        category=skill.category,
        aliases=[a.alias for a in skill.aliases]
    )


@router.get("/system/status")
def get_system_status(user: User = Depends(require_admin), db: Session = Depends(get_db)) -> Dict[str, Any]:
    """
    Get system health status, AI provider details, and database counts.
    Never exposes API keys or raw credentials.
    """
    llm = LLMProviderFactory.get_provider()
    ai_healthy = False
    try:
        ai_healthy = llm.health_check()
    except Exception:
        ai_healthy = False

    return {
        "status": "healthy",
        "environment": settings.ENVIRONMENT,
        "database": {
            "connected": True,
            "total_users": db.query(User).count(),
            "total_candidates": db.query(CandidateProfile).count(),
            "total_skills": db.query(Skill).count(),
        },
        "ai_integration": {
            "enabled": settings.AI_ENABLED,
            "provider": settings.AI_PROVIDER,
            "primary_model": settings.GEMINI_MODEL,
            "fallback_model": settings.GEMINI_FALLBACK_MODEL,
            "has_api_key": bool(settings.GEMINI_API_KEY),
            "connected": ai_healthy,
        }
    }
