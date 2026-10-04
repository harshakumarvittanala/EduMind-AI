import React from "react";
import {
  Brain, MessageSquare, CheckSquare, Network, User, BarChart2,
  Layers, FolderOpen, Calendar, Key, ShieldCheck
} from "lucide-react";

export default function Navbar({
  activeTab,
  setActiveTab,
  onOpenStudyPlanner,
  onOpenApiKeyModal,
  geminiActive
}) {
  const navItems = [
    { id: "tutor", label: "AI Tutor", icon: MessageSquare },
    { id: "quiz", label: "Adaptive Quiz", icon: CheckSquare },
    { id: "graph", label: "Knowledge Graph", icon: Network },
    { id: "learner", label: "Learner Model", icon: User },
    { id: "evaluation", label: "Evaluation & RAGAS", icon: BarChart2 },
    { id: "revision", label: "Smart Revision", icon: Layers },
    { id: "knowledge_base", label: "Knowledge Base", icon: FolderOpen },
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab("tutor")}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-extrabold text-base tracking-tight text-white">EduMind</span>
                <span className="text-xs font-bold px-1.5 py-0.5 rounded-md bg-blue-500/20 text-blue-400 border border-blue-500/30">AI</span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium">Personalized Tutor & Adaptive Learning</p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden xl:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition ${
                    isActive
                      ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2">
            <button
              onClick={onOpenStudyPlanner}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-medium transition"
              title="Generate customized study timetable based on weak topics"
            >
              <Calendar className="w-3.5 h-3.5 text-purple-400" />
              <span className="hidden sm:inline">Study Planner</span>
            </button>

            <button
              onClick={onOpenApiKeyModal}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
              title="Configure Gemini API Settings"
            >
              <Key className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mobile / Smaller screen navigation bar */}
        <div className="xl:hidden flex items-center space-x-1 py-2 overflow-x-auto border-t border-slate-800/60">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition ${
                  isActive
                    ? "bg-blue-600 text-white"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
}
