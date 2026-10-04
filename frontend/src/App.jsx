import React, { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import SourceGroundedTutor from "./components/SourceGroundedTutor";
import AdaptiveQuizEngine from "./components/AdaptiveQuizEngine";
import KnowledgeGraphViewer from "./components/KnowledgeGraphViewer";
import LearnerModelDashboard from "./components/LearnerModelDashboard";
import EvaluationDashboard from "./components/EvaluationDashboard";
import SmartRevisionSuite from "./components/SmartRevisionSuite";
import KnowledgeBaseUploader from "./components/KnowledgeBaseUploader";
import CitationViewerModal from "./components/CitationViewerModal";
import StudyPlannerModal from "./components/StudyPlannerModal";
import ApiKeyModal from "./components/ApiKeyModal";
import { fetchHealth, fetchLearnerProfile } from "./utils/api";

export default function App() {
  const [activeTab, setActiveTab] = useState("tutor");
  const [activeCitation, setActiveCitation] = useState(null);
  const [isStudyPlannerOpen, setIsStudyPlannerOpen] = useState(false);
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [geminiActive, setGeminiActive] = useState(false);
  const [initialTutorPrompt, setInitialTutorPrompt] = useState(null);
  const [targetQuizTopic, setTargetQuizTopic] = useState(null);

  useEffect(() => {
    async function init() {
      try {
        const [health, profile] = await Promise.all([
          fetchHealth().catch(() => ({ gemini_active: false })),
          fetchLearnerProfile("default_student").catch(() => null)
        ]);
        if (health) setGeminiActive(health.gemini_active);
        if (profile) setUserProfile(profile);
      } catch (err) {
        console.error("Initialization error:", err);
      }
    }
    init();
  }, []);

  const handleNavigateToTutor = (prompt) => {
    setInitialTutorPrompt(prompt);
    setActiveTab("tutor");
  };

  const handleNavigateToQuiz = (topic) => {
    setTargetQuizTopic(topic);
    setActiveTab("quiz");
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenStudyPlanner={() => setIsStudyPlannerOpen(true)}
        onOpenApiKeyModal={() => setIsApiKeyModalOpen(true)}
        geminiActive={geminiActive}
      />

      {/* Main View Area */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
        {activeTab === "tutor" && (
          <SourceGroundedTutor
            onOpenCitation={(c) => setActiveCitation(c)}
            userProfile={userProfile}
            initialPrompt={initialTutorPrompt}
          />
        )}

        {activeTab === "quiz" && (
          <AdaptiveQuizEngine
            onOpenCitation={(c) => setActiveCitation(c)}
            onNavigateToTutor={handleNavigateToTutor}
            userProfile={userProfile}
            onUpdateProfile={(updated) => setUserProfile(updated)}
            targetTopic={targetQuizTopic}
          />
        )}

        {activeTab === "graph" && (
          <KnowledgeGraphViewer
            onOpenCitation={(c) => setActiveCitation(c)}
            onNavigateToTutor={handleNavigateToTutor}
            onNavigateToQuiz={handleNavigateToQuiz}
            userProfile={userProfile}
          />
        )}

        {activeTab === "learner" && (
          <LearnerModelDashboard
            userProfile={userProfile}
            onUpdateProfile={(updated) => setUserProfile(updated)}
            onNavigateToTutor={handleNavigateToTutor}
            onNavigateToQuiz={handleNavigateToQuiz}
          />
        )}

        {activeTab === "evaluation" && (
          <EvaluationDashboard userProfile={userProfile} />
        )}

        {activeTab === "revision" && (
          <SmartRevisionSuite
            onOpenCitation={(c) => setActiveCitation(c)}
          />
        )}

        {activeTab === "knowledge_base" && (
          <KnowledgeBaseUploader
            onOpenCitation={(c) => setActiveCitation(c)}
          />
        )}
      </main>

      {/* Citations Inspector Modal */}
      {activeCitation && (
        <CitationViewerModal
          citation={activeCitation}
          onClose={() => setActiveCitation(null)}
        />
      )}

      {/* Study Planner Modal */}
      {isStudyPlannerOpen && (
        <StudyPlannerModal
          userProfile={userProfile}
          onClose={() => setIsStudyPlannerOpen(false)}
          onOpenCitation={(c) => setActiveCitation(c)}
        />
      )}

      {/* API Key Modal */}
      {isApiKeyModalOpen && (
        <ApiKeyModal
          geminiActive={geminiActive}
          onKeyUpdated={(active) => setGeminiActive(active)}
          onClose={() => setIsApiKeyModalOpen(false)}
        />
      )}
    </div>
  );
}
