import React from "react";
import type { GraphNodeCategory, GraphEdgeType } from "../../types";
import { CATEGORY_STYLES, EDGE_STYLES } from "./graphColors";

interface GraphLegendProps {
  isDark: boolean;
}

const CATEGORIES: GraphNodeCategory[] = ["procedural", "definitional", "penalty", "referral", "transitional"];
const EDGE_TYPES: GraphEdgeType[] = ["references", "amends", "depends_on", "related_to"];

const GraphLegend: React.FC<GraphLegendProps> = ({ isDark }) => {
  const textColor = isDark ? "#a09090" : "#9a8b7a";
  const borderColor = isDark ? "#3d2530" : "#e8d8c8";

  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap",
      padding: "10px 16px",
      borderTop: `1px solid ${borderColor}`,
      fontSize: 11, color: textColor,
    }}>
      {/* Node kategorileri */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        <span style={{ fontWeight: 600, marginRight: 2 }}>Node:</span>
        {CATEGORIES.map(cat => {
          const s = CATEGORY_STYLES[cat];
          return (
            <div key={cat} style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <div style={{
                width: 10, height: 10, borderRadius: 3,
                background: isDark ? s.fillDark : s.fill,
                border: `2px solid ${isDark ? s.strokeDark : s.stroke}`,
              }} />
              <span>{s.label}</span>
            </div>
          );
        })}
      </div>

      <div style={{ width: 1, height: 16, background: borderColor }} />

      {/* Edge tipleri */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        <span style={{ fontWeight: 600, marginRight: 2 }}>Kenar:</span>
        {EDGE_TYPES.map(type => {
          const s = EDGE_STYLES[type];
          const color = isDark ? s.colorDark : s.color;
          const dashArr = s.strokeDasharray === "none" ? undefined : s.strokeDasharray;
          return (
            <div key={type} style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <svg width={28} height={10}>
                <line
                  x1="0" y1="5" x2="28" y2="5"
                  stroke={color}
                  strokeWidth={s.strokeWidth}
                  strokeDasharray={dashArr}
                />
                <polygon points="22,2 28,5 22,8" fill={color} />
              </svg>
              <span>{s.label}</span>
            </div>
          );
        })}
      </div>

      <div style={{ marginLeft: "auto", opacity: 0.6 }}>
        Kaydır: sürükle · Yakınlaştır: tekerlek
      </div>
    </div>
  );
};

export default GraphLegend;
