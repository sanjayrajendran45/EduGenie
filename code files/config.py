import os

from dotenv import load_dotenv

load_dotenv()


class Settings:
    """Application configuration."""

    APP_NAME: str = os.getenv("APP_NAME", "EduGenie")
    APP_VERSION: str = os.getenv("APP_VERSION", "1.0.0")

    DEBUG: bool = os.getenv("DEBUG", "true").lower() == "true"

    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "").strip()
    GEMINI_MODEL: str = os.getenv(
        "GEMINI_MODEL",
        "gemini-2.5-flash",
    )

    EXPLANATION_PROVIDER: str = os.getenv(
        "EXPLANATION_PROVIDER",
        "gemini",
    ).lower()

    LOCAL_EXPLANATION_MODEL: str = os.getenv(
        "LOCAL_EXPLANATION_MODEL",
        "MBZUAI/LaMini-Flan-T5-783M",
    )


settings = Settings()