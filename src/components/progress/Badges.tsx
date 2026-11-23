import { BookOpen, Brain, CalendarDays, Compass, Crown, Flame, Lock, Medal, Rocket, Star, SquareTerminal, Zap } from "lucide-react";
import type { Badge, BadgeIcon } from "@/lib/achievements";
import { Reveal } from "@/components/ui/Reveal";
import { cn } from "@/lib/cn";

const ICONS: Record<BadgeIcon, typeof Brain> = {
  brain: Brain,
  star: Star,
  compass: Compass,
  flame: Flame,
  calendar: CalendarDays,
  crown: Crown,
  terminal: SquareTerminal,
  medal: Medal,
  rocket: Rocket,
  book: BookOpen,
  zap: Zap,
};

/** Badge shelf: earned badges in colour, locked ones grey with progress. */
export function Badges({ badges, compact = false }: { badges: Badge[]; compact?: boolean }) {
  const sorted = [...badges].sort((a, b) => Number(b.earned) - Number(a.earned));
  return (
    <ul className={cn("grid gap-3", compact ? "grid-cols-[repeat(auto-fill,minmax(150px,1fr))]" : "grid-cols-[repeat(auto-fill,minmax(180px,1fr))]")}>
      {sorted.map((b, i) => {
        const Icon = ICONS[b.icon];
        return (
          <Reveal as="li" key={b.id} delay={(i % 6) * 0.04} variant="zoom">
            <div
              title={b.description}
              className={cn(
                "flex h-full flex-col items-center gap-2 rounded-[16px] border p-4 text-center",
                b.earned ? b.tone : "border-slate-400/15 bg-white/[0.02] text-text-faint",
              )}
            >
              <span className={cn("relative flex h-12 w-12 items-center justify-center rounded-full border", b.earned ? "border-current shadow-[0_0_24px_-6px_currentColor]" : "border-slate-400/20")}>
                <Icon size={22} aria-hidden="true" />
                {!b.earned && <Lock size={12} className="absolute -bottom-1 -right-1 rounded-full bg-ink-900 p-0.5" aria-hidden="true" />}
              </span>
              <span className={cn("text-sm font-semibold", b.earned ? "text-text" : "text-text-muted")}>{b.name}</span>
              {!compact && <span className="text-xs leading-snug">{b.description}</span>}
              {!b.earned && b.target > 1 && (
                <span className="mt-auto w-full">
                  <span className="mb-1 block font-mono text-[11px]">
                    {b.current}/{b.target}
                  </span>
                  <span className="block h-1 overflow-hidden rounded-full bg-white/[0.06]">
                    <span className="block h-full rounded-full bg-slate-400/60" style={{ width: `${(b.current / b.target) * 100}%` }} />
                  </span>
                </span>
              )}
              {b.earned && <span className="sr-only">Earned</span>}
            </div>
          </Reveal>
        );
      })}
    </ul>
  );
}

/** Small "Lv 3 · Builder" chip. */
export function LevelChip({ level, name, tone }: { level: number; name: string; tone: string }) {
  return <span className={cn("inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium", tone)}>Lv {level} · {name}</span>;
}
