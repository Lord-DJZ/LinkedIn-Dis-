import re
from typing import Optional, Tuple


class QualificationNormalizer:
    """Normalizes raw degree and qualification descriptions into standardized levels and types."""

    LEVEL_PATTERNS = [
        (re.compile(r"\b(ph\.?d|doctor|doctorate)\b", re.I), "doctorate", "PhD"),
        (re.compile(r"\b(master|m\.?sc|m\.?s|m\.?tech|mba|m\.?eng)\b", re.I), "master", "MSc"),
        (re.compile(r"\b(bachelor|b\.?sc|b\.?s|b\.?tech|b\.?eng|b\.?a)\b", re.I), "bachelor", "BSc"),
        (re.compile(r"\b(hnd|higher national diploma|diploma|associate)\b", re.I), "diploma", "Diploma"),
        (re.compile(r"\b(certificate|cert|certification)\b", re.I), "certificate", "Certificate"),
    ]

    FIELD_PATTERNS = [
        (re.compile(r"\b(computer\s+science|cs)\b", re.I), "Computer Science"),
        (re.compile(r"\b(software\s+engineering|se)\b", re.I), "Software Engineering"),
        (re.compile(r"\b(information\s+technology|it)\b", re.I), "Information Technology"),
        (re.compile(r"\b(data\s+science|machine\s+learning|artificial\s+intelligence|ai)\b", re.I), "Data Science & AI"),
        (re.compile(r"\b(electronics?|telecom(?:munication)?)\b", re.I), "Electronic Engineering"),
        (re.compile(r"\b(business|management|marketing)\b", re.I), "Business Management"),
    ]

    @classmethod
    def normalize(cls, raw_degree: str) -> Tuple[Optional[str], Optional[str], Optional[str]]:
        """
        Normalizes raw degree string.
        Returns: (normalized_degree_level, normalized_degree_type, detected_field_of_study)
        """
        level = None
        deg_type = None
        field = None

        for pattern, lvl, dt in cls.LEVEL_PATTERNS:
            if pattern.search(raw_degree):
                level = lvl
                deg_type = dt
                break

        for pattern, fld in cls.FIELD_PATTERNS:
            if pattern.search(raw_degree):
                field = fld
                break

        return level, deg_type, field
