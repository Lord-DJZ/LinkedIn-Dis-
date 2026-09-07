import re
from typing import Any, Dict, List, Optional
from app.schemas.resume import (
    ResumeExtractionResult,
    ExtractedPersonalInfo,
    ExtractedProfessionalInfo,
    ExtractedSkillItem,
    ExtractedEducationItem,
    ExtractedCertificationItem,
    ExtractedExperienceItem,
)


class RuleBasedResumeParser:
    """Deterministic, regex and dictionary-based resume parser."""

    # Regex patterns
    EMAIL_REGEX = re.compile(r"[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+")
    PHONE_REGEX = re.compile(r"(?:\+?\d{1,3}[-.\s]?)?\(?\d{2,4}\)?[-.\s]?\d{3,4}[-.\s]?\d{3,4}")
    LINKEDIN_REGEX = re.compile(r"(?:https?://)?(?:www\.)?linkedin\.com/in/[a-zA-Z0-9_-]+", re.IGNORECASE)
    GITHUB_REGEX = re.compile(r"(?:https?://)?(?:www\.)?github\.com/[a-zA-Z0-9_-]+", re.IGNORECASE)
    URL_REGEX = re.compile(r"https?://[^\s/$.?#].[^\s]*", re.IGNORECASE)

    # Common degree patterns
    DEGREE_PATTERNS = [
        (r"\b(Ph\.?D|Doctor of Philosophy)\b", "doctorate", "PhD"),
        (r"\b(M\.?Sc|Master of Science|M\.?S|M\.?Tech|MBA)\b", "master", "MSc"),
        (r"\b(B\.?Sc|Bachelor of Science|B\.?S|B\.?Tech|B\.?Eng|Bachelor of Engineering|B\.?A|Bachelor of Arts)\b", "bachelor", "BSc"),
        (r"\b(Diploma|Higher National Diploma|HND)\b", "diploma", "HND"),
        (r"\b(Certificate|Certified)\b", "certificate", "Certificate"),
    ]

    # Section Headers
    SECTIONS = {
        "experience": re.compile(r"^(?:work\s+experience|professional\s+experience|employment\s+history|experience)\b", re.IGNORECASE | re.MULTILINE),
        "education": re.compile(r"^(?:education|academic\s+background|qualifications)\b", re.IGNORECASE | re.MULTILINE),
        "skills": re.compile(r"^(?:technical\s+skills|skills|core\s+competencies|technologies)\b", re.IGNORECASE | re.MULTILINE),
        "certifications": re.compile(r"^(?:certifications|licenses|courses)\b", re.IGNORECASE | re.MULTILINE),
    }

    @classmethod
    def parse(cls, raw_text: str, skill_dictionary: Optional[List[str]] = None) -> ResumeExtractionResult:
        """Runs deterministic extraction over raw text."""
        result = ResumeExtractionResult()
        lines = [line.strip() for line in raw_text.splitlines() if line.strip()]

        # 1. Contact Info & URLs
        emails = cls.EMAIL_REGEX.findall(raw_text)
        if emails:
            result.personal_information.email = emails[0]

        phones = cls.PHONE_REGEX.findall(raw_text)
        if phones:
            # Pick phone with reasonable length
            valid_phones = [p.strip() for p in phones if len(re.sub(r"\D", "", p)) >= 8]
            if valid_phones:
                result.personal_information.phone = valid_phones[0]

        linkedin = cls.LINKEDIN_REGEX.findall(raw_text)
        github = cls.GITHUB_REGEX.findall(raw_text)
        urls = cls.URL_REGEX.findall(raw_text)
        all_links = list(set(linkedin + github + urls))
        result.portfolio_links = all_links

        # First line usually contains candidate name
        if lines:
            first_line = lines[0]
            # Avoid picking a header or contact info as name
            if len(first_line.split()) <= 4 and not cls.EMAIL_REGEX.search(first_line) and not cls.PHONE_REGEX.search(first_line):
                result.personal_information.full_name = first_line

        # 2. Match Skills from taxonomy
        skills_to_search = skill_dictionary or [
            "Python", "JavaScript", "TypeScript", "Java", "C#", "Go", "SQL",
            "FastAPI", "Django", "Flask", "React", "Next.js", "Node.js", "Spring Boot",
            "PostgreSQL", "PostGIS", "MySQL", "MongoDB", "Redis",
            "Docker", "Kubernetes", "AWS", "Git", "REST API"
        ]

        found_skills: Dict[str, ExtractedSkillItem] = {}
        for skill_name in skills_to_search:
            # Exact word boundary search
            pattern = rf"\b{re.escape(skill_name)}\b"
            if re.search(pattern, raw_text, re.IGNORECASE):
                found_skills[skill_name.lower()] = ExtractedSkillItem(
                    original_name=skill_name,
                    normalized_name=skill_name,
                    confidence=1.0,
                    source="rule_based"
                )
        result.skills = list(found_skills.values())

        # 3. Detect Degrees
        for pattern_regex, level, deg_type in cls.DEGREE_PATTERNS:
            match = re.search(pattern_regex, raw_text, re.IGNORECASE)
            if match:
                matched_degree = match.group(0)
                # Find the sentence or line context
                field_guess = None
                for line in lines:
                    if matched_degree.lower() in line.lower():
                        field_guess = line
                        break
                result.education.append(ExtractedEducationItem(
                    institution="Educational Institution",
                    original_degree=field_guess or matched_degree,
                    normalized_degree_level=level,
                    normalized_degree_type=deg_type,
                    field_of_study="Computer Science / Engineering" if "computer" in raw_text.lower() or "software" in raw_text.lower() else None
                ))
                break  # Pick highest qualification detected

        # 4. Years of experience estimation from dates
        year_matches = [int(y) for y in re.findall(r"\b(19\d\d|20\d\d)\b", raw_text)]
        if year_matches:
            min_year = min(year_matches)
            current_year = 2026
            if 1980 <= min_year <= current_year:
                estimated_exp = min(current_year - min_year, 35)
                result.professional_information.estimated_total_experience_years = float(estimated_exp)

        return result
