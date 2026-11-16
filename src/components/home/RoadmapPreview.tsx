import { dockerModules, levelStyles, techBySlug, type Level } from "@/lib/data";
import { Reveal } from "@/components/ui/Reveal";
import { TechBadge } from "@/components/ui/TechBadge";

const pills: { level: Level; cls: string }[] = [
  { level: "Beginner", cls: "text-green-200 bg-green-400/10 border-green-400/35" },
  { level: "Intermediate", cls: "text-cyan-200 bg-cyan-400/10 border-cyan-400/35" },
  { level: "Advanced", cls: "text-blue-200 bg-blue-400/10 border-blue-400/35" },
];

export function RoadmapPreview() {
  return (
    <section className="relative border-y border-slate-400/10 bg-slate-900/45">
      <div className="mx-auto flex max-w-site flex-wrap gap-14 px-5 py-[88px] sm:px-8">
        <div className="flex min-w-0 flex-[1_1_340px] flex-col gap-[18px]">
          <Reveal as="span" variant="left" className="kicker">
            02 / LEARNING PATHS
          </Reveal>
          <Reveal as="h2" variant="blur" delay={0.1} className="font-display text-[34px] font-bold tracking-tight sm:text-[42px]">
            A roadmap, not a random playlist
          </Reveal>
          <Reveal as="p" delay={0.2} className="text-[17px] leading-relaxed text-text-muted">
            Every path is ordered from beginner to advanced, with the related videos, notes, exercises and GitHub
            projects in one place. Sign in and your progress is saved lesson by lesson.
          </Reveal>
          <Reveal delay={0.3} className="mt-1.5 flex flex-wrap gap-2.5">
            {pills.map((p) => (
              <span key={p.level} className={`rounded-full border px-3.5 py-2 text-[13px] font-medium ${p.cls}`}>
                {p.level}
              </span>
            ))}
          </Reveal>
        </div>

        <Reveal
          variant="zoom"
          delay={0.1}
          className="min-w-0 flex-[1.4_1_520px] overflow-hidden rounded-[20px] border border-slate-400/20 bg-ink-900/70"
        >
          <div className="flex items-center justify-between gap-3 border-b border-slate-400/15 px-[22px] py-[18px]">
            <span className="flex items-center gap-3">
              <TechBadge tech={techBySlug.docker} size={36} />
              <span className="font-display text-xl font-semibold">Docker Masterclass</span>
            </span>
            <span className="font-mono text-[13px] text-text-faint">{dockerModules.length} modules</span>
          </div>
          <ol className="py-2.5">
            {dockerModules.map((m, i) => (
              <Reveal as="li" key={m.title} variant="right" delay={i * 0.05} className="flex items-center gap-4 px-[22px] py-[11px]">
                <span className="w-[30px] shrink-0 font-mono text-[13px] text-slate-500">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="flex-1 text-[15px] text-slate-200">{m.title}</span>
                <span className={`shrink-0 rounded-full border px-2.5 py-1 text-xs font-medium ${levelStyles[m.level]}`}>
                  {m.level}
                </span>
              </Reveal>
            ))}
          </ol>
        </Reveal>
      </div>
    </section>
  );
}
