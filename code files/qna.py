from gemini_client import get_gemini_service


SYSTEM_INSTRUCTION = """
You are EduGenie, an educational AI assistant.

Your job is to help students learn.

Rules:
1. Give accurate and useful answers.
2. Explain difficult ideas in simple language.
3. Prefer concise answers unless detail is necessary.
4. Use examples when they improve understanding.
5. Do not pretend to know something when you are uncertain.
6. Avoid unnecessary jargon.
7. Format answers using readable paragraphs and bullet points.
"""


def answer_question(question: str) -> str:
    """Answer a student's academic question."""

    question = question.strip()

    if not question:
        raise ValueError("Question cannot be empty.")

    prompt = f"""
A student asked:

{question}

Answer the question clearly.

If the topic is technical:
- define the concept
- explain how it works
- provide a simple example when useful

If the question is a calculation:
- show the important steps

Keep the response educational and easy to understand.
"""

    service = get_gemini_service()

    return service.generate_text(
        prompt,
        system_instruction=SYSTEM_INSTRUCTION,
        temperature=0.3,
        max_output_tokens=1500,
    )