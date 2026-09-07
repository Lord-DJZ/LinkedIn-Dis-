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


def seed_real_credentials_and_cv():
    init_db()
    db: Session = SessionLocal()
    try:
        # 1. CANDIDATE: Demuni Jayasmith (Real CV, Real answers, Real credentials)
        candidate_emails = ["candidate@dullnit.com", "demuni.jayasmith@dullnit.com"]
        candidate_password = hash_password("CandidateSecure2026!")

        for cand_email in candidate_emails:
            user = db.query(User).filter(User.email == cand_email).first()
            if not user:
                user = User(
                    email=cand_email,
                    hashed_password=candidate_password,
                    role=UserRole.CANDIDATE.value,
                    is_active=True,
                )
                db.add(user)
                db.flush()
            else:
                user.hashed_password = candidate_password
                user.role = UserRole.CANDIDATE.value
                user.is_active = True
                db.flush()

            # Ensure profile exists
            profile = db.query(CandidateProfile).filter(CandidateProfile.user_id == user.id).first()
            if not profile:
                profile = CandidateProfile(
                    user_id=user.id,
                    full_name="Demuni Jayasmith",
                    headline="Lead AI Systems & Full-Stack Software Engineer",
                    bio="Ambitious and disciplined AI Systems & Software Engineer with deep expertise in autonomous multi-agent orchestration, high-concurrency backend microservices, and modern reactive web platforms. Currently completing Pearson HND Level 5 in Software Engineering and Pearson HND in Business Management. Track record of architecting low-latency FastAPI services, PostgreSQL database optimizations, and cutting-edge generative AI applications.",
                    avatar_url="/candidate_persona_portrait.jpg",
                    phone="+94 77 123 4567",
                    date_of_birth="2002-04-15",
                    gender="male",
                    total_years_experience=4.0,
                    availability_status="available",
                    profile_visibility="public",
                    is_searchable=True,
                    completeness_score=100,
                )
                db.add(profile)
                db.flush()
            else:
                profile.full_name = "Demuni Jayasmith"
                profile.headline = "Lead AI Systems & Full-Stack Software Engineer"
                profile.bio = "Ambitious and disciplined AI Systems & Software Engineer with deep expertise in autonomous multi-agent orchestration, high-concurrency backend microservices, and modern reactive web platforms. Currently completing Pearson HND Level 5 in Software Engineering and Pearson HND in Business Management. Track record of architecting low-latency FastAPI services, PostgreSQL database optimizations, and cutting-edge generative AI applications."
                profile.avatar_url = "/candidate_persona_portrait.jpg"
                profile.phone = "+94 77 123 4567"
                profile.total_years_experience = 4.0
                profile.availability_status = "available"
                profile.completeness_score = 100
                db.flush()

            # Location
            loc = db.query(CandidateLocation).filter(CandidateLocation.candidate_id == profile.id).first()
            if not loc:
                loc = CandidateLocation(
                    candidate_id=profile.id,
                    city="Colombo",
                    country="Sri Lanka",
                    postal_code="00300",
                    latitude=6.9271,
                    longitude=79.8612,
                )
                db.add(loc)
            else:
                loc.city = "Colombo"
                loc.country = "Sri Lanka"

            # Clear and seed real skills
            db.query(CandidateSkill).filter(CandidateSkill.candidate_id == profile.id).delete()
            real_skills = [
                ("Python", "language", 4.0),
                ("FastAPI", "framework", 3.0),
                ("TypeScript", "language", 3.0),
                ("React", "framework", 3.0),
                ("PostgreSQL", "database", 3.0),
                ("Docker", "devops", 2.5),
                ("PyTorch", "framework", 2.0),
                ("Redis", "database", 2.0),
                ("SQL", "language", 4.0),
                ("Git", "tool", 4.0),
                ("C#", "language", 2.0),
                ("Java", "language", 2.0),
            ]
            for s_name, cat, yrs in real_skills:
                skill_obj = db.query(Skill).filter(Skill.canonical_name == s_name).first()
                if not skill_obj:
                    skill_obj = Skill(canonical_name=s_name, category=cat)
                    db.add(skill_obj)
                    db.flush()
                cs = CandidateSkill(
                    candidate_id=profile.id,
                    skill_id=skill_obj.id,
                    original_name=s_name,
                    normalized_name=s_name,
                    category=cat,
                    years_experience=yrs,
                    confidence=1.0,
                    source="verified_profile",
                )
                db.add(cs)

            # Clear and seed real education (Pearson HND Level 5, Pearson BTEC)
            db.query(CandidateEducation).filter(CandidateEducation.candidate_id == profile.id).delete()
            edu1 = CandidateEducation(
                candidate_id=profile.id,
                institution="Pearson BTEC International",
                original_degree="Pearson HND Level 5 in Software Engineering",
                normalized_degree_level="diploma",
                normalized_degree_type="HND Level 5",
                field_of_study="Software Engineering & Distributed Systems",
                start_date="2024",
                end_date="Present",
                is_current=True,
            )
            edu2 = CandidateEducation(
                candidate_id=profile.id,
                institution="Pearson BTEC International",
                original_degree="Pearson HND in Business Management",
                normalized_degree_level="diploma",
                normalized_degree_type="HND",
                field_of_study="Business Strategy, Leadership & Operations",
                start_date="2024",
                end_date="Present",
                is_current=True,
            )
            edu3 = CandidateEducation(
                candidate_id=profile.id,
                institution="Pearson Edexcel",
                original_degree="Pearson BTEC Level 3 Diploma in IT",
                normalized_degree_level="diploma",
                normalized_degree_type="BTEC Level 3",
                field_of_study="Information Technology & Software Foundations",
                start_date="2022",
                end_date="2024",
                is_current=False,
            )
            db.add_all([edu1, edu2, edu3])

            # Clear and seed real experiences
            db.query(CandidateExperience).filter(CandidateExperience.candidate_id == profile.id).delete()
            exp1 = CandidateExperience(
                candidate_id=profile.id,
                company="Dullnit Intelligence Labs",
                original_job_title="Lead AI & Software Systems Engineer",
                normalized_role="Lead AI Engineer",
                location="Colombo, Sri Lanka",
                start_date="2024",
                end_date="Present",
                is_current=True,
                description="Architected end-to-end multi-agent AI pipelines, low-latency FastAPI microservices, and PostgreSQL pgvector semantic retrieval engine. Led full-stack implementation with React, TypeScript, and Docker container orchestration.",
            )
            exp2 = CandidateExperience(
                candidate_id=profile.id,
                company="Apex Global Technologies",
                original_job_title="Full-Stack Systems Developer",
                normalized_role="Full-Stack Developer",
                location="Colombo, Sri Lanka",
                start_date="2022",
                end_date="2024",
                is_current=False,
                description="Developed enterprise web applications, RESTful APIs, database schema optimizations, and interactive frontends. Collaborated on CI/CD pipelines and microservices deployments.",
            )
            db.add_all([exp1, exp2])

            # Real Persona
            persona = db.query(CandidatePersona).filter(CandidatePersona.candidate_id == profile.id).first()
            if not persona:
                persona = CandidatePersona(
                    candidate_id=profile.id,
                    headline="Lead AI Systems & Full-Stack Software Engineer",
                    summary="Ambitious and disciplined AI Systems & Software Engineer with deep expertise in autonomous multi-agent orchestration, high-concurrency backend microservices, and modern reactive web platforms. Combining software engineering with business strategy to build high-impact production systems.",
                    primary_profession="AI Systems & Software Engineer",
                    seniority_level="Lead / Senior",
                    top_skills=["Python", "FastAPI", "TypeScript", "React", "PostgreSQL", "Docker", "PyTorch", "Redis"],
                    suggested_roles=["Lead AI Engineer", "Principal Systems Architect", "Senior Full-Stack Developer", "Technical Founder"],
                )
                db.add(persona)
            else:
                persona.headline = "Lead AI Systems & Full-Stack Software Engineer"
                persona.summary = "Ambitious and disciplined AI Systems & Software Engineer with deep expertise in autonomous multi-agent orchestration, high-concurrency backend microservices, and modern reactive web platforms. Combining software engineering with business strategy to build high-impact production systems."
                persona.primary_profession = "AI Systems & Software Engineer"
                persona.seniority_level = "Lead / Senior"
                persona.top_skills = ["Python", "FastAPI", "TypeScript", "React", "PostgreSQL", "Docker", "PyTorch", "Redis"]
                persona.suggested_roles = ["Lead AI Engineer", "Principal Systems Architect", "Senior Full-Stack Developer", "Technical Founder"]

        # 2. ORGANIZATION / RECRUITER: Apex Global Technologies
        recruiter_emails = ["recruiter@apexglobal.tech", "organization@dullnit.com", "recruiter@techcorp.com"]
        recruiter_password = hash_password("ApexEnterprise2026!")

        for rec_email in recruiter_emails:
            rec_user = db.query(User).filter(User.email == rec_email).first()
            if not rec_user:
                rec_user = User(
                    email=rec_email,
                    hashed_password=recruiter_password,
                    role=UserRole.RECRUITER.value,
                    is_active=True,
                )
                db.add(rec_user)
                db.flush()
            else:
                rec_user.hashed_password = recruiter_password
                rec_user.role = UserRole.RECRUITER.value
                rec_user.is_active = True
                db.flush()

            rec_prof = db.query(RecruiterProfile).filter(RecruiterProfile.user_id == rec_user.id).first()
            if not rec_prof:
                rec_prof = RecruiterProfile(
                    user_id=rec_user.id,
                    full_name="Sarah Jenkins",
                    company_name="Apex Global Technologies",
                    department="Technical Talent Acquisition",
                    contact_phone="+94 11 234 5678",
                )
                db.add(rec_prof)
            else:
                rec_prof.full_name = "Sarah Jenkins"
                rec_prof.company_name = "Apex Global Technologies"
                rec_prof.department = "Technical Talent Acquisition"
                rec_prof.contact_phone = "+94 11 234 5678"

        db.commit()
        print("Successfully seeded real credentials:")
        print("  - Candidate Login: candidate@dullnit.com / CandidateSecure2026!")
        print("  - Organization Login: recruiter@apexglobal.tech / ApexEnterprise2026!")
        print("  - Real CV backing answers populated for Demuni Jayasmith.")
    except Exception as e:
        db.rollback()
        print(f"Error seeding real accounts: {e}")
        raise e
    finally:
        db.close()


if __name__ == "__main__":
    seed_real_credentials_and_cv()
