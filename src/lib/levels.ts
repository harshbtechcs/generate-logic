/** XP levels (all-time XP). Safe to use on the server and in the browser. */
export const LEVELS = [
  { min: 0, name: "Newbie" },
  { min: 100, name: "Explorer" },
  { min: 250, name: "Builder" },
  { min: 500, name: "Shipper" },
  { min: 1000, name: "Automator" },
  { min: 2000, name: "Cloud Ninja" },
  { min: 3500, name: "DevOps Pro" },
  { min: 5000, name: "DevOps Master" },
] as const;

export type LevelInfo = { level: number; name: string; min: number; next: number | null; nextName: string | null; progress: number };

export function levelFor(xp: number): LevelInfo {
  let i = 0;
  while (i + 1 < LEVELS.length && xp >= LEVELS[i + 1]!.min) i++;
  const cur = LEVELS[i]!;
  const nxt = LEVELS[i + 1];
  return {
    level: i + 1,
    name: cur.name,
    min: cur.min,
    next: nxt?.min ?? null,
    nextName: nxt?.name ?? null,
    progress: nxt ? Math.round(((xp - cur.min) / (nxt.min - cur.min)) * 100) : 100,
  };
}

/** Tailwind colour classes per level, low → high. */
export const LEVEL_TONES = [
  "border-slate-400/40 text-slate-200",
  "border-green-400/40 text-green-200",
  "border-teal-400/40 text-teal-200",
  "border-cyan-400/40 text-cyan-200",
  "border-blue-400/40 text-blue-200",
  "border-violet-400/40 text-violet-200",
  "border-amber-300/50 text-amber-100",
  "border-orange-400/60 text-orange-100",
];
