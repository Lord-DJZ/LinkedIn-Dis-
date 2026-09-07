import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Text, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.database.base import Base


class CandidatePersona(Base):
    __tablename__ = "candidate_personas"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    candidate_id = Column(String(36), ForeignKey("candidate_profiles.id", ondelete="CASCADE"), unique=True, nullable=False)
    headline = Column(String(255), nullable=False)
    summary = Column(Text, nullable=False)
    primary_profession = Column(String(100), nullable=False)
    seniority_level = Column(String(50), nullable=False)  # Junior, Mid-Level, Senior, Lead, Executive
    top_skills = Column(JSON, default=list, nullable=False)
    experience_summary = Column(Text, nullable=True)
    education_summary = Column(Text, nullable=True)
    suggested_roles = Column(JSON, default=list, nullable=False)
    search_keywords = Column(Text, nullable=True)
    generated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    candidate = relationship("CandidateProfile", back_populates="persona")
