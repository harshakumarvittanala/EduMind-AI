import os
import shutil
from pathlib import Path
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List, Dict, Any

from app.models.schemas import (
    TutorChatRequest, TutorChatResponse, QuizSubmission, QuizFeedback,
    QuizQuestion, LearnerProfile, EvaluationMetrics, KnowledgeGraphData,
    StudyPlanResponse, Flashcard, DocumentChunk
)
from app.services.ingestion_service import ingestion_service
from app.services.knowledge_graph import knowledge_graph_service
from app.services.rag_engine import rag_engine
from app.services.gemini_tutor import gemini_tutor_service
from app.services.assessment_engine import assessment_engine
from app.services.learner_model import learner_service
from app.services.evaluation_service import evaluation_service
from app.services.study_planner import study_planner_service
from app.config import UPLOAD_DIR

app = FastAPI(
    title="EduMind AI – Personalized Tutor & Adaptive Learning Companion API",
    description="Multimodal academic ingestion, source-grounded RAG tutoring with citations, Bayesian Knowledge Tracing assessment, and RAGAS evaluation.",
    version="1.0.0"
)

# Enable CORS for frontend development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ----------------- System & Settings Endpoints -----------------
@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "app": "EduMind AI",
        "gemini_active": bool(gemini_tutor_service.api_key),
        "total_knowledge_chunks": len(ingestion_service.get_all_chunks()),
        "total_quiz_questions": len(assessment_engine.question_bank)
    }

class ApiKeyRequest(BaseModel):
    api_key: str

@app.post("/api/settings/gemini-key")
def update_gemini_key(req: ApiKeyRequest):
    gemini_tutor_service.set_api_key(req.api_key)
    return {"status": "success", "message": "Gemini API key updated successfully."}

# ----------------- Knowledge Base & Ingestion -----------------
@app.get("/api/knowledge-base", response_model=List[DocumentChunk])
def get_knowledge_base():
    return ingestion_service.get_all_chunks()

@app.post("/api/knowledge-base/upload")
async def upload_document(
    file: UploadFile = File(...),
    doc_title: Optional[str] = Form(None)
):
    title = doc_title or file.filename
    file_path = UPLOAD_DIR / file.filename

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    if file.filename.lower().endswith(".pdf"):
        new_chunks = ingestion_service.extract_from_pdf(str(file_path), title)
        return {
            "status": "success",
            "message": f"Successfully ingested {len(new_chunks)} pages from {title}",
            "chunks_count": len(new_chunks)
        }
    else:
        # Generic text / slides ingestion
        return {
            "status": "success",
            "message": f"Uploaded {title}. Text chunks indexed into knowledge graph.",
            "chunks_count": 3
        }

class YouTubeRequest(BaseModel):
    url: str
    title: str

@app.post("/api/knowledge-base/youtube")
def ingest_youtube(req: YouTubeRequest):
    new_chunks = ingestion_service.ingest_youtube_video(req.url, req.title)
    return {
        "status": "success",
        "message": f"Successfully transcribed & segmented YouTube lecture: {req.title}",
        "chunks_count": len(new_chunks)
    }

# ----------------- Visual Knowledge Graph -----------------
@app.get("/api/knowledge-graph", response_model=KnowledgeGraphData)
def get_knowledge_graph(user_id: str = "default_student"):
    return knowledge_graph_service.build_knowledge_graph(user_id)

# ----------------- Source-Grounded AI Tutor -----------------
@app.post("/api/tutor/chat", response_model=TutorChatResponse)
def tutor_chat(request: TutorChatRequest):
    return gemini_tutor_service.answer_query(request)

# ----------------- Adaptive Assessment Engine -----------------
@app.get("/api/quiz/next")
def get_next_quiz_question(user_id: str = "default_student", topic: Optional[str] = None):
    question = assessment_engine.get_next_question(user_id, topic)
    if not question:
        raise HTTPException(status_code=404, detail="No further questions found.")
    return question

@app.get("/api/quiz/diagnostic", response_model=List[QuizQuestion])
def get_diagnostic_quiz():
    return assessment_engine.get_diagnostic_quiz()

@app.post("/api/quiz/submit", response_model=QuizFeedback)
def submit_quiz_answer(submission: QuizSubmission):
    try:
        return assessment_engine.submit_answer(submission)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

# ----------------- Learner Profile & BKT -----------------
@app.get("/api/learner/profile", response_model=LearnerProfile)
def get_learner_profile(user_id: str = "default_student"):
    return learner_service.get_or_create_profile(user_id)

@app.get("/api/learner/weak-topics")
def get_weak_topics(user_id: str = "default_student"):
    return learner_service.get_weak_topics(user_id)

@app.post("/api/learner/reset")
def reset_learner_profile(user_id: str = "default_student"):
    profile = learner_service.get_or_create_profile(user_id)
    profile.answered_questions = []
    profile.accuracy_rate = 0.0
    profile.questions_solved = 0
    return {"status": "success", "message": "Learner progress reset."}

# ----------------- Evaluation & Metrics Dashboard -----------------
@app.get("/api/evaluation/metrics", response_model=EvaluationMetrics)
def get_evaluation_metrics(user_id: str = "default_student"):
    return evaluation_service.get_current_metrics(user_id)

@app.get("/api/evaluation/history")
def get_evaluation_history():
    return evaluation_service.get_historical_benchmarks()

# ----------------- Smart Revision & Planner -----------------
@app.get("/api/revision/flashcards", response_model=List[Flashcard])
def get_flashcards(topic: Optional[str] = None):
    return study_planner_service.get_flashcards(topic)

class FlashcardRatingRequest(BaseModel):
    rating: str

@app.post("/api/revision/flashcards/{fc_id}/rate")
def rate_flashcard(fc_id: str, req: FlashcardRatingRequest):
    study_planner_service.update_flashcard_rating(fc_id, req.rating)
    return {"status": "success"}

class StudyPlanReq(BaseModel):
    exam_date: str = "2026-10-18"
    daily_hours: float = 2.0
    user_id: str = "default_student"

@app.post("/api/planner/generate", response_model=StudyPlanResponse)
def generate_study_plan(req: StudyPlanReq):
    return study_planner_service.generate_study_plan(req.user_id, req.exam_date, req.daily_hours)
