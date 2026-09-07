from fastapi import APIRouter, Depends, UploadFile, File, BackgroundTasks, status
from sqlalchemy.orm import Session
from app.database.session import get_db, SessionLocal
from app.api.deps import require_candidate, get_current_candidate
from app.models.candidate import CandidateProfile
from app.models.resume import ResumeDocument
from app.schemas.resume import (
    ResumeUploadResponse,
    ResumeStatusResponse,
    ResumeExtractionReviewResponse,
    ResumeEditRequest,
    ResumeConfirmRequest,
    ResumeExtractionResult,
)
from app.schemas.candidate import CandidateProfileResponse
from app.services.resume_service import ResumeService
from app.core.errors import EntityNotFoundException, UnauthorizedException

router = APIRouter(prefix="/resumes", tags=["Resumes & CV Ingestion"])


def _background_process_resume(resume_id: str):
    """Background task to run text extraction, rule parsing, and AI reconciliation."""
    db: Session = SessionLocal()
    try:
        service = ResumeService(db)
        doc = db.query(ResumeDocument).filter(ResumeDocument.id == resume_id).first()
        if not doc:
            return
        service.process_resume(resume_id)
    except Exception as e:
        logger.warning(f"Background resume processing note: {e}")
    finally:
        db.close()


@router.post("/upload", response_model=ResumeUploadResponse, status_code=status.HTTP_201_CREATED)
def upload_resume(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    process_now: bool = False,
    candidate: CandidateProfile = Depends(get_current_candidate),
    db: Session = Depends(get_db)
):
    """
    Upload a resume file (PDF or DOCX).
    Text extraction and parsing are processed automatically.
    """
    service = ResumeService(db)
    doc = service.upload_resume(
        candidate_id=candidate.id,
        file_obj=file.file,
        original_filename=file.filename,
        mime_type=file.content_type or "application/octet-stream"
    )

    if process_now:
        service.process_resume(doc.id)
    else:
        background_tasks.add_task(_background_process_resume, doc.id)

    return doc



@router.post("/{resume_id}/process-sync", response_model=ResumeExtractionReviewResponse)
def process_resume_sync(
    resume_id: str,
    candidate: CandidateProfile = Depends(get_current_candidate),
    db: Session = Depends(get_db)
):
    """Synchronous trigger for test suites and rapid processing."""
    service = ResumeService(db)
    extraction = service.process_resume(resume_id)
    return ResumeExtractionReviewResponse(
        resume_id=extraction.resume_id,
        status=extraction.resume.status,
        is_confirmed=extraction.is_confirmed,
        reconciled_data=ResumeExtractionResult.model_validate(extraction.reconciled_data),
        rule_based_data=extraction.rule_based_data,
        llm_data=extraction.llm_data,
        candidate_edits=extraction.candidate_edits
    )


@router.get("/{resume_id}/status", response_model=ResumeStatusResponse)
def get_resume_status(
    resume_id: str,
    candidate: CandidateProfile = Depends(get_current_candidate),
    db: Session = Depends(get_db)
):
    """Check processing status and error states."""
    doc = db.query(ResumeDocument).filter(ResumeDocument.id == resume_id).first()
    if not doc:
        raise EntityNotFoundException("ResumeDocument", resume_id)
    if doc.candidate_id != candidate.id:
        raise UnauthorizedException("You do not have access to this resume.")
    return doc


@router.get("/{resume_id}/extraction", response_model=ResumeExtractionReviewResponse)
def get_extraction_preview(
    resume_id: str,
    candidate: CandidateProfile = Depends(get_current_candidate),
    db: Session = Depends(get_db)
):
    """Retrieve extracted profile preview for candidate review and verification."""
    service = ResumeService(db)
    extraction = service.get_extraction_review(resume_id, candidate.id)
    return ResumeExtractionReviewResponse(
        resume_id=extraction.resume_id,
        status=extraction.resume.status,
        is_confirmed=extraction.is_confirmed,
        reconciled_data=ResumeExtractionResult.model_validate(extraction.reconciled_data),
        rule_based_data=extraction.rule_based_data,
        llm_data=extraction.llm_data,
        candidate_edits=extraction.candidate_edits
    )


@router.patch("/{resume_id}/extraction", response_model=ResumeExtractionReviewResponse)
def edit_extraction_preview(
    resume_id: str,
    req: ResumeEditRequest,
    candidate: CandidateProfile = Depends(get_current_candidate),
    db: Session = Depends(get_db)
):
    """Allow candidate to edit extracted facts before confirmation."""
    service = ResumeService(db)
    extraction = service.update_extraction_review(resume_id, candidate.id, req.reconciled_data)
    return ResumeExtractionReviewResponse(
        resume_id=extraction.resume_id,
        status=extraction.resume.status,
        is_confirmed=extraction.is_confirmed,
        reconciled_data=ResumeExtractionResult.model_validate(extraction.reconciled_data),
        rule_based_data=extraction.rule_based_data,
        llm_data=extraction.llm_data,
        candidate_edits=extraction.candidate_edits
    )


@router.post("/{resume_id}/confirm", response_model=CandidateProfileResponse)
def confirm_resume_extraction(
    resume_id: str,
    req: ResumeConfirmRequest,
    candidate: CandidateProfile = Depends(get_current_candidate),
    db: Session = Depends(get_db)
):
    """
    Confirm extracted resume data.
    Normalizes and commits all fields to the candidate's authoritative profile,
    and automatically generates a professional Candidate Persona.
    """
    service = ResumeService(db)
    updated_profile = service.confirm_extraction(
        resume_id=resume_id,
        candidate_id=candidate.id,
        confirmed_data=req.confirmed_data
    )
    return updated_profile
