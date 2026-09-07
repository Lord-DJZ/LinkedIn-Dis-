from typing import Any, Dict
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.api.deps import require_recruiter
from app.models.user import User
from app.schemas.search import (
    RecruiterSearchRequest,
    CandidateSearchResult,
    NaturalLanguageSearchRequest,
)
from app.schemas.common import PaginatedResponse
from app.services.search_service import RecruiterSearchService

router = APIRouter(prefix="/search", tags=["Candidate Discovery & Search"])


class NLSearchResultResponse(PaginatedResponse[CandidateSearchResult]):
    parsed_criteria: RecruiterSearchRequest


@router.post("/candidates", response_model=PaginatedResponse[CandidateSearchResult])
def search_candidates(
    criteria: RecruiterSearchRequest,
    user: User = Depends(require_recruiter),
    db: Session = Depends(get_db)
):
    """
    Search and rank candidates deterministically using database filters and PostGIS geographic radius.
    """
    items, total = RecruiterSearchService.search(db, criteria)
    total_pages = (total + criteria.page_size - 1) // criteria.page_size if total > 0 else 1

    return PaginatedResponse[CandidateSearchResult](
        items=items,
        total=total,
        page=criteria.page,
        page_size=criteria.page_size,
        total_pages=total_pages
    )


@router.post("/candidates/nl", response_model=NLSearchResultResponse)
def natural_language_search_candidates(
    req: NaturalLanguageSearchRequest,
    user: User = Depends(require_recruiter),
    db: Session = Depends(get_db)
):
    """
    Convert recruiter natural-language requirements into structured filters via LLM,
    then execute the deterministic database search engine.
    """
    items, total, parsed_criteria = RecruiterSearchService.natural_language_search(db, req)
    total_pages = (total + parsed_criteria.page_size - 1) // parsed_criteria.page_size if total > 0 else 1

    return NLSearchResultResponse(
        items=items,
        total=total,
        page=parsed_criteria.page,
        page_size=parsed_criteria.page_size,
        total_pages=total_pages,
        parsed_criteria=parsed_criteria
    )
