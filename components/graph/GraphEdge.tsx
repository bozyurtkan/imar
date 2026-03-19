import React, { memo } from "react";
import { BaseEdge, EdgeLabelRenderer, getSmoothStepPath, MarkerType } from "@xyflow/react";
import type { EdgeProps } from "@xyflow/react";
import type { GraphEdgeType } from "../../types";
import { EDGE_STYLES } from "./graphColors";

interface GraphEdgeData {
  relation: string;
  type: GraphEdgeType;
  isDark: boolean;
  highlighted: boolean;
}

const GraphEdge = memo(({
  id, sourceX, sourceY, targetX, targetY,
  sourcePosition, targetPosition, data: rawData, selected,
}: EdgeProps) => {
  const data = rawData as unknown as GraphEdgeData | undefined;
  const edgeType: GraphEdgeType = data?.type ?? "related_to";
  const style = EDGE_STYLES[edgeType] ?? EDGE_STYLES.related_to;
  const isDark = data?.isDark ?? false;
  const highlighted = data?.highlighted ?? false;

  const stroke = isDark ? style.colorDark : style.color;
  const activeStroke = isDark ? "#e8734a" : "#c4501a";
  const finalStroke = (selected || highlighted) ? activeStroke : stroke;
  const finalWidth = (selected || highlighted) ? style.strokeWidth + 1 : style.strokeWidth;

  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX, sourceY, targetX, targetY,
    sourcePosition, targetPosition,
    borderRadius: 12,
  });

  const markerId = `arrow-${id}`;

  return (
    <>
      <defs>
        <marker
          id={markerId}
          markerWidth="10"
          markerHeight="7"
          refX="9"
          refY="3.5"
          orient="auto"
        >
          <polygon
            points="0 0, 10 3.5, 0 7"
            fill={finalStroke}
          />
        </marker>
      </defs>

      <BaseEdge
        id={id}
        path={edgePath}
        style={{
          stroke: finalStroke,
          strokeWidth: finalWidth,
          strokeDasharray: style.strokeDasharray === "none" ? undefined : style.strokeDasharray,
          markerEnd: `url(#${markerId})`,
          transition: "stroke 0.2s, stroke-width 0.2s",
        }}
      />

      {data?.relation && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: "absolute",
              transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
              fontSize: 9,
              fontWeight: 600,
              color: finalStroke,
              background: isDark ? "rgba(26,16,18,0.85)" : "rgba(255,250,245,0.9)",
              border: `1px solid ${finalStroke}30`,
              borderRadius: 4,
              padding: "1px 5px",
              pointerEvents: "none",
              whiteSpace: "nowrap",
            }}
          >
            {data.relation}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
});

GraphEdge.displayName = "GraphEdge";
export default GraphEdge;
