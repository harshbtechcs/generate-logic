import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { dockerModules, type Level } from "@/lib/data";
import { Reveal } from "@/components/ui/Reveal";
import { LetterReveal } from "@/components/motion/AnimatedHeader";
import { DockerArt } from "@/components/home/showcase/art";
import { THEMES } from "@/lib/themes";

const t = THEMES.docker;
const levelCls: Record<Level, string> = {
  Beginner: "bg-green-400/20 text-green-100 ring-green-300/40",
  Intermediate: "bg-amber-300/20 text-amber-100 ring-amber-200/40",
  Advanced: "bg-pink-400/20 text-pink-100 ring-pink-300/40",
};

/** Learning-path preview as a full-bleed Docker-blue block, like a featured flavour in the video. */
export function RoadmapPreview() {
  return (
    <section className="relative isolate overflow-hidden" style={{ background: `radial-gradient(90% 120% at 20% 10%, ${t.bg[1]} 0%, ${t.bg[0]} 60%, #060B19 100%)` }}>
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 opacity-[0.1] [background-image:radial-gradient(rgba(255,255,255,0.6)_1px,transparent_1px)] [background-size:3px_3px]" />
      <span aria-hidden="true" className="pointer-events-none absolute -top-6 left-0 -z-10 select-none whitespace-nowrap font-display text-[22vw] font-black leading-none tracking-tighter text-white/[0.06]">
        DOCKER
      </span>
      <div className="mx-auto grid max-w-site gap-12 px-5 py-24 sm:px-8 lg:grid-cols-[1fr_1.25fr]">
        <div className="flex flex-col gap-5">
          <Reveal as="span" variant="left" className="font-mono text-[13px] tracking-[0.18em]" >
            <span style={{ color: t.accent[0] }}>02 / LEARNING PATHS</span>
          </Reveal>
          <h2 className="font-display text-[40px] font-black uppercase leading-[0.95] tracking-tighter text-white sm:text-[60px]">
            <LetterReveal text="A roadmap, not a random playlist" onView />
          </h2>
          <Reveal as="p" delay={0.2} className="max-w-lg text-[17px] leading-relaxed text-white/80">
            Every path is ordered from beginner to advanced, with the related videos, notes, exercises and GitHub projects in one place. Sign in and your progress is saved lesson by lesson.
          </Reveal>
          <Reveal delay={0.3} className="flex flex-wrap gap-2.5">
            {(Object.keys(levelCls) as Level[]).map((l) => (
              <span key={l} className={`rounded-full px-4 py-2 text-[13px] font-semibold ring-1 ${levelCls[l]}`}>
                {l}
              </span>
            ))}
          </Reveal>
          <Reveal delay={0.35}>
            <Link href="/learn/docker" className="gl-btn inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3.5 font-semibold text-ink-900">
              Start the Docker path <ArrowRight size={18} aria-hidden="true" />
            </Link>
          </Reveal>
          <div aria-hidden="true" className="anim-bob mt-4 hidden w-72 drop-shadow-[0_30px_50px_rgba(0,0,0,0.5)] lg:block">
            <DockerArt a={t.accent[0]} b={t.accent[1]} c={t.accent[2]} />
          </div>
        </div>

        <Reveal variant="zoom" delay={0.1} className="self-start overflow-hidden rounded-[26px] bg-black/25 ring-1 ring-white/15 backdrop-blur-md">
          <div className="flex items-center justify-between gap-3 border-b border-white/10 px-6 py-5">
            <span className="font-display text-2xl font-bold italic text-white">Docker Masterclass</span>
            <span className="rounded-full bg-white/10 px-3 py-1 font-mono text-[13px] text-white/80">{dockerModules.length} modules</span>
          </div>
          <ol className="py-2">
            {dockerModules.map((m, i) => (
              <Reveal as="li" key={m.title} variant="right" delay={i * 0.05} className="group flex items-center gap-4 px-6 py-3 transition-colors hover:bg-white/[0.07]">
                <span className="w-9 shrink-0 font-display text-xl font-black transition-transform group-hover:scale-110" style={{ color: t.accent[0] }}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="flex-1 text-[15px] font-medium text-white transition-transform group-hover:translate-x-1">{m.title}</span>
                <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${levelCls[m.level]}`}>{m.level}</span>
              </Reveal>
            ))}
          </ol>
        </Reveal>
      </div>
    </section>
  );
}
