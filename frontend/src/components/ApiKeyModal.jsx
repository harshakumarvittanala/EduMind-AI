import React, { useState } from "react";
import { X, Key, CheckCircle2, Shield, Sparkles } from "lucide-react";
import { updateGeminiKey } from "../utils/api";

export default function ApiKeyModal({ onClose, geminiActive, onKeyUpdated }) {
  const [key, setKey] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!key.trim()) return;

    setSubmitting(true);
    try {
      await updateGeminiKey(key.trim());
      setStatus("Gemini API key linked successfully! Connected to Gemini 2.5 Flash.");
      if (onKeyUpdated) onKeyUpdated(true);
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      console.error("API Key update error:", err);
      setStatus("Failed to save key. Check backend connection.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden p-6 space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">AI Engine Configuration</h3>
              <p className="text-xs text-slate-400">Gemini 2.5 Flash / 1.5 Flash</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="text-xs text-slate-300 leading-relaxed bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
          <div className="flex items-center space-x-2">
            <Shield className="w-4 h-4 text-emerald-400" />
            <span className="font-semibold text-white">
              Status: {geminiActive ? "Gemini Cloud API Active" : "Local Grounded Engine Active"}
            </span>
          </div>
          <p className="text-slate-400">
            EduMind AI has a built-in deterministic grounding fallback that operates seamlessly without external keys. You can also provide a Gemini API Key to enable extended multilingual reasoning.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              Google Gemini API Key
            </label>
            <input
              type="password"
              placeholder="AIzaSy..."
              value={key}
              onChange={(e) => setKey(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 text-xs px-3.5 py-2.5 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono"
            />
          </div>

          {status && (
            <div className="p-3 rounded-lg bg-emerald-950/30 border border-emerald-500/30 text-xs text-emerald-300 flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{status}</span>
            </div>
          )}

          <div className="flex justify-end space-x-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !key.trim()}
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-medium text-xs flex items-center space-x-1.5 transition"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{submitting ? "Saving..." : "Save API Key"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
