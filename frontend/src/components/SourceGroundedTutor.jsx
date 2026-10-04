import React, { useState, useRef, useEffect } from "react";
import {
  Send, Sparkles, AlertCircle, BookOpen, Volume2, Mic, MicOff,
  Languages, Lightbulb, CheckCircle2, RefreshCw, MessageSquare
} from "lucide-react";
import { sendTutorMessage } from "../utils/api";

export default function SourceGroundedTutor({ onOpenCitation, userProfile }) {
  const [messages, setMessages] = useState([
    {
      id: "m_welcome",
      role: "assistant",
      content: "Hello Alex! I am **EduMind AI**, your source-grounded academic study tutor. I answer questions **strictly** from your uploaded textbooks, lecture slides, and videos with verifiable citations. If something is not in your materials, I will tell you directly.\n\nHow can I help you master your coursework today?",
      citations: [
        {
          chunk_id: "doc_tb_3",
          doc_id: "dl_tb",
          doc_title: "Deep Learning Foundations",
          doc_type: "textbook",
          location: "Page 45",
          snippet: "Backpropagation algorithm computes partial derivatives using the Multivariate Chain Rule."
        }
      ],
      isGrounded: true,
      eliwApplied: false,
      timestamp: "Just now"
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [explainLikeWeak, setExplainLikeWeak] = useState(false);
  const [language, setLanguage] = useState("en");
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  // Voice Speech Recognition (STT)
  const handleToggleVoice = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser. Please try Chrome, Edge, or Safari.");
      return;
    }

    if (isRecording) {
      setIsRecording(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = language === "hi" ? "hi-IN" : language === "te" ? "te-IN" : language === "es" ? "es-ES" : "en-US";
      recognition.interimResults = false;

      recognition.onstart = () => setIsRecording(true);
      recognition.onend = () => setIsRecording(false);
      recognition.onerror = () => setIsRecording(false);

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInput((prev) => (prev ? prev + " " + transcript : transcript));
      };

      recognition.start();
    } catch (err) {
      console.error("Speech recognition error:", err);
      setIsRecording(false);
    }
  };

  // Text-to-Speech (TTS)
  const speakText = (text) => {
    if (!window.speechSynthesis) return;
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    // Strip markdown formatting
    const cleanText = text.replace(/[*#_`>]/g, "").replace(/\[.*?\]/g, "");
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = language === "hi" ? "hi-IN" : language === "te" ? "te-IN" : language === "es" ? "es-ES" : "en-US";
    utterance.rate = 1.0;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const handleSend = async (messageText = null) => {
    const textToSend = messageText || input;
    if (!textToSend.trim() || loading) return;

    const userMsg = {
      id: `msg_u_${Date.now()}`,
      role: "user",
      content: textToSend,
      timestamp: "Just now"
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!messageText) setInput("");
    setLoading(true);

    try {
      const res = await sendTutorMessage({
        message: textToSend,
        explain_like_weak: explainLikeWeak,
        language: language,
        user_id: userProfile?.user_id || "default_student",
        conversation_history: messages.slice(-4).map((m) => ({ role: m.role, content: m.content }))
      });

      const assistantMsg = {
        id: `msg_a_${Date.now()}`,
        role: "assistant",
        content: res.answer,
        citations: res.citations || [],
        isGrounded: res.is_grounded,
        notCovered: res.not_covered,
        highlightedSnippets: res.highlighted_snippets || [],
        suggestedFollowups: res.suggested_followups || [],
        eliwApplied: res.eliw_applied,
        faithfulness: res.faithfulness_score,
        relevance: res.answer_relevance_score,
        timestamp: "Just now"
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      console.error("Tutor chat error:", err);
      setMessages((prev) => [
        ...prev,
        {
          id: `msg_err_${Date.now()}`,
          role: "assistant",
          content: "I encountered an error connecting to the tutoring engine. Please check your backend connection.",
          citations: [],
          isGrounded: false,
          notCovered: false,
          timestamp: "Just now"
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-5.5rem)] max-w-5xl mx-auto bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
      {/* Top Banner & Control Bar */}
      <div className="px-6 py-3.5 bg-slate-950/80 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></div>
          <span className="text-xs font-semibold text-slate-300">Grounding Gate: Active</span>
          <span className="text-slate-600">|</span>
          <span className="text-xs text-slate-400">Strict zero-hallucination policy</span>
        </div>

        <div className="flex items-center space-x-2">
          {/* "Explain Like I'm Weak" Toggle */}
          <button
            onClick={() => setExplainLikeWeak(!explainLikeWeak)}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
              explainLikeWeak
                ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm shadow-amber-500/10"
                : "bg-slate-800/80 text-slate-400 border border-slate-700 hover:text-slate-200"
            }`}
            title="Simplifies technical jargon into intuitive real-world metaphors based on your BKT mastery level"
          >
            <Lightbulb className={`w-3.5 h-3.5 ${explainLikeWeak ? "text-amber-400 animate-bounce" : ""}`} />
            <span>Explain Like I'm Weak</span>
          </button>

          {/* Multilingual Selector */}
          <div className="flex items-center space-x-1 bg-slate-800/80 border border-slate-700 rounded-xl px-2.5 py-1 text-xs">
            <Languages className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-transparent text-slate-200 focus:outline-none cursor-pointer text-xs"
            >
              <option value="en" className="bg-slate-900 text-white">English</option>
              <option value="hi" className="bg-slate-900 text-white">हिन्दी (Hindi)</option>
              <option value="te" className="bg-slate-900 text-white">తెలుగు (Telugu)</option>
              <option value="es" className="bg-slate-900 text-white">Español</option>
            </select>
          </div>
        </div>
      </div>

      {/* Chat Messages Log */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}
          >
            <div
              className={`max-w-3xl rounded-2xl p-5 ${
                msg.role === "user"
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-600/15"
                  : msg.notCovered
                  ? "bg-amber-950/20 border border-amber-500/40 text-slate-200 shadow-md"
                  : "bg-slate-800/90 border border-slate-700/80 text-slate-200 shadow-md"
              }`}
            >
              {/* Header inside assistant message */}
              {msg.role === "assistant" && (
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-700/60">
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-xs">
                      EM
                    </div>
                    <span className="text-xs font-semibold text-slate-200">EduMind AI Tutor</span>
                    {msg.eliwApplied && (
                      <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full font-medium">
                        Simplified Foundation (ELIW)
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    {msg.faithfulness && (
                      <span className="text-[10px] text-emerald-400 flex items-center space-x-1 font-mono">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Faithfulness: {Math.round(msg.faithfulness * 100)}%</span>
                      </span>
                    )}
                    <button
                      onClick={() => speakText(msg.content)}
                      className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-700 transition"
                      title="Read explanation out loud"
                    >
                      <Volume2 className={`w-3.5 h-3.5 ${isSpeaking ? "text-blue-400" : ""}`} />
                    </button>
                  </div>
                </div>
              )}

              {/* Message Content */}
              <div className="text-sm leading-relaxed whitespace-pre-line font-sans">
                {msg.content}
              </div>

              {/* Citations bar */}
              {msg.citations && msg.citations.length > 0 && (
                <div className="mt-4 pt-3 border-t border-slate-700/60">
                  <div className="text-[11px] uppercase tracking-wider font-semibold text-slate-400 mb-2 flex items-center space-x-1">
                    <BookOpen className="w-3 h-3 text-blue-400" />
                    <span>Clickable Source Citations:</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {msg.citations.map((c, i) => (
                      <button
                        key={i}
                        onClick={() => onOpenCitation(c)}
                        className="group flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-blue-600/20 border border-blue-500/30 hover:border-blue-400 text-xs text-blue-300 hover:text-blue-200 transition"
                      >
                        <span className="font-semibold">{c.location}</span>
                        <span className="text-slate-500 group-hover:text-slate-400">·</span>
                        <span className="text-slate-400 group-hover:text-slate-300 truncate max-w-[150px]">{c.doc_title}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Highlighted Snippets if present */}
              {msg.highlightedSnippets && msg.highlightedSnippets.length > 0 && (
                <div className="mt-3 p-2.5 rounded-xl bg-slate-900/60 border border-slate-700/40 text-xs text-slate-300">
                  <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider block mb-1">
                    Grounding Text Snippet:
                  </span>
                  <p className="italic text-slate-300">"{msg.highlightedSnippets[0]}"</p>
                </div>
              )}
            </div>

            {/* Suggested Followups */}
            {msg.suggestedFollowups && msg.suggestedFollowups.length > 0 && (
              <div className="mt-2.5 flex flex-wrap gap-1.5 max-w-2xl">
                {msg.suggestedFollowups.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(q)}
                    className="text-xs bg-slate-800/60 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/70 rounded-full px-3 py-1 transition flex items-center space-x-1 text-left"
                  >
                    <Sparkles className="w-3 h-3 text-blue-400 shrink-0" />
                    <span className="truncate max-w-xs">{q}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex items-center space-x-3 p-4 bg-slate-800/50 rounded-2xl border border-slate-700/50 max-w-md">
            <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-xs text-slate-300 font-medium">Verifying source materials & generating cited response...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Box & Voice Controls */}
      <div className="p-4 bg-slate-950/90 border-t border-slate-800">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="relative flex items-center space-x-2"
        >
          {/* Speech-to-Text Button */}
          <button
            type="button"
            onClick={handleToggleVoice}
            className={`p-3 rounded-xl border transition ${
              isRecording
                ? "bg-red-500/20 border-red-500 text-red-400 animate-pulse"
                : "bg-slate-800/80 border-slate-700 text-slate-400 hover:text-slate-200 hover:bg-slate-800"
            }`}
            title={isRecording ? "Listening... click to stop" : "Speak your question (Voice Input)"}
          >
            {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              explainLikeWeak
                ? "Ask a question (Explain Like I'm Weak mode active)..."
                : "Ask anything from your uploaded textbooks, slides, or videos..."
            }
            className="flex-1 bg-slate-900 border border-slate-700 focus:border-blue-500 text-slate-100 placeholder-slate-500 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 transition"
          />

          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-medium text-sm flex items-center space-x-2 shadow-lg shadow-blue-600/20 transition"
          >
            <span>Ask Tutor</span>
            <Send className="w-4 h-4" />
          </button>
        </form>

        <div className="flex items-center justify-between mt-2.5 px-2 text-[11px] text-slate-500">
          <span>Supported citations: Page numbers, Slide numbers, Video timestamps.</span>
          <span>EduMind AI v1.0 • Guaranteed Grounding</span>
        </div>
      </div>
    </div>
  );
}
