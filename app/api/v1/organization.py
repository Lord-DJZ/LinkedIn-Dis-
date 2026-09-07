from typing import Any, Dict, List, Optional
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.organization import Organization, RecruitedCandidate
from app.models.candidate import CandidateProfile
from app.core.errors import EntityNotFoundException, ForbiddenException

router = APIRouter(prefix="/organization", tags=["Organization & Recruitment Operations"])


# ── Schemas ──
class OrganizationUpdate(BaseModel):
    name: Optional[str] = None
    industry: Optional[str] = None
    description: Optional[str] = None
    website: Optional[str] = None


class RecruitCandidateRequest(BaseModel):
    candidate_id: str
    status: Optional[str] = "Recruited"
    recruited_role: Optional[str] = None
    notes: Optional[str] = None


class UpdateRecruitmentRequest(BaseModel):
    status: Optional[str] = None
    recruited_role: Optional[str] = None
    notes: Optional[str] = None


def get_or_create_organization(db: Session, user: User) -> Organization:
    org = db.query(Organization).filter(Organization.owner_id == user.id).first()
    if not org:
        # Default name based on company or user email
        default_name = "Apex Talent Labs"
        if user.recruiter_profile and user.recruiter_profile.company_name:
            default_name = user.recruiter_profile.company_name
        elif user.email:
            company_part = user.email.split("@")[0].replace(".", " ").title()
            default_name = f"{company_part} Organization"

        org = Organization(
            owner_id=user.id,
            name=default_name,
            industry="Technology & Software Engineering",
            description="Leading innovation in intelligent talent matching and digital engineering teams.",
            website="https://dullnit.com"
        )
        db.add(org)
        db.commit()
        db.refresh(org)
    return org


@router.get("")
def get_my_organization(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    org = get_or_create_organization(db, current_user)
    recruited_count = db.query(RecruitedCandidate).filter(RecruitedCandidate.organization_id == org.id).count()
    return {
        "id": org.id,
        "name": org.name,
        "industry": org.industry,
        "description": org.description,
        "website": org.website,
        "created_at": org.created_at,
        "recruited_count": recruited_count
    }


@router.put("")
def update_my_organization(
    payload: OrganizationUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    org = get_or_create_organization(db, current_user)
    if payload.name is not None:
        org.name = payload.name.strip()
    if payload.industry is not None:
        org.industry = payload.industry.strip()
    if payload.description is not None:
        org.description = payload.description.strip()
    if payload.website is not None:
        org.website = payload.website.strip()

    db.commit()
    db.refresh(org)
    return {
        "id": org.id,
        "name": org.name,
        "industry": org.industry,
        "description": org.description,
        "website": org.website,
        "created_at": org.created_at
    }


@router.get("/recruited")
def list_recruited_candidates(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    org = get_or_create_organization(db, current_user)
    records = db.query(RecruitedCandidate).filter(RecruitedCandidate.organization_id == org.id).order_by(RecruitedCandidate.recruited_at.desc()).all()

    items = []
    for r in records:
        cand: CandidateProfile = r.candidate
        if not cand:
            continue

        # Extract structured details
        skills_data = [{"name": s.normalized_name, "category": s.category, "years": s.years_experience} for s in cand.skills]
        edu_data = [{"institution": e.institution, "degree": e.original_degree, "field": e.field_of_study, "year": e.end_date} for e in cand.education]
        exp_data = [{"company": ex.company, "title": ex.original_job_title, "start": ex.start_date, "end": ex.end_date, "description": ex.description} for ex in cand.experiences]
        
        persona_dict = None
        if cand.persona:
            persona_dict = {
                "headline": cand.persona.headline,
                "summary": cand.persona.summary,
                "primary_profession": cand.persona.primary_profession,
                "seniority_level": cand.persona.seniority_level,
                "top_skills": cand.persona.top_skills or [],
                "experience_summary": cand.persona.experience_summary,
                "education_summary": cand.persona.education_summary,
                "suggested_roles": cand.persona.suggested_roles or []
            }

        items.append({
            "id": r.id,
            "candidate_id": cand.id,
            "status": r.status,
            "recruited_role": r.recruited_role or cand.headline,
            "notes": r.notes,
            "recruited_at": r.recruited_at,
            "candidate": {
                "id": cand.id,
                "full_name": cand.full_name,
                "headline": cand.headline,
                "bio": cand.bio,
                "total_years_experience": cand.total_years_experience,
                "city": cand.location.city if cand.location else None,
                "country": cand.location.country if cand.location else None,
                "availability_status": cand.availability_status,
                "skills": skills_data,
                "education": edu_data,
                "experiences": exp_data,
                "persona": persona_dict
            }
        })

    return {
        "organization_id": org.id,
        "organization_name": org.name,
        "total": len(items),
        "items": items
    }


@router.post("/recruit")
def recruit_candidate(
    payload: RecruitCandidateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    org = get_or_create_organization(db, current_user)
    cand = db.query(CandidateProfile).filter(CandidateProfile.id == payload.candidate_id).first()
    if not cand:
        raise EntityNotFoundException(f"Candidate profile {payload.candidate_id} not found.")

    existing = db.query(RecruitedCandidate).filter(
        RecruitedCandidate.organization_id == org.id,
        RecruitedCandidate.candidate_id == cand.id
    ).first()

    if existing:
        existing.status = payload.status or "Recruited"
        if payload.recruited_role:
            existing.recruited_role = payload.recruited_role
        if payload.notes:
            existing.notes = payload.notes
        db.commit()
        db.refresh(existing)
        return {"success": True, "message": "Recruitment record updated.", "recruitment_id": existing.id, "status": existing.status}

    record = RecruitedCandidate(
        organization_id=org.id,
        candidate_id=cand.id,
        status=payload.status or "Recruited",
        recruited_role=payload.recruited_role or cand.headline,
        notes=payload.notes,
        recruited_at=datetime.now(timezone.utc)
    )
    db.add(record)
    db.commit()
    db.refresh(record)

    return {"success": True, "message": f"{cand.full_name} has been recruited to {org.name}.", "recruitment_id": record.id, "status": record.status}


@router.patch("/recruit/{candidate_id}")
def update_recruitment_status(
    candidate_id: str,
    payload: UpdateRecruitmentRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    org = get_or_create_organization(db, current_user)
    record = db.query(RecruitedCandidate).filter(
        RecruitedCandidate.organization_id == org.id,
        RecruitedCandidate.candidate_id == candidate_id
    ).first()

    if not record:
        raise EntityNotFoundException(f"Candidate {candidate_id} is not recruited in organization {org.name}.")

    if payload.status is not None:
        record.status = payload.status
    if payload.recruited_role is not None:
        record.recruited_role = payload.recruited_role
    if payload.notes is not None:
        record.notes = payload.notes

    db.commit()
    db.refresh(record)
    return {"success": True, "recruitment_id": record.id, "status": record.status}


@router.delete("/recruit/{candidate_id}")
def remove_recruited_candidate(
    candidate_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    org = get_or_create_organization(db, current_user)
    record = db.query(RecruitedCandidate).filter(
        RecruitedCandidate.organization_id == org.id,
        RecruitedCandidate.candidate_id == candidate_id
    ).first()

    if not record:
        raise EntityNotFoundException(f"Candidate {candidate_id} is not in your organization.")

    db.delete(record)
    db.commit()
    return {"success": True, "message": "Candidate removed from organization recruited list."}
