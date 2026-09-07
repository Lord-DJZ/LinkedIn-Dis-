import uuid
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from app.database.session import SessionLocal
from app.core.security import hash_password
from app.models.user import User, RecruiterProfile, UserRole
from app.models.skill import Skill, SkillAlias
from app.models.candidate import (
    CandidateProfile,
    CandidateLocation,
    CandidateSkill,
    CandidateEducation,
    CandidateExperience,
    CandidatePreferredRole,
)
from app.models.persona import CandidatePersona

SEED_SKILLS = [
    # Languages
    {"name": "Python", "category": "language", "aliases": ["Python3", "Python 3", "py"]},
    {"name": "JavaScript", "category": "language", "aliases": ["JS", "ECMAScript", "ES6", "Vanilla JS"]},
    {"name": "TypeScript", "category": "language", "aliases": ["TS"]},
    {"name": "Java", "category": "language", "aliases": ["Java 17", "Java 21", "Core Java"]},
    {"name": "C#", "category": "language", "aliases": ["CSharp", "C Sharp", ".NET C#"]},
    {"name": "Go", "category": "language", "aliases": ["Golang"]},
    {"name": "SQL", "category": "language", "aliases": ["Structured Query Language"]},

    # Frameworks
    {"name": "FastAPI", "category": "framework", "aliases": ["Fast API"]},
    {"name": "Django", "category": "framework", "aliases": ["Django REST Framework", "DRF"]},
    {"name": "Flask", "category": "framework", "aliases": []},
    {"name": "React", "category": "framework", "aliases": ["React.js", "React JS", "ReactJS"]},
    {"name": "Next.js", "category": "framework", "aliases": ["NextJS", "Next js"]},
    {"name": "Node.js", "category": "framework", "aliases": ["NodeJS", "Node js", "Node"]},
    {"name": "Spring Boot", "category": "framework", "aliases": ["SpringBoot", "Spring"]},
    {"name": "Express", "category": "framework", "aliases": ["Express.js", "ExpressJS"]},

    # Databases
    {"name": "PostgreSQL", "category": "database", "aliases": ["Postgres", "Postgre SQL", "pg"]},
    {"name": "PostGIS", "category": "database", "aliases": ["Post GIS"]},
    {"name": "MySQL", "category": "database", "aliases": ["My SQL"]},
    {"name": "MongoDB", "category": "database", "aliases": ["Mongo", "Mongo DB"]},
    {"name": "Redis", "category": "database", "aliases": []},

    # DevOps & Tools
    {"name": "Docker", "category": "devops", "aliases": ["Docker Compose", "Containerization"]},
    {"name": "Kubernetes", "category": "devops", "aliases": ["K8s", "K8"]},
    {"name": "AWS", "category": "cloud", "aliases": ["Amazon Web Services"]},
    {"name": "Git", "category": "tool", "aliases": ["GitHub", "GitLab"]},
    {"name": "REST API", "category": "architecture", "aliases": ["RESTful", "REST APIs", "REST"]},
]


def seed_database():
    db: Session = SessionLocal()
    try:
        # 1. Seed Skills & Aliases
        for item in SEED_SKILLS:
            existing = db.query(Skill).filter(Skill.canonical_name == item["name"]).first()
            if not existing:
                skill = Skill(
                    canonical_name=item["name"],
                    category=item.get("category", "general")
                )
                db.add(skill)
                db.flush()
                for alias_str in item.get("aliases", []):
                    alias = SkillAlias(skill_id=skill.id, alias=alias_str)
                    db.add(alias)

        # 2. Seed Admin User
        admin_user = db.query(User).filter(User.email == "admin@dullnit.com").first()
        if not admin_user:
            admin_user = User(
                email="admin@dullnit.com",
                hashed_password=hash_password("AdminSecurePass123!"),
                role=UserRole.ADMIN.value,
                is_active=True
            )
            db.add(admin_user)

        # 3. Seed Recruiter User
        recruiter_user = db.query(User).filter(User.email == "recruiter@techcorp.com").first()
        if not recruiter_user:
            recruiter_user = User(
                email="recruiter@techcorp.com",
                hashed_password=hash_password("RecruiterSecurePass123!"),
                role=UserRole.RECRUITER.value,
                is_active=True
            )
            db.add(recruiter_user)
            db.flush()
            recruiter_prof = RecruiterProfile(
                user_id=recruiter_user.id,
                full_name="Sarah Jenkins",
                company_name="Apex Global Technologies",
                department="Technical Talent Acquisition",
                contact_phone="+94 11 234 5678"
            )
            db.add(recruiter_prof)

        # 4. Clean up any leftover fake candidates
        fake_emails = [
            "candidate_a@dullnit.com",
            "candidate_b@dullnit.com",
            "candidate_c@dullnit.com",
            "candidate_d@dullnit.com",
            "candidate1@techcorp.com",
            "candidate2@techcorp.com",
            "candidate3@techcorp.com",
            "candidate4@techcorp.com",
        ]
        fake_users = db.query(User).filter(User.email.in_(fake_emails)).all()
        for fu in fake_users:
            db.delete(fu)

        db.commit()
        print("Database successfully seeded with skills, admin, and recruiter (0 fake candidates).")
    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
        raise e
    finally:
        db.close()


def purge_all_fake_candidates():
    """Removes all non-real test candidates from the database."""
    db: Session = SessionLocal()
    try:
        fake_emails = [
            "candidate_a@dullnit.com",
            "candidate_b@dullnit.com",
            "candidate_c@dullnit.com",
            "candidate_d@dullnit.com",
            "candidate1@techcorp.com",
            "candidate2@techcorp.com",
            "candidate3@techcorp.com",
            "candidate4@techcorp.com",
        ]
        # Delete fake users (cascades to profiles, skills, locations, experiences, education, personas)
        fake_users = db.query(User).filter(User.email.in_(fake_emails)).all()
        for fu in fake_users:
            db.delete(fu)
        db.commit()
        print(f"Purged {len(fake_users)} fake candidate accounts.")
    except Exception as e:
        db.rollback()
        print(f"Error purging fake candidates: {e}")
    finally:
        db.close()


if __name__ == "__main__":
    purge_all_fake_candidates()
    seed_database()

