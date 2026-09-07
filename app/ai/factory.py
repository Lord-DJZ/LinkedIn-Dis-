import logging
from app.ai.base import LLMProvider
from app.ai.gemini import GeminiLLMProvider
from app.ai.fake import FakeLLMProvider
from app.core.config import settings

logger = logging.getLogger(__name__)


class LLMProviderFactory:
    """Factory to instantiate the appropriate LLM provider based on configuration."""

    @classmethod
    def get_provider(cls, force_fake: bool = False) -> LLMProvider:
        if force_fake or not settings.AI_ENABLED:
            return FakeLLMProvider()

        provider_name = settings.AI_PROVIDER.lower()
        if provider_name == "gemini":
            if not settings.GEMINI_API_KEY:
                logger.info("No GEMINI_API_KEY provided; falling back to FakeLLMProvider.")
                return FakeLLMProvider()
            return GeminiLLMProvider()

        elif provider_name == "fake":
            return FakeLLMProvider()

        else:
            logger.warning(f"Unknown AI_PROVIDER '{provider_name}'; falling back to FakeLLMProvider.")
            return FakeLLMProvider()
