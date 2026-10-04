import React, { useState, useEffect } from "react";
import { Network, Sparkles, BookOpen, ArrowRight, Layers, CheckCircle2, AlertCircle } from "lucide-react";
import { fetchKnowledgeGraph } from "../utils/api";

export default function KnowledgeGraphViewer({ onOpenCitation, onNavigateToTutor, onNavigateToQuiz, userProfile }) {
  const [graphData, setGraphData] = useState({ nodes: [], edges: [] });
  const [selectedNode, setSelectedNode] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    async function loadGraph() {
      try {
        const data = await fetchKnowledgeGraph(userProfile?.user_id || "default_student");
        setGraphData(data);
        if (data.nodes.length > 0) {
          // Default select the weakest node (e.g. Backpropagation)
          const weak = [...data.nodes].sort((a, b) => a.mastery_level - b.mastery_level)[0];
          setSelectedNode(weak || data.nodes[0]);
        }
      } catch (err) {
        console.error("Failed to load knowledge graph:", err);
      } finally {
        setLoading(false);
      }
    }
    loadGraph();
  }, [userProfile]);

  const getNodeColor = (mastery) => {
    if (mastery >= 0.75) return "#10b981"; // Emerald
    if (mastery >= 0.50) return "#f59e0b"; // Amber
    return "#ef4444"; // Red/Rose (Weak)
  };

  const filteredNodes = searchQuery
    ? graphData.nodes.filter((n) =>
        n.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : graphData.nodes;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full uppercase tracking-wider bg-purple-500/20 text-purple-400 border border-purple-500/30">
              Interactive Prerequisite Network
            </span>
            <span className="text-xs text-slate-400">Source-Grounded Topology</span>
          </div>
          <h2 className="text-xl font-bold text-white mt-1">Multimodal Knowledge Graph</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Visualize hierarchical dependencies between concepts, textbooks, slides, and video lectures.
          </p>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3 text-xs">
            <div className="flex items-center space-x-1.5">
              <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
              <span className="text-slate-300">Mastered (&gt;75%)</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <div className="w-3 h-3 rounded-full bg-amber-500"></div>
              <span className="text-slate-300">In Progress (50-75%)</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <div className="w-3 h-3 rounded-full bg-rose-500 animate-pulse"></div>
              <span className="text-slate-300">Weak Area (&lt;50%)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Graph Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* SVG Visual Canvas (2 cols) */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl overflow-hidden flex flex-col">
          <div className="flex justify-between items-center mb-3 px-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Concept Topology & Prerequisite Flow
            </span>
            <input
              type="text"
              placeholder="Search concepts in graph..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-slate-950 border border-slate-700 text-xs px-3 py-1.5 rounded-lg text-slate-200 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex-1 min-h-[460px] bg-slate-950/80 rounded-xl border border-slate-800/80 relative overflow-auto p-4 flex items-center justify-center">
            {loading ? (
              <div className="text-center space-y-3">
                <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="text-xs text-slate-400">Assembling graph relationships...</p>
              </div>
            ) : (
              <svg className="w-full h-full min-w-[750px] min-h-[440px]" viewBox="0 0 1100 520">
                <defs>
                  <marker
                    id="arrowhead"
                    markerWidth="8"
                    markerHeight="6"
                    refX="24"
                    refY="3"
                    orient="auto"
                  >
                    <polygon points="0 0, 8 3, 0 6" fill="#475569" />
                  </marker>
                  <linearGradient id="edgeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.4" />
                  </linearGradient>
                </defs>

                {/* Render Edges */}
                {graphData.edges.map((edge, idx) => {
                  const sNode = graphData.nodes.find((n) => n.id === edge.source);
                  const tNode = graphData.nodes.find((n) => n.id === edge.target);
                  if (!sNode || !tNode) return null;

                  return (
                    <g key={idx}>
                      <line
                        x1={sNode.x}
                        y1={sNode.y}
                        x2={tNode.x}
                        y2={tNode.y}
                        stroke="#334155"
                        strokeWidth="2.5"
                        strokeDasharray={edge.relationship === "prerequisite_of" ? "none" : "4 4"}
                        markerEnd="url(#arrowhead)"
                      />
                    </g>
                  );
                })}

                {/* Render Nodes */}
                {filteredNodes.map((node) => {
                  const isSelected = selectedNode?.id === node.id;
                  const color = getNodeColor(node.mastery_level);

                  return (
                    <g
                      key={node.id}
                      onClick={() => setSelectedNode(node)}
                      className="cursor-pointer group"
                      transform={`translate(${node.x}, ${node.y})`}
                    >
                      {/* Glow ring when selected */}
                      {isSelected && (
                        <circle
                          r="34"
                          fill="none"
                          stroke="#60a5fa"
                          strokeWidth="3"
                          className="animate-pulse"
                        />
                      )}

                      {/* Main Node Circle */}
                      <circle
                        r="24"
                        fill="#0f172a"
                        stroke={color}
                        strokeWidth={isSelected ? "4" : "2.5"}
                        className="transition-transform group-hover:scale-110 duration-200"
                      />

                      {/* Mastery Percentage Inside Circle */}
                      <text
                        textAnchor="middle"
                        dy="4"
                        fill="#f8fafc"
                        fontSize="10"
                        fontWeight="bold"
                        fontFamily="monospace"
                      >
                        {Math.round(node.mastery_level * 100)}%
                      </text>

                      {/* Label under node */}
                      <text
                        textAnchor="middle"
                        dy="40"
                        fill={isSelected ? "#93c5fd" : "#cbd5e1"}
                        fontSize="11"
                        fontWeight={isSelected ? "bold" : "medium"}
                        className="pointer-events-none drop-shadow"
                      >
                        {node.label.length > 20 ? node.label.slice(0, 18) + "..." : node.label}
                      </text>
                    </g>
                  );
                })}
              </svg>
            )}
          </div>
        </div>

        {/* Selected Node Details Panel (1 col) */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
          {selectedNode ? (
            <div className="space-y-5">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                    {selectedNode.type}
                  </span>
                  <span
                    className="text-xs font-bold font-mono px-2 py-0.5 rounded-full"
                    style={{
                      color: getNodeColor(selectedNode.mastery_level),
                      backgroundColor: `${getNodeColor(selectedNode.mastery_level)}15`,
                      border: `1px solid ${getNodeColor(selectedNode.mastery_level)}40`
                    }}
                  >
                    Mastery: {Math.round(selectedNode.mastery_level * 100)}%
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white mt-2 leading-snug">
                  {selectedNode.label}
                </h3>
              </div>

              <div className="text-xs text-slate-300 leading-relaxed bg-slate-950/70 p-4 rounded-xl border border-slate-800">
                {selectedNode.description}
              </div>

              {/* Prerequisites list */}
              {selectedNode.prerequisites && selectedNode.prerequisites.length > 0 && (
                <div>
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                    Direct Prerequisites:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedNode.prerequisites.map((pId) => {
                      const pNode = graphData.nodes.find((n) => n.id === pId);
                      return (
                        <button
                          key={pId}
                          onClick={() => pNode && setSelectedNode(pNode)}
                          className="text-xs bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 px-2.5 py-1 rounded-lg transition"
                        >
                          ← {pNode ? pNode.label : pId}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Source Document References */}
              {selectedNode.doc_references && selectedNode.doc_references.length > 0 && (
                <div>
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                    Source Citations:
                  </span>
                  <div className="space-y-2">
                    {selectedNode.doc_references.map((cit, idx) => (
                      <button
                        key={idx}
                        onClick={() => onOpenCitation(cit)}
                        className="w-full text-left p-2.5 rounded-xl bg-slate-950/90 hover:bg-blue-950/30 border border-slate-800 hover:border-blue-500/40 text-xs text-slate-300 transition flex items-center justify-between"
                      >
                        <div className="flex items-center space-x-2">
                          <BookOpen className="w-3.5 h-3.5 text-blue-400" />
                          <span className="font-semibold text-blue-300">{cit.location}</span>
                        </div>
                        <span className="text-slate-500 text-[10px] truncate max-w-[120px]">{cit.doc_title}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12 text-slate-400 text-xs">
              Select a node in the graph to view prerequisites and citations.
            </div>
          )}

          {/* Quick Action Buttons */}
          {selectedNode && (
            <div className="pt-4 border-t border-slate-800 space-y-2 mt-4">
              <button
                onClick={() => onNavigateToTutor && onNavigateToTutor(`Explain ${selectedNode.label} starting from its prerequisites.`)}
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs flex items-center justify-center space-x-1.5 transition shadow-md shadow-blue-600/15"
              >
                <span>Ask AI Tutor About This</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => onNavigateToQuiz && onNavigateToQuiz(selectedNode.label)}
                className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 text-xs font-medium transition"
              >
                Practice Quiz on this Topic
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
