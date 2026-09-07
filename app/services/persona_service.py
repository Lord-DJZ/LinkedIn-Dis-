import json
from typing import List, Optional
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from app.models.candidate import CandidateProfile
from app.models.persona import CandidatePersona
from app.ai.factory import LLMProviderFactory
from app.ai.prompts import PERSONA_GENERATION_SYSTEM_PROMPT


class PersonaService:
    """Generates and manages derived Candidate Personas from confirmed structured profiles."""

    @classmethod
    def generate_or_update_persona(cls, db: Session, candidate_id: str) -> CandidatePersona:
        candidate: CandidateProfile = db.query(CandidateProfile).filter(CandidateProfile.id == candidate_id).first()
        if not candidate:
            raise ValueError(f"Candidate {candidate_id} not found.")

        # Extract structured facts
        skills_list = [s.normalized_name for s in candidate.skills]
        top_skills = skills_list[:8]
        years_exp = candidate.total_years_experience or 0.0

        # Estimate seniority
        if years_exp >= 8:
            seniority = "Lead / Principal"
        elif years_exp >= 5:
            seniority = "Senior"
        elif years_exp >= 2:
            seniority = "Mid-Level"
        else:
            seniority = "Junior"

        # Primary profession
        primary_prof = "Software Engineer"
        if candidate.preferred_roles:
            primary_prof = candidate.preferred_roles[0].normalized_role or candidate.preferred_roles[0].role_title
        elif candidate.experiences:
            primary_prof = candidate.experiences[0].normalized_role or candidate.experiences[0].original_job_title

        # Education summary
        edu_summary = None
        if candidate.education:
            highest_edu = candidate.education[0]
            edu_summary = f"{highest_edu.original_degree} from {highest_edu.institution}"

        # Experience summary
        exp_summary = f"{years_exp:.1f} years of professional experience across {len(candidate.experiences)} verified roles."

        # Headline
        headline = candidate.headline or f"{seniority} {primary_prof} with {int(years_exp) if years_exp else 0}+ years of experience"

        # Synthesis of summary
        skills_str = ", ".join(top_skills[:5]) if top_skills else "modern software technologies"
        summary = (
            candidate.bio
            or f"{seniority} {primary_prof} with approximately {years_exp:.1f} years of engineering experience. "
               f"Strongest core skills include {skills_str}. "
               f"Demonstrated track record of delivering resilient and maintainable solutions."
        )

        # Suggested roles
        suggested = [r.normalized_role or r.role_title for r in candidate.preferred_roles]
        if not suggested:
            suggested = [primary_prof, "Software Engineer", "Backend Engineer"]

        # Search keywords
        keywords = " ".join(set(
            skills_list + suggested + [primary_prof, seniority, candidate.full_name] +
            ([candidate.location.city, candidate.location.country] if candidate.location else [])
        ))

        # Check existing persona
        existing_persona = db.query(CandidatePersona).filter(CandidatePersona.candidate_id == candidate_id).first()
        if existing_persona:
            existing_persona.headline = headline
            existing_persona.summary = summary
            existing_persona.primary_profession = primary_prof
            existing_persona.seniority_level = seniority
            existing_persona.top_skills = top_skills
            existing_persona.experience_summary = exp_summary
            existing_persona.education_summary = edu_summary
            existing_persona.suggested_roles = list(dict.fromkeys(suggested))
            existing_persona.search_keywords = keywords
            existing_persona.generated_at = datetime.now(timezone.utc)
            db.commit()
            db.refresh(existing_persona)
            return existing_persona
        else:
            new_persona = CandidatePersona(
                candidate_id=candidate_id,
                headline=headline,
                summary=summary,
                primary_profession=primary_prof,
                seniority_level=seniority,
                top_skills=top_skills,
                experience_summary=exp_summary,
                education_summary=edu_summary,
                suggested_roles=list(dict.fromkeys(suggested)),
                search_keywords=keywords
            )
            db.add(new_persona)
            db.commit()
            db.refresh(new_persona)
            return new_persona
