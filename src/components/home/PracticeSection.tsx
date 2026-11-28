import Link from "next/link";
import { ArrowRight, CalendarCheck, Crown, SquareTerminal, Trophy } from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import type { LeaderEntry } from "@/lib/leaderboard";
import { TRACKS } from "@/lib/terminal/missions";

const MISSIONS = TRACKS.reduce((n, t) => n + t.missions.length, 0);

type Props = {
  daily: { question: string; tool: string; level: string } | null;
  top: LeaderEntry[];
};

const termLines = [
  { p: "~$", c: "docker run -d --name web -p 8080:80 nginx" },
  { o: "a3f9c2e81b7d…" },
  { p: "~$", c: "kubectl scale deployment web --replicas=3" },
  { o: "deployment.apps/web scaled", ok: true },
  { p: "~/project$", c: "terraform apply -auto-approve" },
  { o: "Apply complete! Resources: 2 added.", ok: true },
];

/** Homepage teaser for the daily challenge, the playground and the leaderboard. */
export function PracticeSection({ daily, top }: Props) {
  return (
    <section className="relative mx-auto max-w-site px-5 pb-24 pt-6 sm:px-8">
      <SectionHeading
        kicker="PRACTICE EVERY DAY"
        title="Don't just watch"
        intro="A daily question, a safe terminal to try real commands, and a leaderboard to keep you going."
      />
      <div className="grid gap-5 lg:grid-cols-3">
        <Reveal className="h-full">
          <Link href="/daily" className="gl-card group relative flex h-full flex-col gap-4 overflow-hidden rounded-[24px] p-6 text-white ring-1 ring-white/10"
            style={{ background: "linear-gradient(155deg, #c98a06 0%, #3b2503 90%)" }}>
            <span className="flex items-center gap-2 text-sm font-semibold text-white">
              <CalendarCheck size={18} aria-hidden="true" /> Today&apos;s challenge
            </span>
            {daily ? (
              <>
                <span className="flex flex-wrap gap-2 text-xs">
                  <span className="rounded-full border border-slate-400/30 px-2.5 py-1">{daily.tool}</span>
                  <span className="rounded-full border border-slate-400/30 px-2.5 py-1 capitalize">{daily.level}</span>
                </span>
                <span className="font-display text-xl font-semibold leading-snug">{daily.question}</span>
              </>
            ) : (
              <span className="font-display text-xl font-semibold">A new DevOps question every day</span>
            )}
            <span className="mt-auto inline-flex items-center gap-1 text-sm font-medium text-white">
              Answer now <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" aria-hidden="true" />
            </span>
          </Link>
        </Reveal>

        <Reveal delay={0.08} className="h-full">
          <Link href="/terminal" className="gl-card group flex h-full flex-col overflow-hidden rounded-[24px] bg-[#05080f] ring-1 ring-green-400/40 shadow-[0_30px_60px_-30px_rgba(34,197,94,0.6)]">
            <span className="flex items-center gap-2 border-b border-slate-400/15 px-4 py-2.5">
              <span className="h-2.5 w-2.5 rounded-full bg-red-400/80" />
              <span className="h-2.5 w-2.5 rounded-full bg-amber-300/80" />
              <span className="h-2.5 w-2.5 rounded-full bg-green-400/80" />
              <span className="ml-2 font-mono text-[11px] text-text-faint">Command Playground</span>
            </span>
            <span className="flex flex-1 flex-col gap-1 px-4 py-3 font-mono text-[12.5px] leading-relaxed">
              {termLines.map((l, i) =>
                "c" in l ? (
                  <span key={i}>
                    <span className="text-brand-green">{l.p}</span> <span className="text-slate-100">{l.c}</span>
                  </span>
                ) : (
                  <span key={i} className={l.ok ? "text-green-300" : "text-slate-400"}>
                    {l.o}
                  </span>
                ),
              )}
              <span>
                <span className="text-brand-green">~$</span> <span className="inline-block h-4 w-2 translate-y-0.5 animate-pulse bg-brand-teal" />
              </span>
            </span>
            <span className="flex items-center justify-between border-t border-slate-400/15 px-4 py-3 text-sm">
              <span className="flex items-center gap-2 text-green-200">
                <SquareTerminal size={16} aria-hidden="true" /> {MISSIONS} guided missions
              </span>
              <ArrowRight size={16} className="text-green-200 transition-transform group-hover:translate-x-1" aria-hidden="true" />
            </span>
          </Link>
        </Reveal>

        <Reveal delay={0.16} className="h-full">
          <Link href="/leaderboard" className="gl-card group relative flex h-full flex-col gap-4 overflow-hidden rounded-[24px] p-6 text-white ring-1 ring-white/10"
            style={{ background: "linear-gradient(155deg, #d9520c 0%, #3d1404 90%)" }}>
            <span className="flex items-center gap-2 text-sm font-semibold text-white">
              <Trophy size={18} aria-hidden="true" /> Top learners this week
            </span>
            {top.length ? (
              <ol className="flex flex-col gap-2.5">
                {top.map((e) => (
                  <li key={e.id} className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full border border-orange-300/40 text-xs font-semibold">
                      {e.rank === 1 ? <Crown size={16} className="text-amber-300" aria-label="First place" /> : `#${e.rank}`}
                    </span>
                    <span className="flex-1 font-medium">{e.name}</span>
                    <span className="font-mono text-sm text-white">{e.total} XP</span>
                  </li>
                ))}
              </ol>
            ) : (
              <span className="text-text-muted">The board is empty this week — your name could be at the top.</span>
            )}
            <span className="mt-auto inline-flex items-center gap-1 text-sm font-medium text-white">
              See the leaderboard <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" aria-hidden="true" />
            </span>
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
