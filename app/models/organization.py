import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.database.base import Base


class Organization(Base):
    __tablename__ = "organizations"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    owner_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(255), nullable=False, default="Apex Talent Labs")
    industry = Column(String(255), nullable=True, default="Technology & Software")
    description = Column(Text, nullable=True, default="Pioneering modern software engineering and intelligent product development.")
    website = Column(String(255), nullable=True, default="https://dullnit.com")
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False
    )

    owner = relationship("User")
    recruited_candidates = relationship("RecruitedCandidate", back_populates="organization", cascade="all, delete-orphan")


class RecruitedCandidate(Base):
    __tablename__ = "recruited_candidates"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    organization_id = Column(String(36), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False)
    candidate_id = Column(String(36), ForeignKey("candidate_profiles.id", ondelete="CASCADE"), nullable=False)
    status = Column(String(50), nullable=False, default="Recruited")  # "Shortlisted", "Interviewing", "Offer Extended", "Recruited"
    recruited_role = Column(String(255), nullable=True)
    notes = Column(Text, nullable=True)
    recruited_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    organization = relationship("Organization", back_populates="recruited_candidates")
    candidate = relationship("CandidateProfile")
