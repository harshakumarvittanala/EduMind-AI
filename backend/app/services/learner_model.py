import math
from typing import Dict, Any, List, Optional
from app.models.schemas import LearnerProfile, BKTParameters, QuestionDifficulty

class LearnerModelService:
    def __init__(self):
        # In-memory store of user profiles
        self.profiles: Dict[str, LearnerProfile] = {}
        # Prepopulate a realistic initial learner
        self._init_default_learner()

    def _init_default_learner(self):
        default_user = LearnerProfile(
            user_id="default_student",
            name="Alex Morgan",
            topic_mastery={
                "Neural Network Basics": 0.82,
                "Activation Functions": 0.74,
                "Gradient Descent & Optimization": 0.48,
                "Backpropagation Algorithm": 0.35, # Weak topic!
                "Convolutional Neural Networks (CNNs)": 0.65,
                "Attention Mechanisms & Transformers": 0.40, # Weak topic!
                "Loss Functions & Regularization": 0.78
            },
            bkt_params={
                "Neural Network Basics": BKTParameters(p_l0=0.5, p_t=0.15, p_g=0.25, p_s=0.1),
                "Activation Functions": BKTParameters(p_l0=0.4, p_t=0.15, p_g=0.25, p_s=0.1),
                "Gradient Descent & Optimization": BKTParameters(p_l0=0.3, p_t=0.12, p_g=0.25, p_s=0.1),
                "Backpropagation Algorithm": BKTParameters(p_l0=0.2, p_t=0.10, p_g=0.25, p_s=0.12),
                "Convolutional Neural Networks (CNNs)": BKTParameters(p_l0=0.35, p_t=0.15, p_g=0.25, p_s=0.1),
                "Attention Mechanisms & Transformers": BKTParameters(p_l0=0.2, p_t=0.10, p_g=0.25, p_s=0.12),
                "Loss Functions & Regularization": BKTParameters(p_l0=0.45, p_t=0.15, p_g=0.25, p_s=0.1)
            },
            answered_questions=[],
            history=[
                {"timestamp": "2026-10-01 10:15", "topic": "Neural Network Basics", "score": 1, "mastery_before": 0.72, "mastery_after": 0.82},
                {"timestamp": "2026-10-02 14:20", "topic": "Backpropagation Algorithm", "score": 0, "mastery_before": 0.42, "mastery_after": 0.35},
                {"timestamp": "2026-10-03 09:30", "topic": "Loss Functions & Regularization", "score": 1, "mastery_before": 0.70, "mastery_after": 0.78}
            ],
            diagnostic_completed=True,
            streak_days=4,
            total_study_minutes=145,
            questions_solved=24,
            accuracy_rate=79.2
        )
        self.profiles["default_student"] = default_user

    def get_or_create_profile(self, user_id: str) -> LearnerProfile:
        if user_id not in self.profiles:
            self.profiles[user_id] = LearnerProfile(
                user_id=user_id,
                name=f"Student {user_id[-4:] if len(user_id) >= 4 else user_id}",
                topic_mastery={},
                bkt_params={},
                answered_questions=[],
                history=[],
                diagnostic_completed=False,
                streak_days=1,
                total_study_minutes=10,
                questions_solved=0,
                accuracy_rate=0.0
            )
        return self.profiles[user_id]

    def update_bkt_mastery(self, user_id: str, topic: str, is_correct: bool) -> tuple[float, float]:
        """
        Bayesian Knowledge Tracing (BKT) update formula:
        1. Posterior update:
           P(L_{t-1} | Correct) = (P(L_{t-1}) * (1 - S)) / (P(L_{t-1})*(1 - S) + (1 - P(L_{t-1}))*G)
           P(L_{t-1} | Incorrect) = (P(L_{t-1}) * S) / (P(L_{t-1})*S + (1 - P(L_{t-1}))*(1 - G))
        2. Transition learning update:
           P(L_t) = P(L_{t-1} | obs) + (1 - P(L_{t-1} | obs)) * T
        """
        profile = self.get_or_create_profile(user_id)
        current_mastery = profile.topic_mastery.get(topic, 0.30)
        params = profile.bkt_params.get(topic, BKTParameters())

        p_l = current_mastery
        p_s = params.p_s
        p_g = params.p_g
        p_t = params.p_t

        if is_correct:
            numerator = p_l * (1.0 - p_s)
            denominator = (p_l * (1.0 - p_s)) + ((1.0 - p_l) * p_g)
        else:
            numerator = p_l * p_s
            denominator = (p_l * p_s) + ((1.0 - p_l) * (1.0 - p_g))

        denominator = max(denominator, 1e-6)
        p_posterior = min(max(numerator / denominator, 0.01), 0.99)

        # Transition
        new_mastery = p_posterior + (1.0 - p_posterior) * p_t
        new_mastery = round(min(max(new_mastery, 0.05), 0.99), 3)

        # Save back to profile
        profile.topic_mastery[topic] = new_mastery
        profile.questions_solved += 1
        correct_count = round((profile.accuracy_rate / 100.0) * (profile.questions_solved - 1)) + (1 if is_correct else 0)
        profile.accuracy_rate = round((correct_count / profile.questions_solved) * 100.0, 1)

        profile.history.append({
            "topic": topic,
            "is_correct": is_correct,
            "mastery_before": current_mastery,
            "mastery_after": new_mastery
        })

        return current_mastery, new_mastery

    def get_recommended_difficulty(self, user_id: str, topic: str) -> QuestionDifficulty:
        """
        Dynamic Difficulty Adjustment based on current topic mastery:
        - Mastery < 0.45 -> EASY (scaffold basic terminology and foundational intuition)
        - Mastery 0.45 - 0.75 -> MEDIUM (application and conceptual comprehension)
        - Mastery > 0.75 -> HARD (edge cases, multi-step math/derivations, synthesis)
        """
        profile = self.get_or_create_profile(user_id)
        mastery = profile.topic_mastery.get(topic, 0.30)

        if mastery < 0.45:
            return QuestionDifficulty.EASY
        elif mastery <= 0.75:
            return QuestionDifficulty.MEDIUM
        else:
            return QuestionDifficulty.HARD

    def get_weak_topics(self, user_id: str, threshold: float = 0.55) -> List[Dict[str, Any]]:
        profile = self.get_or_create_profile(user_id)
        weak = []
        for topic, score in profile.topic_mastery.items():
            if score < threshold:
                weak.append({"topic": topic, "mastery": score, "status": "Needs Attention"})
        # Sort weakest first
        weak.sort(key=lambda x: x["mastery"])
        return weak

learner_service = LearnerModelService()
