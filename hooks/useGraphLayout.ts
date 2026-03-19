import { useMemo } from "react";
import type { Node, Edge } from "@xyflow/react";
import type { GraphData } from "../types";
import { NODE_SIZES } from "../components/graph/graphColors";

const H_GAP = 260;
const V_GAP = 140;
const PADDING = 60;
const MAX_COLS = 4;

export function useGraphLayout(
  graphData: GraphData | null,
  isDark: boolean
): { rfNodes: Node[]; rfEdges: Edge[] } {
  return useMemo(() => {
    if (!graphData || graphData.nodes.length === 0) return { rfNodes: [], rfEdges: [] };

    const { nodes, edges } = graphData;

    // Bağlantı sayısını hesapla (tooltip için)
    const connMap: Record<string, number> = {};
    edges.forEach(e => {
      connMap[e.source] = (connMap[e.source] ?? 0) + 1;
      connMap[e.target] = (connMap[e.target] ?? 0) + 1;
    });

    // importance=3 önce, sonra importance=2, importance=1 sırala
    const sorted = [...nodes].sort((a, b) => b.importance - a.importance);

    const cols = Math.min(MAX_COLS, Math.max(2, Math.ceil(Math.sqrt(sorted.length))));

    const rfNodes: Node[] = sorted.map((node, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const offsetX = row % 2 === 1 ? H_GAP / 2 : 0;
      const size = NODE_SIZES[node.importance] ?? NODE_SIZES[1];

      return {
        id: node.id,
        type: "graphNode",
        position: {
          x: PADDING + col * H_GAP + offsetX,
          y: PADDING + row * V_GAP,
        },
        data: { ...node, isDark, connectionCount: connMap[node.id] ?? 0 },
        style: { width: size.width, height: size.height },
      };
    });

    const nodeSet = new Set(rfNodes.map(n => n.id));
    const rfEdges: Edge[] = edges
      .filter(e => nodeSet.has(e.source) && nodeSet.has(e.target))
      .map((e, i) => ({
        id: `e-${i}-${e.source}-${e.target}`,
        source: e.source,
        target: e.target,
        type: "graphEdge",
        data: { relation: e.relation, type: e.type, isDark, highlighted: false },
      }));

    return { rfNodes, rfEdges };
  }, [graphData, isDark]);
}
