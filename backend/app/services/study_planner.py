import datetime
from typing import List, Dict, Any, Optional
from app.models.schemas import Flashcard, StudyPlanResponse, StudyPlanDay, Citation, DocumentType
from app.services.learner_model import learner_service
from app.services.ingestion_service import ingestion_service

class StudyPlannerService:
    def __init__(self):
        self.flashcards: List[Flashcard] = []
        self._init_flashcards()

    def _init_flashcards(self):
        self.flashcards = [
            Flashcard(
                id="fc_1",
                topic="Backpropagation Algorithm",
                front="In computational graphs, how do gradients combine at a node with multiple outgoing branches during the backward pass?",
                back="Upstream gradients from multiple outgoing branches MUST be SUMMED together (via the Multivariate Chain Rule), never multiplied.",
                citation=Citation(
                    chunk_id="doc_vid_2",
                    doc_id="mit_lec_video",
                    doc_title="MIT 6.S191 Lecture Video",
                    doc_type=DocumentType.VIDEO,
                    location="Video 10:32",
                    snippet="Notice what happens at a node with multiple outgoing branches during the backward pass: the gradients from all branches MUST be summed together!"
                ),
                mastery_rating="Learning"
            ),
            Flashcard(
                id="fc_2",
                topic="Activation Functions",
                front="Why do deep networks with Sigmoid activation suffer from the Vanishing Gradient problem?",
                back="The maximum derivative of the sigmoid is 0.25 (at z=0). Cascading multiplications of fractional derivatives across layers cause gradients to shrink exponentially toward earlier layers.",
                citation=Citation(
                    chunk_id="doc_tb_2",
                    doc_id="dl_textbook_vol1",
                    doc_title="Deep Learning Foundations Textbook",
                    doc_type=DocumentType.TEXTBOOK,
                    location="Page 28",
                    snippet="When gradients are backpropagated through multiple Sigmoid layers, multiplying by these fractional derivatives causes the gradient to vanish exponentially."
                ),
                mastery_rating="Mastered"
            ),
            Flashcard(
                id="fc_3",
                topic="Gradient Descent & Optimization",
                front="What is the key purpose of Bias Correction in the Adam Optimizer?",
                back="Because first and second moment vectors are initialized to zero, raw estimates are biased toward zero early in training. Bias correction normalizes them by (1 - beta^t).",
                citation=Citation(
                    chunk_id="doc_sl_2",
                    doc_id="lec04_slides",
                    doc_title="Lecture 04 Slides",
                    doc_type=DocumentType.SLIDE,
                    location="Slide 12",
                    snippet="Both moments are bias-corrected to counteract initialization at zero."
                ),
                mastery_rating="Learning"
            ),
            Flashcard(
                id="fc_4",
                topic="Attention Mechanisms & Transformers",
                front="Why does Scaled Dot-Product Attention divide (Q * K^T) by sqrt(d_k)?",
                back="To prevent large dot product magnitudes from pushing the Softmax function into flat regions with vanishing gradients.",
                citation=Citation(
                    chunk_id="doc_vid_3",
                    doc_id="mit_lec_video",
                    doc_title="MIT 6.S191 Lecture Video",
                    doc_type=DocumentType.VIDEO,
                    location="Video 21:45",
                    snippet="Dividing by the square root of key dimension d_k prevents the dot products from growing excessively large, avoiding vanishing gradients."
                ),
                mastery_rating="New"
            ),
            Flashcard(
                id="fc_5",
                topic="Convolutional Neural Networks (CNNs)",
                front="What are the two primary inductive biases of Convolutional Layers?",
                back="1. Local Connectivity (pixels close together are correlated)\n2. Parameter Sharing / Translation Equivariance (the same kernel filter slides everywhere).",
                citation=Citation(
                    chunk_id="doc_sl_3",
                    doc_id="lec04_slides",
                    doc_title="Lecture 04 Slides",
                    doc_type=DocumentType.SLIDE,
                    location="Slide 18",
                    snippet="Convolutional Layers exploit two key inductive biases: Local Connectivity and Translation Equivalence."
                ),
                mastery_rating="Mastered"
            )
        ]

    def get_flashcards(self, topic: Optional[str] = None) -> List[Flashcard]:
        if topic:
            return [fc for fc in self.flashcards if fc.topic == topic]
        return self.flashcards

    def update_flashcard_rating(self, fc_id: str, rating: str):
        for fc in self.flashcards:
            if fc.id == fc_id:
                fc.mastery_rating = rating
                break

    def generate_study_plan(self, user_id: str, exam_date_str: str = "2026-10-18", daily_hours: float = 2.0) -> StudyPlanResponse:
        weak_topics = learner_service.get_weak_topics(user_id)
        weak_topic_names = [w["topic"] for w in weak_topics] or [
            "Backpropagation Algorithm",
            "Attention Mechanisms & Transformers",
            "Gradient Descent & Optimization"
        ]

        days = 7
        daily_schedule: List[StudyPlanDay] = []
        base_date = datetime.date.today()

        topics_cycle = weak_topic_names + ["Convolutional Neural Networks (CNNs)", "Loss Functions & Regularization", "Comprehensive Mock Exam"]

        citations_pool = [
            Citation(chunk_id="c1", doc_id="dl_tb", doc_title="Deep Learning Foundations", doc_type=DocumentType.TEXTBOOK, location="Page 45", snippet="Backpropagation derivation"),
            Citation(chunk_id="c2", doc_id="lec04", doc_title="Lecture 04 Slides", doc_type=DocumentType.SLIDE, location="Slide 12", snippet="Adam optimizer bias correction"),
            Citation(chunk_id="c3", doc_id="mit_vid", doc_title="MIT 6.S191 Video", doc_type=DocumentType.VIDEO, location="Video 10:32", snippet="Branch node summation rule")
        ]

        for i in range(days):
            day_date = base_date + datetime.timedelta(days=i+1)
            t_name = topics_cycle[i % len(topics_cycle)]
            
            tasks = [
                f"Review foundational theory in {t_name}",
                f"Work through practice numerical exercises and derivations",
                f"Test memory with 5 adaptive quiz questions"
            ]

            daily_schedule.append(StudyPlanDay(
                day=i + 1,
                date=day_date.strftime("%b %d, %Y"),
                focus_topic=t_name,
                estimated_minutes=int(daily_hours * 60),
                tasks=tasks,
                citations=[citations_pool[i % len(citations_pool)]],
                quiz_target_count=5
            ))

        return StudyPlanResponse(
            exam_date=exam_date_str,
            days_left=days,
            weak_topics_targeted=weak_topic_names,
            daily_schedule=daily_schedule,
            projected_mastery_gain=24.5 # +24.5% projected mastery gain
        )

study_planner_service = StudyPlannerService()
