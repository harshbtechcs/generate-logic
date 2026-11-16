import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getPlaylist } from "@/lib/youtube";
import { getSyncedPlaylist } from "@/lib/sync";
import { getSession } from "@/lib/session";
import { getCompletedLessonIds, isPlaylistSaved, recordPlaylistOpened } from "@/lib/learning";
import { PlaylistPlayer } from "@/components/playlist/PlaylistPlayer";

// Shows each signed-in user their own progress, so it can't be cached per page.
// (YouTube API responses are still cached for an hour underneath.)
export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

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

export default async function PlaylistPage({ params, searchParams }: Props) {
  const { id } = await params;
  const sp = await searchParams;

  const [data, session] = await Promise.all([getSyncedPlaylist(id), getSession()]);
  if (!data) notFound();
  const { playlist, lessons, dbId } = data;

  const userId = session?.user.id;
  let completedIds: string[] = [];
  let saved = false;
  if (userId) {
    [completedIds, saved] = await Promise.all([
      getCompletedLessonIds(userId, lessons.map((l) => l.id)),
      isPlaylistSaved(userId, dbId),
    ]);
    await recordPlaylistOpened(userId, dbId);
  }

  // ?lesson=N opens lesson N; otherwise resume at the first unfinished lesson.
  const requested = Number(typeof sp.lesson === "string" ? sp.lesson : NaN);
  const firstOpen = lessons.findIndex((l) => !completedIds.includes(l.id));
  const startIndex =
    Number.isInteger(requested) && requested >= 1 && requested <= lessons.length
      ? requested - 1
      : firstOpen === -1
        ? 0
        : firstOpen;

  return (
    <div className="mx-auto max-w-site px-5 pb-28 pt-10 sm:px-8">
      <Link href="/playlists" className="mb-6 inline-flex items-center gap-2 text-sm text-text-muted hover:text-brand-teal">
        <ArrowLeft size={16} aria-hidden="true" /> All playlists
      </Link>
      <PlaylistPlayer
        youtubePlaylistId={playlist.id}
        playlistDbId={dbId}
        title={playlist.title}
        category={playlist.technology?.name ?? "Cloud & DevOps"}
        lessons={lessons}
        initialCompleted={completedIds}
        initialSaved={saved}
        signedIn={!!userId}
        startIndex={startIndex}
      />
      {playlist.description && (
        <section className="mt-12 max-w-3xl">
          <h2 className="mb-3 font-display text-xl font-semibold">About this playlist</h2>
          <p className="whitespace-pre-line leading-relaxed text-text-muted">{playlist.description}</p>
        </section>
      )}
    </div>
  );
}
