import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { dockerModules, levelStyles, technologies, techBySlug } from "@/lib/data";
import { getChannelPlaylists } from "@/lib/youtube";
import { Reveal } from "@/components/ui/Reveal";
import { TechBadge } from "@/components/ui/TechBadge";
import { PlaylistCard } from "@/components/home/PlaylistCard";

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

  return (
    <div className="mx-auto max-w-site px-5 pb-28 pt-10 sm:px-8">
      <Link href="/#paths" className="mb-8 inline-flex items-center gap-2 text-sm text-text-muted hover:text-brand-teal">
        <ArrowLeft size={16} aria-hidden="true" /> All technologies
      </Link>

      <Reveal className="mb-14 flex flex-wrap items-center gap-6">
        <TechBadge tech={tech} size={84} />
        <div className="flex flex-col gap-2">
          <span className="kicker">LEARNING PATH · {tech.tag.toUpperCase()}</span>
          <h1 className="font-display text-[40px] font-bold leading-tight sm:text-[52px]">{tech.name}</h1>
        </div>
      </Reveal>

      <section className="mb-16">
        <Reveal as="h2" variant="blur" className="mb-6 font-display text-2xl font-semibold">
          Roadmap
        </Reveal>
        {roadmap ? (
          <ol className="overflow-hidden rounded-[20px] border border-slate-400/20 bg-ink-900/70 py-2.5">
            {roadmap.map((m, i) => (
              <Reveal as="li" key={m.title} variant="right" delay={i * 0.04} className="flex items-center gap-4 px-[22px] py-3">
                <span className="w-[30px] font-mono text-[13px] text-slate-500">{String(i + 1).padStart(2, "0")}</span>
                <span className="flex-1 text-[15px] text-slate-200">{m.title}</span>
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
        <Reveal as="h2" variant="blur" className="mb-6 font-display text-2xl font-semibold">
          {tech.name} playlists
        </Reveal>
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
  );
}
