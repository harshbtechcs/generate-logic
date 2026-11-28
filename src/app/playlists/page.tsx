import type { Metadata } from "next";
import { getChannelPlaylists } from "@/lib/youtube";
import { PageHeader } from "@/components/ui/PageHeader";
import { Reveal } from "@/components/ui/Reveal";
import { PlaylistCard } from "@/components/home/PlaylistCard";
import { site } from "@/lib/site";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Playlists",
  description: "Every Generate Logic playlist, synced automatically from YouTube.",
};

export default async function PlaylistsPage() {
  const playlists = await getChannelPlaylists();
  return (
    <>
      <PageHeader
        kicker="PLAYLISTS" word="PLAY"
        title="All playlists"
        intro="Synced automatically from the Generate Logic YouTube channel. Pick a playlist and watch it right here."
      />
      <section className="mx-auto max-w-site px-5 pb-28 sm:px-8">
        {playlists.length > 0 ? (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-5">
            {playlists.map((p, i) => (
              <Reveal key={p.id} delay={(i % 3) * 0.1}>
                <PlaylistCard playlist={p} />
              </Reveal>
            ))}
          </div>
        ) : (
          <Reveal className="rounded-[22px] border border-dashed border-slate-400/30 p-10 text-center">
            <h2 className="font-display text-2xl font-semibold">Playlists are on the way</h2>
            <p className="mx-auto mt-3 max-w-md text-text-muted">
              New playlists show up here automatically once they are published on YouTube.
            </p>
            <a
              href={site.youtube}
              target="_blank"
              rel="noopener noreferrer"
              className="gl-btn mt-6 inline-block rounded-xl bg-brand-teal px-6 py-3.5 font-semibold text-ink-900"
            >
              Subscribe on YouTube
            </a>
          </Reveal>
        )}
      </section>
    </>
  );
}
