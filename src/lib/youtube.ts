import "server-only";
import { matchTechnology, type Technology } from "./data";

/**
 * YouTube auto-sync.
 *
 * Playlists are read straight from the channel through the YouTube Data API v3.
 * Results are cached by Next.js and refreshed every hour, so a playlist made
 * public on YouTube shows up on the site within an hour with no manual step.
 * The API key never leaves the server.
 */

const API = "https://www.googleapis.com/youtube/v3";
export const SYNC_INTERVAL_SECONDS = 60 * 60; // 1 hour

export type Playlist = {
  id: string;
  title: string;
  description: string;
  thumbnail: string | null;
  videoCount: number;
  publishedAt: string;
  technology?: Technology;
};

export type PlaylistVideo = {
  id: string;
  title: string;
  description: string;
  thumbnail: string | null;
  position: number;
  publishedAt: string;
};

type Thumbs = Record<string, { url: string; width?: number; height?: number } | undefined>;

function bestThumb(t?: Thumbs): string | null {
  if (!t) return null;
  return (t.maxres ?? t.standard ?? t.high ?? t.medium ?? t.default)?.url ?? null;
}

function config() {
  const key = process.env.YOUTUBE_API_KEY;
  const channelId = process.env.YOUTUBE_CHANNEL_ID;
  return key && channelId ? { key, channelId } : null;
}

export function isYouTubeConfigured() {
  return config() !== null;
}

/** fresh: true skips the hourly cache — used by "Sync YouTube now" so new playlists show immediately. */
type FetchOpts = { fresh?: boolean };

async function yt<T>(path: string, params: Record<string, string>, opts: FetchOpts = {}): Promise<T> {
  const cfg = config();
  if (!cfg) throw new Error("YouTube API is not configured");
  const qs = new URLSearchParams({ ...params, key: cfg.key });
  const res = await fetch(
    `${API}/${path}?${qs}`,
    opts.fresh ? { cache: "no-store" } : { next: { revalidate: SYNC_INTERVAL_SECONDS, tags: ["youtube"] } },
  );
  if (!res.ok) {
    // Do not log the URL: it contains the API key.
    throw new Error(`YouTube API ${path} failed with status ${res.status}`);
  }
  return res.json() as Promise<T>;
}

type PlaylistsResponse = {
  nextPageToken?: string;
  items: {
    id: string;
    snippet: { title: string; description: string; publishedAt: string; channelId?: string; thumbnails?: Thumbs };
    contentDetails: { itemCount: number };
    status?: { privacyStatus: string };
  }[];
};

/** All public playlists on the channel, newest first. Returns [] if not configured or on error. */
export async function getChannelPlaylists(opts: FetchOpts = {}): Promise<Playlist[]> {
  const cfg = config();
  if (!cfg) return [];
  try {
    const out: Playlist[] = [];
    let pageToken: string | undefined;
    do {
      const data: PlaylistsResponse = await yt<PlaylistsResponse>(
        "playlists",
        {
          part: "snippet,contentDetails,status",
          channelId: cfg.channelId,
          maxResults: "50",
          ...(pageToken ? { pageToken } : {}),
        },
        opts,
      );
      for (const p of data.items) {
        if (p.status && p.status.privacyStatus !== "public") continue;
        if (p.contentDetails.itemCount === 0) continue;
        out.push({
          id: p.id,
          title: p.snippet.title,
          description: p.snippet.description,
          thumbnail: bestThumb(p.snippet.thumbnails),
          videoCount: p.contentDetails.itemCount,
          publishedAt: p.snippet.publishedAt,
          technology: matchTechnology(`${p.snippet.title} ${p.snippet.description}`),
        });
      }
      pageToken = data.nextPageToken;
    } while (pageToken);
    return out.sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
  } catch (err) {
    console.error("[youtube] playlist sync failed:", (err as Error).message);
    return [];
  }
}

type PlaylistItemsResponse = {
  nextPageToken?: string;
  items: {
    snippet: {
      title: string;
      description: string;
      publishedAt: string;
      position: number;
      thumbnails?: Thumbs;
      resourceId: { videoId: string };
    };
    contentDetails?: { videoPublishedAt?: string };
    status?: { privacyStatus: string };
  }[];
};

/** One playlist with its videos in order, or null if it does not exist / is not on this channel. */
export async function getPlaylist(
  playlistId: string,
  opts: FetchOpts = {},
): Promise<{ playlist: Playlist; videos: PlaylistVideo[] } | null> {
  if (!/^[A-Za-z0-9_-]{10,64}$/.test(playlistId)) return null;
  const cfg = config();
  if (!cfg) return null;

  // Look this one playlist up directly (its own cache entry) instead of searching the
  // channel-wide list, which may be up to an hour old and miss a just-published playlist.
  let playlist: Playlist;
  try {
    const found = await yt<PlaylistsResponse>("playlists", { part: "snippet,contentDetails,status", id: playlistId }, opts);
    const p = found.items[0];
    if (!p) return null;
    if (p.snippet.channelId && p.snippet.channelId !== cfg.channelId) return null; // not our channel
    if (p.status && p.status.privacyStatus !== "public") return null;
    playlist = {
      id: p.id,
      title: p.snippet.title,
      description: p.snippet.description,
      thumbnail: bestThumb(p.snippet.thumbnails),
      videoCount: p.contentDetails.itemCount,
      publishedAt: p.snippet.publishedAt,
      technology: matchTechnology(`${p.snippet.title} ${p.snippet.description}`),
    };
  } catch (err) {
    console.error("[youtube] playlist lookup failed:", (err as Error).message);
    return null;
  }

  try {
    const videos: PlaylistVideo[] = [];
    let pageToken: string | undefined;
    do {
      const data: PlaylistItemsResponse = await yt<PlaylistItemsResponse>(
        "playlistItems",
        {
          part: "snippet,contentDetails,status",
          playlistId,
          maxResults: "50",
          ...(pageToken ? { pageToken } : {}),
        },
        opts,
      );
      for (const it of data.items) {
        if (it.status && it.status.privacyStatus !== "public") continue;
        videos.push({
          id: it.snippet.resourceId.videoId,
          title: it.snippet.title,
          description: it.snippet.description,
          thumbnail: bestThumb(it.snippet.thumbnails),
          position: it.snippet.position,
          // When the video itself went public (not when it was added to the playlist)
          publishedAt: it.contentDetails?.videoPublishedAt ?? it.snippet.publishedAt,
        });
      }
      pageToken = data.nextPageToken;
    } while (pageToken);
    // Course order: oldest video first, newest at the bottom — whatever order the
    // YouTube playlist uses (it may add new videos to the top). Ties keep playlist order.
    videos.sort((a, b) => a.publishedAt.localeCompare(b.publishedAt) || a.position - b.position);
    return { playlist, videos };
  } catch (err) {
    console.error("[youtube] playlist items failed:", (err as Error).message);
    return { playlist, videos: [] };
  }
}
