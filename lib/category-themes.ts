import type { Category } from "./types";

export interface CategoryTheme {
  gradient: string;
  bg: string;
  text: string;
  textLight: string;
  glow: string;
  surface: string;
  border: string;
  ring: string;
  accent: string;
  label: string;
  labelAr: string;
}

export const CATEGORY_THEMES: Record<Category, CategoryTheme> = {
  restaurant: {
    gradient: "from-orange-500 to-red-500",
    bg: "bg-orange-500",
    text: "text-orange-400",
    textLight: "text-orange-600",
    glow: "rgba(249,115,22,0.15)",
    surface: "rgba(249,115,22,0.06)",
    border: "rgba(249,115,22,0.2)",
    ring: "ring-orange-500/30",
    accent: "#f97316",
    label: "Restaurants & Cafes",
    labelAr: "مطاعم وكافيهات",
  },
  supermarket: {
    gradient: "from-emerald-400 to-teal-500",
    bg: "bg-emerald-500",
    text: "text-emerald-400",
    textLight: "text-emerald-600",
    glow: "rgba(52,211,153,0.15)",
    surface: "rgba(52,211,153,0.06)",
    border: "rgba(52,211,153,0.2)",
    ring: "ring-emerald-500/30",
    accent: "#34d399",
    label: "Supermarkets",
    labelAr: "سوبر ماركت",
  },
  online: {
    gradient: "from-violet-500 to-fuchsia-500",
    bg: "bg-violet-500",
    text: "text-violet-400",
    textLight: "text-violet-600",
    glow: "rgba(139,92,246,0.15)",
    surface: "rgba(139,92,246,0.06)",
    border: "rgba(139,92,246,0.2)",
    ring: "ring-violet-500/30",
    accent: "#8b5cf6",
    label: "Online Stores",
    labelAr: "متاجر أونلاين",
  },
} as const;
