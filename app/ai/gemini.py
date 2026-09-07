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
