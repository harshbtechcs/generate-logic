"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { getSession } from "@/lib/session";
import { syncAllPlaylists } from "@/lib/sync";

/*
 * Server actions run on the server only. The user id ALWAYS comes from the
 * session cookie — never from the browser — so nobody can change someone
 * else's progress or bookmarks (ownership check on every protected operation).
 */

const id = z.string().min(1).max(64);

type Result = { ok: true } | { ok: false; error: string };

async function currentUserId() {
  const session = await getSession();
  return session?.user.id ?? null;
}

/** Mark a lesson complete (or not). Also enrolls the user in that learning path. */
export async function setLessonComplete(lessonId: string, completed: boolean): Promise<Result> {
  const userId = await currentUserId();
  if (!userId) return { ok: false, error: "Please sign in to track progress." };
  if (!id.safeParse(lessonId).success) return { ok: false, error: "Invalid lesson." };

  const lesson = await db.lesson.findUnique({
    where: { id: lessonId },
    select: { id: true, playlist: { select: { learningPathId: true, status: true } } },
  });
  if (!lesson || lesson.playlist.status === "HIDDEN") return { ok: false, error: "Lesson not found." };

  await db.$transaction(async (tx) => {
    await tx.userProgress.upsert({
      where: { userId_lessonId: { userId, lessonId } },
      create: { userId, lessonId, completionStatus: completed ? "COMPLETED" : "IN_PROGRESS", completedAt: completed ? new Date() : null },
      update: { completionStatus: completed ? "COMPLETED" : "IN_PROGRESS", completedAt: completed ? new Date() : null },
    });
    if (completed) {
      await tx.userActivity.create({ data: { userId, activityType: "COMPLETED_LESSON", resourceId: lessonId } });
      if (lesson.playlist.learningPathId) {
        await tx.userEnrollment.upsert({
          where: { userId_learningPathId: { userId, learningPathId: lesson.playlist.learningPathId } },
          create: { userId, learningPathId: lesson.playlist.learningPathId },
          update: {},
        });
      }
    }
  });

  revalidatePath("/dashboard");
  return { ok: true };
}

/** Save / unsave a playlist to "My Playlists". */
export async function setPlaylistSaved(playlistId: string, saved: boolean): Promise<Result> {
  const userId = await currentUserId();
  if (!userId) return { ok: false, error: "Please sign in to save playlists." };
  if (!id.safeParse(playlistId).success) return { ok: false, error: "Invalid playlist." };

  const exists = await db.playlist.count({ where: { id: playlistId, status: "PUBLISHED" } });
  if (!exists) return { ok: false, error: "Playlist not found." };

  const key = { userId_resourceType_resourceId: { userId, resourceType: "PLAYLIST" as const, resourceId: playlistId } };
  if (saved) {
    await db.userBookmark.upsert({
      where: key,
      create: { userId, resourceType: "PLAYLIST", resourceId: playlistId },
      update: {},
    });
  } else {
    await db.userBookmark.deleteMany({ where: { userId, resourceType: "PLAYLIST", resourceId: playlistId } });
  }

  revalidatePath("/dashboard");
  return { ok: true };
}

/** Admin only: pull every playlist + lesson from YouTube into the database right now. */
type SyncResult = { ok: true; found: number; synced: number; failed: string[] } | { ok: false; error: string };

export async function syncYouTubeNow(): Promise<SyncResult> {
  const session = await getSession();
  if (!session || session.user.role !== "ADMIN") return { ok: false, error: "Not allowed." };

  try {
    const { found, synced, failed } = await syncAllPlaylists();
    await db.auditLog.create({
      data: { actorUserId: session.user.id, action: "YOUTUBE_SYNC", resourceType: "PLAYLIST", resourceId: null },
    });
    revalidateTag("youtube"); // pages re-fetch the playlist list instead of using the hourly cache
    revalidatePath("/", "layout");
    return { ok: true, found, synced, failed };
  } catch (err) {
    const message = (err as Error).message;
    console.error("[sync] failed:", message);
    // Admin-only screen: show the real reason (never contains the API key).
    return { ok: false, error: `Sync failed: ${message}` };
  }
}
