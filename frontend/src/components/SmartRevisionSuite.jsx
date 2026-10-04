import React, { useState, useEffect } from "react";
import { Layers, RotateCcw, Volume2, BookOpen, CheckCircle2, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { fetchFlashcards, rateFlashcard } from "../utils/api";

export default function SmartRevisionSuite({ onOpenCitation }) {
  const [flashcards, setFlashcards] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("flashcards"); // "flashcards" | "summaries" | "audionotes"
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    async function loadCards() {
      try {
        const cards = await fetchFlashcards();
        setFlashcards(cards);
      } catch (err) {
        console.error("Failed to load flashcards:", err);
      } finally {
        setLoading(false);
      }
    }
    loadCards();
  }, []);

  const handleNext = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % flashcards.length);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev - 1 + flashcards.length) % flashcards.length);
  };

  const handleRating = async (rating) => {
    if (!flashcards[currentIndex]) return;
    const cardId = flashcards[currentIndex].id;
    try {
      await rateFlashcard(cardId, rating);
      const updated = [...flashcards];
      updated[currentIndex].mastery_rating = rating;
      setFlashcards(updated);
      handleNext();
    } catch (err) {
      console.error("Rating error:", err);
    }
  };

  const currentCard = flashcards[currentIndex];

  const handleSpeak = (text) => {
    if (!window.speechSynthesis) return;
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }
    const clean = text.replace(/[*#_`>]/g, "");
    const utterance = new SpeechSynthesisUtterance(clean);
    utterance.rate = 1.0;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full uppercase tracking-wider bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              AI Revision Suite
            </span>
            <span className="text-xs text-slate-400">Active Recall & Spaced Repetition</span>
          </div>
          <h2 className="text-xl font-bold text-white mt-1">Smart Recall & Audio Notes</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Strengthen long-term retention using multimodal flashcards, chapter summaries, and audio notes.
          </p>
        </div>

        {/* Mode Selector Tabs */}
        <div className="flex items-center space-x-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab("flashcards")}
            className={`px-3 py-1.5 rounded-lg font-medium transition ${
              activeTab === "flashcards" ? "bg-blue-600 text-white shadow-sm" : "text-slate-400 hover:text-white"
            }`}
          >
            3D Flashcards
          </button>
          <button
            onClick={() => setActiveTab("summaries")}
            className={`px-3 py-1.5 rounded-lg font-medium transition ${
              activeTab === "summaries" ? "bg-blue-600 text-white shadow-sm" : "text-slate-400 hover:text-white"
            }`}
          >
            Key Summaries
          </button>
          <button
            onClick={() => setActiveTab("audionotes")}
            className={`px-3 py-1.5 rounded-lg font-medium transition ${
              activeTab === "audionotes" ? "bg-blue-600 text-white shadow-sm" : "text-slate-400 hover:text-white"
            }`}
          >
            Audio Notes
          </button>
        </div>
      </div>

      {/* Mode 1: 3D Flip Flashcards */}
      {activeTab === "flashcards" && (
        <div className="space-y-6">
          {loading ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-400 text-sm">
              Loading revision deck...
            </div>
          ) : currentCard ? (
            <div className="space-y-4">
              {/* Card Counter & Topic */}
              <div className="flex justify-between items-center px-2 text-xs text-slate-400">
                <span className="font-semibold text-slate-200">
                  Topic: <strong className="text-blue-400">{currentCard.topic}</strong>
                </span>
                <span className="font-mono">
                  Card {currentIndex + 1} of {flashcards.length}
                </span>
              </div>

              {/* 3D Flip Card Container */}
              <div
                onClick={() => setIsFlipped(!isFlipped)}
                className="perspective-1000 min-h-[300px] cursor-pointer"
              >
                <div
                  className={`relative w-full min-h-[300px] rounded-2xl border transition-all duration-500 transform-style-3d shadow-2xl p-8 flex flex-col justify-between ${
                    isFlipped
                      ? "bg-slate-900/95 border-blue-500/40 text-slate-100"
                      : "bg-gradient-to-br from-slate-900 via-slate-850 to-slate-950 border-slate-700/80 text-white"
                  }`}
                >
                  {/* Top bar */}
                  <div className="flex justify-between items-center pb-4 border-b border-slate-800/80">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-1">
                      <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                      <span>{isFlipped ? "Answer & Proof" : "Recall Prompt"}</span>
                    </span>
                    <span className="text-[10px] text-slate-400 italic">Click card anywhere to flip</span>
                  </div>

                  {/* Body Text */}
                  <div className="py-6 text-center my-auto">
                    <div className="text-lg md:text-xl font-medium leading-relaxed font-sans max-w-xl mx-auto">
                      {isFlipped ? currentCard.back : currentCard.front}
                    </div>
                  </div>

                  {/* Card Bottom Citation */}
                  <div className="pt-4 border-t border-slate-800/80 flex justify-between items-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenCitation(currentCard.citation);
                      }}
                      className="text-xs text-blue-400 hover:text-blue-300 font-medium flex items-center space-x-1"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>Citation: {currentCard.citation.location}</span>
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSpeak(isFlipped ? currentCard.back : currentCard.front);
                      }}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                      title="Read card aloud"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Navigation & Spaced Repetition Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handlePrev}
                    className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 transition"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={handleNext}
                    className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 transition"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>

                {/* Spaced Repetition Rating Buttons */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleRating("Again")}
                    className="px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-medium transition"
                  >
                    Again (1d)
                  </button>
                  <button
                    onClick={() => handleRating("Hard")}
                    className="px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-medium transition"
                  >
                    Hard (2d)
                  </button>
                  <button
                    onClick={() => handleRating("Good")}
                    className="px-3 py-1.5 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 border border-blue-500/30 text-xs font-medium transition"
                  >
                    Good (4d)
                  </button>
                  <button
                    onClick={() => handleRating("Easy")}
                    className="px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-medium transition"
                  >
                    Easy (7d)
                  </button>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      )}

      {/* Mode 2: Key Summaries */}
      {activeTab === "summaries" && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          <h3 className="text-base font-bold text-white">Concise Syllabus Revision Summaries</h3>

          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
              <div className="flex justify-between items-center">
                <h4 className="text-sm font-bold text-blue-400">Backpropagation & Computational Graphs</h4>
                <span className="text-xs text-slate-500">Video 10:32 & Page 45</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Backprop applies the Multivariate Chain Rule in reverse. Crucial rule: whenever a node diverges into multiple branches, incoming upstream gradients from each branch must be <strong>summed</strong>. Gradients along a sequential path are multiplied.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
              <div className="flex justify-between items-center">
                <h4 className="text-sm font-bold text-amber-400">Adam Optimizer & Bias Correction</h4>
                <span className="text-xs text-slate-500">Slide 12</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Adam tracks the 1st moment (momentum) and 2nd raw moment (RMSProp). Because moment vectors initialize at zero, bias correction dividing by (1 - beta^t) prevents small initial update magnitudes.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
              <div className="flex justify-between items-center">
                <h4 className="text-sm font-bold text-purple-400">Scaled Dot-Product Attention</h4>
                <span className="text-xs text-slate-500">Video 21:45</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Attention weights = softmax((Q * K^T) / sqrt(d_k)). Dividing by sqrt(d_k) keeps dot-product magnitudes in moderate ranges, avoiding vanishing softmax gradients.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Mode 3: Audio Notes */}
      {activeTab === "audionotes" && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-base font-bold text-white">Synthesized Audio Revision Notes</h3>
              <p className="text-xs text-slate-400">Listen to high-yield audio snippets on your commute</p>
            </div>
          </div>

          <div className="space-y-3">
            {[
              {
                title: "Deep Dive: Why Branch Gradients Add Up",
                duration: "2 min listen",
                text: "When an intermediate neuron outputs to multiple downstream nodes, each downstream node contributes a distinct pathway of error to the loss. According to multivariate total derivative rules, the total gradient is the sum of these independent contributions."
              },
              {
                title: "Vanishing Gradients: Sigmoid vs ReLU",
                duration: "3 min listen",
                text: "The derivative of sigmoid maxes out at 0.25. In a 5 layer network, 0.25 to the 5th power is less than 0.001. That is why modern networks favor ReLU, whose derivative is exactly 1.0 for all positive values."
              },
              {
                title: "The Inductive Biases of CNNs",
                duration: "2 min listen",
                text: "Convolutional layers rely on local connectivity and parameter sharing. A cat in the top-left corner of an image produces the same feature response as a cat in the bottom-right corner."
              }
            ].map((track, i) => (
              <div key={i} className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-semibold text-white">{track.title}</h4>
                  <p className="text-xs text-slate-400 mt-0.5">{track.duration}</p>
                </div>
                <button
                  onClick={() => handleSpeak(track.text)}
                  className="px-4 py-2 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 text-xs font-medium flex items-center space-x-1.5 transition"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>Listen</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
