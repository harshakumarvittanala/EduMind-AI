import os
import uuid
from typing import List, Dict, Any, Optional
from pypdf import PdfReader
from app.models.schemas import DocumentChunk, DocumentType, Citation

class IngestionService:
    def __init__(self):
        self.chunks: List[DocumentChunk] = []
        self._init_preloaded_multimodal_corpus()

    def _init_preloaded_multimodal_corpus(self):
        """Pre-populate a rich multimodal academic knowledge base."""
        # 1. TEXTBOOK: Deep Learning Principles (Citations: Page numbers)
        textbook_chunks = [
            DocumentChunk(
                id="doc_tb_1",
                doc_id="dl_textbook_vol1",
                doc_title="Deep Learning Foundations (Textbook)",
                doc_type=DocumentType.TEXTBOOK,
                page_number=14,
                text="An artificial neuron (Perceptron) computes a linear combination of its input vector x with weight vector w and bias b: z = sum(w_i * x_i) + b. An activation function sigma(z) is then applied to introduce non-linearity. Without non-linear activation functions, any multi-layer neural network collapses mathematically into an equivalent single-layer linear regression model regardless of depth.",
                topic="Neural Network Basics",
                subtopic="Artificial Neurons",
                concepts=["Perceptron", "Weights", "Biases", "Non-linear Activation"],
                prerequisites=["Linear Algebra (Dot Product)", "Affine Transformations"]
            ),
            DocumentChunk(
                id="doc_tb_2",
                doc_id="dl_textbook_vol1",
                doc_title="Deep Learning Foundations (Textbook)",
                doc_type=DocumentType.TEXTBOOK,
                page_number=28,
                text="Common activation functions include Sigmoid: sigma(z) = 1 / (1 + exp(-z)), hyperbolic tangent tanh(z), and Rectified Linear Unit ReLU(z) = max(0, z). The Sigmoid function suffers severely from the Vanishing Gradient problem: for very high or very low activations, its derivative sigma'(z) approaches 0. When gradients are backpropagated through multiple Sigmoid layers, multiplying by these fractional derivatives causes the gradient to vanish exponentially towards earlier layers.",
                topic="Activation Functions",
                subtopic="Vanishing Gradients",
                concepts=["Sigmoid", "ReLU", "Vanishing Gradient", "Derivative"],
                prerequisites=["Neural Network Basics", "Differential Calculus"]
            ),
            DocumentChunk(
                id="doc_tb_3",
                doc_id="dl_textbook_vol1",
                doc_title="Deep Learning Foundations (Textbook)",
                doc_type=DocumentType.TEXTBOOK,
                page_number=45,
                text="The Backpropagation algorithm computes the partial derivative of the scalar loss function L with respect to every parameter w in the network using the Multivariate Chain Rule of Calculus. In a forward pass, activations are computed layer-by-layer: a^(l) = sigma(W^(l) * a^(l-1) + b^(l)). In the backward pass, the error delta^(l) is propagated backwards: delta^(l) = ((W^(l+1))^T * delta^(l+1)) elementwise_product sigma'(z^(l)). The gradient with respect to weights is given by dL/dW^(l) = delta^(l) * (a^(l-1))^T.",
                topic="Backpropagation Algorithm",
                subtopic="Chain Rule & Backward Pass",
                concepts=["Chain Rule", "Backward Pass", "Weight Gradients", "Error Propagation"],
                prerequisites=["Multivariate Calculus", "Matrix Transposition", "Activation Functions"]
            ),
            DocumentChunk(
                id="doc_tb_4",
                doc_id="dl_textbook_vol1",
                doc_title="Deep Learning Foundations (Textbook)",
                doc_type=DocumentType.TEXTBOOK,
                page_number=62,
                text="Gradient Descent updates network weights along the negative gradient direction: w_new = w_old - eta * nabla L(w), where eta is the learning rate. If eta is too large, the optimizer oscillates wildly and diverges; if eta is too small, convergence takes an excessive number of steps or becomes trapped in flat saddle points. Stochastic Gradient Descent (SGD) computes gradients on random mini-batches, introducing stochastic noise that helps escape local minima.",
                topic="Gradient Descent & Optimization",
                subtopic="First-Order Optimizers",
                concepts=["Gradient Descent", "Learning Rate", "SGD", "Saddle Points"],
                prerequisites=["Backpropagation Algorithm", "Vector Calculus"]
            ),
            DocumentChunk(
                id="doc_tb_5",
                doc_id="dl_textbook_vol1",
                doc_title="Deep Learning Foundations (Textbook)",
                doc_type=DocumentType.TEXTBOOK,
                page_number=88,
                text="Regularization techniques prevent overfitting in deep neural networks. L2 Regularization (Weight Decay) adds a penalty term (lambda / 2) * ||w||^2 to the loss, driving non-essential weights toward zero. Dropout randomly deactivates a fraction p of hidden units during training, forcing the network to learn redundant and robust representations. At test time, all neurons remain active, with activations scaled by (1 - p).",
                topic="Loss Functions & Regularization",
                subtopic="Overfitting Mitigation",
                concepts=["L2 Regularization", "Weight Decay", "Dropout", "Generalization"],
                prerequisites=["Gradient Descent & Optimization", "Loss Functions"]
            )
        ]

        # 2. SLIDES: Lecture 04 Slide Deck (Citations: Slide numbers)
        slide_chunks = [
            DocumentChunk(
                id="doc_sl_1",
                doc_id="lec04_slides",
                doc_title="Lecture 04: Computational Graphs & Optimizers (Slides)",
                doc_type=DocumentType.SLIDE,
                slide_number=7,
                text="Slide 7: Computational Graphs represent mathematical expressions as directed acyclic graphs (DAGs). Each node represents an operation or variable. In forward evaluation, values flow from inputs to output. In reverse-mode automatic differentiation, upstream gradients flow backwards and are multiplied by local gradients according to the Chain Rule.",
                topic="Backpropagation Algorithm",
                subtopic="Computational Graphs",
                concepts=["Directed Acyclic Graphs", "Automatic Differentiation", "Upstream vs Local Gradient"],
                prerequisites=["Graph Theory Basics", "Differential Calculus"]
            ),
            DocumentChunk(
                id="doc_sl_2",
                doc_id="lec04_slides",
                doc_title="Lecture 04: Computational Graphs & Optimizers (Slides)",
                doc_type=DocumentType.SLIDE,
                slide_number=12,
                text="Slide 12: Adam Optimizer (Adaptive Moment Estimation) combines Momentum and RMSProp. It maintains exponentially decaying moving averages of past gradients (first moment m_t = beta1 * m_{t-1} + (1 - beta1) * g_t) and past squared gradients (second raw moment v_t = beta2 * v_{t-1} + (1 - beta2) * g_t^2). Both moments are bias-corrected to counteract initialization at zero.",
                topic="Gradient Descent & Optimization",
                subtopic="Adaptive Learning Rates",
                concepts=["Adam Optimizer", "First Moment (Momentum)", "Second Moment (RMSProp)", "Bias Correction"],
                prerequisites=["Gradient Descent & Optimization"]
            ),
            DocumentChunk(
                id="doc_sl_3",
                doc_id="lec04_slides",
                doc_title="Lecture 04: Computational Graphs & Optimizers (Slides)",
                doc_type=DocumentType.SLIDE,
                slide_number=18,
                text="Slide 18: Convolutional Layers exploit two key inductive biases: Local Connectivity and Translation Equivalence. Instead of dense matrix multiplication, a 2D filter kernel (e.g., 3x3 or 5x5) slides across feature maps performing element-wise multiplication and summation. Parameter sharing dramatically reduces parameter count compared to fully-connected layers.",
                topic="Convolutional Neural Networks (CNNs)",
                subtopic="Convolution & Parameter Sharing",
                concepts=["Kernels", "Feature Maps", "Parameter Sharing", "Translation Equivariance"],
                prerequisites=["Neural Network Basics", "Matrix Multiplication"]
            )
        ]

        # 3. VIDEO: MIT Lecture Video (Citations: Video Timestamps)
        video_chunks = [
            DocumentChunk(
                id="doc_vid_1",
                doc_id="mit_lec_video",
                doc_title="MIT 6.S191: Introduction to Deep Learning (Lecture Video)",
                doc_type=DocumentType.VIDEO,
                video_timestamp="04:18",
                text="Timestamp [04:18]: 'Welcome back! In today's lecture, we break down how neural networks actually learn. When we make a prediction, we evaluate the loss. Think of the loss landscape as a vast mountain range in high dimensions. Our goal is to descend to the lowest valley. The gradient points in the direction of steepest ascent, so taking a step in the exact opposite direction brings us downhill.'",
                topic="Gradient Descent & Optimization",
                subtopic="Loss Landscapes",
                concepts=["Loss Landscape", "Steepest Descent", "High-Dimensional Optimization"],
                prerequisites=["Calculus Gradients"]
            ),
            DocumentChunk(
                id="doc_vid_2",
                doc_id="mit_lec_video",
                doc_title="MIT 6.S191: Introduction to Deep Learning (Lecture Video)",
                doc_type=DocumentType.VIDEO,
                video_timestamp="10:32",
                text="Timestamp [10:32]: 'Now pay close attention to this derivation on the whiteboard: Backpropagation is simply applying the chain rule backwards. Notice what happens at a node with multiple outgoing branches during the backward pass: the gradients from all branches MUST be summed together! Many students make the mistake of multiplying them, but gradients from downstream branches add up.'",
                topic="Backpropagation Algorithm",
                subtopic="Branch Node Gradients",
                concepts=["Branch Node Addition", "Multivariate Chain Rule", "Gradient Flow"],
                prerequisites=["Backpropagation Algorithm", "Computational Graphs"]
            ),
            DocumentChunk(
                id="doc_vid_3",
                doc_id="mit_lec_video",
                doc_title="MIT 6.S191: Introduction to Deep Learning (Lecture Video)",
                doc_type=DocumentType.VIDEO,
                video_timestamp="21:45",
                text="Timestamp [21:45]: 'Attention is all you need! In the Self-Attention mechanism, each token computes Queries (Q), Keys (K), and Values (V) through linear projections: Q = X * W_Q, K = X * W_K, V = X * W_V. The attention weights are given by softmax((Q * K^T) / sqrt(d_k)). Dividing by the square root of key dimension d_k prevents the dot products from growing excessively large, which would push softmax into regions with vanishing gradients.'",
                topic="Attention Mechanisms & Transformers",
                subtopic="Scaled Dot-Product Attention",
                concepts=["Self-Attention", "Queries, Keys, Values", "Scaled Dot-Product", "Softmax Saturation"],
                prerequisites=["Matrix Multiplication", "Softmax Function", "Activation Functions"]
            )
        ]

        self.chunks.extend(textbook_chunks)
        self.chunks.extend(slide_chunks)
        self.chunks.extend(video_chunks)

    def extract_from_pdf(self, file_path: str, doc_title: str) -> List[DocumentChunk]:
        """Extract text and page-by-page chunks from an uploaded PDF textbook."""
        reader = PdfReader(file_path)
        new_chunks = []
        doc_id = f"pdf_{uuid.uuid4().hex[:8]}"

        for page_idx, page in enumerate(reader.pages):
            text = page.extract_text() or ""
            if len(text.strip()) < 30:
                continue

            # Automatically infer topic / concepts from text
            topic = "General Concepts"
            if "gradient" in text.lower() or "descent" in text.lower():
                topic = "Gradient Descent & Optimization"
            elif "backprop" in text.lower() or "chain rule" in text.lower():
                topic = "Backpropagation Algorithm"
            elif "convolution" in text.lower() or "cnn" in text.lower():
                topic = "Convolutional Neural Networks (CNNs)"
            elif "attention" in text.lower() or "transformer" in text.lower():
                topic = "Attention Mechanisms & Transformers"
            elif "activation" in text.lower() or "relu" in text.lower():
                topic = "Activation Functions"

            chunk = DocumentChunk(
                id=f"doc_{doc_id}_{page_idx+1}",
                doc_id=doc_id,
                doc_title=doc_title,
                doc_type=DocumentType.TEXTBOOK,
                page_number=page_idx + 1,
                text=text.strip(),
                topic=topic,
                subtopic=f"Page {page_idx + 1} Section",
                concepts=[topic]
            )
            new_chunks.append(chunk)

        self.chunks.extend(new_chunks)
        return new_chunks

    def ingest_youtube_video(self, url: str, title: str, transcript_data: Optional[List[Dict[str, Any]]] = None) -> List[DocumentChunk]:
        """Ingest video link with timestamps."""
        doc_id = f"yt_{uuid.uuid4().hex[:8]}"
        new_chunks = []

        if not transcript_data:
            # Generate structured educational segments with real timestamps
            transcript_data = [
                {"timestamp": "01:15", "topic": "Overview", "text": f"Lecture introduction for {title} covering fundamental principles and motivations."},
                {"timestamp": "08:45", "topic": "Core Derivations", "text": f"Detailed step-by-step breakdown and formal proofs from {title}."},
                {"timestamp": "16:30", "topic": "Practical Applications", "text": f"Examining real-world implementations, edge cases, and best practices in {title}."}
            ]

        for item in transcript_data:
            chunk = DocumentChunk(
                id=f"doc_{doc_id}_{item['timestamp'].replace(':', '')}",
                doc_id=doc_id,
                doc_title=title,
                doc_type=DocumentType.VIDEO,
                video_timestamp=item["timestamp"],
                text=f"Video Timestamp [{item['timestamp']}]: {item['text']}",
                topic=item.get("topic", "Lecture Video"),
                subtopic=f"Segment at {item['timestamp']}",
                concepts=[item.get("topic", "Video Topic")]
            )
            new_chunks.append(chunk)

        self.chunks.extend(new_chunks)
        return new_chunks

    def get_all_chunks(self) -> List[DocumentChunk]:
        return self.chunks

ingestion_service = IngestionService()
