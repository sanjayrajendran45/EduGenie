from config import settings
from gemini_client import get_gemini_service


def explain_with_gemini(topic: str) -> str:
    """Explain a topic using Gemini."""

    topic = topic.strip()

    if not topic:
        raise ValueError("Topic cannot be empty.")

    prompt = f"""
Explain the following topic to a beginner:

Topic:
{topic}

Use this structure:

1. Simple definition
2. How it works
3. Simple example
4. Important points

Avoid unnecessarily complicated terminology.
Make the explanation easy for a student to understand.
"""

    service = get_gemini_service()

    return service.generate_text(
        prompt,
        system_instruction=(
            "You are a patient teacher who explains difficult "
            "concepts in simple language."
        ),
        temperature=0.3,
        max_output_tokens=1800,
    )


def explain_with_local_model(topic: str) -> str:
    """Explain a topic using LaMini-Flan-T5 locally."""

    try:
        from transformers import pipeline
    except ImportError as exc:
        raise RuntimeError(
            "Local explanation dependencies are not installed. "
            "Run: pip install -r requirements-local.txt"
        ) from exc

    generator = _get_local_generator()

    prompt = f"""
Explain this topic in simple language for a student.

Topic: {topic}

Give:
1. Definition
2. Simple explanation
3. Example
4. Key points
"""

    result = generator(
        prompt,
        max_new_tokens=300,
        do_sample=False,
    )

    if not result:
        raise RuntimeError(
            "Local model returned no explanation."
        )

    return result[0]["generated_text"].strip()


_local_generator = None


def _get_local_generator():
    global _local_generator

    if _local_generator is None:
        from transformers import pipeline

        _local_generator = pipeline(
            "text2text-generation",
            model=settings.LOCAL_EXPLANATION_MODEL,
        )

    return _local_generator


def explain_topic(topic: str) -> str:
    """Select the configured explanation provider."""

    if not topic.strip():
        raise ValueError("Topic cannot be empty.")

    if settings.EXPLANATION_PROVIDER == "local":
        return explain_with_local_model(topic)

    return explain_with_gemini(topic)