import json
from typing import Optional, Type, TypeVar
from pydantic import BaseModel
from app.ai.base import LLMProvider
from app.schemas.resume import (
    ResumeExtractionResult,
    ExtractedPersonalInfo,
    ExtractedProfessionalInfo,
    ExtractedSkillItem,
    ExtractedEducationItem,
    ExtractedExperienceItem,
)

T = TypeVar("T", bound=BaseModel)


class FakeLLMProvider(LLMProvider):
    """Deterministic mock LLM provider for unit tests, offline development, and fallback."""

    def __init__(self, custom_response: Optional[BaseModel] = None):
        self.custom_response = custom_response

    def generate_structured(
        self,
        prompt: str,
        response_schema: Type[T],
        system_instruction: Optional[str] = None
    ) -> T:
        if self.custom_response and isinstance(self.custom_response, response_schema):
            return self.custom_response

        # Synthetic structured resume extraction response
        if response_schema == ResumeExtractionResult:
            prompt_lower = prompt.lower()
            # Detect language hints
            detected_lang = "en"
            if "ingeniero" in prompt_lower or "experiencia" in prompt_lower:
                detected_lang = "es"
            elif "développeur" in prompt_lower or "expérience" in prompt_lower:
                detected_lang = "fr"
            elif "entwickler" in prompt_lower or "berufserfahrung" in prompt_lower:
                detected_lang = "de"

            result = ResumeExtractionResult(
                personal_information=ExtractedPersonalInfo(
                    full_name="Alex Mercer",
                    email="alex.mercer@example.com",
                    phone="+1 555 123 4567",
                    city="Colombo",
                    country="Sri Lanka"
                ),
                professional_information=ExtractedProfessionalInfo(
                    current_title="Senior Python Engineer",
                    headline="Senior Backend Engineer with 5 years in Python & Cloud Architecture",
                    professional_summary="Experienced backend specialist focusing on FastAPI microservices and distributed database tuning.",
                    estimated_total_experience_years=5.0
                ),
                skills=[
                    ExtractedSkillItem(original_name="Python", normalized_name="Python", confidence=0.98, source="llm"),
                    ExtractedSkillItem(original_name="FastAPI", normalized_name="FastAPI", confidence=0.95, source="llm"),
                    ExtractedSkillItem(original_name="PostgreSQL", normalized_name="PostgreSQL", confidence=0.92, source="llm"),
                    ExtractedSkillItem(original_name="Docker", normalized_name="Docker", confidence=0.90, source="llm"),
                ],
                education=[
                    ExtractedEducationItem(
                        institution="University of Colombo",
                        original_degree="Bachelor of Science in Computer Science",
                        normalized_degree_level="bachelor",
                        normalized_degree_type="BSc",
                        field_of_study="Computer Science",
                        start_date="2015",
                        end_date="2019"
                    )
                ],
                experience=[
                    ExtractedExperienceItem(
                        company="Global Tech Systems",
                        original_job_title="Senior Software Engineer",
                        normalized_role="Backend Engineer",
                        location="Colombo",
                        start_date="2019-01",
                        end_date="Present",
                        current_position=True,
                        description="Built scalable microservices using FastAPI and optimized database indexing.",
                        identified_skills=["Python", "FastAPI", "PostgreSQL"]
                    )
                ],
                suggested_roles=["Backend Engineer", "API Engineer", "Software Engineer"],
                detected_language=detected_lang
            )
            return result  # type: ignore

        # Generic Pydantic fallback
        return response_schema.model_validate({})

    def generate_text(
        self,
        prompt: str,
        system_instruction: Optional[str] = None
    ) -> str:
        return "Mid-Level Backend Software Engineer with approximately 4 years of experience. Strongest skills include Python, FastAPI, PostgreSQL, Docker and REST API development. Suitable for Backend Engineer, API Engineer and Software Engineer positions."

    def health_check(self) -> bool:
        return True
