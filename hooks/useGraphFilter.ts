import { useMemo } from "react";
import type { Node, Edge } from "@xyflow/react";
import type { GraphNode } from "../types";

export function useGraphFilter(
  rfNodes: Node[],
  rfEdges: Edge[],
  searchQuery: string,
  showCentralOnly: boolean
): { filteredNodes: Node[]; filteredEdges: Edge[] } {
  return useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    let visibleNodeIds: Set<string>;

    if (showCentralOnly) {
      // Sadece importance=3 ve onların komşuları
      const centralIds = new Set(
        rfNodes
          .filter(n => (n.data as unknown as GraphNode).importance === 3)
          .map(n => n.id)
      );
      const neighborIds = new Set<string>();
      rfEdges.forEach(e => {
        if (centralIds.has(e.source)) neighborIds.add(e.target);
        if (centralIds.has(e.target)) neighborIds.add(e.source);
      });
      visibleNodeIds = new Set([...centralIds, ...neighborIds]);
    } else if (q) {
      // Arama: eşleşen node ve komşuları
      const matchIds = new Set(
        rfNodes
          .filter(n => {
            const d = n.data as unknown as GraphNode;
            return (
              d.id.toLowerCase().includes(q) ||
              d.label.toLowerCase().includes(q) ||
              d.desc.toLowerCase().includes(q)
            );
          })
          .map(n => n.id)
      );
      const neighborIds = new Set<string>();
      rfEdges.forEach(e => {
        if (matchIds.has(e.source)) neighborIds.add(e.target);
        if (matchIds.has(e.target)) neighborIds.add(e.source);
      });
      visibleNodeIds = new Set([...matchIds, ...neighborIds]);
    } else {
      visibleNodeIds = new Set(rfNodes.map(n => n.id));
    }

    const filteredNodes = rfNodes.map(n => ({
      ...n,
      style: {
        ...n.style,
        opacity: visibleNodeIds.has(n.id) ? 1 : 0.18,
      },
    }));

    const filteredEdges = rfEdges.map(e => ({
      ...e,
      data: {
        ...e.data,
        highlighted: visibleNodeIds.has(e.source) && visibleNodeIds.has(e.target),
      },
      style: {
        opacity: visibleNodeIds.has(e.source) && visibleNodeIds.has(e.target) ? 1 : 0.1,
      },
    }));

    return { filteredNodes, filteredEdges };
  }, [rfNodes, rfEdges, searchQuery, showCentralOnly]);
}
