import React, { memo } from "react";
import { Handle, Position, NodeToolbar } from "@xyflow/react";
import type { NodeProps } from "@xyflow/react";
import type { GraphNode as GraphNodeData } from "../../types";
import { CATEGORY_STYLES, NODE_SIZES } from "./graphColors";

type NodeData = GraphNodeData & { isDark: boolean; connectionCount: number };

const GraphNode = memo(({ data: rawData, selected }: NodeProps) => {
  const data = rawData as unknown as NodeData;
  const style = CATEGORY_STYLES[data.category] ?? CATEGORY_STYLES.definitional;
  const size = NODE_SIZES[data.importance] ?? NODE_SIZES[1];
  const isDark = data.isDark;

  const fill = isDark ? style.fillDark : style.fill;
  const stroke = isDark ? style.strokeDark : style.stroke;
  const textColor = isDark ? "#f5e6ea" : "#2d1b12";
  const subColor = isDark ? "#a89090" : "#9a8b7a";

  return (
    <>
      <NodeToolbar isVisible={selected} position={Position.Top}>
        <div
          style={{
            background: isDark ? "#2d1b20" : "#fff",
            border: `1px solid ${stroke}`,
            borderRadius: 10,
            padding: "8px 12px",
            fontSize: 12,
            color: textColor,
            maxWidth: 220,
            boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
          }}
        >
          <div style={{ fontWeight: 700, marginBottom: 4 }}>{data.label} — {data.desc}</div>
          <div style={{ color: subColor, fontSize: 11 }}>
            {style.label} · {data.connectionCount} bağlantı · Önem {data.importance}/3
          </div>
        </div>
      </NodeToolbar>

      <Handle type="target" position={Position.Left} style={{ opacity: 0 }} />
      <Handle type="source" position={Position.Right} style={{ opacity: 0 }} />

      <div
        style={{
          width: size.width,
          height: size.height,
          borderRadius: 12,
          background: fill,
          border: `${selected ? 2.5 : 1.5}px solid ${stroke}`,
          boxShadow: selected
            ? `0 0 0 3px ${stroke}40, 0 4px 20px ${stroke}30`
            : `0 2px 8px rgba(0,0,0,0.08)`,
          display: "flex",
          alignItems: "center",
          overflow: "hidden",
          cursor: "pointer",
          transition: "box-shadow 0.2s, border-color 0.2s",
          position: "relative",
        }}
      >
        {/* Sol renkli accent çizgisi */}
        <div
          style={{
            width: 4,
            height: "100%",
            background: style.accent,
            flexShrink: 0,
            borderRadius: "2px 0 0 2px",
          }}
        />
        <div style={{ padding: "6px 10px", overflow: "hidden", flex: 1 }}>
          <div
            style={{
              fontSize: size.fontSize,
              fontWeight: data.importance === 3 ? 800 : 700,
              color: textColor,
              lineHeight: 1.3,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {data.label}
          </div>
          <div
            style={{
              fontSize: size.fontSize - 2,
              color: subColor,
              lineHeight: 1.3,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              marginTop: 2,
            }}
          >
            {data.desc}
          </div>
        </div>
        {/* Importance badge */}
        {data.importance === 3 && (
          <div
            style={{
              position: "absolute",
              top: 4,
              right: 6,
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: style.accent,
              opacity: 0.8,
            }}
          />
        )}
      </div>
    </>
  );
});

GraphNode.displayName = "GraphNode";
export default GraphNode;
