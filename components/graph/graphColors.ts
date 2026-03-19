import type { GraphNodeCategory, GraphEdgeType } from "../../types";

export interface CategoryStyle {
  fill: string;
  fillDark: string;
  stroke: string;
  strokeDark: string;
  accent: string;
  label: string;
}

export const CATEGORY_STYLES: Record<GraphNodeCategory, CategoryStyle> = {
  procedural: {
    fill: "#fff7ed", fillDark: "#2d1a0a",
    stroke: "#fb923c", strokeDark: "#c2410c",
    accent: "#f97316",
    label: "Uygulama",
  },
  definitional: {
    fill: "#f0fdf4", fillDark: "#052e16",
    stroke: "#4ade80", strokeDark: "#15803d",
    accent: "#22c55e",
    label: "Tanım",
  },
  penalty: {
    fill: "#fef2f2", fillDark: "#2d0a0a",
    stroke: "#f87171", strokeDark: "#b91c1c",
    accent: "#ef4444",
    label: "Yaptırım",
  },
  referral: {
    fill: "#eff6ff", fillDark: "#0a1a2d",
    stroke: "#60a5fa", strokeDark: "#1d4ed8",
    accent: "#3b82f6",
    label: "Atıf",
  },
  transitional: {
    fill: "#faf5ff", fillDark: "#1a0a2d",
    stroke: "#c084fc", strokeDark: "#7e22ce",
    accent: "#a855f7",
    label: "Geçiş",
  },
};

export interface EdgeStyle {
  strokeDasharray: string;
  strokeWidth: number;
  color: string;
  colorDark: string;
  label: string;
}

export const EDGE_STYLES: Record<GraphEdgeType, EdgeStyle> = {
  references: {
    strokeDasharray: "6 3",
    strokeWidth: 1.5,
    color: "#d4c4b8",
    colorDark: "#3d3148",
    label: "Atıf",
  },
  amends: {
    strokeDasharray: "none",
    strokeWidth: 2.5,
    color: "#ef4444",
    colorDark: "#f87171",
    label: "Değiştirir",
  },
  depends_on: {
    strokeDasharray: "2 4",
    strokeWidth: 1.5,
    color: "#f97316",
    colorDark: "#fb923c",
    label: "Bağlı",
  },
  related_to: {
    strokeDasharray: "none",
    strokeWidth: 1,
    color: "#94a3b8",
    colorDark: "#475569",
    label: "İlgili",
  },
};

export const NODE_SIZES: Record<1 | 2 | 3, { width: number; height: number; fontSize: number }> = {
  1: { width: 140, height: 54, fontSize: 11 },
  2: { width: 160, height: 62, fontSize: 12 },
  3: { width: 185, height: 72, fontSize: 13 },
};
