from typing import List, Dict, Any
from app.models.schemas import KnowledgeNode, KnowledgeEdge, KnowledgeGraphData, Citation, DocumentType
from app.services.ingestion_service import ingestion_service
from app.services.learner_model import learner_service

class KnowledgeGraphService:
    def __init__(self):
        pass

    def build_knowledge_graph(self, user_id: str = "default_student") -> KnowledgeGraphData:
        profile = learner_service.get_or_create_profile(user_id)
        chunks = ingestion_service.get_all_chunks()

        # Map topics to citations
        topic_citations: Dict[str, List[Citation]] = {}
        for c in chunks:
            cit = Citation(
                chunk_id=c.id,
                doc_id=c.doc_id,
                doc_title=c.doc_title,
                doc_type=c.doc_type,
                location=(
                    f"Page {c.page_number}" if c.page_number
                    else f"Slide {c.slide_number}" if c.slide_number
                    else f"Video {c.video_timestamp}" if c.video_timestamp
                    else "Source"
                ),
                snippet=c.text[:120] + "..."
            )
            if c.topic not in topic_citations:
                topic_citations[c.topic] = []
            topic_citations[c.topic].append(cit)

        nodes: List[KnowledgeNode] = [
            KnowledgeNode(
                id="math_foundations",
                label="Multivariate Calculus & Linear Algebra",
                type="topic",
                description="Core mathematical pillars: partial derivatives, chain rule, matrix dot products, and vector spaces.",
                mastery_level=0.90,
                prerequisites=[],
                doc_references=topic_citations.get("Neural Network Basics", [])[:1],
                x=120,
                y=180
            ),
            KnowledgeNode(
                id="nn_basics",
                label="Neural Network Basics",
                type="topic",
                description="Artificial neurons, perceptrons, linear combinations, and layered feed-forward computation.",
                mastery_level=profile.topic_mastery.get("Neural Network Basics", 0.82),
                prerequisites=["math_foundations"],
                doc_references=topic_citations.get("Neural Network Basics", []),
                x=320,
                y=180
            ),
            KnowledgeNode(
                id="activation_funcs",
                label="Activation Functions",
                type="subtopic",
                description="Non-linear gates: Sigmoid, ReLU, Tanh, and the Vanishing Gradient challenge.",
                mastery_level=profile.topic_mastery.get("Activation Functions", 0.74),
                prerequisites=["nn_basics"],
                doc_references=topic_citations.get("Activation Functions", []),
                x=320,
                y=320
            ),
            KnowledgeNode(
                id="backprop",
                label="Backpropagation Algorithm",
                type="topic",
                description="Reverse-mode automatic differentiation, upstream/local gradient multiplication, and branch node accumulation.",
                mastery_level=profile.topic_mastery.get("Backpropagation Algorithm", 0.35),
                prerequisites=["activation_funcs", "math_foundations"],
                doc_references=topic_citations.get("Backpropagation Algorithm", []),
                x=550,
                y=250
            ),
            KnowledgeNode(
                id="opt_gradient_descent",
                label="Gradient Descent & Optimization",
                type="topic",
                description="Navigating loss landscapes with SGD, Momentum, RMSProp, and Adam with bias correction.",
                mastery_level=profile.topic_mastery.get("Gradient Descent & Optimization", 0.48),
                prerequisites=["backprop"],
                doc_references=topic_citations.get("Gradient Descent & Optimization", []),
                x=750,
                y=180
            ),
            KnowledgeNode(
                id="loss_regularization",
                label="Loss Functions & Regularization",
                type="subtopic",
                description="Cross-Entropy, MSE, L2 Weight Decay, and Dropout to mitigate overfitting.",
                mastery_level=profile.topic_mastery.get("Loss Functions & Regularization", 0.78),
                prerequisites=["opt_gradient_descent"],
                doc_references=topic_citations.get("Loss Functions & Regularization", []),
                x=950,
                y=180
            ),
            KnowledgeNode(
                id="cnns",
                label="Convolutional Neural Networks (CNNs)",
                type="topic",
                description="Visual feature extraction with kernel filters, parameter sharing, and translation equivariance.",
                mastery_level=profile.topic_mastery.get("Convolutional Neural Networks (CNNs)", 0.65),
                prerequisites=["nn_basics"],
                doc_references=topic_citations.get("Convolutional Neural Networks (CNNs)", []),
                x=550,
                y=420
            ),
            KnowledgeNode(
                id="transformers",
                label="Attention Mechanisms & Transformers",
                type="topic",
                description="Scaled dot-product self-attention with Query, Key, Value projections and softmax normalization.",
                mastery_level=profile.topic_mastery.get("Attention Mechanisms & Transformers", 0.40),
                prerequisites=["activation_funcs", "backprop"],
                doc_references=topic_citations.get("Attention Mechanisms & Transformers", []),
                x=780,
                y=360
            )
        ]

        edges: List[KnowledgeEdge] = [
            KnowledgeEdge(source="math_foundations", target="nn_basics", relationship="prerequisite_of"),
            KnowledgeEdge(source="nn_basics", target="activation_funcs", relationship="prerequisite_of"),
            KnowledgeEdge(source="activation_funcs", target="backprop", relationship="prerequisite_of"),
            KnowledgeEdge(source="math_foundations", target="backprop", relationship="prerequisite_of"),
            KnowledgeEdge(source="backprop", target="opt_gradient_descent", relationship="prerequisite_of"),
            KnowledgeEdge(source="opt_gradient_descent", target="loss_regularization", relationship="prerequisite_of"),
            KnowledgeEdge(source="nn_basics", target="cnns", relationship="prerequisite_of"),
            KnowledgeEdge(source="activation_funcs", target="transformers", relationship="prerequisite_of"),
            KnowledgeEdge(source="backprop", target="transformers", relationship="prerequisite_of")
        ]

        return KnowledgeGraphData(nodes=nodes, edges=edges)

knowledge_graph_service = KnowledgeGraphService()
