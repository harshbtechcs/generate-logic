import Link from "next/link";
import { RefreshCw } from "lucide-react";
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
          <div className="flex items-center gap-2.5 rounded-xl border border-green-400/30 bg-green-400/5 px-4 py-2.5 text-sm text-green-200">
            <RefreshCw size={18} aria-hidden="true" />
            New YouTube playlists appear here automatically
          </div>
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
