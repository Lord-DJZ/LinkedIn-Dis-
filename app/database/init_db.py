import logging
from sqlalchemy import text
from app.database.session import engine
from app.database.base import Base
from app.core.config import settings

# Import all models so they register with Base.metadata
from app.models import (
    User,
    RecruiterProfile,
    Skill,
    SkillAlias,
    CandidateProfile,
    CandidateLocation,
    CandidateSkill,
    CandidateEducation,
    CandidateExperience,
    CandidateCertification,
    CandidatePreferredRole,
    ResumeDocument,
    ResumeExtraction,
    CandidatePersona,
    AuditEvent,
)

logger = logging.getLogger(__name__)


def init_db():
    """Create database tables and enable PostGIS extension if using PostgreSQL."""
    if "postgresql" in settings.DATABASE_URL:
        try:
            with engine.connect() as conn:
                conn.execute(text("CREATE EXTENSION IF NOT EXISTS postgis;"))
                conn.commit()
                logger.info("PostGIS extension ensured.")
        except Exception as e:
            logger.warning(f"Could not initialize PostGIS extension: {e}")

    # Create all tables defined in metadata
    Base.metadata.create_all(bind=engine)
    logger.info("All database tables successfully created.")


if __name__ == "__main__":
    init_db()
