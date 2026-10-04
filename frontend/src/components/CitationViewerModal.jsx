import React from "react";
import { X, BookOpen, Presentation, Video, ExternalLink, CheckCircle2, Bookmark } from "lucide-react";

export default function CitationViewerModal({ citation, onClose }) {
  if (!citation) return null;

  const isVideo = citation.doc_type === "video" || citation.location.includes("Video");
  const isSlide = citation.doc_type === "slide" || citation.location.includes("Slide");
  const isTextbook = citation.doc_type === "textbook" || citation.location.includes("Page");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-xl ${
              isVideo ? "bg-red-500/10 text-red-400 border border-red-500/20" :
              isSlide ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" :
              "bg-blue-500/10 text-blue-400 border border-blue-500/20"
            }`}>
              {isVideo && <Video className="w-5 h-5" />}
              {isSlide && <Presentation className="w-5 h-5" />}
              {isTextbook && <BookOpen className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider bg-slate-800 text-slate-300 border border-slate-700">
                  {citation.location}
                </span>
                <span className="text-xs text-emerald-400 flex items-center space-x-1 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Verified Source Snippet</span>
                </span>
              </div>
              <h3 className="text-base font-semibold text-white mt-0.5">
                {citation.doc_title}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5 overflow-y-auto">
          {/* Simulated Viewer depending on media type */}
          {isVideo && (
            <div className="bg-slate-950 rounded-xl p-4 border border-slate-800 space-y-3">
              <div className="relative aspect-video rounded-lg bg-slate-900 border border-slate-800/80 flex flex-col items-center justify-center overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
                <div className="z-10 flex flex-col items-center text-center px-4">
                  <div className="w-14 h-14 rounded-full bg-red-600/90 text-white flex items-center justify-center shadow-lg shadow-red-600/30 mb-2">
                    <Video className="w-7 h-7" />
                  </div>
                  <p className="text-xs font-medium text-slate-300">Lecture Segment Synchronized</p>
                  <p className="text-lg font-bold text-white tracking-wide">Timestamp: {citation.location}</p>
                </div>
                {/* Simulated Timeline Bar */}
                <div className="absolute bottom-3 left-4 right-4 z-10 flex items-center space-x-2">
                  <span className="text-[10px] text-red-400 font-mono font-bold">{citation.location.replace("Video ", "")}</span>
                  <div className="flex-1 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                    <div className="h-full bg-red-500 rounded-full w-[35%]"></div>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">35:00</span>
                </div>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-400 px-1">
                <span>Lecture Video Stream</span>
                <span className="text-emerald-400 font-medium">Auto-seek to {citation.location}</span>
              </div>
            </div>
          )}

          {isSlide && (
            <div className="bg-slate-950 rounded-xl p-5 border border-slate-800">
              <div className="bg-slate-900/90 rounded-lg p-6 border border-amber-500/20 shadow-inner">
                <div className="flex justify-between items-center pb-3 mb-4 border-b border-slate-800">
                  <span className="text-xs font-bold text-amber-400 tracking-wider uppercase">Slide Presentation View</span>
                  <span className="text-xs text-slate-400 font-mono">{citation.location}</span>
                </div>
                <div className="text-sm text-slate-200 leading-relaxed font-sans">
                  {citation.snippet}
                </div>
              </div>
            </div>
          )}

          {isTextbook && (
            <div className="bg-slate-950 rounded-xl p-5 border border-slate-800">
              <div className="bg-slate-900/90 rounded-lg p-6 border border-blue-500/20 shadow-inner">
                <div className="flex justify-between items-center pb-3 mb-4 border-b border-slate-800">
                  <span className="text-xs font-bold text-blue-400 tracking-wider uppercase">Textbook Excerpt</span>
                  <span className="text-xs text-slate-400 font-mono">{citation.location}</span>
                </div>
                <div className="text-sm text-slate-200 leading-relaxed font-serif">
                  "{citation.snippet}"
                </div>
              </div>
            </div>
          )}

          {/* Source Grounding Info */}
          <div className="bg-blue-950/20 border border-blue-800/40 rounded-xl p-4 flex items-start space-x-3">
            <Bookmark className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
            <div className="text-xs text-slate-300 leading-relaxed">
              <p className="font-semibold text-blue-300 mb-0.5">Strict Citation Grounding Guarantee</p>
              This exact excerpt was extracted by EduMind's OCR & CV ingestion pipeline. All AI explanations and quiz questions referencing this topic are anchored directly to this text.
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-950/80 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition"
          >
            Close Viewer
          </button>
        </div>
      </div>
    </div>
  );
}
