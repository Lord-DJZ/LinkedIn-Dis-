import uuid
from datetime import datetime, timezone
import enum
from sqlalchemy import (
    Column, String, Text, Integer, Boolean, DateTime, ForeignKey, JSON
)
from sqlalchemy.orm import relationship
from app.database.base import Base


class ResumeStatus(str, enum.Enum):
    UPLOADED = "uploaded"
    EXTRACTING_TEXT = "extracting_text"
    TEXT_EXTRACTED = "text_extracted"
    AI_PROCESSING = "ai_processing"
    REVIEW_REQUIRED = "review_required"
    CONFIRMED = "confirmed"
    FAILED = "failed"
    OCR_REQUIRED = "ocr_required"


class ResumeDocument(Base):
    __tablename__ = "resume_documents"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    candidate_id = Column(String(36), ForeignKey("candidate_profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    file_name = Column(String(255), nullable=False)
    stored_file_path = Column(String(500), nullable=False)
    file_size = Column(Integer, nullable=False)
    mime_type = Column(String(100), nullable=False)
    file_hash = Column(String(64), nullable=False, index=True)  # SHA-256
    status = Column(String(50), default=ResumeStatus.UPLOADED.value, nullable=False, index=True)
    raw_text = Column(Text, nullable=True)
    error_message = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False
    )

    candidate = relationship("CandidateProfile", back_populates="resume_documents")
    extraction = relationship("ResumeExtraction", back_populates="resume", uselist=False, cascade="all, delete-orphan")


class ResumeExtraction(Base):
    __tablename__ = "resume_extractions"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    resume_id = Column(String(36), ForeignKey("resume_documents.id", ondelete="CASCADE"), unique=True, nullable=False)
    extraction_model = Column(String(100), nullable=True)
    prompt_version = Column(String(50), nullable=True)
    schema_version = Column(String(50), default="v1", nullable=False)
    rule_based_data = Column(JSON, nullable=True)
    llm_data = Column(JSON, nullable=True)
    reconciled_data = Column(JSON, nullable=True)
    candidate_edits = Column(JSON, nullable=True)
    is_confirmed = Column(Boolean, default=False, nullable=False, index=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    confirmed_at = Column(DateTime(timezone=True), nullable=True)

    resume = relationship("ResumeDocument", back_populates="extraction")
