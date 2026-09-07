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

        # 4. Helper function to create candidate
        def create_candidate(
            email: str,
            full_name: str,
            headline: str,
            bio: str,
            total_years: float,
            city: str,
            country: str,
            lat: float,
            lon: float,
            skills_list: list,
            education_list: list,
            experiences_list: list,
            preferred_roles: list
        ):
            if db.query(User).filter(User.email == email).first():
                return
            cand_user = User(
                email=email,
                hashed_password=hash_password("CandidateSecurePass123!"),
                role=UserRole.CANDIDATE.value,
                is_active=True
            )
            db.add(cand_user)
            db.flush()

            profile = CandidateProfile(
                user_id=cand_user.id,
                full_name=full_name,
                headline=headline,
                bio=bio,
                total_years_experience=total_years,
                availability_status="available",
                profile_visibility="public",
                is_searchable=True,
                completeness_score=95
            )
            db.add(profile)
            db.flush()

            # Location
            loc = CandidateLocation(
                candidate_id=profile.id,
                city=city,
                country=country,
                latitude=lat,
                longitude=lon,
                coordinates=f"SRID=4326;POINT({lon} {lat})"
            )
            db.add(loc)

            # Skills
            for sk_name in skills_list:
                db_skill = db.query(Skill).filter(Skill.canonical_name == sk_name).first()
                c_skill = CandidateSkill(
                    candidate_id=profile.id,
                    skill_id=db_skill.id if db_skill else None,
                    original_name=sk_name,
                    normalized_name=sk_name,
                    category=db_skill.category if db_skill else "general",
                    years_experience=total_years,
                    confidence=1.0,
                    source="confirmed"
                )
                db.add(c_skill)

            # Education
            for edu in education_list:
                c_edu = CandidateEducation(
                    candidate_id=profile.id,
                    institution=edu["institution"],
                    original_degree=edu["degree"],
                    normalized_degree_level=edu["level"],
                    normalized_degree_type=edu.get("type", "BSc"),
                    field_of_study=edu["field"],
                    start_date=edu.get("start", "2016"),
                    end_date=edu.get("end", "2020"),
                    is_current=False
                )
                db.add(c_edu)

            # Experiences
            for exp in experiences_list:
                c_exp = CandidateExperience(
                    candidate_id=profile.id,
                    company=exp["company"],
                    original_job_title=exp["title"],
                    normalized_role=exp.get("role", "Software Engineer"),
                    location=exp.get("location", city),
                    start_date=exp.get("start", "2020"),
                    end_date=exp.get("end", "Present"),
                    is_current=exp.get("current", True),
                    description=exp.get("description", "Engineered backend microservices and APIs.")
                )
                db.add(c_exp)

            # Preferred Roles
            for pr in preferred_roles:
                c_pr = CandidatePreferredRole(
                    candidate_id=profile.id,
                    role_title=pr,
                    normalized_role=pr
                )
                db.add(c_pr)

            # Persona
            persona = CandidatePersona(
                candidate_id=profile.id,
                headline=headline,
                summary=bio,
                primary_profession=preferred_roles[0] if preferred_roles else "Software Engineer",
                seniority_level="Senior" if total_years >= 5 else "Mid-Level",
                top_skills=skills_list,
                experience_summary=f"{total_years} years of professional engineering experience.",
                education_summary=f"{education_list[0]['degree']} from {education_list[0]['institution']}" if education_list else None,
                suggested_roles=preferred_roles,
                search_keywords=" ".join(skills_list + preferred_roles + [city, country])
            )
            db.add(persona)

        # Candidate A: Python, FastAPI, PostgreSQL (4 yrs exp, BSc Computer Science, Colombo)
        create_candidate(
            email="candidate_a@dullnit.com",
            full_name="Kavinda Perera",
            headline="Mid-Level Backend Software Engineer (Python, FastAPI, PostgreSQL)",
            bio="Backend engineer with 4 years designing high-throughput REST APIs and database schemas.",
            total_years=4.0,
            city="Colombo",
            country="Sri Lanka",
            lat=6.9271,
            lon=79.8612,
            skills_list=["Python", "FastAPI", "PostgreSQL", "Docker", "REST API"],
            education_list=[{
                "institution": "University of Colombo",
                "degree": "BSc in Computer Science",
                "level": "bachelor",
                "type": "BSc",
                "field": "Computer Science"
            }],
            experiences_list=[{
                "company": "Virtusa",
                "title": "Senior Software Engineer",
                "role": "Backend Engineer",
                "start": "2020-01",
                "end": "Present",
                "current": True,
                "description": "Architected FastAPI backend services and optimized PostgreSQL queries."
            }],
            preferred_roles=["Backend Engineer", "API Engineer", "Software Engineer"]
        )

        # Candidate B: Java, Spring Boot, MySQL (6 yrs exp, BSc Software Engineering, Kandy)
        create_candidate(
            email="candidate_b@dullnit.com",
            full_name="Dilshan Bandara",
            headline="Senior Java & Spring Boot Backend Engineer",
            bio="Enterprise backend developer with 6 years building distributed microservices with Java and Spring Boot.",
            total_years=6.0,
            city="Kandy",
            country="Sri Lanka",
            lat=7.2906,
            lon=80.6337,
            skills_list=["Java", "Spring Boot", "MySQL", "Docker", "Kubernetes"],
            education_list=[{
                "institution": "University of Peradeniya",
                "degree": "BSc in Software Engineering",
                "level": "bachelor",
                "type": "BSc",
                "field": "Software Engineering"
            }],
            experiences_list=[{
                "company": "WSO2",
                "title": "Lead Software Engineer",
                "role": "Backend Engineer",
                "start": "2018-03",
                "end": "Present",
                "current": True,
                "description": "Designed enterprise Java microservices and transaction management."
            }],
            preferred_roles=["Backend Engineer", "Java Developer", "Systems Architect"]
        )

        # Candidate C: React, TypeScript, Node.js (3 yrs exp, Colombo)
        create_candidate(
            email="candidate_c@dullnit.com",
            full_name="Nadeesha Fernando",
            headline="Full Stack & Frontend Engineer (React, TypeScript, Node.js)",
            bio="Passionate engineer building accessible, high-performance web applications with modern React.",
            total_years=3.0,
            city="Colombo",
            country="Sri Lanka",
            lat=6.9271,
            lon=79.8612,
            skills_list=["React", "TypeScript", "Node.js", "JavaScript", "Docker"],
            education_list=[{
                "institution": "SLIIT",
                "degree": "BSc (Hons) in Information Technology",
                "level": "bachelor",
                "type": "BSc",
                "field": "Information Technology"
            }],
            experiences_list=[{
                "company": "Sysco LABS",
                "title": "Software Engineer",
                "role": "Full Stack Engineer",
                "start": "2021-06",
                "end": "Present",
                "current": True,
                "description": "Created interactive web applications using React, TypeScript, and Node.js."
            }],
            preferred_roles=["Full Stack Engineer", "Frontend Developer", "Web Developer"]
        )

        # Candidate D: Python, Django, AWS (7 yrs exp, Galle)
        create_candidate(
            email="candidate_d@dullnit.com",
            full_name="Chathura Silva",
            headline="Lead Cloud & Backend Engineer (Python, Django, AWS)",
            bio="Senior backend specialist with 7 years architecting scalable cloud systems on AWS with Django.",
            total_years=7.0,
            city="Galle",
            country="Sri Lanka",
            lat=6.0535,
            lon=80.2210,
            skills_list=["Python", "Django", "AWS", "PostgreSQL", "Docker"],
            education_list=[{
                "institution": "University of Moratuwa",
                "degree": "BSc in Electronic & Telecommunication Engineering",
                "level": "bachelor",
                "type": "BSc",
                "field": "Engineering"
            }],
            experiences_list=[{
                "company": "CodeGen",
                "title": "Tech Lead",
                "role": "Backend Engineer",
                "start": "2017-01",
                "end": "Present",
                "current": True,
                "description": "Led backend engineering team delivering cloud-native travel reservation solutions."
            }],
            preferred_roles=["Backend Engineer", "Cloud Architect", "Technical Lead"]
        )

        db.commit()
        print("Database successfully seeded with skills, aliases, admin, recruiter, and candidates A, B, C, D.")
    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
        raise e
    finally:
        db.close()


if __name__ == "__main__":
    seed_database()
