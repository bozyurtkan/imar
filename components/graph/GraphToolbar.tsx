import React from "react";
import { useReactFlow } from "@xyflow/react";
import { ZoomIn, ZoomOut, Maximize2, Search, Star } from "lucide-react";

interface GraphToolbarProps {
  searchQuery: string;
  onSearchChange: (v: string) => void;
  showCentralOnly: boolean;
  onToggleCentral: () => void;
  isDark: boolean;
}

const GraphToolbar: React.FC<GraphToolbarProps> = ({
  searchQuery, onSearchChange, showCentralOnly, onToggleCentral, isDark,
}) => {
  const { zoomIn, zoomOut, fitView } = useReactFlow();

  const btn = (onClick: () => void, children: React.ReactNode, title: string, active = false) => (
    <button
      onClick={onClick}
      title={title}
      style={{
        display: "flex", alignItems: "center", justifyContent: "center",
        width: 32, height: 32, borderRadius: 8, border: "none", cursor: "pointer",
        background: active
          ? (isDark ? "#e8734a" : "#c4501a")
          : (isDark ? "#3d2530" : "#f0e0d0"),
        color: active ? "#fff" : (isDark ? "#d4a090" : "#8a5040"),
        transition: "background 0.15s",
      }}
    >
      {children}
    </button>
  );

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
      {/* Arama */}
      <div style={{
        display: "flex", alignItems: "center", gap: 6,
        background: isDark ? "#2d1b20" : "#fff5ee",
        border: `1px solid ${isDark ? "#4a2f36" : "#e0c8b8"}`,
        borderRadius: 10, padding: "4px 10px",
      }}>
        <Search size={13} color={isDark ? "#a08090" : "#c4501a"} />
        <input
          type="text"
          value={searchQuery}
          onChange={e => onSearchChange(e.target.value)}
          placeholder="Madde ara..."
          style={{
            border: "none", outline: "none", background: "transparent",
            fontSize: 12, color: isDark ? "#f5e6ea" : "#2d1b12",
            width: 120,
          }}
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange("")}
            style={{ border: "none", background: "none", cursor: "pointer",
              color: isDark ? "#a08090" : "#9a8b7a", fontSize: 14, lineHeight: 1 }}
          >×</button>
        )}
      </div>

      {/* Merkezi madde butonu */}
      {btn(onToggleCentral, <Star size={14} />, "Merkezi Maddeleri Göster", showCentralOnly)}

      {/* Zoom butonları */}
      {btn(() => zoomIn({ duration: 200 }), <ZoomIn size={14} />, "Yakınlaştır")}
      {btn(() => zoomOut({ duration: 200 }), <ZoomOut size={14} />, "Uzaklaştır")}
      {btn(() => fitView({ duration: 300, padding: 0.1 }), <Maximize2 size={14} />, "Tümünü Göster")}
    </div>
  );
};

export default GraphToolbar;
