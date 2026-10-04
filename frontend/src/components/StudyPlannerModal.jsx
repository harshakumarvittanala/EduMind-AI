import React, { useState } from "react";
import { X, Calendar, Clock, BookOpen, CheckCircle2, Sparkles, TrendingUp } from "lucide-react";
import { generateStudyPlan } from "../utils/api";

export default function StudyPlannerModal({ onClose, userProfile, onOpenCitation }) {
  const [examDate, setExamDate] = useState("2026-10-18");
  const [dailyHours, setDailyHours] = useState(2.0);
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const res = await generateStudyPlan({
        exam_date: examDate,
        daily_hours: parseFloat(dailyHours),
        user_id: userProfile?.user_id || "default_student"
      });
      setPlan(res);
    } catch (err) {
      console.error("Failed to generate plan:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/70">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Smart Adaptive Study Planner</h3>
              <p className="text-xs text-slate-400">Generates optimal revision schedule based on your weak BKT topics</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form & Generated Schedule */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-950/70 p-4 rounded-xl border border-slate-800">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Target Exam Date</label>
              <input
                type="date"
                value={examDate}
                onChange={(e) => setExamDate(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 text-xs px-3 py-2 rounded-lg text-white focus:outline-none focus:border-purple-500"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Daily Study Hours</label>
              <select
                value={dailyHours}
                onChange={(e) => setDailyHours(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 text-xs px-3 py-2 rounded-lg text-white focus:outline-none focus:border-purple-500"
              >
                <option value="1.0">1.0 Hour / Day</option>
                <option value="2.0">2.0 Hours / Day</option>
                <option value="3.5">3.5 Hours / Day</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={handleGenerate}
                disabled={loading}
                className="w-full py-2 px-4 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-medium text-xs flex items-center justify-center space-x-1.5 transition shadow-lg shadow-purple-600/20"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{loading ? "Optimizing Plan..." : "Generate Schedule"}</span>
              </button>
            </div>
          </div>

          {/* Generated Plan Display */}
          {plan ? (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 p-4 bg-purple-950/20 border border-purple-800/40 rounded-xl text-xs">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="w-4 h-4 text-purple-400" />
                  <span className="text-slate-300">
                    Projected Mastery Growth: <strong className="text-emerald-400">+{plan.projected_mastery_gain}%</strong>
                  </span>
                </div>
                <div className="text-purple-300 font-mono">
                  Target Exam: {plan.exam_date} ({plan.days_left} Days Revision Window)
                </div>
              </div>

              <div className="space-y-3">
                {plan.daily_schedule.map((day) => (
                  <div key={day.day} className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold font-mono px-2 py-0.5 rounded-full bg-slate-800 text-purple-400 border border-slate-700">
                          Day {day.day} · {day.date}
                        </span>
                        <h4 className="text-sm font-bold text-white">{day.focus_topic}</h4>
                      </div>
                      <span className="text-xs text-slate-400 font-mono">{day.estimated_minutes} mins</span>
                    </div>

                    <ul className="text-xs text-slate-300 space-y-1 list-disc list-inside">
                      {day.tasks.map((t, idx) => (
                        <li key={idx}>{t}</li>
                      ))}
                    </ul>

                    {day.citations && day.citations.length > 0 && (
                      <div className="pt-2 flex items-center space-x-2">
                        <span className="text-[10px] text-slate-500">Key Resource:</span>
                        <button
                          onClick={() => onOpenCitation(day.citations[0])}
                          className="text-[11px] text-blue-400 hover:text-blue-300 font-medium flex items-center space-x-1"
                        >
                          <BookOpen className="w-3 h-3" />
                          <span>{day.citations[0].location} ({day.citations[0].doc_title})</span>
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-xs text-slate-500">
              Select your exam date and click "Generate Schedule" to compute your personalized revision timetable.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
