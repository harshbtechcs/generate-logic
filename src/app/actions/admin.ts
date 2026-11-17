"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { getSession } from "@/lib/session";

/*
 * Admin-only actions. Every action re-checks on the server that the caller is
 * an admin (never trust the browser) and writes an audit-log entry.
 */

type Result = { ok: true } | { ok: false; error: string };
const id = z.string().min(1).max(64);

async function currentAdmin() {
  const session = await getSession();
  if (!session || session.user.role !== "ADMIN") return null;
  return session.user;
}

async function audit(actorUserId: string, action: string, resourceType: string, resourceId: string) {
  await db.auditLog.create({ data: { actorUserId, action, resourceType, resourceId } });
}

/** Disable (restrict) or re-enable a user's account. Disabling signs them out everywhere. */
export async function setUserDisabled(userId: string, disabled: boolean): Promise<Result> {
  const admin = await currentAdmin();
  if (!admin) return { ok: false, error: "Not allowed." };
  if (!id.safeParse(userId).success) return { ok: false, error: "Invalid user." };
  if (userId === admin.id) return { ok: false, error: "You can't restrict your own account." };

  const target = await db.user.findUnique({ where: { id: userId }, select: { role: true } });
  if (!target) return { ok: false, error: "User not found." };
  if (target.role === "ADMIN") return { ok: false, error: "Admin accounts can't be restricted here." };

  await db.$transaction([
    db.user.update({ where: { id: userId }, data: { accountStatus: disabled ? "DISABLED" : "ACTIVE" } }),
    // Deleting sessions logs the user out immediately on every device.
    ...(disabled ? [db.session.deleteMany({ where: { userId } })] : []),
  ]);
  await audit(admin.id, disabled ? "USER_DISABLED" : "USER_ENABLED", "USER", userId);

  revalidatePath("/admin", "layout");
  return { ok: true };
}

/** Undo a lesson the user marked complete (e.g. they asked for it). */
export async function undoLessonCompletion(userId: string, lessonId: string): Promise<Result> {
  const admin = await currentAdmin();
  if (!admin) return { ok: false, error: "Not allowed." };
  if (!id.safeParse(userId).success || !id.safeParse(lessonId).success) return { ok: false, error: "Invalid request." };

  const { count } = await db.userProgress.deleteMany({ where: { userId, lessonId } });
  if (count === 0) return { ok: false, error: "Nothing to undo — this lesson isn't marked complete." };
  // Remove the matching "completed" history entries so the user's activity feed stays accurate.
  await db.userActivity.deleteMany({ where: { userId, activityType: "COMPLETED_LESSON", resourceId: lessonId } });
  await audit(admin.id, "LESSON_COMPLETION_UNDONE", "USER_PROGRESS", `${userId}:${lessonId}`);

  revalidatePath("/admin", "layout");
  return { ok: true };
}

/** Undo every completed lesson of one playlist for a user. */
export async function resetPlaylistProgress(userId: string, playlistId: string): Promise<Result> {
  const admin = await currentAdmin();
  if (!admin) return { ok: false, error: "Not allowed." };
  if (!id.safeParse(userId).success || !id.safeParse(playlistId).success) return { ok: false, error: "Invalid request." };

  const lessons = await db.lesson.findMany({ where: { playlistId }, select: { id: true } });
  const lessonIds = lessons.map((l) => l.id);
  await db.$transaction([
    db.userProgress.deleteMany({ where: { userId, lessonId: { in: lessonIds } } }),
    db.userActivity.deleteMany({ where: { userId, activityType: "COMPLETED_LESSON", resourceId: { in: lessonIds } } }),
  ]);
  await audit(admin.id, "PLAYLIST_PROGRESS_RESET", "PLAYLIST", `${userId}:${playlistId}`);

  revalidatePath("/admin", "layout");
  return { ok: true };
}
