import uuid
from typing import List, Dict, Any, Optional
from app.models.schemas import (
    QuizQuestion, QuizSubmission, QuizFeedback, QuestionDifficulty, QuestionType, Citation, DocumentType
)
from app.services.learner_model import learner_service
from app.services.ingestion_service import ingestion_service

class AssessmentEngine:
    def __init__(self):
        self.question_bank: List[QuizQuestion] = []
        self._init_question_bank()

    def _init_question_bank(self):
        """Populate source-grounded questions across MCQs, Short conceptual, and Numerical problems."""
        # 1. Backpropagation MCQ (Difficulty: Medium)
        q1 = QuizQuestion(
            id="q_bp_01",
            topic="Backpropagation Algorithm",
            subtopic="Branch Node Gradients",
            difficulty=QuestionDifficulty.MEDIUM,
            question_type=QuestionType.MCQ,
            prompt="In reverse-mode automatic differentiation (backpropagation), when an intermediate variable in a computational graph feeds into two or more outgoing operations, how are the incoming upstream gradients combined during the backward pass?",
            options=[
                "A) The upstream gradients are multiplied together via the product rule",
                "B) The upstream gradients are summed together via the multivariate chain rule",
                "C) Only the maximum upstream gradient is kept while others are zeroed out",
                "D) The gradients are averaged and scaled by the batch dimension"
            ],
            correct_answer="B) The upstream gradients are summed together via the multivariate chain rule",
            explanation="According to the Multivariate Chain Rule, if a variable x influences the loss through paths y and z, dL/dx = (dL/dy * dy/dx) + (dL/dz * dz/dx). Thus, incoming upstream gradients from multiple branches must be ADDED together, not multiplied.",
            citation=Citation(
                chunk_id="doc_vid_2",
                doc_id="mit_lec_video",
                doc_title="MIT 6.S191: Introduction to Deep Learning",
                doc_type=DocumentType.VIDEO,
                location="Video 10:32",
                snippet="Notice what happens at a node with multiple outgoing branches during the backward pass: the gradients from all branches MUST be summed together! Downstream branches add up."
            ),
            misconception_hints={
                "A) The upstream gradients are multiplied together via the product rule": "Common Misconception: Confusing the chain rule (which multiplies along a single path) with fan-out branches (which add across independent diverging paths)."
            }
        )

        # 2. Activation Function / Numerical (Difficulty: Easy)
        q2 = QuizQuestion(
            id="q_act_02",
            topic="Activation Functions",
            subtopic="Vanishing Gradients",
            difficulty=QuestionDifficulty.EASY,
            question_type=QuestionType.MCQ,
            prompt="What is the maximum possible value of the first derivative of the standard Sigmoid function sigma(z) = 1 / (1 + exp(-z)), and why does this trigger the vanishing gradient problem?",
            options=[
                "A) Max derivative is 1.0 at z = 0, causing no gradient shrinkage",
                "B) Max derivative is 0.25 at z = 0, causing gradients to contract by at least 4x at every sigmoid layer",
                "C) Max derivative is 0.50 at z = 1, leading to oscillating gradients",
                "D) Max derivative is infinity due to division by zero at negative inputs"
            ],
            correct_answer="B) Max derivative is 0.25 at z = 0, causing gradients to contract by at least 4x at every sigmoid layer",
            explanation="The derivative of the sigmoid is sigma'(z) = sigma(z) * (1 - sigma(z)). At z = 0, sigma(0) = 0.5, so sigma'(0) = 0.5 * 0.5 = 0.25. Since the derivative is at most 0.25, multiplying across deep layers drives gradients exponentially towards 0.",
            citation=Citation(
                chunk_id="doc_tb_2",
                doc_id="dl_textbook_vol1",
                doc_title="Deep Learning Foundations (Textbook)",
                doc_type=DocumentType.TEXTBOOK,
                location="Page 28",
                snippet="For very high or very low activations, its derivative sigma'(z) approaches 0. When gradients are backpropagated through multiple Sigmoid layers, multiplying by these fractional derivatives causes the gradient to vanish exponentially."
            ),
            misconception_hints={
                "A) Max derivative is 1.0 at z = 0, causing no gradient shrinkage": "Misconception: Mistaking the maximum value of the sigmoid function itself (1.0) with the maximum value of its derivative (0.25)."
            }
        )

        # 3. Optimization / Adam Optimizer (Difficulty: Hard)
        q3 = QuizQuestion(
            id="q_opt_03",
            topic="Gradient Descent & Optimization",
            subtopic="Adaptive Learning Rates",
            difficulty=QuestionDifficulty.HARD,
            question_type=QuestionType.MCQ,
            prompt="In the Adam optimizer, why is bias correction essential for the first and second moment estimates during the initial iterations of training?",
            options=[
                "A) Because moment vectors are initialized to zero, causing raw estimates to be biased heavily toward zero early on",
                "B) Because the learning rate starts at zero and must be warmed up exponentially",
                "C) Because gradients on mini-batches are always strictly positive",
                "D) To prevent matrix singularity in the Hessian inverse approximation"
            ],
            correct_answer="A) Because moment vectors are initialized to zero, causing raw estimates to be biased heavily toward zero early on",
            explanation="Since m_0 = 0 and v_0 = 0, m_t is a convex combination starting from 0. Dividing by (1 - beta_1^t) and (1 - beta_2^t) un-biases the estimators toward their true expected values, especially when t is small.",
            citation=Citation(
                chunk_id="doc_sl_2",
                doc_id="lec04_slides",
                doc_title="Lecture 04: Computational Graphs & Optimizers",
                doc_type=DocumentType.SLIDE,
                location="Slide 12",
                snippet="Adam maintains exponentially decaying moving averages of past gradients and squared gradients. Both moments are bias-corrected to counteract initialization at zero."
            ),
            misconception_hints={
                "B) Because the learning rate starts at zero and must be warmed up exponentially": "Misconception: Confusing Adam's mathematical moment unbiasing with learning rate warmup schedules."
            }
        )

        # 4. Transformers / Numerical Problem (Difficulty: Medium)
        q4 = QuizQuestion(
            id="q_att_04",
            topic="Attention Mechanisms & Transformers",
            subtopic="Scaled Dot-Product",
            difficulty=QuestionDifficulty.MEDIUM,
            question_type=QuestionType.NUMERICAL,
            prompt="In Scaled Dot-Product Attention with Key dimension d_k = 64, by what exact scaling factor do we divide the dot product (Q * K^T) before feeding it into the Softmax function?",
            correct_answer="8",
            explanation="The scaling factor is sqrt(d_k). With d_k = 64, sqrt(64) = 8. Dividing by 8 prevents the dot products from growing large in magnitude, which would push softmax into regions with vanishing gradients.",
            citation=Citation(
                chunk_id="doc_vid_3",
                doc_id="mit_lec_video",
                doc_title="MIT 6.S191: Introduction to Deep Learning",
                doc_type=DocumentType.VIDEO,
                location="Video 21:45",
                snippet="The attention weights are given by softmax((Q * K^T) / sqrt(d_k)). Dividing by the square root of key dimension d_k prevents the dot products from growing excessively large."
            )
        )

        # 5. Convolutional Networks / Short Conceptual (Difficulty: Easy)
        q5 = QuizQuestion(
            id="q_cnn_05",
            topic="Convolutional Neural Networks (CNNs)",
            subtopic="Parameter Sharing",
            difficulty=QuestionDifficulty.EASY,
            question_type=QuestionType.SHORT,
            prompt="What are the two foundational inductive biases that enable Convolutional Layers to drastically reduce parameter count compared to Fully Connected layers?",
            correct_answer="Local Connectivity and Parameter Sharing (Translation Equivariance)",
            explanation="Instead of connecting every input pixel to every output neuron, CNNs use Local Connectivity (small receptive fields) and Parameter Sharing (sliding identical kernel weights across the entire image).",
            citation=Citation(
                chunk_id="doc_sl_3",
                doc_id="lec04_slides",
                doc_title="Lecture 04: Computational Graphs & Optimizers",
                doc_type=DocumentType.SLIDE,
                location="Slide 18",
                snippet="Convolutional Layers exploit two key inductive biases: Local Connectivity and Translation Equivalence. Parameter sharing dramatically reduces parameter count compared to fully-connected layers."
            )
        )

        # 6. Neural Network Basics (Difficulty: Easy)
        q6 = QuizQuestion(
            id="q_nn_06",
            topic="Neural Network Basics",
            subtopic="Artificial Neurons",
            difficulty=QuestionDifficulty.EASY,
            question_type=QuestionType.MCQ,
            prompt="What happens if a 100-layer deep neural network is constructed without any non-linear activation functions between layers?",
            options=[
                "A) It becomes equivalent to an exponential polynomial curve",
                "B) It collapses mathematically into a single-layer linear model",
                "C) The loss function automatically becomes non-convex",
                "D) The network can fit arbitrary continuous functions (Universal Approximation)"
            ],
            correct_answer="B) It collapses mathematically into a single-layer linear model",
            explanation="Because matrix multiplication is linear: W_2 * (W_1 * x) = (W_2 * W_1) * x = W_combined * x. Any composition of linear transformations is itself merely a single linear transformation.",
            citation=Citation(
                chunk_id="doc_tb_1",
                doc_id="dl_textbook_vol1",
                doc_title="Deep Learning Foundations (Textbook)",
                doc_type=DocumentType.TEXTBOOK,
                location="Page 14",
                snippet="Without non-linear activation functions, any multi-layer neural network collapses mathematically into an equivalent single-layer linear regression model regardless of depth."
            )
        )

        self.question_bank.extend([q1, q2, q3, q4, q5, q6])

    def get_diagnostic_quiz(self) -> List[QuizQuestion]:
        """Return diagnostic baseline quiz for a new learner."""
        return self.question_bank[:4]

    def get_next_question(self, user_id: str, topic: Optional[str] = None) -> Optional[QuizQuestion]:
        """
        Adaptive Question Selector:
        - Filters out already answered questions to guarantee ZERO repetition!
        - Selects question matching student's current BKT difficulty.
        """
        profile = learner_service.get_or_create_profile(user_id)
        answered_set = set(profile.answered_questions)

        # Determine target topic (weakest if not specified)
        if not topic:
            weak_topics = learner_service.get_weak_topics(user_id)
            target_topic = weak_topics[0]["topic"] if weak_topics else "Backpropagation Algorithm"
        else:
            target_topic = topic

        target_diff = learner_service.get_recommended_difficulty(user_id, target_topic)

        # Candidate pool matching topic & unseen
        candidates = [
            q for q in self.question_bank
            if q.id not in answered_set and (topic is None or q.topic == target_topic)
        ]

        if not candidates:
            # Fallback to any unseen question
            candidates = [q for q in self.question_bank if q.id not in answered_set]

        if not candidates:
            # All questions answered! Reset answered set for loop practice
            candidates = self.question_bank

        # Prefer difficulty match
        matched = [c for c in candidates if c.difficulty == target_diff]
        if matched:
            return matched[0]

        return candidates[0]

    def submit_answer(self, submission: QuizSubmission) -> QuizFeedback:
        # Locate question
        target_q = None
        for q in self.question_bank:
            if q.id == submission.question_id:
                target_q = q
                break

        if not target_q:
            raise ValueError(f"Question {submission.question_id} not found")

        # Evaluate correctness
        user_ans = submission.user_answer.strip().lower()
        correct_ans = target_q.correct_answer.strip().lower()

        # Handle MCQ letter or text match
        is_correct = False
        if target_q.question_type == QuestionType.MCQ:
            # Check letter match or string containment
            if user_ans.startswith(correct_ans[:2].lower()) or correct_ans in user_ans or user_ans in correct_ans:
                is_correct = True
        elif target_q.question_type == QuestionType.NUMERICAL:
            # Strip non-digits
            user_num = ''.join(c for c in user_ans if c.isdigit() or c == '.')
            corr_num = ''.join(c for c in correct_ans if c.isdigit() or c == '.')
            is_correct = (user_num == corr_num)
        else:
            # Short answer key terms check
            key_terms = [w for w in target_q.correct_answer.lower().split() if len(w) > 4]
            matched_terms = [w for w in key_terms if w in user_ans]
            is_correct = len(matched_terms) >= 2 or user_ans in correct_ans

        # Update Bayesian Knowledge Tracing
        prev_mastery, new_mastery = learner_service.update_bkt_mastery(
            submission.user_id, target_q.topic, is_correct
        )

        # Record question in answered history (prevents repetition)
        profile = learner_service.get_or_create_profile(submission.user_id)
        if target_q.id not in profile.answered_questions:
            profile.answered_questions.append(target_q.id)

        # Misconception check
        misconception = None
        if not is_correct and target_q.misconception_hints:
            for opt_key, hint in target_q.misconception_hints.items():
                if opt_key[:2].lower() in user_ans:
                    misconception = hint
                    break

        # Next difficulty recommendation
        next_diff = learner_service.get_recommended_difficulty(submission.user_id, target_q.topic)

        # Suggest revision topic if incorrect
        revision_topic = target_q.topic if not is_correct else None

        return QuizFeedback(
            is_correct=is_correct,
            correct_answer=target_q.correct_answer,
            explanation=target_q.explanation,
            citation=target_q.citation,
            misconception=misconception,
            updated_mastery_score=new_mastery,
            previous_mastery_score=prev_mastery,
            next_difficulty=next_diff,
            suggested_revision_topic=revision_topic
        )

assessment_engine = AssessmentEngine()
