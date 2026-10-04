import React, { useState, useEffect } from "react";
import {
  CheckCircle2, XCircle, ArrowRight, BookOpen, AlertTriangle,
  Award, TrendingUp, RefreshCw, Sparkles, HelpCircle, Layers
} from "lucide-react";
import confetti from "canvas-confetti";
import { fetchNextQuizQuestion, submitQuizAnswer, fetchLearnerProfile } from "../utils/api";

export default function AdaptiveQuizEngine({ onOpenCitation, onNavigateToTutor, userProfile, onUpdateProfile }) {
  const [question, setQuestion] = useState(null);
  const [selectedOption, setSelectedOption] = useState("");
  const [textAnswer, setTextAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [streak, setStreak] = useState(3);
  const [totalAnswered, setTotalAnswered] = useState(0);

  const loadQuestion = async (topic = null) => {
    setLoading(true);
    setFeedback(null);
    setSelectedOption("");
    setTextAnswer("");
    try {
      const q = await fetchNextQuizQuestion(userProfile?.user_id || "default_student", topic);
      setQuestion(q);
    } catch (err) {
      console.error("Failed to load question:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQuestion();
  }, []);

  const handleSubmit = async () => {
    const answer = question.question_type === "MCQ" ? selectedOption : textAnswer;
    if (!answer.trim() || submitting) return;

    setSubmitting(true);
    try {
      const res = await submitQuizAnswer({
        question_id: question.id,
        user_answer: answer,
        user_id: userProfile?.user_id || "default_student"
      });

      setFeedback(res);
      setTotalAnswered((prev) => prev + 1);

      if (res.is_correct) {
        setStreak((prev) => prev + 1);
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 }
        });
      } else {
        setStreak(0);
      }

      // Refresh learner profile
      if (onUpdateProfile) {
        const updated = await fetchLearnerProfile(userProfile?.user_id || "default_student");
        onUpdateProfile(updated);
      }
    } catch (err) {
      console.error("Error submitting answer:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const getDifficultyColor = (diff) => {
    switch (diff) {
      case "Easy": return "text-emerald-400 bg-emerald-500/10 border-emerald-500/30";
      case "Medium": return "text-amber-400 bg-amber-500/10 border-amber-500/30";
      case "Hard": return "text-rose-400 bg-rose-500/10 border-rose-500/30";
      default: return "text-blue-400 bg-blue-500/10 border-blue-500/30";
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Assessment Header & BKT Stats */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full uppercase tracking-wider bg-blue-500/20 text-blue-400 border border-blue-500/30">
              Bayesian Adaptive Engine
            </span>
            <span className="text-xs text-slate-400">Zero-repetition guaranteed</span>
          </div>
          <h2 className="text-xl font-bold text-white mt-1">Adaptive Knowledge Assessment</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Difficulty dynamically calibrates to your mastery trajectory after every response.
          </p>
        </div>

        <div className="flex items-center space-x-4">
          <div className="text-right">
            <div className="text-xs text-slate-400">Current Streak</div>
            <div className="text-lg font-bold text-amber-400 flex items-center justify-end space-x-1">
              <span>🔥 {streak} in a row</span>
            </div>
          </div>
          <div className="h-8 w-px bg-slate-800"></div>
          <div className="text-right">
            <div className="text-xs text-slate-400">Total Solved</div>
            <div className="text-lg font-bold text-white">
              {totalAnswered + (userProfile?.questions_solved || 0)}
            </div>
          </div>
        </div>
      </div>

      {/* Main Question Card */}
      {loading ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center space-y-4">
          <div className="w-10 h-10 border-3 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm text-slate-400">Calibrating Bayesian parameters & fetching personalized question...</p>
        </div>
      ) : question ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
          {/* Question Metadata Bar */}
          <div className="px-6 py-4 bg-slate-950/70 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center space-x-2">
              <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border ${getDifficultyColor(question.difficulty)}`}>
                {question.difficulty} Level
              </span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 font-mono">
                {question.question_type}
              </span>
              <span className="text-xs text-slate-400 font-medium">Topic: <strong className="text-slate-200">{question.topic}</strong></span>
            </div>

            <button
              onClick={() => onOpenCitation(question.citation)}
              className="flex items-center space-x-1.5 text-xs text-blue-400 hover:text-blue-300 font-medium transition"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Grounded in {question.citation.location}</span>
            </button>
          </div>

          {/* Prompt */}
          <div className="p-6 md:p-8 space-y-6">
            <div className="text-base md:text-lg text-slate-100 font-medium leading-relaxed">
              {question.prompt}
            </div>

            {/* MCQ Options */}
            {question.question_type === "MCQ" && question.options && (
              <div className="space-y-3">
                {question.options.map((opt, idx) => {
                  const isSelected = selectedOption === opt;
                  return (
                    <button
                      key={idx}
                      disabled={feedback !== null || submitting}
                      onClick={() => setSelectedOption(opt)}
                      className={`w-full text-left p-4 rounded-xl border text-sm font-medium transition flex items-start space-x-3 ${
                        isSelected
                          ? "bg-blue-600/15 border-blue-500 text-blue-100 shadow-md shadow-blue-500/5"
                          : "bg-slate-800/60 border-slate-700/80 text-slate-300 hover:bg-slate-800 hover:border-slate-600"
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 text-xs ${
                        isSelected ? "border-blue-400 bg-blue-500 text-white" : "border-slate-600"
                      }`}>
                        {String.fromCharCode(65 + idx)}
                      </div>
                      <span className="leading-snug">{opt}</span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Numerical / Short Input */}
            {question.question_type !== "MCQ" && (
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                  Your Solution ({question.question_type}):
                </label>
                <input
                  type="text"
                  disabled={feedback !== null || submitting}
                  value={textAnswer}
                  onChange={(e) => setTextAnswer(e.target.value)}
                  placeholder={
                    question.question_type === "NUMERICAL"
                      ? "Enter exact computed numerical value (e.g. 8)..."
                      : "Type your concise explanation here..."
                  }
                  className="w-full bg-slate-950 border border-slate-700 focus:border-blue-500 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            )}

            {/* Submit Action */}
            {!feedback && (
              <div className="pt-2 flex justify-end">
                <button
                  onClick={handleSubmit}
                  disabled={submitting || (question.question_type === "MCQ" ? !selectedOption : !textAnswer.trim())}
                  className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-medium text-sm flex items-center space-x-2 shadow-lg shadow-blue-600/20 transition"
                >
                  <span>{submitting ? "Evaluating BKT model..." : "Submit Answer"}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Instant Cited Feedback & Misconception Analysis */}
            {feedback && (
              <div className="mt-6 space-y-4 pt-6 border-t border-slate-800 animate-fade-in">
                {/* Status Banner */}
                <div className={`p-4 rounded-xl border flex items-start space-x-3 ${
                  feedback.is_correct
                    ? "bg-emerald-950/20 border-emerald-500/40 text-emerald-200"
                    : "bg-rose-950/20 border-rose-500/40 text-rose-200"
                }`}>
                  {feedback.is_correct ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <h4 className="text-sm font-bold">
                      {feedback.is_correct ? "Correct! Outstanding derivation." : "Incorrect Answer"}
                    </h4>
                    {!feedback.is_correct && (
                      <p className="text-xs text-slate-300 mt-1">
                        <strong>Correct Answer:</strong> {feedback.correct_answer}
                      </p>
                    )}
                  </div>
                </div>

                {/* Misconception Diagnostic (if student picked common trap) */}
                {feedback.misconception && (
                  <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/40 flex items-start space-x-3">
                    <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                    <div className="text-xs text-amber-200 leading-relaxed">
                      <strong className="block font-semibold text-amber-300 mb-0.5">Identified Misconception:</strong>
                      {feedback.misconception}
                    </div>
                  </div>
                )}

                {/* Explanation */}
                <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300 space-y-2 leading-relaxed">
                  <span className="font-semibold text-white block">Explanation & Proof:</span>
                  <p>{feedback.explanation}</p>
                </div>

                {/* BKT Mastery Delta */}
                <div className="p-4 rounded-xl bg-blue-950/20 border border-blue-800/40 flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="w-4 h-4 text-blue-400" />
                    <span className="text-slate-300">
                      <strong>BKT Mastery Update for {question.topic}:</strong>
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 font-mono">
                    <span className="text-slate-400">{Math.round(feedback.previous_mastery_score * 100)}%</span>
                    <span>→</span>
                    <span className={`font-bold ${feedback.is_correct ? "text-emerald-400" : "text-amber-400"}`}>
                      {Math.round(feedback.updated_mastery_score * 100)}%
                    </span>
                    <span className="text-[10px] text-slate-500">
                      ({feedback.is_correct ? "+" : ""}{Math.round((feedback.updated_mastery_score - feedback.previous_mastery_score) * 100)}%)
                    </span>
                  </div>
                </div>

                {/* Grounding Citation Button & Next Question */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <button
                    onClick={() => onOpenCitation(feedback.citation)}
                    className="flex items-center space-x-1.5 text-xs px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-blue-300 border border-slate-700 transition"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-blue-400" />
                    <span>Inspect Source: {feedback.citation.location}</span>
                  </button>

                  <div className="flex items-center space-x-2">
                    {feedback.suggested_revision_topic && (
                      <button
                        onClick={() => onNavigateToTutor && onNavigateToTutor(`Can you explain ${feedback.suggested_revision_topic} with simple analogies?`)}
                        className="px-3 py-2 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-medium transition"
                      >
                        Ask Tutor to Revise
                      </button>
                    )}
                    <button
                      onClick={() => loadQuestion()}
                      className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs flex items-center space-x-2 shadow-md shadow-blue-600/20 transition"
                    >
                      <span>Next Adaptive Question</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center space-y-3">
          <Award className="w-12 h-12 text-blue-400 mx-auto" />
          <h3 className="text-lg font-bold text-white">All Syllabus Questions Mastered!</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            You have answered all available adaptive questions in this knowledge unit.
          </p>
          <button
            onClick={() => loadQuestion()}
            className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-medium"
          >
            Start Practice Loop
          </button>
        </div>
      )}
    </div>
  );
}
