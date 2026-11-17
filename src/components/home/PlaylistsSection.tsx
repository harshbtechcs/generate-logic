import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Playlist } from "@/lib/youtube";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { PlaylistCard, PlaylistPlaceholder } from "./PlaylistCard";

const placeholders = [
  { name: "Docker", short: "Dk", toneKey: "cyan" as const },
  { name: "Kubernetes", short: "K8s", toneKey: "blue" as const },
  { name: "Terraform", short: "TF", toneKey: "green" as const },
];

export function PlaylistsSection({ playlists }: { playlists: Playlist[] }) {
  const featured = playlists.slice(0, 6);
  return (
    <section id="playlists" className="relative mx-auto max-w-site scroll-mt-24 px-5 py-24 sm:px-8">
      <SectionHeading
        kicker="03 / PLAYLISTS"
        title="Fresh from the channel"
        aside={
          <Link
            href="/playlists"
            className="gl-btn inline-flex items-center gap-2 rounded-xl border border-brand-teal/40 bg-brand-teal/10 px-5 py-3 text-sm font-medium text-teal-100"
          >
            View all playlists <ArrowRight size={17} aria-hidden="true" />
          </Link>
        }
      />
      <div className="grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-5">
        {featured.length > 0
          ? featured.map((p, i) => (
              <Reveal key={p.id} delay={(i % 3) * 0.1}>
                <PlaylistCard playlist={p} />
              </Reveal>
            ))
          : placeholders.map((p, i) => (
              <Reveal key={p.name} delay={i * 0.1}>
                <PlaylistPlaceholder {...p} />
              </Reveal>
            ))}
      </div>
      {playlists.length > featured.length && (
        <Reveal className="mt-10 flex justify-center">
          <Link href="/playlists" className="gl-btn rounded-xl border border-slate-400/30 px-6 py-3.5 font-medium">
            View all {playlists.length} playlists
          </Link>
        </Reveal>
      )}
    </section>
  );
}
