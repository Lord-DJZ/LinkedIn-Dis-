from typing import Optional
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "Dullnit Candidate Discovery Platform"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    API_V1_STR: str = "/api/v1"

    # Database & PostGIS
    DATABASE_URL: str = "postgresql://dullnit:dullnit_password@localhost:5432/dullnit_db"
    TEST_DATABASE_URL: str = "sqlite:///:memory:"

    # Security
    JWT_SECRET: str = "dullnit-super-secret-development-key-change-in-production-32bytes"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440  # 24 hours

    # File Storage
    STORAGE_BACKEND: str = "local"
    UPLOAD_DIR: str = "./storage/uploads"
    MAX_UPLOAD_SIZE_BYTES: int = 10 * 1024 * 1024  # 10 MB

    # AI Configuration (Gemini)
    AI_ENABLED: bool = True
    AI_PROVIDER: str = "gemini"
    GEMINI_API_KEY: Optional[str] = None
    GEMINI_MODEL: str = "gemini-2.5-flash"
    GEMINI_FALLBACK_MODEL: str = "gemini-1.5-flash"
    AI_TIMEOUT_SECONDS: int = 30
    AI_MAX_RETRIES: int = 2
    RUN_LIVE_AI_TESTS: bool = False

    # Scoring Weights (Normalized internally to 1.0)
    WEIGHT_SKILL: float = 0.35
    WEIGHT_EXPERIENCE: float = 0.25
    WEIGHT_EDUCATION: float = 0.15
    WEIGHT_ROLE: float = 0.15
    WEIGHT_LOCATION: float = 0.10

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )


settings = Settings()
