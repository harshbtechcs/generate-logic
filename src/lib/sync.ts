import "server-only";
import { Prisma } from "@prisma/client";
import { db } from "./db";
import type { Technology } from "./data";
import { getChannelPlaylists, getPlaylist, type Playlist, type PlaylistVideo } from "./youtube";

/**
 * Copies YouTube playlists and their videos into our own database
 * (Playlist + Lesson rows), so progress, bookmarks and notes can point at them.
 * YouTube stays the source of truth for titles / thumbnails / order.
 */

const STALE_MS = 60 * 60 * 1000; // re-sync a playlist at most once an hour

/** One Category + one LearningPath per technology, created on first use. */
async function ensureLearningPath(tech: Technology) {
  const category = await db.category.upsert({
    where: { slug: tech.slug },
    update: {},
    create: { slug: tech.slug, name: tech.name, description: tech.tag },
  });
  const existing = await db.learningPath.findFirst({ where: { categoryId: category.id }, orderBy: { createdAt: "asc" } });
  if (existing) return existing;
  return db.learningPath.create({
    data: { categoryId: category.id, title: `${tech.name} Learning Path`, description: `Learn ${tech.name} step by step.` },
  });
}

async function writePlaylist(p: Playlist, videos: PlaylistVideo[]) {
  const path = p.technology ? await ensureLearningPath(p.technology) : null;

  const existing = await db.playlist.findUnique({ where: { youtubePlaylistId: p.id }, select: { learningPathId: true } });
  const playlist = await db.playlist.upsert({
    where: { youtubePlaylistId: p.id },
    create: {
      youtubePlaylistId: p.id,
      title: p.title,
      description: p.description,
      thumbnail: p.thumbnail,
      videoCount: p.videoCount,
      publishedAt: new Date(p.publishedAt),
      learningPathId: path?.id ?? null,
      syncedAt: new Date(),
    },
    update: {
      title: p.title,
      description: p.description,
      thumbnail: p.thumbnail,
      videoCount: p.videoCount,
      publishedAt: new Date(p.publishedAt),
      // keep an admin's manual choice; only fill it in when empty
      ...(existing?.learningPathId ? {} : { learningPathId: path?.id ?? null }),
      syncedAt: new Date(),
    },
  });

  // Lessons: insert new videos, update titles/order of existing ones.
  // Videos removed from YouTube are kept so students' progress history survives.
  for (const [i, v] of videos.entries()) {
    await db.lesson.upsert({
      where: { playlistId_youtubeVideoId: { playlistId: playlist.id, youtubeVideoId: v.id } },
      create: {
        playlistId: playlist.id,
        youtubeVideoId: v.id,
        title: v.title,
        description: v.description.slice(0, 5000),
        sequenceNumber: i + 1,
      },
      update: { title: v.title, description: v.description.slice(0, 5000), sequenceNumber: i + 1 },
    });
  }
  return playlist;
}

export type SyncedLesson = { id: string; videoId: string; title: string; thumbnail: string | null; sequence: number };

/**
 * Makes sure the playlist and its lessons exist in the database (re-syncing if stale)
 * and returns our DB ids alongside the YouTube data. Returns null if the playlist
 * is not on the channel or an admin has hidden it.
 */
export async function getSyncedPlaylist(youtubePlaylistId: string) {
  const yt = await getPlaylist(youtubePlaylistId);
  if (!yt) return null;

  let row = await db.playlist.findUnique({
    where: { youtubePlaylistId },
    include: { lessons: { select: { id: true, youtubeVideoId: true } } },
  });

  const stale =
    !row ||
    !row.syncedAt ||
    Date.now() - row.syncedAt.getTime() > STALE_MS ||
    yt.videos.some((v) => !row!.lessons.some((l) => l.youtubeVideoId === v.id));

  if (stale && yt.videos.length > 0) {
    try {
      await writePlaylist(yt.playlist, yt.videos);
    } catch (err) {
      // Two visitors syncing at the same moment can collide on a unique key — the other one won, fine.
      if (!(err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002")) throw err;
    }
    row = await db.playlist.findUnique({
      where: { youtubePlaylistId },
      include: { lessons: { select: { id: true, youtubeVideoId: true } } },
    });
  }
  if (!row || row.status === "HIDDEN") return null;

  const idByVideo = new Map(row.lessons.map((l) => [l.youtubeVideoId, l.id]));
  const lessons: SyncedLesson[] = yt.videos.flatMap((v, i) => {
    const id = idByVideo.get(v.id);
    return id ? [{ id, videoId: v.id, title: v.title, thumbnail: v.thumbnail, sequence: i + 1 }] : [];
  });

  return { dbId: row.id, learningPathId: row.learningPathId, playlist: yt.playlist, lessons };
}

/**
 * Sync every public playlist on the channel (used by "Sync YouTube now" and /api/youtube/refresh).
 * Bypasses the hourly cache so a playlist published a minute ago is picked up. Returns how many were synced.
 */
export async function syncAllPlaylists() {
  const playlists = await getChannelPlaylists({ fresh: true });
  let synced = 0;
  for (const p of playlists) {
    const data = await getPlaylist(p.id, { fresh: true });
    if (data && data.videos.length > 0) {
      await writePlaylist(data.playlist, data.videos);
      synced++;
    }
  }
  return synced;
}
