from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.candidate import (
    CandidateProfile,
    CandidateLocation,
    CandidateSkill,
    CandidateEducation,
    CandidateExperience,
    CandidateCertification,
    CandidatePreferredRole,
)
from app.models.skill import Skill
from app.schemas.candidate import (
    CandidateProfileUpdate,
    CandidateLocationBase,
    CandidateEducationCreate,
    CandidateExperienceCreate,
    CandidateCertificationCreate,
    CandidatePreferredRoleCreate,
)
from app.schemas.skill import CandidateSkillCreate
from app.normalization.service import NormalizationService
from app.services.persona_service import PersonaService
from app.core.errors import EntityNotFoundException


class ProfileService:
    """Handles manual candidate profile creation, incremental updates, and visibility."""

    def __init__(self, db: Session):
        self.db = db
        self.normalizer = NormalizationService(db)

    def get_profile_by_user_id(self, user_id: str) -> CandidateProfile:
        profile = self.db.query(CandidateProfile).filter(CandidateProfile.user_id == user_id).first()
        if not profile:
            raise EntityNotFoundException("CandidateProfile", user_id)
        return profile

    def update_profile(self, user_id: str, updates: CandidateProfileUpdate) -> CandidateProfile:
        profile = self.get_profile_by_user_id(user_id)
        if updates.full_name is not None:
            profile.full_name = updates.full_name
        if updates.headline is not None:
            profile.headline = updates.headline
        if updates.bio is not None:
            profile.bio = updates.bio
        if updates.total_years_experience is not None:
            profile.total_years_experience = updates.total_years_experience
        if updates.availability_status is not None:
            profile.availability_status = updates.availability_status
        if updates.profile_visibility is not None:
            profile.profile_visibility = updates.profile_visibility
        if updates.is_searchable is not None:
            profile.is_searchable = updates.is_searchable

        self._refresh_completeness(profile)
        self.db.commit()
        self.db.refresh(profile)
        return profile

    def set_location(self, user_id: str, loc_data: CandidateLocationBase) -> CandidateLocation:
        profile = self.get_profile_by_user_id(user_id)
        loc = profile.location
        if not loc:
            loc = CandidateLocation(candidate_id=profile.id)
            self.db.add(loc)

        loc.city = loc_data.city
        loc.country = loc_data.country
        loc.postal_code = loc_data.postal_code
        loc.latitude = loc_data.latitude
        loc.longitude = loc_data.longitude
        if loc_data.latitude is not None and loc_data.longitude is not None:
            loc.coordinates = f"SRID=4326;POINT({loc_data.longitude} {loc_data.latitude})"

        self._refresh_completeness(profile)
        self.db.commit()
        self.db.refresh(loc)
        return loc

    def add_skill(self, user_id: str, skill_in: CandidateSkillCreate) -> CandidateSkill:
        profile = self.get_profile_by_user_id(user_id)
        canon_name, conf = self.normalizer.skill_normalizer.normalize(skill_in.name)
        skill_db = self.db.query(Skill).filter(Skill.canonical_name == canon_name).first()

        cand_skill = CandidateSkill(
            candidate_id=profile.id,
            skill_id=skill_db.id if skill_db else None,
            original_name=skill_in.name,
            normalized_name=canon_name,
            category=skill_in.category or (skill_db.category if skill_db else "general"),
            years_experience=skill_in.years_experience,
            confidence=1.0,
            source="manual"
        )
        self.db.add(cand_skill)
        self._refresh_completeness(profile)
        self.db.commit()
        self.db.refresh(cand_skill)
        return cand_skill

    def remove_skill(self, user_id: str, skill_id: str) -> bool:
        profile = self.get_profile_by_user_id(user_id)
        cand_skill = self.db.query(CandidateSkill).filter(
            CandidateSkill.id == skill_id,
            CandidateSkill.candidate_id == profile.id
        ).first()
        if not cand_skill:
            raise EntityNotFoundException("CandidateSkill", skill_id)
        self.db.delete(cand_skill)
        self._refresh_completeness(profile)
        self.db.commit()
        return True

    def add_education(self, user_id: str, edu_in: CandidateEducationCreate) -> CandidateEducation:
        profile = self.get_profile_by_user_id(user_id)
        lvl, dt, fld = self.normalizer.qual_normalizer.normalize(edu_in.original_degree)

        c_edu = CandidateEducation(
            candidate_id=profile.id,
            institution=edu_in.institution,
            original_degree=edu_in.original_degree,
            normalized_degree_level=edu_in.normalized_degree_level or lvl,
            normalized_degree_type=edu_in.normalized_degree_type or dt,
            field_of_study=edu_in.field_of_study or fld,
            start_date=edu_in.start_date,
            end_date=edu_in.end_date,
            is_current=edu_in.is_current
        )
        self.db.add(c_edu)
        self._refresh_completeness(profile)
        self.db.commit()
        self.db.refresh(c_edu)
        return c_edu

    def remove_education(self, user_id: str, education_id: str) -> bool:
        profile = self.get_profile_by_user_id(user_id)
        c_edu = self.db.query(CandidateEducation).filter(
            CandidateEducation.id == education_id,
            CandidateEducation.candidate_id == profile.id
        ).first()
        if not c_edu:
            raise EntityNotFoundException("CandidateEducation", education_id)
        self.db.delete(c_edu)
        self._refresh_completeness(profile)
        self.db.commit()
        return True

    def add_experience(self, user_id: str, exp_in: CandidateExperienceCreate) -> CandidateExperience:
        profile = self.get_profile_by_user_id(user_id)
        role, seniority = self.normalizer.title_normalizer.normalize(exp_in.original_job_title)

        c_exp = CandidateExperience(
            candidate_id=profile.id,
            company=exp_in.company,
            original_job_title=exp_in.original_job_title,
            normalized_role=exp_in.normalized_role or role,
            location=exp_in.location,
            start_date=exp_in.start_date,
            end_date=exp_in.end_date,
            is_current=exp_in.is_current,
            description=exp_in.description
        )
        self.db.add(c_exp)
        self._refresh_completeness(profile)
        self.db.commit()
        self.db.refresh(c_exp)
        return c_exp

    def remove_experience(self, user_id: str, experience_id: str) -> bool:
        profile = self.get_profile_by_user_id(user_id)
        c_exp = self.db.query(CandidateExperience).filter(
            CandidateExperience.id == experience_id,
            CandidateExperience.candidate_id == profile.id
        ).first()
        if not c_exp:
            raise EntityNotFoundException("CandidateExperience", experience_id)
        self.db.delete(c_exp)
        self._refresh_completeness(profile)
        self.db.commit()
        return True

    def _refresh_completeness(self, profile: CandidateProfile):
        profile.completeness_score = NormalizationService.calculate_completeness_score(
            headline=profile.headline,
            bio=profile.bio,
            skills_count=len(profile.skills),
            education_count=len(profile.education),
            experience_count=len(profile.experiences),
            has_location=bool(profile.location and (profile.location.city or profile.location.country))
        )
