import math
from typing import List, Optional, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import func, and_, or_, select
from app.models.candidate import (
    CandidateProfile,
    CandidateLocation,
    CandidateSkill,
    CandidateEducation,
    CandidateExperience,
    CandidatePreferredRole,
)
from app.models.persona import CandidatePersona
from app.schemas.search import (
    RecruiterSearchRequest,
    CandidateSearchResult,
    NaturalLanguageSearchRequest,
)
from app.services.scoring_service import ScoringService
from app.ai.factory import LLMProviderFactory
from app.ai.prompts import QUERY_PARSER_SYSTEM_PROMPT


def haversine_distance_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Computes great-circle distance between two points in kilometers."""
    R = 6371.0  # Earth radius in kilometers
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (
        math.sin(dlat / 2) ** 2
        + math.cos(math.radians(lat1))
        * math.cos(math.radians(lat2))
        * math.sin(dlon / 2) ** 2
    )
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c


class RecruiterSearchService:
    """Executes database-level candidate filtering and ranking with spatial radius calculations."""

    @classmethod
    def search(
        cls,
        db: Session,
        criteria: RecruiterSearchRequest
    ) -> Tuple[List[CandidateSearchResult], int]:
        # Base query: Only searchable, non-private candidates
        query = db.query(CandidateProfile).filter(
            CandidateProfile.is_searchable == True,
            CandidateProfile.profile_visibility.in_(["public", "anonymous"])
        )

        # 1. Experience Range Filters
        if criteria.min_experience is not None:
            query = query.filter(CandidateProfile.total_years_experience >= criteria.min_experience)
        if criteria.max_experience is not None:
            query = query.filter(CandidateProfile.total_years_experience <= criteria.max_experience)

        # 2. Availability Filter
        if criteria.availability:
            query = query.filter(CandidateProfile.availability_status == criteria.availability)

        # 3. Required Skills Filter (Candidate must possess ALL required skills)
        if criteria.required_skills:
            req_skill_names = [s.strip().lower() for s in criteria.required_skills if s.strip()]
            for skill_term in req_skill_names:
                query = query.filter(
                    CandidateProfile.skills.any(
                        func.lower(CandidateSkill.normalized_name) == skill_term
                    )
                )

        # 4. Education Filter
        if criteria.education_level:
            query = query.filter(
                CandidateProfile.education.any(
                    func.lower(CandidateEducation.normalized_degree_level) == criteria.education_level.lower()
                )
            )

        # 5. Role Filter
        if criteria.role:
            role_term = f"%{criteria.role.strip()}%"
            query = query.filter(
                or_(
                    CandidateProfile.preferred_roles.any(
                        CandidatePreferredRole.normalized_role.ilike(role_term)
                    ),
                    CandidateProfile.preferred_roles.any(
                        CandidatePreferredRole.role_title.ilike(role_term)
                    ),
                    CandidateProfile.experiences.any(
                        CandidateExperience.normalized_role.ilike(role_term)
                    ),
                    CandidateProfile.experiences.any(
                        CandidateExperience.original_job_title.ilike(role_term)
                    ),
                )
            )

        # 6. City / Country String Filter (when no coordinates)
        if criteria.city and criteria.latitude is None:
            query = query.filter(
                CandidateProfile.location.has(
                    func.lower(CandidateLocation.city) == criteria.city.strip().lower()
                )
            )
        if criteria.country:
            query = query.filter(
                CandidateProfile.location.has(
                    func.lower(CandidateLocation.country) == criteria.country.strip().lower()
                )
            )

        candidates = query.all()

        # 7. Spatial Radius Filtering & Distance Computation
        ranked_candidates = []
        for cand in candidates:
            dist_km = None
            if criteria.latitude is not None and criteria.longitude is not None and cand.location:
                if cand.location.latitude is not None and cand.location.longitude is not None:
                    dist_km = haversine_distance_km(
                        criteria.latitude,
                        criteria.longitude,
                        cand.location.latitude,
                        cand.location.longitude
                    )
                    # Filter out if beyond requested radius
                    if criteria.radius_km is not None and dist_km > criteria.radius_km:
                        continue

            score, reasons = ScoringService.calculate_score(cand, criteria, dist_km)

            # Display name anonymization check
            if cand.profile_visibility == "anonymous":
                display_name = f"Anonymous Professional ({cand.headline or 'Engineer'})"
            else:
                display_name = cand.full_name

            top_skills = [s.normalized_name for s in cand.skills[:6]]

            ranked_candidates.append({
                "result": CandidateSearchResult(
                    candidate_id=cand.id,
                    display_name=display_name,
                    headline=cand.headline,
                    summary=cand.bio,
                    total_years_experience=cand.total_years_experience,
                    city=cand.location.city if cand.location else None,
                    country=cand.location.country if cand.location else None,
                    distance_km=round(dist_km, 1) if dist_km is not None else None,
                    top_skills=top_skills,
                    match_score=score,
                    match_reasons=reasons,
                    profile_visibility=cand.profile_visibility,
                    availability_status=cand.availability_status
                ),
                "score": score
            })

        # Sort descending by match score
        ranked_candidates.sort(key=lambda x: x["score"], reverse=True)

        total_count = len(ranked_candidates)
        # Pagination
        start_idx = (criteria.page - 1) * criteria.page_size
        end_idx = start_idx + criteria.page_size
        paginated_items = [item["result"] for item in ranked_candidates[start_idx:end_idx]]

        return paginated_items, total_count

    @classmethod
    def natural_language_search(
        cls,
        db: Session,
        request: NaturalLanguageSearchRequest
    ) -> Tuple[List[CandidateSearchResult], int, RecruiterSearchRequest]:
        """Converts recruiter natural-language prompt into structured filters via LLM, then executes search."""
        llm = LLMProviderFactory.get_provider()

        prompt = f"Convert this recruiter query into structured search filters:\nQuery: {request.query}"
        structured_criteria = llm.generate_structured(
            prompt=prompt,
            response_schema=RecruiterSearchRequest,
            system_instruction=QUERY_PARSER_SYSTEM_PROMPT
        )

        results, total = cls.search(db, structured_criteria)
        return results, total, structured_criteria
