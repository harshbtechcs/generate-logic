import "server-only";
import { db } from "./db";

/** Which of these lessons the user has completed (only this user's rows are read). */
export async function getCompletedLessonIds(userId: string, lessonIds: string[]) {
  if (lessonIds.length === 0) return [];
  const rows = await db.userProgress.findMany({
    where: { userId, lessonId: { in: lessonIds }, completionStatus: "COMPLETED" },
    select: { lessonId: true },
  });
  return rows.map((r) => r.lessonId);
}

export async function isPlaylistSaved(userId: string, playlistDbId: string) {
  const n = await db.userBookmark.count({ where: { userId, resourceType: "PLAYLIST", resourceId: playlistDbId } });
  return n > 0;
}

/** Log "opened playlist" at most once per day per playlist (feeds learning history). */
export async function recordPlaylistOpened(userId: string, playlistDbId: string) {
  const startOfDay = new Date();
  startOfDay.setUTCHours(0, 0, 0, 0);
  const already = await db.userActivity.count({
    where: { userId, activityType: "OPENED_PLAYLIST", resourceId: playlistDbId, createdAt: { gte: startOfDay } },
  });
  if (!already) {
    await db.userActivity.create({ data: { userId, activityType: "OPENED_PLAYLIST", resourceId: playlistDbId } });
  }
}

export type CourseProgress = {
  playlistId: string; // DB id
  youtubePlaylistId: string;
  title: string;
  thumbnail: string | null;
  total: number;
  completed: number;
  percent: number;
  nextLesson: number; // 1-based index to resume from
};

/** Playlists the user has started or saved, with progress — for "Continue learning" / "My Playlists". */
export async function getUserCourses(userId: string) {
  const saved = await db.userBookmark.findMany({
    where: { userId, resourceType: "PLAYLIST" },
    select: { resourceId: true },
  });
  const savedIds = new Set(saved.map((s) => s.resourceId));

  const playlists = await db.playlist.findMany({
    where: {
      status: "PUBLISHED",
      OR: [{ id: { in: [...savedIds] } }, { lessons: { some: { progress: { some: { userId } } } } }],
    },
    select: {
      id: true,
      youtubePlaylistId: true,
      title: true,
      thumbnail: true,
      lessons: {
        orderBy: { sequenceNumber: "asc" },
        select: { sequenceNumber: true, progress: { where: { userId }, select: { completionStatus: true, updatedAt: true } } },
      },
    },
  });

  const courses = playlists.map((p) => {
    const done = p.lessons.map((l) => l.progress[0]?.completionStatus === "COMPLETED");
    const completed = done.filter(Boolean).length;
    const firstOpen = done.findIndex((d) => !d);
    const lastTouched = Math.max(0, ...p.lessons.flatMap((l) => l.progress.map((x) => x.updatedAt.getTime())));
    const course: CourseProgress & { saved: boolean; lastTouched: number } = {
      playlistId: p.id,
      youtubePlaylistId: p.youtubePlaylistId,
      title: p.title,
      thumbnail: p.thumbnail,
      total: p.lessons.length,
      completed,
      percent: p.lessons.length ? Math.round((completed / p.lessons.length) * 100) : 0,
      nextLesson: firstOpen === -1 ? 1 : firstOpen + 1,
      saved: savedIds.has(p.id),
      lastTouched,
    };
    return course;
  });

  const inProgress = courses
    .filter((c) => c.completed > 0 && c.completed < c.total)
    .sort((a, b) => b.lastTouched - a.lastTouched);
  const finished = courses.filter((c) => c.total > 0 && c.completed === c.total);
  const savedList = courses.filter((c) => c.saved);

  return { inProgress, finished, saved: savedList };
}

export type ActivityItem = { id: string; type: string; label: string; href: string | null; at: Date };

/** Most recent learning activity, with readable titles. */
export async function getRecentActivity(userId: string, take = 8): Promise<ActivityItem[]> {
  const rows = await db.userActivity.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, take });
  const lessonIds = rows.filter((r) => r.activityType === "COMPLETED_LESSON").map((r) => r.resourceId);
  const playlistIds = rows.filter((r) => r.activityType === "OPENED_PLAYLIST").map((r) => r.resourceId);

  const [lessons, playlists] = await Promise.all([
    db.lesson.findMany({
      where: { id: { in: lessonIds } },
      select: { id: true, title: true, sequenceNumber: true, playlist: { select: { youtubePlaylistId: true } } },
    }),
    db.playlist.findMany({ where: { id: { in: playlistIds } }, select: { id: true, title: true, youtubePlaylistId: true } }),
  ]);
  const lessonMap = new Map(lessons.map((l) => [l.id, l]));
  const playlistMap = new Map(playlists.map((p) => [p.id, p]));

  return rows.flatMap((r) => {
    if (r.activityType === "COMPLETED_LESSON") {
      const l = lessonMap.get(r.resourceId);
      return l
        ? [{ id: r.id, type: "Completed", label: l.title, href: `/playlists/${l.playlist.youtubePlaylistId}?lesson=${l.sequenceNumber}`, at: r.createdAt }]
        : [];
    }
    if (r.activityType === "OPENED_PLAYLIST") {
      const p = playlistMap.get(r.resourceId);
      return p ? [{ id: r.id, type: "Opened", label: p.title, href: `/playlists/${p.youtubePlaylistId}`, at: r.createdAt }] : [];
    }
    return [];
  });
}
