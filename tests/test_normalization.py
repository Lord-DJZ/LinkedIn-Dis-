from app.normalization.skills import SkillNormalizer
from app.normalization.qualifications import QualificationNormalizer
from app.normalization.titles import JobTitleNormalizer
from app.normalization.service import NormalizationService
from sqlalchemy.orm import Session


def test_skill_normalization(db_session: Session):
    normalizer = SkillNormalizer(db_session)

    # 1. Exact canonical
    c1, conf1 = normalizer.normalize("Python")
    assert c1 == "Python"
    assert conf1 == 1.0

    # 2. Known alias: ReactJS -> React
    c2, conf2 = normalizer.normalize("ReactJS")
    assert c2 == "React"
    assert conf2 >= 0.95

    # 3. Known alias with punctuation: React.js -> React
    c3, conf3 = normalizer.normalize("React.js")
    assert c3 == "React"
    assert conf3 >= 0.90

    # 4. Postgres -> PostgreSQL
    c4, conf4 = normalizer.normalize("Postgres")
    assert c4 == "PostgreSQL"
    assert conf4 >= 0.95


def test_qualification_normalization():
    # BSc
    lvl1, dt1, fld1 = QualificationNormalizer.normalize("B.Sc. in Computer Science")
    assert lvl1 == "bachelor"
    assert dt1 == "BSc"
    assert fld1 == "Computer Science"

    # Master / MBA
    lvl2, dt2, fld2 = QualificationNormalizer.normalize("Master of Science in Software Engineering")
    assert lvl2 == "master"
    assert dt2 == "MSc"
    assert fld2 == "Software Engineering"

    # Doctorate
    lvl3, dt3, _ = QualificationNormalizer.normalize("Ph.D. in Artificial Intelligence")
    assert lvl3 == "doctorate"
    assert dt3 == "PhD"

    # Diploma
    lvl4, dt4, _ = QualificationNormalizer.normalize("Higher National Diploma in Computing")
    assert lvl4 == "diploma"


def test_job_title_normalization():
    # Backend Engineer
    role1, sen1 = JobTitleNormalizer.normalize("Senior Python Developer")
    assert role1 == "Backend Engineer"
    assert sen1 == "Senior"

    # Frontend Engineer
    role2, sen2 = JobTitleNormalizer.normalize("Junior React UI Developer")
    assert role2 == "Frontend Engineer"
    assert sen2 == "Junior"

    # Lead Architect
    role3, sen3 = JobTitleNormalizer.normalize("Lead Cloud & Infrastructure Architect")
    assert role3 == "DevOps Engineer" or role3 == "Technical Lead / Architect"
    assert "Lead" in sen3


def test_completeness_calculation():
    score_empty = NormalizationService.calculate_completeness_score(
        headline=None,
        bio=None,
        skills_count=0,
        education_count=0,
        experience_count=0,
        has_location=False
    )
    assert score_empty == 0

    score_full = NormalizationService.calculate_completeness_score(
        headline="Senior Engineer",
        bio="Experienced developer",
        skills_count=5,
        education_count=1,
        experience_count=2,
        has_location=True
    )
    assert score_full >= 90
