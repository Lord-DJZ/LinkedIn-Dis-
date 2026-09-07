from typing import List, Optional, Tuple
from app.core.config import settings
from app.models.candidate import CandidateProfile
from app.schemas.search import RecruiterSearchRequest


class ScoringService:
    """Computes transparent, multi-dimensional candidate ranking scores (0-100) with clear explanations."""

    DEGREE_HIERARCHY = {
        "high_school": 1,
        "certificate": 2,
        "diploma": 3,
        "bachelor": 4,
        "master": 5,
        "doctorate": 6,
    }

    @classmethod
    def calculate_score(
        cls,
        candidate: CandidateProfile,
        criteria: RecruiterSearchRequest,
        calculated_distance_km: Optional[float] = None
    ) -> Tuple[float, List[str]]:
        reasons: List[str] = []
        sub_scores = []
        weights = []

        candidate_skills_lower = {s.normalized_name.lower(): s.normalized_name for s in candidate.skills}

        # 1. Skill Match Score (Weight: 35%)
        req_skills = [s.strip().lower() for s in criteria.required_skills if s.strip()]
        opt_skills = [s.strip().lower() for s in criteria.optional_skills if s.strip()]

        matched_req = [candidate_skills_lower[s] for s in req_skills if s in candidate_skills_lower]
        matched_opt = [candidate_skills_lower[s] for s in opt_skills if s in candidate_skills_lower]

        if req_skills:
            req_ratio = len(matched_req) / len(req_skills)
            opt_bonus = (len(matched_opt) / len(opt_skills) * 0.2) if opt_skills else 0.0
            skill_score = min(1.0, (req_ratio * 0.8) + opt_bonus) * 100.0
            reasons.append(f"Matched {len(matched_req)}/{len(req_skills)} required skills: {', '.join(matched_req) if matched_req else 'None'}")
            if matched_opt:
                reasons.append(f"Matched {len(matched_opt)} optional skills: {', '.join(matched_opt)}")
        elif opt_skills:
            skill_score = (len(matched_opt) / len(opt_skills)) * 100.0
            reasons.append(f"Matched {len(matched_opt)}/{len(opt_skills)} skills: {', '.join(matched_opt)}")
        else:
            skill_score = 100.0

        sub_scores.append(skill_score)
        weights.append(settings.WEIGHT_SKILL)

        # 2. Experience Match Score (Weight: 25%)
        cand_exp = candidate.total_years_experience or 0.0
        if criteria.min_experience is not None:
            if cand_exp >= criteria.min_experience:
                exp_score = 100.0
                reasons.append(f"Experience: {cand_exp:.1f} yrs exceeds required {criteria.min_experience:.1f} yrs")
            else:
                ratio = cand_exp / max(criteria.min_experience, 0.1)
                exp_score = max(0.0, ratio * 70.0)
                reasons.append(f"Experience: {cand_exp:.1f} yrs below required {criteria.min_experience:.1f} yrs")
        else:
            exp_score = min(100.0, cand_exp * 15.0)  # Gradual score up to ~7 years
            reasons.append(f"Total experience: {cand_exp:.1f} yrs")

        sub_scores.append(exp_score)
        weights.append(settings.WEIGHT_EXPERIENCE)

        # 3. Education Match Score (Weight: 15%)
        if criteria.education_level:
            req_rank = cls.DEGREE_HIERARCHY.get(criteria.education_level.lower(), 4)
            highest_cand_rank = 0
            highest_deg_desc = "No degree"
            for edu in candidate.education:
                cand_rank = cls.DEGREE_HIERARCHY.get((edu.normalized_degree_level or "").lower(), 0)
                if cand_rank > highest_cand_rank:
                    highest_cand_rank = cand_rank
                    highest_deg_desc = edu.original_degree

            if highest_cand_rank >= req_rank:
                edu_score = 100.0
                reasons.append(f"Education: {highest_deg_desc} satisfies requirement ({criteria.education_level})")
            else:
                edu_score = 40.0
                reasons.append(f"Education: {highest_deg_desc} below required {criteria.education_level}")
        else:
            edu_score = 90.0 if candidate.education else 60.0

        sub_scores.append(edu_score)
        weights.append(settings.WEIGHT_EDUCATION)

        # 4. Role Match Score (Weight: 15%)
        if criteria.role:
            target_role = criteria.role.strip().lower()
            role_matched = False
            for r in candidate.preferred_roles:
                if target_role in (r.normalized_role or "").lower() or target_role in r.role_title.lower():
                    role_matched = True
                    break
            if not role_matched:
                for exp in candidate.experiences:
                    if target_role in (exp.normalized_role or "").lower() or target_role in exp.original_job_title.lower():
                        role_matched = True
                        break

            if role_matched:
                role_score = 100.0
                reasons.append(f"Role match: matches '{criteria.role}'")
            else:
                role_score = 40.0
        else:
            role_score = 100.0

        sub_scores.append(role_score)
        weights.append(settings.WEIGHT_ROLE)

        # 5. Location / Distance Match Score (Weight: 10%)
        if calculated_distance_km is not None and criteria.radius_km is not None:
            if calculated_distance_km <= criteria.radius_km:
                # Closer to origin scores higher: 100% at 0km, 60% at boundary
                decay = 1.0 - 0.4 * (calculated_distance_km / max(criteria.radius_km, 1.0))
                loc_score = max(50.0, decay * 100.0)
                reasons.append(f"Proximity: {calculated_distance_km:.1f} km away (within {criteria.radius_km:.0f} km radius)")
            else:
                loc_score = 20.0
                reasons.append(f"Location: {calculated_distance_km:.1f} km away exceeds requested {criteria.radius_km:.0f} km")
        elif criteria.city and candidate.location:
            if criteria.city.lower() == (candidate.location.city or "").lower():
                loc_score = 100.0
                reasons.append(f"City match: {candidate.location.city}")
            else:
                loc_score = 50.0
        else:
            loc_score = 80.0

        sub_scores.append(loc_score)
        weights.append(settings.WEIGHT_LOCATION)

        # Weighted Normalized Total
        total_weight = sum(weights)
        final_score = sum(s * w for s, w in zip(sub_scores, weights)) / total_weight
        final_score = round(min(100.0, max(0.0, final_score)), 1)

        return final_score, reasons
