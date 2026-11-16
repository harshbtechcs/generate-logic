import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getPlaylist } from "@/lib/youtube";
import { PlaylistPlayer } from "@/components/playlist/PlaylistPlayer";

export const revalidate = 3600;

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const data = await getPlaylist(id);
  if (!data) return { title: "Playlist not found" };
  return {
    title: data.playlist.title,
    description: data.playlist.description.slice(0, 160) || `Watch ${data.playlist.title} on Generate Logic.`,
    openGraph: data.playlist.thumbnail ? { images: [data.playlist.thumbnail] } : undefined,
  };
}

export default async function PlaylistPage({ params }: Props) {
  const { id } = await params;
  const data = await getPlaylist(id);
  if (!data) notFound();
  const { playlist, videos } = data;

  return (
    <div className="mx-auto max-w-site px-5 pb-28 pt-10 sm:px-8">
      <Link href="/playlists" className="mb-6 inline-flex items-center gap-2 text-sm text-text-muted hover:text-brand-teal">
        <ArrowLeft size={16} aria-hidden="true" /> All playlists
      </Link>
      <div className="mb-8 flex flex-col gap-2">
        <span className="kicker">{playlist.technology?.name.toUpperCase() ?? "CLOUD & DEVOPS"}</span>
        <h1 className="font-display text-[34px] font-bold leading-tight sm:text-[44px]">{playlist.title}</h1>
        <p className="font-mono text-sm text-text-faint">{playlist.videoCount} videos</p>
      </div>
      <PlaylistPlayer playlistId={playlist.id} videos={videos} />
      {playlist.description && (
        <section className="mt-12 max-w-3xl">
          <h2 className="mb-3 font-display text-xl font-semibold">About this playlist</h2>
          <p className="whitespace-pre-line leading-relaxed text-text-muted">{playlist.description}</p>
        </section>
      )}
    </div>
  );
}
