const API_BASE = "http://127.0.0.1:8000/api";

export async function fetchHealth() {
  const res = await fetch(`${API_BASE}/health`);
  return res.json();
}

export async function fetchKnowledgeBase() {
  const res = await fetch(`${API_BASE}/knowledge-base`);
  return res.json();
}

export async function uploadDocument(formData) {
  const res = await fetch(`${API_BASE}/knowledge-base/upload`, {
    method: "POST",
    body: formData,
  });
  return res.json();
}

export async function ingestYouTube(url, title) {
  const res = await fetch(`${API_BASE}/knowledge-base/youtube`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url, title }),
  });
  return res.json();
}

export async function fetchKnowledgeGraph(userId = "default_student") {
  const res = await fetch(`${API_BASE}/knowledge-graph?user_id=${userId}`);
  return res.json();
}

export async function sendTutorMessage(payload) {
  const res = await fetch(`${API_BASE}/tutor/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return res.json();
}

export async function fetchNextQuizQuestion(userId = "default_student", topic = null) {
  const url = topic
    ? `${API_BASE}/quiz/next?user_id=${userId}&topic=${encodeURIComponent(topic)}`
    : `${API_BASE}/quiz/next?user_id=${userId}`;
  const res = await fetch(url);
  return res.json();
}

export async function fetchDiagnosticQuiz() {
  const res = await fetch(`${API_BASE}/quiz/diagnostic`);
  return res.json();
}

export async function submitQuizAnswer(payload) {
  const res = await fetch(`${API_BASE}/quiz/submit`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return res.json();
}

export async function fetchLearnerProfile(userId = "default_student") {
  const res = await fetch(`${API_BASE}/learner/profile?user_id=${userId}`);
  return res.json();
}

export async function fetchWeakTopics(userId = "default_student") {
  const res = await fetch(`${API_BASE}/learner/weak-topics?user_id=${userId}`);
  return res.json();
}

export async function resetLearnerProfile(userId = "default_student") {
  const res = await fetch(`${API_BASE}/learner/reset?user_id=${userId}`, {
    method: "POST",
  });
  return res.json();
}

export async function fetchEvaluationMetrics(userId = "default_student") {
  const res = await fetch(`${API_BASE}/evaluation/metrics?user_id=${userId}`);
  return res.json();
}

export async function fetchEvaluationHistory() {
  const res = await fetch(`${API_BASE}/evaluation/history`);
  return res.json();
}

export async function fetchFlashcards(topic = null) {
  const url = topic ? `${API_BASE}/revision/flashcards?topic=${encodeURIComponent(topic)}` : `${API_BASE}/revision/flashcards`;
  const res = await fetch(url);
  return res.json();
}

export async function rateFlashcard(fcId, rating) {
  const res = await fetch(`${API_BASE}/revision/flashcards/${fcId}/rate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ rating }),
  });
  return res.json();
}

export async function generateStudyPlan(payload) {
  const res = await fetch(`${API_BASE}/planner/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return res.json();
}

export async function updateGeminiKey(apiKey) {
  const res = await fetch(`${API_BASE}/settings/gemini-key`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ api_key: apiKey }),
  });
  return res.json();
}
