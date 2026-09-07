import pytest
import os
from typing import Generator
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from app.main import app
from app.database.base import Base
from app.database.session import get_db
from app.models.user import User, RecruiterProfile, UserRole
from app.models.candidate import CandidateProfile, CandidateLocation, CandidateSkill
from app.models.skill import Skill, SkillAlias
from app.core.security import hash_password, create_access_token
from app.ai.fake import FakeLLMProvider
from app.ai.factory import LLMProviderFactory

# Use in-memory SQLite for fast, isolated test runs
TEST_DB_URL = "sqlite:///:memory:"
test_engine = create_engine(TEST_DB_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)


@pytest.fixture(scope="session", autouse=True)
def setup_test_db():
    Base.metadata.create_all(bind=test_engine)
    db = TestingSessionLocal()
    # Seed skills
    skills_data = [
        ("Python", "language", ["Python3", "Python 3"]),
        ("FastAPI", "framework", ["Fast API"]),
        ("PostgreSQL", "database", ["Postgres", "Postgre SQL"]),
        ("React", "framework", ["React.js", "React JS", "ReactJS"]),
        ("Java", "language", ["Core Java"]),
        ("Spring Boot", "framework", ["SpringBoot"]),
        ("Docker", "devops", ["Containerization"]),
    ]
    for name, cat, aliases in skills_data:
        s = Skill(canonical_name=name, category=cat)
        db.add(s)
        db.flush()
        for a in aliases:
            db.add(SkillAlias(skill_id=s.id, alias=a))
    db.commit()
    db.close()
    yield
    Base.metadata.drop_all(bind=test_engine)


@pytest.fixture
def db_session() -> Generator[Session, None, None]:
    connection = test_engine.connect()
    transaction = connection.begin()
    session = TestingSessionLocal(bind=connection)
    try:
        yield session
    finally:
        session.close()
        transaction.rollback()
        connection.close()


@pytest.fixture
def client(db_session: Session) -> Generator[TestClient, None, None]:
    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


@pytest.fixture
def candidate_auth_headers(db_session: Session):
    user = User(
        email="test_candidate@dullnit.com",
        hashed_password=hash_password("Password123!"),
        role=UserRole.CANDIDATE.value,
        is_active=True
    )
    db_session.add(user)
    db_session.flush()

    profile = CandidateProfile(
        user_id=user.id,
        full_name="Test Candidate",
        headline="Software Engineer",
        total_years_experience=3.0,
        availability_status="available",
        profile_visibility="public",
        is_searchable=True,
        completeness_score=50
    )
    db_session.add(profile)
    db_session.commit()

    token = create_access_token(
        subject=user.id,
        role=user.role,
        additional_claims={"email": user.email, "profile_id": profile.id}
    )
    return {"Authorization": f"Bearer {token}"}, user, profile


@pytest.fixture
def recruiter_auth_headers(db_session: Session):
    user = User(
        email="test_recruiter@dullnit.com",
        hashed_password=hash_password("Password123!"),
        role=UserRole.RECRUITER.value,
        is_active=True
    )
    db_session.add(user)
    db_session.flush()

    profile = RecruiterProfile(
        user_id=user.id,
        full_name="Test Recruiter",
        company_name="Tech Recruitment Partners"
    )
    db_session.add(profile)
    db_session.commit()

    token = create_access_token(
        subject=user.id,
        role=user.role,
        additional_claims={"email": user.email, "profile_id": profile.id}
    )
    return {"Authorization": f"Bearer {token}"}, user, profile
