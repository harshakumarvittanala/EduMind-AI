import React, { useState, useEffect } from "react";
import {
  Upload, FileText, Video, Presentation, Link as LinkIcon, CheckCircle2,
  Search, BookOpen, Layers, Sparkles, Filter, ExternalLink
} from "lucide-react";
import { fetchKnowledgeBase, uploadDocument, ingestYouTube } from "../utils/api";

export default function KnowledgeBaseUploader({ onOpenCitation }) {
  const [chunks, setChunks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [ytUrl, setYtUrl] = useState("");
  const [ytTitle, setYtTitle] = useState("");
  const [activeFilter, setActiveFilter] = useState("all"); // "all" | "textbook" | "slide" | "video"
  const [search, setSearch] = useState("");
  const [uploadStatus, setUploadStatus] = useState(null);

  const loadChunks = async () => {
    try {
      const data = await fetchKnowledgeBase();
      setChunks(data);
    } catch (err) {
      console.error("Failed to load knowledge chunks:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadChunks();
  }, []);

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadStatus(null);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("doc_title", file.name);

    try {
      const res = await uploadDocument(formData);
      setUploadStatus(res.message);
      await loadChunks();
    } catch (err) {
      console.error("File upload error:", err);
      setUploadStatus("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleYouTubeIngest = async (e) => {
    e.preventDefault();
    if (!ytUrl.trim() || !ytTitle.trim()) return;

    setUploading(true);
    setUploadStatus(null);
    try {
      const res = await ingestYouTube(ytUrl, ytTitle);
      setUploadStatus(res.message);
      setYtUrl("");
      setYtTitle("");
      await loadChunks();
    } catch (err) {
      console.error("YouTube error:", err);
      setUploadStatus("YouTube ingestion failed.");
    } finally {
      setUploading(false);
    }
  };

  const filteredChunks = chunks.filter((c) => {
    const matchesFilter = activeFilter === "all" || c.doc_type === activeFilter;
    const matchesSearch =
      c.text.toLowerCase().includes(search.toLowerCase()) ||
      c.topic.toLowerCase().includes(search.toLowerCase()) ||
      c.doc_title.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full uppercase tracking-wider bg-blue-500/20 text-blue-400 border border-blue-500/30">
              Multimodal Ingestion Pipeline
            </span>
            <span className="text-xs text-slate-400">OCR & CV Processing Active</span>
          </div>
          <h2 className="text-xl font-bold text-white mt-1">Academic Knowledge Repository</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Ingest lecture videos, PDF textbooks, and slide presentations into structured, cited chunks.
          </p>
        </div>

        <div className="text-right text-xs text-slate-400 font-mono">
          <span>{chunks.length} Total Knowledge Chunks Indexed</span>
        </div>
      </div>

      {/* Dual Upload Section (PDF / Slides & YouTube Video) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Box 1: File Uploader */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center space-x-2 text-white font-semibold text-sm">
            <Upload className="w-4 h-4 text-blue-400" />
            <span>Upload Textbooks & Slides (PDF / PPT)</span>
          </div>
          <p className="text-xs text-slate-400">
            Automatically extracts chapters, page numbers, slide numbers, diagrams, and formulas.
          </p>

          <label className="border-2 border-dashed border-slate-700 hover:border-blue-500 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer bg-slate-950/60 transition group">
            <FileText className="w-10 h-10 text-slate-500 group-hover:text-blue-400 transition mb-2" />
            <span className="text-xs font-medium text-slate-300 group-hover:text-white">
              {uploading ? "Extracting & Segmenting..." : "Click to select PDF or PPT"}
            </span>
            <span className="text-[10px] text-slate-500 mt-1">PDF, PPTX, or DOCX (up to 50MB)</span>
            <input
              type="file"
              accept=".pdf,.ppt,.pptx,.txt"
              onChange={handleFileUpload}
              disabled={uploading}
              className="hidden"
            />
          </label>
        </div>

        {/* Box 2: YouTube / Video Ingester */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center space-x-2 text-white font-semibold text-sm">
            <Video className="w-4 h-4 text-red-400" />
            <span>Ingest Video Lectures (YouTube / MP4)</span>
          </div>
          <p className="text-xs text-slate-400">
            Transcribes speech with Whisper and marks exact MM:SS video timestamps for citations.
          </p>

          <form onSubmit={handleYouTubeIngest} className="space-y-3">
            <input
              type="text"
              placeholder="Lecture Title (e.g. Stanford CS229: Backpropagation)"
              value={ytTitle}
              onChange={(e) => setYtTitle(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 text-xs px-3.5 py-2.5 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
            />
            <div className="flex space-x-2">
              <input
                type="text"
                placeholder="YouTube URL or MP4 Link..."
                value={ytUrl}
                onChange={(e) => setYtUrl(e.target.value)}
                className="flex-1 bg-slate-950 border border-slate-700 text-xs px-3.5 py-2.5 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
              />
              <button
                type="submit"
                disabled={uploading || !ytUrl.trim() || !ytTitle.trim()}
                className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-medium text-xs transition"
              >
                Transcribe
              </button>
            </div>
          </form>
        </div>
      </div>

      {uploadStatus && (
        <div className="p-4 rounded-xl bg-blue-950/20 border border-blue-500/30 flex items-center space-x-2 text-xs text-blue-300">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{uploadStatus}</span>
        </div>
      )}

      {/* Chunks Explorer */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-white">Indexed Knowledge Chunks</h3>
            <p className="text-xs text-slate-400">Ground truth database queried by the strict RAG engine</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Filter buttons */}
            <div className="flex items-center space-x-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
              <button
                onClick={() => setActiveFilter("all")}
                className={`px-2.5 py-1 rounded-lg font-medium transition ${
                  activeFilter === "all" ? "bg-slate-800 text-white" : "text-slate-400"
                }`}
              >
                All ({chunks.length})
              </button>
              <button
                onClick={() => setActiveFilter("textbook")}
                className={`px-2.5 py-1 rounded-lg font-medium transition ${
                  activeFilter === "textbook" ? "bg-slate-800 text-white" : "text-slate-400"
                }`}
              >
                Textbooks
              </button>
              <button
                onClick={() => setActiveFilter("slide")}
                className={`px-2.5 py-1 rounded-lg font-medium transition ${
                  activeFilter === "slide" ? "bg-slate-800 text-white" : "text-slate-400"
                }`}
              >
                Slides
              </button>
              <button
                onClick={() => setActiveFilter("video")}
                className={`px-2.5 py-1 rounded-lg font-medium transition ${
                  activeFilter === "video" ? "bg-slate-800 text-white" : "text-slate-400"
                }`}
              >
                Videos
              </button>
            </div>

            {/* Search */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search chunks..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-slate-950 border border-slate-700 text-xs pl-8 pr-3 py-1.5 rounded-xl text-slate-200 focus:outline-none focus:border-blue-500"
              />
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
            </div>
          </div>
        </div>

        {/* Chunks List */}
        <div className="space-y-3">
          {filteredChunks.map((chunk) => {
            const loc =
              chunk.page_number ? `Page ${chunk.page_number}` :
              chunk.slide_number ? `Slide ${chunk.slide_number}` :
              chunk.video_timestamp ? `Video ${chunk.video_timestamp}` : "Source";

            return (
              <div
                key={chunk.id}
                className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 hover:border-slate-700 transition space-y-2"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-blue-300 border border-slate-700 font-mono">
                      {loc}
                    </span>
                    <span className="text-xs font-semibold text-white">{chunk.doc_title}</span>
                    <span className="text-slate-500">·</span>
                    <span className="text-xs text-slate-400">{chunk.topic}</span>
                  </div>

                  <button
                    onClick={() => onOpenCitation({
                      chunk_id: chunk.id,
                      doc_id: chunk.doc_id,
                      doc_title: chunk.doc_title,
                      doc_type: chunk.doc_type,
                      location: loc,
                      snippet: chunk.text
                    })}
                    className="text-xs text-blue-400 hover:text-blue-300 flex items-center space-x-1"
                  >
                    <span>View Excerpt</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed font-sans line-clamp-3">
                  {chunk.text}
                </p>

                {chunk.concepts && chunk.concepts.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {chunk.concepts.map((c, i) => (
                      <span key={i} className="text-[10px] px-2 py-0.5 rounded-md bg-slate-900 text-slate-400 border border-slate-800">
                        {c}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
