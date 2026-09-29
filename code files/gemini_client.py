from functools import lru_cache

from google import genai
from google.genai import types

from config import settings


class GeminiService:
    """Reusable Gemini API service."""

    def __init__(self):
        if not settings.GEMINI_API_KEY:
            raise RuntimeError(
                "GEMINI_API_KEY is missing. "
                "Create a .env file and add your Gemini API key."
            )

        self.client = genai.Client(
            api_key=settings.GEMINI_API_KEY
        )

        self.model = settings.GEMINI_MODEL

    def generate_text(
        self,
        prompt: str,
        *,
        system_instruction: str | None = None,
        temperature: float = 0.4,
        max_output_tokens: int = 2048,
    ) -> str:
        """Generate normal text from Gemini."""

        config = types.GenerateContentConfig(
            temperature=temperature,
            max_output_tokens=max_output_tokens,
            system_instruction=system_instruction,
        )

        response = self.client.models.generate_content(
            model=self.model,
            contents=prompt,
            config=config,
        )

        text = response.text

        if not text:
            raise RuntimeError(
                "Gemini returned an empty response."
            )

        return text.strip()

    def generate_structured(
        self,
        prompt: str,
        response_schema,
        *,
        system_instruction: str | None = None,
        temperature: float = 0.3,
        max_output_tokens: int = 4096,
    ):
        """Generate structured output validated against a Pydantic model."""

        config = types.GenerateContentConfig(
            temperature=temperature,
            max_output_tokens=max_output_tokens,
            response_mime_type="application/json",
            response_schema=response_schema,
            system_instruction=system_instruction,
        )

        response = self.client.models.generate_content(
            model=self.model,
            contents=prompt,
            config=config,
        )

        if not response.text:
            raise RuntimeError(
                "Gemini returned an empty structured response."
            )

        return response_schema.model_validate_json(
            response.text
        )


@lru_cache(maxsize=1)
def get_gemini_service() -> GeminiService:
    return GeminiService()