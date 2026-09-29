from pathlib import Path
from typing import Any

from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from pydantic import BaseModel, Field

from config import settings
from explanation_module import explain_topic
from learning_path import get_learning_recommendations
from qna import answer_question
from quiz_module import QuizResponse, generate_quiz
from summary_module import summarize_text


BASE_DIR = Path(__file__).resolve().parent

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description=(
        "EduGenie - Google Gemini powered "
        "AI learning assistant."
    ),
)


app.mount(
    "/static",
    StaticFiles(directory=BASE_DIR / "static"),
    name="static",
)


templates = Jinja2Templates(
    directory=str(BASE_DIR / "templates")
)


class TextRequest(BaseModel):
    text: str = Field(
        ...,
        min_length=1,
        max_length=30000,
    )


class TopicRequest(BaseModel):
    topic: str = Field(
        ...,
        min_length=1,
        max_length=5000,
    )


class QARequest(BaseModel):
    question: str = Field(
        ...,
        min_length=1,
        max_length=5000,
    )


class TextResponse(BaseModel):
    result: str


@app.get(
    "/",
    response_class=HTMLResponse,
)
@app.get("/")
def home(request: Request):
    return templates.TemplateResponse(
        request=request,
        name="index.html",
        context={
            "request": request,
            "app_name": "EduGenie",
        },
    )


@app.get("/health")
def health() -> dict[str, Any]:
    return {
        "status": "ok",
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "gemini_configured": bool(
            settings.GEMINI_API_KEY
        ),
        "explanation_provider": (
            settings.EXPLANATION_PROVIDER
        ),
    }


@app.post(
    "/qa",
    response_model=TextResponse,
)
def qa(request: QARequest):
    try:
        result = answer_question(request.question)

        return TextResponse(
            result=result
        )

    except ValueError as exc:
        raise HTTPException(
            status_code=400,
            detail=str(exc),
        )

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Q&A failed: {exc}",
        )


@app.post(
    "/explain",
    response_model=TextResponse,
)
def explain(request: TopicRequest):
    try:
        result = explain_topic(request.topic)

        return TextResponse(
            result=result
        )

    except ValueError as exc:
        raise HTTPException(
            status_code=400,
            detail=str(exc),
        )

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Explanation failed: {exc}",
        )


@app.post(
    "/quiz",
    response_model=QuizResponse,
)
def quiz(request: TextRequest):
    try:
        return generate_quiz(request.text)

    except ValueError as exc:
        raise HTTPException(
            status_code=400,
            detail=str(exc),
        )

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Quiz generation failed: {exc}",
        )


@app.post(
    "/summarize",
    response_model=TextResponse,
)
def summarize(request: TextRequest):
    try:
        result = summarize_text(request.text)

        return TextResponse(
            result=result
        )

    except ValueError as exc:
        raise HTTPException(
            status_code=400,
            detail=str(exc),
        )

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Summarization failed: {exc}",
        )


@app.post(
    "/learn/recommendations",
    response_model=TextResponse,
)
def learning_recommendations(
    request: TopicRequest,
):
    try:
        result = get_learning_recommendations(
            request.topic
        )

        return TextResponse(
            result=result
        )

    except ValueError as exc:
        raise HTTPException(
            status_code=400,
            detail=str(exc),
        )

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=(
                f"Learning path generation failed: {exc}"
            ),
        )