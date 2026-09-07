import re
from typing import Optional, Tuple


class JobTitleNormalizer:
    """Normalizes raw job titles into canonical role families for structured search."""

    ROLE_FAMILIES = [
        (re.compile(r"\b(backend|api|server|django|fastapi|spring|node|python|golang|flask)\b", re.I), "Backend Engineer"),
        (re.compile(r"\b(frontend|react|vue|angular|web\s+developer|ui)\b", re.I), "Frontend Engineer"),

        (re.compile(r"\b(full\s*stack|fullstack)\b", re.I), "Full Stack Engineer"),
        (re.compile(r"\b(devops|sre|infrastructure|cloud|platform)\b", re.I), "DevOps Engineer"),
        (re.compile(r"\b(data\s+scientist|machine\s+learning|ml\s+engineer|ai\s+engineer)\b", re.I), "Data Scientist / AI Engineer"),
        (re.compile(r"\b(data\s+engineer|etl|big\s+data)\b", re.I), "Data Engineer"),
        (re.compile(r"\b(mobile|android|ios|flutter|react\s+native)\b", re.I), "Mobile Engineer"),
        (re.compile(r"\b(qa|quality\s+assurance|test|automation\s+engineer)\b", re.I), "QA Engineer"),
        (re.compile(r"\b(architect|tech\s+lead|team\s+lead|engineering\s+manager)\b", re.I), "Technical Lead / Architect"),
        (re.compile(r"\b(software\s+engineer|software\s+developer|programmer)\b", re.I), "Software Engineer"),
    ]

    SENIORITY_PATTERNS = [
        (re.compile(r"\b(lead|principal|director|head|vp)\b", re.I), "Lead / Principal"),
        (re.compile(r"\b(senior|sr\.?)\b", re.I), "Senior"),
        (re.compile(r"\b(mid|intermediate)\b", re.I), "Mid-Level"),
        (re.compile(r"\b(junior|associate|entry|intern)\b", re.I), "Junior"),
    ]

    @classmethod
    def normalize(cls, raw_title: str) -> Tuple[str, str]:
        """
        Normalizes a job title.
        Returns: (normalized_role_family, detected_seniority)
        """
        role = "Software Engineer"
        for pattern, canon_role in cls.ROLE_FAMILIES:
            if pattern.search(raw_title):
                role = canon_role
                break

        seniority = "Mid-Level"
        for pattern, sen in cls.SENIORITY_PATTERNS:
            if pattern.search(raw_title):
                seniority = sen
                break

        return role, seniority
