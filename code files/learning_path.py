from gemini_client import get_gemini_service


def get_learning_recommendations(topic: str) -> str:
    """Generate a beginner-to-advanced learning path."""

    topic = topic.strip()

    if not topic:
        raise ValueError(
            "Please provide a topic for the learning path."
        )

    prompt = f"""
Create a structured learning path for:

{topic}

The learner may be a beginner.

Organize the learning path into:

1. Beginner level
2. Intermediate level
3. Advanced level

For every level include:

- Topics to learn
- What the learner should understand
- Suggested practice
- Small project ideas
- Useful resource types such as:
  videos, documentation, articles, books, or practice websites

Also provide:

- Recommended learning order
- Approximate time required for each level
- Prerequisites
- A final project idea

Do not invent specific URLs unless you are certain they exist.
When mentioning resources, resource types are enough.
"""

    service = get_gemini_service()

    return service.generate_text(
        prompt,
        system_instruction=(
            "You are an experienced educational mentor. "
            "Create realistic, progressive learning plans."
        ),
        temperature=0.4,
        max_output_tokens=3000,
    )