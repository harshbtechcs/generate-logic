/** Colour themes used by animated page headers and backdrops (safe on server and client). */
export type IconName =
  | "box" | "hexagon" | "layers" | "cloud" | "server" | "cpu" | "terminal" | "git" | "merge" | "workflow"
  | "brain" | "calendar" | "flame" | "trophy" | "crown" | "medal" | "map" | "play" | "book" | "code"
  | "sparkles" | "shield" | "user" | "rocket" | "star" | "file";

export type Theme = { bg: [string, string]; accent: [string, string, string]; icons: IconName[] };

const T = (bg: [string, string], accent: [string, string, string], icons: IconName[]): Theme => ({ bg, accent, icons });

export const THEMES = {
  teal: T(["#04222a", "#0e7c86"], ["#5eead4", "#22d3ee", "#0f766e"], ["sparkles", "code", "cloud", "terminal", "rocket"]),
  docker: T(["#06244a", "#1662c4"], ["#7cc4ff", "#2f86e6", "#174f9c"], ["box", "box", "layers", "server", "cloud"]),
  kubernetes: T(["#12175a", "#3c4ee0"], ["#a5b4fc", "#6366f1", "#2a33a8"], ["hexagon", "hexagon", "cpu", "workflow", "server"]),
  terraform: T(["#2a0f57", "#7a3fe0"], ["#c4b5fd", "#8b5cf6", "#5b21b6"], ["layers", "box", "cloud", "code", "layers"]),
  aws: T(["#5a2104", "#ea7a12"], ["#ffd29a", "#f59e0b", "#b45309"], ["cloud", "server", "cloud", "cpu", "shield"]),
  linux: T(["#0b3b2a", "#16a36b"], ["#86efac", "#22c55e", "#15803d"], ["terminal", "terminal", "cpu", "server", "code"]),
  git: T(["#5e140c", "#e2492d"], ["#ffb4a3", "#f97316", "#b91c1c"], ["git", "merge", "git", "terminal", "code"]),
  ansible: T(["#3a0a10", "#c0283c"], ["#fecdd3", "#f43f5e", "#9f1239"], ["workflow", "server", "terminal", "code", "server"]),
  jenkins: T(["#2b1a0c", "#a0632a"], ["#fde2c3", "#d97706", "#7c2d12"], ["workflow", "rocket", "code", "server", "play"]),
  cicd: T(["#062c33", "#0891b2"], ["#a5f3fc", "#06b6d4", "#155e75"], ["workflow", "rocket", "git", "play", "code"]),
  networking: T(["#0a1f3d", "#2563eb"], ["#bfdbfe", "#3b82f6", "#1e3a8a"], ["server", "cloud", "workflow", "shield", "cpu"]),
  azure: T(["#061a3a", "#0b6fd6"], ["#bae6fd", "#0ea5e9", "#075985"], ["cloud", "server", "shield", "cloud", "cpu"]),
  gcp: T(["#0b2a1c", "#2f8f5b"], ["#bbf7d0", "#34d399", "#065f46"], ["cloud", "cpu", "server", "cloud", "hexagon"]),
  amber: T(["#3b2503", "#c98a06"], ["#fde68a", "#fbbf24", "#92400e"], ["calendar", "flame", "brain", "star", "sparkles"]),
  orange: T(["#3d1404", "#d9520c"], ["#fed7aa", "#fb923c", "#9a3412"], ["trophy", "crown", "medal", "star", "flame"]),
  violet: T(["#1e0b4a", "#6d3bd2"], ["#ddd6fe", "#a78bfa", "#5b21b6"], ["brain", "star", "sparkles", "code", "brain"]),
  green: T(["#052e1c", "#15803d"], ["#bbf7d0", "#4ade80", "#166534"], ["terminal", "code", "terminal", "cpu", "server"]),
  blue: T(["#071c44", "#1d4ed8"], ["#bfdbfe", "#60a5fa", "#1e40af"], ["map", "rocket", "layers", "cloud", "star"]),
  red: T(["#3a0707", "#c81e1e"], ["#fecaca", "#f87171", "#991b1b"], ["play", "play", "book", "sparkles", "star"]),
  indigo: T(["#11103d", "#4338ca"], ["#c7d2fe", "#818cf8", "#3730a3"], ["book", "file", "code", "sparkles", "brain"]),
  pink: T(["#3a0a2a", "#c026d3"], ["#f5d0fe", "#e879f9", "#86198f"], ["rocket", "code", "git", "star", "sparkles"]),
  slate: T(["#0f172a", "#334155"], ["#e2e8f0", "#94a3b8", "#475569"], ["shield", "file", "book", "user", "shield"]),
} satisfies Record<string, Theme>;

export type ThemeName = keyof typeof THEMES;

/** Pick a theme from a page kicker such as "DAILY CHALLENGE". */
export function themeForKicker(kicker: string): ThemeName {
  const k = kicker.toUpperCase();
  const map: [string, ThemeName][] = [
    ["DAILY", "amber"],
    ["LEADERBOARD", "orange"],
    ["QUIZ", "violet"],
    ["PLAYGROUND", "green"],
    ["TERMINAL", "green"],
    ["ROADMAP", "blue"],
    ["PLAYLIST", "red"],
    ["BLOG", "indigo"],
    ["NOTES", "amber"],
    ["PROJECT", "pink"],
    ["LEGAL", "slate"],
    ["ABOUT", "teal"],
    ["PRACTICE", "teal"],
    ["ADMIN", "slate"],
  ];
  return map.find(([w]) => k.includes(w))?.[1] ?? "teal";
}

export function themeForTech(slug: string): ThemeName {
  return slug in THEMES ? (slug as ThemeName) : "teal";
}
