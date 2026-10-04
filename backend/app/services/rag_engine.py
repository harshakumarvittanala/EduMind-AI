import re
import math
from typing import List, Tuple, Dict, Any, Optional
from app.models.schemas import DocumentChunk, Citation, DocumentType
from app.services.ingestion_service import ingestion_service
from app.config import GROUNDING_SIMILARITY_THRESHOLD

class RAGEngine:
    def __init__(self):
        pass

    def _tokenize(self, text: str) -> List[str]:
        return [w.lower() for w in re.findall(r'\b[a-zA-Z0-9_\-\^]+\b', text) if len(w) > 1]

    def _compute_similarity(self, query: str, chunk_text: str) -> float:
        """Calculate word-overlap and keyword relevance score (cosine-like TF match)."""
        q_tokens = self._tokenize(query)
        c_tokens = self._tokenize(chunk_text)

        if not q_tokens or not c_tokens:
            return 0.0

        # Term frequency for query & chunk
        q_counts: Dict[str, int] = {}
        for t in q_tokens:
            q_counts[t] = q_counts.get(t, 0) + 1

        c_counts: Dict[str, int] = {}
        for t in c_tokens:
            c_counts[t] = c_counts.get(t, 0) + 1

        # Calculate cosine similarity with bonus for exact multi-token phrases
        dot_product = 0.0
        for t, count in q_counts.items():
            if t in c_counts:
                # Weight rarer or longer tokens higher
                weight = 1.0 + (0.3 if len(t) > 5 else 0.0)
                dot_product += count * c_counts[t] * weight

        q_norm = math.sqrt(sum(c ** 2 for c in q_counts.values()))
        c_norm = math.sqrt(sum(c ** 2 for c in c_counts.values()))

        if q_norm == 0 or c_norm == 0:
            return 0.0

        sim = dot_product / (q_norm * c_norm)

        # Check for direct phrase match bonus
        q_clean = query.lower().strip()
        if len(q_clean) > 6 and q_clean in chunk_text.lower():
            sim = min(1.0, sim + 0.35)

        return sim

    def retrieve(self, query: str, top_k: int = 3) -> Tuple[List[DocumentChunk], List[Citation], bool, float]:
        """
        Retrieve chunks matching query.
        Returns:
            (matching_chunks, citations, is_covered, highest_score)
        """
        all_chunks = ingestion_service.get_all_chunks()
        scored_chunks: List[Tuple[DocumentChunk, float]] = []

        for chunk in all_chunks:
            # Combine text and concept metadata for retrieval
            searchable_content = f"{chunk.doc_title} {chunk.topic} {chunk.subtopic or ''} {' '.join(chunk.concepts)} {chunk.text}"
            score = self._compute_similarity(query, searchable_content)
            if score > 0.05:
                scored_chunks.append((chunk, score))

        scored_chunks.sort(key=lambda x: x[1], reverse=True)

        if not scored_chunks:
            return [], [], False, 0.0

        best_score = scored_chunks[0][1]

        # Strict Grounding Gate: Check threshold
        if best_score < GROUNDING_SIMILARITY_THRESHOLD:
            return [], [], False, best_score

        top_matches = scored_chunks[:top_k]
        chunks = [c for c, _ in top_matches]

        citations = []
        for c, score in top_matches:
            if c.page_number:
                loc = f"Page {c.page_number}"
            elif c.slide_number:
                loc = f"Slide {c.slide_number}"
            elif c.video_timestamp:
                loc = f"Video {c.video_timestamp}"
            else:
                loc = "Source"

            citations.append(Citation(
                chunk_id=c.id,
                doc_id=c.doc_id,
                doc_title=c.doc_title,
                doc_type=c.doc_type,
                location=loc,
                snippet=c.text[:220] + ("..." if len(c.text) > 220 else ""),
                confidence_score=round(score, 3)
            ))

        return chunks, citations, True, best_score

    def extract_highlight_snippets(self, query: str, chunks: List[DocumentChunk]) -> List[str]:
        """Extract key sentences from chunks most relevant to query for UI highlighting."""
        query_words = set(self._tokenize(query))
        highlights = []

        for chunk in chunks:
            sentences = re.split(r'(?<=[.!?])\s+', chunk.text)
            for s in sentences:
                s_words = set(self._tokenize(s))
                overlap = query_words.intersection(s_words)
                if len(overlap) >= 2:
                    highlights.append(s.strip())
                    if len(highlights) >= 4:
                        break
            if len(highlights) >= 4:
                break

        return highlights

rag_engine = RAGEngine()
