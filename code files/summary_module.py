from gemini_client import get_gemini_service


def summarize_text(text: str) -> str:
    """Create a concise educational summary."""

    text = text.strip()

    if not text:
        raise ValueError(
            "Please provide text to summarize."
        )

    prompt = f"""
Summarize the following educational text.

TEXT:
{text}

Requirements:

- Keep the important information.
- Remove unnecessary repetition.
- Use simple language.
- Organize the summary with headings or bullet points when useful.
- Do not introduce facts that are not supported by the provided text.
- Make the result useful for exam revision.
"""

    service = get_gemini_service()

    return service.generate_text(
        prompt,
        system_instruction=(
            "You are an educational summarization assistant. "
            "Preserve the important meaning of the source."
        ),
        temperature=0.2,
        max_output_tokens=2000,
    )