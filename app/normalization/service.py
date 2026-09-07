from typing import Optional
from sqlalchemy.orm import Session
from app.normalization.skills import SkillNormalizer
from app.normalization.qualifications import QualificationNormalizer
from app.normalization.titles import JobTitleNormalizer
from app.schemas.resume import ResumeExtractionResult


class NormalizationService:
    """Unified service for normalizing candidate profile information."""

    def __init__(self, db: Optional[Session] = None):
        self.skill_normalizer = SkillNormalizer(db)
        self.qual_normalizer = QualificationNormalizer()
        self.title_normalizer = JobTitleNormalizer()

    def normalize_extraction_result(self, result: ResumeExtractionResult) -> ResumeExtractionResult:
        """Normalizes skills, qualifications, and experiences in an extraction result."""
        # 1. Normalize Skills
        for skill in result.skills:
            canon_name, conf = self.skill_normalizer.normalize(skill.original_name)
            skill.normalized_name = canon_name
            skill.confidence = min(skill.confidence, conf)

        # 2. Normalize Education
        for edu in result.education:
            lvl, dt, fld = self.qual_normalizer.normalize(edu.original_degree)
            if lvl and not edu.normalized_degree_level:
                edu.normalized_degree_level = lvl
            if dt and not edu.normalized_degree_type:
                edu.normalized_degree_type = dt
            if fld and not edu.field_of_study:
                edu.field_of_study = fld

        # 3. Normalize Experience Roles
        for exp in result.experience:
            role, seniority = self.title_normalizer.normalize(exp.original_job_title)
            if not exp.normalized_role:
                exp.normalized_role = role

        # 4. Suggest Roles if empty
        if not result.suggested_roles and result.experience:
            roles = set()
            for exp in result.experience:
                if exp.normalized_role:
                    roles.add(exp.normalized_role)
            result.suggested_roles = list(roles)

        return result

    @staticmethod
    def calculate_completeness_score(
        headline: Optional[str],
        bio: Optional[str],
        skills_count: int,
        education_count: int,
        experience_count: int,
        has_location: bool
    ) -> int:
        """Calculates profile completeness percentage (0 - 100)."""
        score = 0
        if headline:
            score += 15
        if bio:
            score += 15
        if skills_count > 0:
            score += min(skills_count * 5, 25)
        if education_count > 0:
            score += 15
        if experience_count > 0:
            score += 20
        if has_location:
            score += 10
        return min(score, 100)
