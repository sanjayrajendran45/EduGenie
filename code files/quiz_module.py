from typing import List

from pydantic import BaseModel, Field, field_validator

from gemini_client import get_gemini_service


class QuizQuestion(BaseModel):
    question: str = Field(
        description="The multiple-choice question."
    )

    options: List[str] = Field(
        description="Exactly four answer choices."
    )

    correct_answer: str = Field(
        description="The correct answer. It must exactly match one option."
    )

    explanation: str = Field(
        description="A short explanation of why the correct answer is correct."
    )

    @field_validator("options")
    @classmethod
    def validate_options(cls, value):
        if len(value) != 4:
            raise ValueError(
                "Each quiz question must contain exactly four options."
            )

        return value

    @field_validator("correct_answer")
    @classmethod
    def validate_correct_answer(cls, value, info):
        options = info.data.get("options", [])

        if options and value not in options:
            raise ValueError(
                "correct_answer must exactly match one of the options."
            )

        return value


class QuizResponse(BaseModel):
    title: str
    questions: List[QuizQuestion]

    @field_validator("questions")
    @classmethod
    def validate_question_count(cls, value):
        if len(value) != 3:
            raise ValueError(
                "EduGenie must generate exactly three questions."
            )

        return value


def generate_quiz(text: str) -> QuizResponse:
    """Generate a three-question MCQ quiz."""

    text = text.strip()

    if not text:
        raise ValueError(
            "Please provide a topic or passage for the quiz."
        )

    prompt = f"""
Create an educational multiple-choice quiz based on the following
topic or passage.

CONTENT:
{text}

Requirements:

- Generate exactly 3 questions.
- Every question must have exactly 4 options.
- Only one option must be correct.
- The correct_answer must exactly match one of the options.
- Include a short explanation for each answer.
- Questions should test understanding rather than random trivia.
- Make the difficulty appropriate for a student.
"""

    service = get_gemini_service()

    quiz = service.generate_structured(
        prompt,
        QuizResponse,
        system_instruction=(
            "You are an educational quiz generator. "
            "Return only information that follows the requested schema."
        ),
        temperature=0.4,
        max_output_tokens=3500,
    )

    return quiz