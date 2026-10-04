from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any, Union
from enum import Enum

class DocumentType(str, Enum):
    TEXTBOOK = "textbook"
    SLIDE = "slide"
    VIDEO = "video"

class DocumentChunk(BaseModel):
    id: str
    doc_id: str
    doc_title: str
    doc_type: DocumentType
    page_number: Optional[int] = None
    slide_number: Optional[int] = None
    video_timestamp: Optional[str] = None # e.g. "10:32" or seconds
    text: str
    visual_description: Optional[str] = None
    topic: str
    subtopic: Optional[str] = None
    concepts: List[str] = Field(default_factory=list)
    prerequisites: List[str] = Field(default_factory=list)

class Citation(BaseModel):
    chunk_id: str
    doc_id: str
    doc_title: str
    doc_type: DocumentType
    location: str # e.g. "Page 45", "Slide 12", "Video 10:32"
    snippet: str
    confidence_score: float = 1.0

class KnowledgeNode(BaseModel):
    id: str
    label: str
    type: str # "topic", "subtopic", "concept"
    description: str
    mastery_level: float = 0.0 # 0.0 to 1.0
    prerequisites: List[str] = Field(default_factory=list)
    doc_references: List[Citation] = Field(default_factory=list)
    x: Optional[float] = None
    y: Optional[float] = None

class KnowledgeEdge(BaseModel):
    source: str
    target: str
    relationship: str # "prerequisite_of", "part_of", "relates_to"

class KnowledgeGraphData(BaseModel):
    nodes: List[KnowledgeNode]
    edges: List[KnowledgeEdge]

class TutorChatRequest(BaseModel):
    message: str
    conversation_history: List[Dict[str, str]] = Field(default_factory=list)
    explain_like_weak: bool = False
    language: str = "en" # "en", "hi", "te", "es"
    user_id: str = "default_student"

class TutorChatResponse(BaseModel):
    answer: str
    citations: List[Citation] = Field(default_factory=list)
    is_grounded: bool = True
    not_covered: bool = False
    highlighted_snippets: List[str] = Field(default_factory=list)
    suggested_followups: List[str] = Field(default_factory=list)
    eliw_applied: bool = False
    language: str = "en"
    faithfulness_score: float = 0.95
    answer_relevance_score: float = 0.94

class QuestionDifficulty(str, Enum):
    EASY = "Easy"
    MEDIUM = "Medium"
    HARD = "Hard"
    ADAPTIVE = "Adaptive"

class QuestionType(str, Enum):
    MCQ = "MCQ"
    SHORT = "Short"
    NUMERICAL = "Numerical"

class QuizQuestion(BaseModel):
    id: str
    topic: str
    subtopic: Optional[str] = None
    difficulty: QuestionDifficulty
    question_type: QuestionType
    prompt: str
    options: Optional[List[str]] = None # For MCQ
    correct_answer: str
    explanation: str
    citation: Citation
    misconception_hints: Dict[str, str] = Field(default_factory=dict) # Option -> misconception

class QuizSubmission(BaseModel):
    question_id: str
    user_answer: str
    user_id: str = "default_student"
    time_taken_seconds: Optional[int] = None

class QuizFeedback(BaseModel):
    is_correct: bool
    correct_answer: str
    explanation: str
    citation: Citation
    misconception: Optional[str] = None
    updated_mastery_score: float
    previous_mastery_score: float
    next_difficulty: QuestionDifficulty
    suggested_revision_topic: Optional[str] = None

class BKTParameters(BaseModel):
    p_l0: float = 0.20 # Prior knowledge probability
    p_t: float = 0.15  # Probability of learning (transition)
    p_g: float = 0.25  # Probability of guessing correctly
    p_s: float = 0.10  # Probability of slipping (error despite knowing)

class LearnerProfile(BaseModel):
    user_id: str
    name: str = "Alex Learner"
    topic_mastery: Dict[str, float] = Field(default_factory=dict) # Topic -> mastery score (0-1)
    bkt_params: Dict[str, BKTParameters] = Field(default_factory=dict)
    answered_questions: List[str] = Field(default_factory=list) # IDs of answered questions
    history: List[Dict[str, Any]] = Field(default_factory=list)
    diagnostic_completed: bool = False
    streak_days: int = 4
    total_study_minutes: int = 145
    questions_solved: int = 24
    accuracy_rate: float = 79.2

class EvaluationMetrics(BaseModel):
    faithfulness: float = 0.96
    answer_relevance: float = 0.94
    context_precision: float = 0.92
    context_recall: float = 0.90
    question_repetition_rate: float = 0.0 # Strict 0% repetition
    student_improvement_rate: float = 28.5 # % increase over baseline
    total_evaluations: int = 42
    timestamp: Optional[str] = None

class Flashcard(BaseModel):
    id: str
    topic: str
    front: str
    back: str
    citation: Citation
    mastery_rating: str = "New" # "New", "Learning", "Mastered"

class StudyPlanDay(BaseModel):
    day: int
    date: str
    focus_topic: str
    estimated_minutes: int
    tasks: List[str]
    citations: List[Citation]
    quiz_target_count: int

class StudyPlanResponse(BaseModel):
    exam_date: str
    days_left: int
    weak_topics_targeted: List[str]
    daily_schedule: List[StudyPlanDay]
    projected_mastery_gain: float
