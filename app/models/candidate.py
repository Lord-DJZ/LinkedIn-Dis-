import uuid
from datetime import datetime, timezone
from sqlalchemy import (
    Column, String, Text, Float, Integer, Boolean, DateTime, ForeignKey, Index
)
from sqlalchemy.orm import relationship
from sqlalchemy.types import TypeDecorator, String as SqlString
from geoalchemy2 import Geometry
from app.database.base import Base



class PointGeometry(TypeDecorator):
    """PostGIS Point geometry for PostgreSQL, transparent string fallback for SQLite/tests."""
    impl = SqlString
    cache_ok = True

    def load_dialect_impl(self, dialect):
        if dialect.name == "postgresql":
            return dialect.type_descriptor(Geometry(geometry_type="POINT", srid=4326, spatial_index=True))
        return dialect.type_descriptor(SqlString(100))

    def process_bind_param(self, value, dialect):
        return value

    def process_result_value(self, value, dialect):
        return value


class CandidateProfile(Base):
    __tablename__ = "candidate_profiles"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    full_name = Column(String(255), nullable=False)
    headline = Column(String(255), nullable=True)
    bio = Column(Text, nullable=True)
    avatar_url = Column(String(500), nullable=True)
    phone = Column(String(50), nullable=True)
    date_of_birth = Column(String(50), nullable=True)
    gender = Column(String(20), nullable=True)
    total_years_experience = Column(Float, default=0.0, nullable=False, index=True)
    availability_status = Column(String(50), default="available", nullable=False, index=True)
    profile_visibility = Column(String(50), default="public", nullable=False, index=True)  # public, anonymous, private
    is_searchable = Column(Boolean, default=True, nullable=False, index=True)
    completeness_score = Column(Integer, default=0, nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False
    )

    user = relationship("User", back_populates="candidate_profile")
    location = relationship("CandidateLocation", back_populates="candidate", uselist=False, cascade="all, delete-orphan")
    skills = relationship("CandidateSkill", back_populates="candidate", cascade="all, delete-orphan")
    education = relationship("CandidateEducation", back_populates="candidate", cascade="all, delete-orphan")
    experiences = relationship("CandidateExperience", back_populates="candidate", cascade="all, delete-orphan")
    certifications = relationship("CandidateCertification", back_populates="candidate", cascade="all, delete-orphan")
    preferred_roles = relationship("CandidatePreferredRole", back_populates="candidate", cascade="all, delete-orphan")
    resume_documents = relationship("ResumeDocument", back_populates="candidate", cascade="all, delete-orphan")
    persona = relationship("CandidatePersona", back_populates="candidate", uselist=False, cascade="all, delete-orphan")


class CandidateLocation(Base):
    __tablename__ = "candidate_locations"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    candidate_id = Column(String(36), ForeignKey("candidate_profiles.id", ondelete="CASCADE"), unique=True, nullable=False)
    city = Column(String(100), nullable=True, index=True)
    country = Column(String(100), nullable=True, index=True)
    postal_code = Column(String(50), nullable=True)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    # PostGIS Point in WGS 84 (SRID 4326) on PostgreSQL, safe string fallback on SQLite
    coordinates = Column(PointGeometry, nullable=True)

    candidate = relationship("CandidateProfile", back_populates="location")



class CandidateSkill(Base):
    __tablename__ = "candidate_skills"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    candidate_id = Column(String(36), ForeignKey("candidate_profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    skill_id = Column(String(36), ForeignKey("skills.id", ondelete="CASCADE"), nullable=True, index=True)
    original_name = Column(String(100), nullable=False)
    normalized_name = Column(String(100), nullable=False, index=True)
    category = Column(String(50), nullable=True)
    years_experience = Column(Float, nullable=True)
    confidence = Column(Float, default=1.0, nullable=False)
    source = Column(String(50), default="manual", nullable=False)  # manual, rule_based, llm, confirmed

    candidate = relationship("CandidateProfile", back_populates="skills")
    skill = relationship("Skill", back_populates="candidate_skills")


class CandidateEducation(Base):
    __tablename__ = "candidate_education"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    candidate_id = Column(String(36), ForeignKey("candidate_profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    institution = Column(String(255), nullable=False)
    original_degree = Column(String(255), nullable=False)
    normalized_degree_level = Column(String(50), nullable=True, index=True)  # bachelor, master, doctorate, diploma, certificate
    normalized_degree_type = Column(String(50), nullable=True)  # BSc, MSc, PhD, etc.
    field_of_study = Column(String(255), nullable=True, index=True)
    start_date = Column(String(50), nullable=True)
    end_date = Column(String(50), nullable=True)
    is_current = Column(Boolean, default=False, nullable=False)

    candidate = relationship("CandidateProfile", back_populates="education")


class CandidateExperience(Base):
    __tablename__ = "candidate_experiences"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    candidate_id = Column(String(36), ForeignKey("candidate_profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    company = Column(String(255), nullable=False)
    original_job_title = Column(String(255), nullable=False)
    normalized_role = Column(String(255), nullable=True, index=True)
    location = Column(String(255), nullable=True)
    start_date = Column(String(50), nullable=True)
    end_date = Column(String(50), nullable=True)
    is_current = Column(Boolean, default=False, nullable=False)
    description = Column(Text, nullable=True)

    candidate = relationship("CandidateProfile", back_populates="experiences")


class CandidateCertification(Base):
    __tablename__ = "candidate_certifications"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    candidate_id = Column(String(36), ForeignKey("candidate_profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(255), nullable=False, index=True)
    issuing_organization = Column(String(255), nullable=True)
    issue_date = Column(String(50), nullable=True)
    expiration_date = Column(String(50), nullable=True)

    candidate = relationship("CandidateProfile", back_populates="certifications")


class CandidatePreferredRole(Base):
    __tablename__ = "candidate_preferred_roles"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    candidate_id = Column(String(36), ForeignKey("candidate_profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    role_title = Column(String(255), nullable=False)
    normalized_role = Column(String(255), nullable=True, index=True)

    candidate = relationship("CandidateProfile", back_populates="preferred_roles")
