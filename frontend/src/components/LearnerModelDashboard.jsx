import React from "react";
import { User, Award, Flame, Clock, Target, AlertTriangle, ArrowRight, Brain, RotateCcw } from "lucide-react";
import { resetLearnerProfile, fetchLearnerProfile } from "../utils/api";

export default function LearnerModelDashboard({ userProfile, onUpdateProfile, onNavigateToTutor, onNavigateToQuiz }) {
  const profile = userProfile || {
    name: "Alex Morgan",
    topic_mastery: {},
    streak_days: 4,
    questions_solved: 24,
    accuracy_rate: 79.2,
    total_study_minutes: 145,
    history: []
  };

  const handleReset = async () => {
    if (confirm("Reset learner progress to re-calibrate Bayesian baseline?")) {
      await resetLearnerProfile(profile.user_id || "default_student");
      const updated = await fetchLearnerProfile(profile.user_id || "default_student");
      if (onUpdateProfile) onUpdateProfile(updated);
    }
  };

  const topicsList = Object.entries(profile.topic_mastery || {}).map(([topic, score]) => ({
    topic,
    score: Math.round(score * 100),
    rawScore: score,
    isWeak: score < 0.55
  }));

  // Sort weakest topics first
  const weakTopics = topicsList.filter((t) => t.isWeak).sort((a, b) => a.score - b.score);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Banner & Stats Overview */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center font-bold text-white text-xl shadow-lg shadow-blue-500/20">
              {profile.name ? profile.name.slice(0, 2).toUpperCase() : "AL"}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  Bayesian Knowledge Tracing (BKT) Active
                </span>
                <span className="text-xs text-emerald-400">Diagnostic Calibrated</span>
              </div>
              <h2 className="text-xl font-bold text-white mt-1">{profile.name}</h2>
              <p className="text-xs text-slate-400">Personalized Cognitive Learner Profile</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleReset}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-medium transition"
              title="Reset progress to retake diagnostic test"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Baseline</span>
            </button>
          </div>
        </div>

        {/* 4 Stat Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6">
          <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
              <span>Study Streak</span>
              <Flame className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-bold text-white">{profile.streak_days || 4} Days</div>
            <span className="text-[11px] text-emerald-400 mt-1 block">Active consistent habit</span>
          </div>

          <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
              <span>Questions Solved</span>
              <Target className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-2xl font-bold text-white">{profile.questions_solved || 24}</div>
            <span className="text-[11px] text-blue-400 mt-1 block">Zero repetition rate</span>
          </div>

          <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
              <span>Accuracy Rate</span>
              <Award className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-bold text-white">{profile.accuracy_rate || 79.2}%</div>
            <span className="text-[11px] text-slate-400 mt-1 block">+12.4% this week</span>
          </div>

          <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
              <span>Study Time</span>
              <Clock className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-2xl font-bold text-white">{profile.total_study_minutes || 145}m</div>
            <span className="text-[11px] text-purple-400 mt-1 block">Across 3 modalities</span>
          </div>
        </div>
      </div>

      {/* Weak Areas Attention Box */}
      {weakTopics.length > 0 && (
        <div className="bg-amber-950/20 border border-amber-500/30 rounded-2xl p-6 shadow-xl space-y-3">
          <div className="flex items-center space-x-2 text-amber-300 font-semibold text-sm">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span>Targeted Focus: Needs Immediate Attention</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            The Bayesian Knowledge Tracing model identified lower confidence probabilities in the following foundational concepts. Strengthening these will unblock downstream prerequisites.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
            {weakTopics.map((item, idx) => (
              <div key={idx} className="bg-slate-900/90 border border-amber-500/20 p-4 rounded-xl flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white">{item.topic}</h4>
                  <div className="text-xs text-amber-400 font-mono mt-0.5">
                    Mastery: {item.score}% · Scaffold Level Needed
                  </div>
                </div>
                <button
                  onClick={() => onNavigateToTutor && onNavigateToTutor(`Explain ${item.topic} using simple analogies (ELIW mode).`)}
                  className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-medium transition"
                >
                  Revise Now
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Topic Mastery Progress Bars */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white">Syllabus Topic Mastery Breakdown</h3>
            <p className="text-xs text-slate-400">Calculated via BKT posterior probability updates</p>
          </div>
          <span className="text-xs text-slate-400 font-mono">{topicsList.length} Active Topics</span>
        </div>

        <div className="space-y-4">
          {topicsList.map((item, idx) => {
            const barColor =
              item.score >= 75 ? "bg-emerald-500" :
              item.score >= 50 ? "bg-amber-500" :
              "bg-rose-500";

            return (
              <div key={idx} className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-200">{item.topic}</span>
                  <span className="font-mono font-bold text-slate-300">{item.score}%</span>
                </div>
                <div className="h-2.5 w-full bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-800">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                    style={{ width: `${item.score}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Mathematical Engine Rationale Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center space-x-2">
          <Brain className="w-5 h-5 text-indigo-400" />
          <h3 className="text-sm font-bold text-white">How EduMind's Learner Engine Works</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-300 leading-relaxed">
          <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800">
            <strong className="text-blue-300 block mb-1">1. Bayesian Knowledge Tracing (BKT)</strong>
            Every concept maintains prior knowledge $P(L_0)$, learning transition $P(T)$, guess probability $P(G)$, and slip probability $P(S)$. Each right or wrong answer updates the latent belief state $P(L_t)$.
          </div>
          <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800">
            <strong className="text-indigo-300 block mb-1">2. Dynamic Difficulty Adjustment (DDA)</strong>
            Questions are routed to Easy (&lt;45%), Medium (45-75%), or Hard (&gt;75%) to maintain the optimal "Zone of Proximal Development" without causing frustration or boredom.
          </div>
        </div>
      </div>
    </div>
  );
}
