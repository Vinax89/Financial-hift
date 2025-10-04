import { useTheme } from "../theme/ThemeProvider";

// Pure helper for charts palette (no hooks inside)
export function getChartTheme(theme) {
  const palettes = {
    light: {
      text: "#334155",
      grid: "rgba(148,163,184,0.25)",
      tooltipBg: "hsl(var(--background))",
      tooltipBorder: "hsl(var(--border))",
      primary: "#0ea5e9",   // sky-500
      secondary: "#10b981", // emerald-500
      accent: "#8b5cf6",    // violet-500
      danger: "#ef4444",    // red-500
      muted: "#94a3b8",
      pie: ["#ef4444","#f97316","#eab308","#22c55e","#3b82f6","#8b5cf6","#ec4899","#06b6d4","#84cc16","#f59e0b"]
    },
    dark: {
      text: "#e2e8f0",
      grid: "rgba(148,163,184,0.2)",
      tooltipBg: "hsl(var(--background))",
      tooltipBorder: "hsl(var(--border))",
      primary: "#38bdf8",   // sky-400
      secondary: "#10b981", // emerald-500
      accent: "#a78bfa",    // violet-400
      danger: "#f87171",    // red-400
      muted: "#94a3b8",
      pie: ["#f87171","#fb923c","#facc15","#4ade80","#60a5fa","#a78bfa","#f472b6","#22d3ee","#a3e635","#fbbf24"]
    },
    oled: {
      text: "#f8fafc",
      grid: "rgba(203,213,225,0.18)",
      tooltipBg: "hsl(var(--background))",
      tooltipBorder: "hsl(var(--border))",
      primary: "#7dd3fc",   // sky-300
      secondary: "#34d399", // emerald-400
      accent: "#c4b5fd",    // violet-300
      danger: "#fca5a5",    // red-300
      muted: "#cbd5e1",
      pie: ["#fca5a5","#fdba74","#fde047","#86efac","#93c5fd","#c4b5fd","#f9a8d4","#67e8f9","#bef264","#fbbf24"]
    }
  };
  const p = palettes[theme] || palettes.light;
  return {
    text: p.text,
    grid: p.grid,
    tooltipBg: p.tooltipBg,
    tooltipBorder: p.tooltipBorder,
    barColors: { gross: p.secondary, net: p.primary },
    lineColors: { income: p.secondary, expenses: p.danger, net: p.primary },
    pieColors: p.pie
  };
}