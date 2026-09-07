import uuid
from sqlalchemy import Column, String, ForeignKey
from sqlalchemy.orm import relationship
from app.database.base import Base


class Skill(Base):
    __tablename__ = "skills"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    canonical_name = Column(String(100), unique=True, index=True, nullable=False)
    category = Column(String(50), nullable=True, default="general", index=True)

    aliases = relationship("SkillAlias", back_populates="skill", cascade="all, delete-orphan")
    candidate_skills = relationship("CandidateSkill", back_populates="skill")


class SkillAlias(Base):
    __tablename__ = "skill_aliases"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    skill_id = Column(String(36), ForeignKey("skills.id", ondelete="CASCADE"), nullable=False, index=True)
    alias = Column(String(100), unique=True, index=True, nullable=False)

    skill = relationship("Skill", back_populates="aliases")
