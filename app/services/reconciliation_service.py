from typing import Dict
from app.schemas.resume import (
    ResumeExtractionResult,
    ExtractedSkillItem,
)


class ReconciliationService:
    """Merges deterministic rule-based facts with LLM semantic extraction."""

    @classmethod
    def reconcile(
        cls,
        rule_result: ResumeExtractionResult,
        llm_result: ResumeExtractionResult
    ) -> ResumeExtractionResult:
        merged = ResumeExtractionResult()

        # 1. Personal Information
        # Rule-based email & phone & URLs are deterministic and prioritized
        merged.personal_information.email = (
            rule_result.personal_information.email
            or llm_result.personal_information.email
        )
        merged.personal_information.phone = (
            rule_result.personal_information.phone
            or llm_result.personal_information.phone
        )
        # Full name: LLM usually understands name context better than naive first line
        merged.personal_information.full_name = (
            llm_result.personal_information.full_name
            or rule_result.personal_information.full_name
        )
        merged.personal_information.city = (
            llm_result.personal_information.city
            or rule_result.personal_information.city
        )
        merged.personal_information.country = (
            llm_result.personal_information.country
            or rule_result.personal_information.country
        )

        # 2. Professional Information
        merged.professional_information.headline = (
            llm_result.professional_information.headline
            or rule_result.professional_information.headline
        )
        merged.professional_information.current_title = (
            llm_result.professional_information.current_title
            or rule_result.professional_information.current_title
        )
        merged.professional_information.professional_summary = (
            llm_result.professional_information.professional_summary
            or rule_result.professional_information.professional_summary
        )

        # Experience estimation: prefer LLM calculation if available (> 0), else rule-based
        llm_exp = llm_result.professional_information.estimated_total_experience_years or 0.0
        rule_exp = rule_result.professional_information.estimated_total_experience_years or 0.0
        merged.professional_information.estimated_total_experience_years = max(llm_exp, rule_exp)

        # 3. Skills Reconciliation
        skills_by_name: Dict[str, ExtractedSkillItem] = {}

        # First add LLM skills
        for s in llm_result.skills:
            norm_key = (s.normalized_name or s.original_name).lower()
            s.source = "llm"
            skills_by_name[norm_key] = s

        # Then merge rule-based skills (giving rule_based source for matching items)
        for s in rule_result.skills:
            norm_key = (s.normalized_name or s.original_name).lower()
            if norm_key in skills_by_name:
                # Upgraded to rule_based confirmation
                skills_by_name[norm_key].source = "rule_based"
                skills_by_name[norm_key].confidence = 1.0
            else:
                s.source = "rule_based"
                s.confidence = 1.0
                skills_by_name[norm_key] = s

        merged.skills = list(skills_by_name.values())

        # 4. Education Reconciliation
        # LLM extracts rich degrees and institutions; fallback to rule-based if empty
        merged.education = llm_result.education if llm_result.education else rule_result.education

        # 5. Experience Reconciliation
        merged.experience = llm_result.experience if llm_result.experience else rule_result.experience

        # 6. Certifications & Languages & Portfolio Links
        merged.certifications = llm_result.certifications if llm_result.certifications else rule_result.certifications
        merged.languages = llm_result.languages if llm_result.languages else rule_result.languages

        # Deduplicate portfolio links
        all_links = list(dict.fromkeys(rule_result.portfolio_links + llm_result.portfolio_links))
        merged.portfolio_links = all_links

        merged.suggested_roles = llm_result.suggested_roles or rule_result.suggested_roles
        merged.detected_language = llm_result.detected_language or rule_result.detected_language

        return merged
