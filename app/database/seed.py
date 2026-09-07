import uuid
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from app.database.session import SessionLocal
from app.database.init_db import init_db
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


IMAGE_1_CANDIDATES = [
    {
        "full_name": "Jessica Patrick",
        "email": "jess.pa@gmail.com",
        "phone": "707-723-4127",
        "date_of_birth": "Jan 12, 1981",
        "gender": "female",
        "headline": "Principal Cloud & Distributed Systems Architect",
        "bio": "Specialized in high-concurrency microservices, real-time message brokers, and resilient cloud architecture.",
        "years": 14.0,
        "city": "San Jose",
        "country": "United States",
        "address": "2305 S White Rd, San Jose, CA",
        "avatar_url": "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80",
        "skills": ["Python", "FastAPI", "Kubernetes", "AWS", "PostgreSQL", "Docker"]
    },
    {
        "full_name": "David Kim",
        "email": "david.kim@gmail.com",
        "phone": "669-842-1135",
        "date_of_birth": "Apr 17, 1990",
        "gender": "male",
        "headline": "Senior Full-Stack AI Engineer",
        "bio": "Building multimodal agent platforms, high-throughput reactive frontends, and low-latency inference pipelines.",
        "years": 8.0,
        "city": "San Jose",
        "country": "United States",
        "address": "300 N Capitol Ave, San Jose, CA",
        "avatar_url": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80",
        "skills": ["TypeScript", "React", "Next.js", "Python", "PyTorch", "Redis"]
    },
    {
        "full_name": "Sarah Lopez",
        "email": "s.lopez87@gmail.com",
        "phone": "650-338-4023",
        "date_of_birth": "Nov 23, 1987",
        "gender": "female",
        "headline": "Lead Engineering Manager & DevOps Director",
        "bio": "Mentoring engineering teams, scaling CI/CD platforms, and establishing enterprise security governance.",
        "years": 11.0,
        "city": "San Jose",
        "country": "United States",
        "address": "721 Blossom Hill Rd, San Jose, CA",
        "avatar_url": None,  # Clean ivory card fallback matching Image 1
        "skills": ["Docker", "Kubernetes", "Git", "Go", "AWS", "REST API"]
    },
    {
        "full_name": "Michael Tran",
        "email": "m.tran79@gmail.com",
        "phone": "408-555-0192",
        "date_of_birth": "Aug 08, 1979",
        "gender": "male",
        "headline": "Chief Technology Officer & Systems Architect",
        "bio": "18+ years building mission-critical platforms, fault-tolerant databases, and high-performance engineering teams.",
        "years": 18.0,
        "city": "San Jose",
        "country": "United States",
        "address": "1980 E Capitol Expy, San Jose, CA",
        "avatar_url": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80",
        "skills": ["Python", "C#", "PostgreSQL", "Docker", "SQL", "REST API"]
    },
    {
        "full_name": "Daniel Lee",
        "email": "daniel.lee@example.com",
        "phone": "669-900-1234",
        "date_of_birth": "Dec 04, 1988",
        "gender": "male",
        "headline": "Frontend Platform Architect & Design Systems Lead",
        "bio": "Obsessed with micro-interactions, responsive ergonomics, design systems, and web performance.",
        "years": 9.0,
        "city": "San Jose",
        "country": "United States",
        "address": "877 Palm Ave, San Jose, CA",
        "avatar_url": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80",
        "skills": ["React", "TypeScript", "Next.js", "JavaScript", "REST API"]
    },
    {
        "full_name": "Olivia Brown",
        "email": "olivia.brown@example.com",
        "phone": "707-441-8765",
        "date_of_birth": "Apr 14, 1978",
        "gender": "female",
        "headline": "VP of AI Research & Machine Intelligence",
        "bio": "Leading applied research teams in generative reasoning, agent workflows, and deep learning architectures.",
        "years": 16.0,
        "city": "Santa Rosa",
        "country": "United States",
        "address": "555 Willow Rd, Santa Rosa, CA",
        "avatar_url": "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=800&q=80",
        "skills": ["Python", "PyTorch", "PostgreSQL", "Docker", "REST API"]
    }
]


def seed_image1_candidates(db: Session):
    for c_data in IMAGE_1_CANDIDATES:
        existing = db.query(User).filter(User.email == c_data["email"]).first()
        if existing:
            continue
        user = User(
            email=c_data["email"],
            hashed_password=hash_password("CandidateSecurePass123!"),
            role=UserRole.CANDIDATE.value,
            is_active=True
        )
        db.add(user)
        db.flush()

        profile = CandidateProfile(
            user_id=user.id,
            full_name=c_data["full_name"],
            headline=c_data["headline"],
            bio=c_data["bio"],
            avatar_url=c_data["avatar_url"],
            phone=c_data["phone"],
            date_of_birth=c_data["date_of_birth"],
            gender=c_data["gender"],
            total_years_experience=c_data["years"],
            availability_status="available",
            profile_visibility="public",
            is_searchable=True,
            completeness_score=95
        )
        db.add(profile)
        db.flush()

        loc = CandidateLocation(
            candidate_id=profile.id,
            city=c_data["city"],
            country=c_data["country"],
            latitude=37.3382,
            longitude=-121.8863
        )
        db.add(loc)

        for s_name in c_data["skills"]:
            skill_rec = db.query(Skill).filter(Skill.canonical_name == s_name).first()
            c_skill = CandidateSkill(
                candidate_id=profile.id,
                skill_id=skill_rec.id if skill_rec else None,
                original_name=s_name,
                normalized_name=s_name,
                confidence=1.0,
                source="verified_profile"
            )
            db.add(c_skill)

        # Add persona
        persona = CandidatePersona(
            candidate_id=profile.id,
            headline=c_data["headline"],
            summary=c_data["bio"],
            primary_profession=c_data["headline"].split("&")[0].strip(),
            seniority_level="Senior / Lead",
            top_skills=c_data["skills"],
            suggested_roles=[c_data["headline"], "Principal Engineer"]
        )
        db.add(persona)

    db.commit()


def seed_database():
    init_db()
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

        # 4. Seed Image 1 Candidates
        seed_image1_candidates(db)

        db.commit()

        # 5. Seed Real Candidate (Demuni Jayasmith) and Real Organization (Apex Global)
        from app.database.seed_real_accounts import seed_real_credentials_and_cv
        seed_real_credentials_and_cv()

        print("Database successfully seeded with skills, admin, recruiter, Image 1 candidates, and real verified credentials.")
    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
        raise e
    finally:
        db.close()


if __name__ == "__main__":
    seed_database()

