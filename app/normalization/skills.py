import re
from typing import Dict, Optional, Tuple
from sqlalchemy.orm import Session
from app.models.skill import Skill, SkillAlias


class SkillNormalizer:
    """Normalizes raw skill strings to canonical names and identifies confidence."""

    def __init__(self, db: Optional[Session] = None):
        self.db = db
        self._canonical_cache: Dict[str, str] = {}
        self._alias_cache: Dict[str, str] = {}
        if db:
            self.load_cache()

    def load_cache(self):
        """Loads canonical skills and aliases into fast memory cache."""
        skills = self.db.query(Skill).all()
        for s in skills:
            self._canonical_cache[s.canonical_name.lower()] = s.canonical_name
            for a in s.aliases:
                self._alias_cache[a.alias.lower()] = s.canonical_name

    def normalize(self, raw_skill: str) -> Tuple[str, float]:
        """
        Normalizes a skill name.
        Returns: (canonical_name, confidence)
        """
        cleaned = raw_skill.strip()
        cleaned_lower = cleaned.lower()

        # 1. Exact canonical match (case-insensitive)
        if cleaned_lower in self._canonical_cache:
            return self._canonical_cache[cleaned_lower], 1.0

        # 2. Known alias match
        if cleaned_lower in self._alias_cache:
            return self._alias_cache[cleaned_lower], 0.95

        # 3. Punctuation-stripped match (e.g. "React.js" -> "react js" -> "react")
        stripped = re.sub(r"[.\-_]", "", cleaned_lower).replace(" ", "")
        for alias_low, canon in self._alias_cache.items():
            alias_stripped = re.sub(r"[.\-_]", "", alias_low).replace(" ", "")
            if stripped == alias_stripped:
                return canon, 0.90

        for canon_low, canon in self._canonical_cache.items():
            canon_stripped = re.sub(r"[.\-_]", "", canon_low).replace(" ", "")
            if stripped == canon_stripped:
                return canon, 0.90

        # Unrecognized skill: return original title-cased with moderate confidence
        return cleaned.title(), 0.70
