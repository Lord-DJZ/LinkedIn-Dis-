import time
import logging
from typing import Optional, Type, TypeVar
from pydantic import BaseModel
from google import genai
from google.genai import types
from app.ai.base import LLMProvider
from app.core.config import settings
from app.core.errors import ResumeExtractionException

logger = logging.getLogger(__name__)
T = TypeVar("T", bound=BaseModel)


class GeminiLLMProvider(LLMProvider):
    """Production Google Gemini LLM provider using the google-genai SDK."""

    def __init__(
        self,
        api_key: Optional[str] = None,
        primary_model: Optional[str] = None,
        fallback_model: Optional[str] = None
    ):
        self.api_key = api_key or settings.GEMINI_API_KEY
        self.primary_model = primary_model or settings.GEMINI_MODEL
        self.fallback_model = fallback_model or settings.GEMINI_FALLBACK_MODEL
        self.timeout = settings.AI_TIMEOUT_SECONDS
        self.max_retries = settings.AI_MAX_RETRIES

        if not self.api_key:
            logger.warning("Gemini API key is not configured. Live Gemini calls will fail.")
            self.client = None
        else:
            self.client = genai.Client(api_key=self.api_key)

    def generate_structured(
        self,
        prompt: str,
        response_schema: Type[T],
        system_instruction: Optional[str] = None
    ) -> T:
        if not self.client:
            raise ResumeExtractionException(
                "Gemini API key is not set. Please configure GEMINI_API_KEY in .env.",
                error_code="AI_NOT_CONFIGURED"
            )

        models_to_try = [self.primary_model]
        if self.fallback_model and self.fallback_model != self.primary_model:
            models_to_try.append(self.fallback_model)

        last_error = None
        for model_name in models_to_try:
            for attempt in range(1, self.max_retries + 1):
                try:
                    logger.info(f"Invoking Gemini model '{model_name}', attempt {attempt}/{self.max_retries}")
                    config = types.GenerateContentConfig(
                        system_instruction=system_instruction,
                        response_mime_type="application/json",
                        response_schema=response_schema,
                    )
                    response = self.client.models.generate_content(
                        model=model_name,
                        contents=prompt,
                        config=config,
                    )

                    if not response.text:
                        raise ValueError("Empty response received from Gemini model.")

                    # Parse into Pydantic schema
                    validated_obj = response_schema.model_validate_json(response.text)
                    return validated_obj

                except Exception as e:
                    last_error = e
                    logger.warning(f"Gemini API attempt {attempt} failed on model '{model_name}': {e}")
                    if attempt < self.max_retries:
                        time.sleep(1.5 * attempt)

        raise ResumeExtractionException(
            f"All Gemini extraction attempts failed: {last_error}",
            error_code="AI_CALL_FAILED"
        )

    def generate_text(
        self,
        prompt: str,
        system_instruction: Optional[str] = None
    ) -> str:
        if not self.client:
            raise ResumeExtractionException("Gemini API key is not configured.")

        config = types.GenerateContentConfig(system_instruction=system_instruction)
        response = self.client.models.generate_content(
            model=self.primary_model,
            contents=prompt,
            config=config
        )
        return response.text or ""

    def set_api_key(self, api_key: str):
        """Hot-swaps the Gemini API key and re-initializes client."""
        self.api_key = api_key
        self.client = genai.Client(api_key=api_key)

    def test_connection(self, candidate_api_key: Optional[str] = None) -> dict:
        """Tests live API key connectivity and returns latency and model details."""
        test_key = candidate_api_key or self.api_key
        if not test_key:
            raise ResumeExtractionException("API key is empty.", error_code="API_KEY_MISSING")

        client_to_test = genai.Client(api_key=test_key)
        start_time = time.time()
        res = client_to_test.models.generate_content(
            model=self.primary_model,
            contents="ping"
        )
        latency_ms = int((time.time() - start_time) * 1000)
        if not res or not res.text:
            raise ValueError("Received empty test response from Gemini model.")
        return {
            "connected": True,
            "latency_ms": latency_ms,
            "model": self.primary_model,
            "message": f"Successfully verified Gemini connection in {latency_ms}ms."
        }

    def extract_text_from_file(self, file_path: str, mime_type: str) -> str:
        """Uses Gemini Multimodal to transcribe text from image CVs (PNG, JPG) and scanned PDFs."""
        if not self.client:
            raise ResumeExtractionException("Gemini API key is not configured.", error_code="AI_NOT_CONFIGURED")

        with open(file_path, "rb") as f:
            file_bytes = f.read()

        file_part = types.Part.from_bytes(data=file_bytes, mime_type=mime_type)
        prompt = (
            "You are an expert CV transcription system. "
            "Extract and transcribe all text from this resume/CV document cleanly, "
            "accurately preserving all candidate details including contact info, professional summary, "
            "work experience (company, title, dates, descriptions), education (institution, degree, field, dates), "
            "and skills/certifications."
        )
        config = types.GenerateContentConfig(
            system_instruction="Transcribe the document accurately with clear section headings."
        )
        response = self.client.models.generate_content(
            model=self.primary_model,
            contents=[file_part, prompt],
            config=config
        )
        return response.text or ""

    def generate_structured_from_file(
        self,
        file_path: str,
        mime_type: str,
        response_schema: Type[T],
        system_instruction: Optional[str] = None
    ) -> T:
        """Extracts structured schema directly from image CVs (PNG, JPG) or PDFs using Gemini vision."""
        if not self.client:
            raise ResumeExtractionException("Gemini API key is not configured.", error_code="AI_NOT_CONFIGURED")

        with open(file_path, "rb") as f:
            file_bytes = f.read()

        file_part = types.Part.from_bytes(data=file_bytes, mime_type=mime_type)
        prompt = (
            "Analyze this resume/CV document visually and extract all candidate facts "
            "into the strict structured schema. Correctly parse dates, company names, "
            "job titles, skills, and education."
        )
        config = types.GenerateContentConfig(
            system_instruction=system_instruction,
            response_mime_type="application/json",
            response_schema=response_schema,
        )
        response = self.client.models.generate_content(
            model=self.primary_model,
            contents=[file_part, prompt],
            config=config
        )
        if not response.text:
            raise ValueError("Empty response received from Gemini model.")
        return response_schema.model_validate_json(response.text)

    def health_check(self) -> bool:
        if not self.client:
            return False
        try:
            res = self.client.models.generate_content(
                model=self.primary_model,
                contents="ping"
            )
            return bool(res and res.text)
        except Exception as e:
            logger.error(f"Gemini health check error: {e}")
            return False
