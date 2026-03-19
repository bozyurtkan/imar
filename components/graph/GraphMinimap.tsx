import React from "react";
import { MiniMap } from "@xyflow/react";
import type { Node } from "@xyflow/react";
import type { GraphNodeCategory } from "../../types";
import { CATEGORY_STYLES } from "./graphColors";

interface GraphMinimapProps {
  isDark: boolean;
}

const GraphMinimap: React.FC<GraphMinimapProps> = ({ isDark }) => {
  const nodeColor = (node: Node) => {
    const category = (node.data as any)?.category as GraphNodeCategory;
    const style = CATEGORY_STYLES[category] ?? CATEGORY_STYLES.definitional;
    return isDark ? style.strokeDark : style.stroke;
  };

  return (
    <MiniMap
      nodeColor={nodeColor}
      maskColor={isDark ? "rgba(26,16,18,0.7)" : "rgba(253,246,240,0.7)"}
      style={{
        background: isDark ? "#231519" : "#fdf6f0",
        border: `1px solid ${isDark ? "#4a2f36" : "#e0c8b8"}`,
        borderRadius: 10,
      }}
      nodeStrokeWidth={2}
      pannable
      zoomable
    />
  );
};

export default GraphMinimap;
