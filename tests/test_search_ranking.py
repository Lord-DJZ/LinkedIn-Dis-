from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from app.models.user import User, UserRole
from app.models.candidate import (
    CandidateProfile,
    CandidateLocation,
    CandidateSkill,
    CandidateEducation,
    CandidateExperience,
    CandidatePreferredRole,
)
from app.core.security import hash_password


def seed_search_candidates(db: Session):
    candidates_data = [
        # Candidate A: Python, FastAPI, PostgreSQL (4 yrs, Colombo: 6.9271, 79.8612)
        {
            "email": "cand_a_test@dullnit.com",
            "name": "Kavinda Perera",
            "headline": "Mid-Level Backend Software Engineer",
            "exp": 4.0,
            "city": "Colombo",
            "lat": 6.9271,
            "lon": 79.8612,
            "skills": ["Python", "FastAPI", "PostgreSQL", "Docker"],
            "role": "Backend Engineer",
            "degree_level": "bachelor"
        },
        # Candidate B: Java, Spring Boot, MySQL (6 yrs, Kandy: 7.2906, 80.6337)
        {
            "email": "cand_b_test@dullnit.com",
            "name": "Dilshan Bandara",
            "headline": "Senior Java Backend Engineer",
            "exp": 6.0,
            "city": "Kandy",
            "lat": 7.2906,
            "lon": 80.6337,
            "skills": ["Java", "Spring Boot", "MySQL", "Docker"],
            "role": "Backend Engineer",
            "degree_level": "bachelor"
        },
        # Candidate C: React, TypeScript (3 yrs, Colombo)
        {
            "email": "cand_c_test@dullnit.com",
            "name": "Nadeesha Fernando",
            "headline": "Frontend React Engineer",
            "exp": 3.0,
            "city": "Colombo",
            "lat": 6.9271,
            "lon": 79.8612,
            "skills": ["React", "TypeScript", "JavaScript"],
            "role": "Frontend Engineer",
            "degree_level": "bachelor"
        },
        # Candidate D: Python, Django, AWS (7 yrs, Galle: 6.0535, 80.2210)
        {
            "email": "cand_d_test@dullnit.com",
            "name": "Chathura Silva",
            "headline": "Lead Cloud & Python Engineer",
            "exp": 7.0,
            "city": "Galle",
            "lat": 6.0535,
            "lon": 80.2210,
            "skills": ["Python", "Django", "AWS", "PostgreSQL"],
            "role": "Backend Engineer",
            "degree_level": "bachelor"
        },
    ]

    for c in candidates_data:
        if db.query(User).filter(User.email == c["email"]).first():
            continue
        u = User(
            email=c["email"],
            hashed_password=hash_password("Pass123!"),
            role=UserRole.CANDIDATE.value,
            is_active=True
        )
        db.add(u)
        db.flush()

        p = CandidateProfile(
            user_id=u.id,
            full_name=c["name"],
            headline=c["headline"],
            total_years_experience=c["exp"],
            availability_status="available",
            profile_visibility="public",
            is_searchable=True,
            completeness_score=90
        )
        db.add(p)
        db.flush()

        loc = CandidateLocation(
            candidate_id=p.id,
            city=c["city"],
            country="Sri Lanka",
            latitude=c["lat"],
            longitude=c["lon"]
        )
        db.add(loc)

        for s_name in c["skills"]:
            cs = CandidateSkill(
                candidate_id=p.id,
                original_name=s_name,
                normalized_name=s_name,
                source="confirmed",
                confidence=1.0
            )
            db.add(cs)

        pr = CandidatePreferredRole(
            candidate_id=p.id,
            role_title=c["role"],
            normalized_role=c["role"]
        )
        db.add(pr)

        edu = CandidateEducation(
            candidate_id=p.id,
            institution="University",
            original_degree="BSc Computer Science",
            normalized_degree_level=c["degree_level"]
        )
        db.add(edu)

    db.commit()


def test_search_python_developers(client: TestClient, recruiter_auth_headers, db_session: Session):
    headers, _, _ = recruiter_auth_headers
    seed_search_candidates(db_session)

    resp = client.post("/api/v1/search/candidates", json={
        "required_skills": ["Python"]
    }, headers=headers)

    assert resp.status_code == 200
    data = resp.json()
    names = [c["display_name"] for c in data["items"]]
    assert "Kavinda Perera" in names  # Candidate A
    assert "Chathura Silva" in names  # Candidate D
    assert "Dilshan Bandara" not in names  # Candidate B (Java)
    assert "Nadeesha Fernando" not in names  # Candidate C (React)


def test_search_python_and_fastapi(client: TestClient, recruiter_auth_headers, db_session: Session):
    headers, _, _ = recruiter_auth_headers
    seed_search_candidates(db_session)

    resp = client.post("/api/v1/search/candidates", json={
        "required_skills": ["Python", "FastAPI"]
    }, headers=headers)

    assert resp.status_code == 200
    data = resp.json()
    names = [c["display_name"] for c in data["items"]]
    assert "Kavinda Perera" in names
    assert "Chathura Silva" not in names  # Candidate D has Python + Django, but NOT FastAPI


def test_search_experience_filter(client: TestClient, recruiter_auth_headers, db_session: Session):
    headers, _, _ = recruiter_auth_headers
    seed_search_candidates(db_session)

    resp = client.post("/api/v1/search/candidates", json={
        "required_skills": ["Python"],
        "min_experience": 5.0
    }, headers=headers)

    assert resp.status_code == 200
    data = resp.json()
    names = [c["display_name"] for c in data["items"]]
    assert "Chathura Silva" in names  # 7 yrs
    assert "Kavinda Perera" not in names  # 4 yrs (excluded by min_experience=5.0)


def test_geographic_radius_search(client: TestClient, recruiter_auth_headers, db_session: Session):
    headers, _, _ = recruiter_auth_headers
    seed_search_candidates(db_session)

    # Search within 30 km of Colombo (6.9271, 79.8612)
    resp = client.post("/api/v1/search/candidates", json={
        "required_skills": ["Python"],
        "latitude": 6.9271,
        "longitude": 79.8612,
        "radius_km": 30.0
    }, headers=headers)

    assert resp.status_code == 200
    data = resp.json()
    names = [c["display_name"] for c in data["items"]]
    # Candidate A is in Colombo (~0 km away) -> Included
    assert "Kavinda Perera" in names
    # Candidate D is in Galle (~115 km away) -> Excluded by 30km radius filter!
    assert "Chathura Silva" not in names

    # Check match explanation and distance reporting
    candidate_a = next(c for c in data["items"] if c["display_name"] == "Kavinda Perera")
    assert candidate_a["distance_km"] is not None
    assert candidate_a["distance_km"] < 5.0
    assert candidate_a["match_score"] > 80.0
    assert any("Python" in r for r in candidate_a["match_reasons"])
