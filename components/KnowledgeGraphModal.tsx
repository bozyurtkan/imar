import React, { useState, useCallback, useEffect } from "react";
import {
  ReactFlow, ReactFlowProvider, Background, BackgroundVariant,
  useReactFlow, SelectionMode,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { GitBranch, X, Sparkles, Loader2 } from "lucide-react";

import type { DocumentFile } from "../types";
import type { MevzuatMaddesi } from "../data/mevzuatVeritabani";
import { getMevzuatGraph } from "../data/mevzuatVeritabani";
import { geminiService } from "../services/geminiService";
import { useGraphLayout } from "../hooks/useGraphLayout";
import { useGraphFilter } from "../hooks/useGraphFilter";
import GraphNode from "./graph/GraphNode";
import GraphEdge from "./graph/GraphEdge";
import GraphToolbar from "./graph/GraphToolbar";
import GraphMinimap from "./graph/GraphMinimap";
import GraphLegend from "./graph/GraphLegend";
import type { GraphData } from "../types";

const nodeTypes = { graphNode: GraphNode };
const edgeTypes = { graphEdge: GraphEdge };

interface KnowledgeGraphModalProps {
  isOpen: boolean;
  onClose: () => void;
  documents: DocumentFile[];
  isDarkMode: boolean;
  onNodeClick: (madde: MevzuatMaddesi) => void;
}

const GraphCanvas: React.FC<{
  graphData: GraphData | null;
  isDark: boolean;
  searchQuery: string;
  showCentralOnly: boolean;
  onSearchChange: (v: string) => void;
  onToggleCentral: () => void;
  onNodeClickById: (id: string) => void;
}> = ({ graphData, isDark, searchQuery, showCentralOnly, onSearchChange, onToggleCentral, onNodeClickById }) => {
  const { fitView } = useReactFlow();
  const { rfNodes, rfEdges } = useGraphLayout(graphData, isDark);
  const { filteredNodes, filteredEdges } = useGraphFilter(rfNodes, rfEdges, searchQuery, showCentralOnly);

  useEffect(() => {
    if (filteredNodes.length > 0) {
      setTimeout(() => fitView({ duration: 350, padding: 0.12 }), 50);
    }
  }, [graphData, showCentralOnly, fitView]);

  const bg = isDark ? "#1a1012" : "#fdf6f0";
  const dotColor = isDark ? "#3d2530" : "#e8d0c0";

  return (
    <div style={{ flex: 1, position: "relative", minHeight: 0 }}>
      {/* Toolbar (üstte, ReactFlow içinde) */}
      <div style={{
        position: "absolute", top: 12, left: 12, zIndex: 10,
        display: "flex", gap: 8,
      }}>
        <GraphToolbar
          searchQuery={searchQuery}
          onSearchChange={onSearchChange}
          showCentralOnly={showCentralOnly}
          onToggleCentral={onToggleCentral}
          isDark={isDark}
        />
      </div>

      <ReactFlow
        nodes={filteredNodes}
        edges={filteredEdges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodeClick={(_, node) => onNodeClickById(node.id)}
        fitView
        minZoom={0.2}
        maxZoom={2.5}
        selectionMode={SelectionMode.Partial}
        style={{ background: bg }}
        proOptions={{ hideAttribution: true }}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={24}
          size={1.2}
          color={dotColor}
        />
        <GraphMinimap isDark={isDark} />
      </ReactFlow>
    </div>
  );
};

const KnowledgeGraphModal: React.FC<KnowledgeGraphModalProps> = ({
  isOpen, onClose, documents, isDarkMode, onNodeClick,
}) => {
  const [graphData, setGraphData] = useState<GraphData | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedDocId, setSelectedDocId] = useState("default");
  const [searchQuery, setSearchQuery] = useState("");
  const [showCentralOnly, setShowCentralOnly] = useState(false);

  // Varsayılan grafik verisini yükle
  const defaultGraph = getMevzuatGraph();
  const displayData = graphData ?? defaultGraph;

  const handleAnalyze = useCallback(async () => {
    if (selectedDocId === "default") {
      setGraphData(null); // defaultGraph kullanılacak
      return;
    }
    const doc = documents.find(d => d.id === selectedDocId);
    if (!doc) return;
    setIsAnalyzing(true);
    try {
      const result = await geminiService.extractGraphFromText(doc.content);
      setGraphData(result);
    } catch (e: any) {
      console.error("Graph analiz hatası:", e);
    } finally {
      setIsAnalyzing(false);
    }
  }, [selectedDocId, documents]);

  const handleNodeClick = useCallback((nodeId: string) => {
    // defaultGraph'tan MevzuatMaddesi bul
    const madde = defaultGraph.nodes.find(n => n.id === nodeId);
    if (madde) {
      // MevzuatMaddesi formatındaki veri data/mevzuatVeritabani'den geliyor
      // App.tsx'teki getMadde fonksiyonunu kullanıyoruz
      import("../data/mevzuatVeritabani").then(({ getMadde }) => {
        const full = getMadde(nodeId);
        if (full) onNodeClick(full);
      });
    }
    onClose();
  }, [defaultGraph, onNodeClick, onClose]);

  useEffect(() => {
    if (!isOpen) {
      setSearchQuery("");
      setShowCentralOnly(false);
    }
  }, [isOpen]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    if (isOpen) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const border = isDarkMode ? "#4a2f36" : "#e0c8b8";
  const bg = isDarkMode ? "#231519" : "#fdf6f0";
  const text = isDarkMode ? "#f5e6ea" : "#2d1b12";
  const subText = isDarkMode ? "#a08090" : "#9a8b7a";
  const inputBg = isDarkMode ? "#2d1b20" : "#fff5ee";
  const accent = isDarkMode ? "#e8734a" : "#c4501a";

  return (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center p-4"
      style={{ background: isDarkMode ? "rgba(26,16,18,0.75)" : "rgba(45,27,18,0.3)" }}
      onClick={onClose}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: bg,
          border: `1px solid ${border}`,
          borderRadius: 20,
          width: "100%",
          maxWidth: 1100,
          height: "88vh",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          boxShadow: "0 24px 64px rgba(0,0,0,0.25)",
        }}
      >
        {/* Header */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "14px 20px",
          borderBottom: `1px solid ${border}`,
          gap: 12,
          flexShrink: 0,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 34, height: 34, borderRadius: 10,
              background: `${accent}20`,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <GitBranch size={18} color={accent} />
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: text }}>Mevzuat İlişki Grafiği</div>
              <div style={{ fontSize: 11, color: subText }}>
                {displayData.nodes.length} madde · {displayData.edges.length} bağlantı
              </div>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, justifyContent: "center" }}>
            {/* Belge seçici */}
            <select
              value={selectedDocId}
              onChange={e => { setSelectedDocId(e.target.value); setGraphData(null); }}
              style={{
                background: inputBg, border: `1px solid ${border}`,
                color: text, borderRadius: 10, padding: "6px 12px",
                fontSize: 12, outline: "none", maxWidth: 220,
              }}
            >
              <option value="default">Varsayılan (3194 İmar Kanunu)</option>
              {documents.map(d => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>

            {/* Analiz butonu */}
            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing}
              style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "7px 14px", borderRadius: 10, border: "none",
                background: isAnalyzing ? `${accent}60` : accent,
                color: "#fff", fontSize: 12, fontWeight: 700,
                cursor: isAnalyzing ? "default" : "pointer",
                transition: "background 0.15s",
              }}
            >
              {isAnalyzing
                ? <><Loader2 size={13} className="animate-spin" /> Analiz ediliyor...</>
                : <><Sparkles size={13} /> {selectedDocId === "default" ? "Varsayılanı Yükle" : "Analiz Et"}</>
              }
            </button>
          </div>

          <button
            onClick={onClose}
            style={{
              width: 32, height: 32, borderRadius: 8, border: "none",
              background: isDarkMode ? "#3d2530" : "#f0e0d0",
              color: subText, cursor: "pointer", display: "flex",
              alignItems: "center", justifyContent: "center",
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Loading overlay */}
        {isAnalyzing && (
          <div style={{
            position: "absolute", inset: 0, zIndex: 20,
            display: "flex", alignItems: "center", justifyContent: "center",
            background: isDarkMode ? "rgba(26,16,18,0.6)" : "rgba(253,246,240,0.6)",
            borderRadius: 20,
          }}>
            <div style={{ textAlign: "center", color: text }}>
              <Loader2 size={36} color={accent} className="animate-spin" style={{ margin: "0 auto 12px" }} />
              <div style={{ fontSize: 14, fontWeight: 600 }}>Gemini belgeyi analiz ediyor...</div>
              <div style={{ fontSize: 12, color: subText, marginTop: 4 }}>Maddeler arası ilişkiler tespit ediliyor</div>
            </div>
          </div>
        )}

        {/* React Flow Canvas */}
        <ReactFlowProvider>
          <GraphCanvas
            graphData={displayData}
            isDark={isDarkMode}
            searchQuery={searchQuery}
            showCentralOnly={showCentralOnly}
            onSearchChange={setSearchQuery}
            onToggleCentral={() => setShowCentralOnly(p => !p)}
            onNodeClickById={handleNodeClick}
          />
        </ReactFlowProvider>

        {/* Legend */}
        <GraphLegend isDark={isDarkMode} />
      </div>
    </div>
  );
};

export default KnowledgeGraphModal;
