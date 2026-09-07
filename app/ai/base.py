from abc import ABC, abstractmethod
from typing import Optional, Type, TypeVar
from pydantic import BaseModel

T = TypeVar("T", bound=BaseModel)


class LLMProvider(ABC):
    """Abstract interface for LLM providers."""

    @abstractmethod
    def generate_structured(
        self,
        prompt: str,
        response_schema: Type[T],
        system_instruction: Optional[str] = None
    ) -> T:
        """Generates strict structured output validated against a Pydantic schema."""
        pass

    @abstractmethod
    def generate_text(
        self,
        prompt: str,
        system_instruction: Optional[str] = None
    ) -> str:
        """Generates freeform text."""
        pass

    @abstractmethod
    def health_check(self) -> bool:
        """Returns True if provider is operational and credentials are valid."""
        pass
