import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { dockerModules, levelStyles, technologies, techBySlug } from "@/lib/data";
import { getChannelPlaylists } from "@/lib/youtube";
import { Reveal } from "@/components/ui/Reveal";
import { TechBadge } from "@/components/ui/TechBadge";
import { PlaylistCard } from "@/components/home/PlaylistCard";
import { AnimatedHeader, LetterReveal } from "@/components/motion/AnimatedHeader";
import { THEMES, themeForTech } from "@/lib/themes";
import { TRACKS } from "@/lib/terminal/missions";

export const revalidate = 3600;

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return technologies.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const tech = techBySlug[slug];
  return tech
    ? { title: `${tech.name} learning path`, description: `Learn ${tech.name} step by step with Generate Logic.` }
    : { title: "Not found" };
}

// Roadmaps are hard-coded for now; Phase 4 moves them into the database (admin-editable).
const roadmaps: Record<string, typeof dockerModules> = { docker: dockerModules };

export default async function LearnPage({ params }: Props) {
  const { slug } = await params;
  const tech = techBySlug[slug];
  if (!tech) notFound();

  const playlists = (await getChannelPlaylists()).filter((p) => p.technology?.slug === slug);
  const roadmap = roadmaps[slug];

  const theme = THEMES[themeForTech(slug)];
  const art = (["docker", "kubernetes", "terraform", "aws", "linux", "git"] as const).find((a) => a === slug);

  return (
    <>
      <AnimatedHeader
        kicker={`LEARNING PATH · ${tech.tag.toUpperCase()}`}
        title={tech.name}
        intro={`Learn ${tech.name} step by step — videos in order, then test yourself with the quiz${TRACKS.some((t) => t.tool === slug) ? " and practise in the terminal" : ""}.`}
        theme={themeForTech(slug)}
        word={tech.short.length > 2 ? tech.short : tech.name.split(" ")[0]}
        art={art}
        side={art ? undefined : <TechBadge tech={tech} size={160} />}
      >
        <Link href={`/quiz/${tech.slug}`} className="gl-btn inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-ink-900">
          Test yourself: {tech.name} quiz
        </Link>
        {TRACKS.some((t) => t.tool === slug) && (
          <Link href={`/terminal?tool=${slug}`} className="inline-flex items-center gap-2 rounded-xl border border-white/30 bg-white/10 px-5 py-3 text-sm font-semibold text-white backdrop-blur hover:bg-white/20">
            Practise in the terminal
          </Link>
        )}
        <Link href="/#paths" className="inline-flex items-center gap-2 rounded-xl px-3 py-3 text-sm text-white/70 hover:text-white">
          <ArrowLeft size={16} aria-hidden="true" /> All technologies
        </Link>
      </AnimatedHeader>
    <div className="mx-auto max-w-site px-5 pb-28 sm:px-8">
      <section className="mb-16">
        <h2 className="mb-6 font-display text-[40px] font-black uppercase leading-none tracking-tighter sm:text-[56px]">
          <LetterReveal text="The Roadmap" onView />
        </h2>
        {roadmap ? (
          <ol className="overflow-hidden rounded-[26px] py-2.5 ring-1 ring-white/15" style={{ background: `linear-gradient(160deg, ${theme.bg[1]}cc 0%, ${theme.bg[0]} 70%)` }}>
            {roadmap.map((m, i) => (
              <Reveal as="li" key={m.title} variant="right" delay={i * 0.04} className="group flex items-center gap-4 px-6 py-3.5 transition-colors hover:bg-white/[0.07]">
                <span className="w-9 font-display text-xl font-black transition-transform group-hover:scale-110" style={{ color: theme.accent[0] }}>{String(i + 1).padStart(2, "0")}</span>
                <span className="flex-1 text-[15px] font-medium text-white transition-transform group-hover:translate-x-1">{m.title}</span>
                <span className={`rounded-full border px-2.5 py-1 text-xs font-medium ${levelStyles[m.level]}`}>{m.level}</span>
              </Reveal>
            ))}
          </ol>
        ) : (
          <Reveal className="rounded-[20px] border border-dashed border-slate-400/30 p-8 text-text-muted">
            The {tech.name} roadmap is being prepared.
          </Reveal>
        )}
      </section>

      <section>
        <h2 className="mb-6 font-display text-[40px] font-black uppercase leading-none tracking-tighter sm:text-[56px]">
          <LetterReveal text="Playlists" onView />
        </h2>
        {playlists.length > 0 ? (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-5">
            {playlists.map((p, i) => (
              <Reveal key={p.id} delay={(i % 3) * 0.1}>
                <PlaylistCard playlist={p} />
              </Reveal>
            ))}
          </div>
        ) : (
          <Reveal className="rounded-[20px] border border-dashed border-slate-400/30 p-8 text-text-muted">
            No {tech.name} playlist yet — it will appear here automatically once it is published on YouTube.
          </Reveal>
        )}
      </section>
    </div>
    </>
  );
}
