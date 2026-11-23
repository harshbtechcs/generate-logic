import "server-only";
import { db } from "./db";

/** Consecutive days (ending today or yesterday) on which the user completed a lesson. */
function streakFrom(days: Date[]) {
  const keys = new Set(days.map((d) => d.toISOString().slice(0, 10)));
  const day = new Date();
  // A streak is still alive if the last lesson was yesterday.
  if (!keys.has(day.toISOString().slice(0, 10))) day.setUTCDate(day.getUTCDate() - 1);
  let streak = 0;
  while (keys.has(day.toISOString().slice(0, 10))) {
    streak++;
    day.setUTCDate(day.getUTCDate() - 1);
  }
  return streak;
}

/**
 * Dashboard numbers for ONE user. Every query is filtered by userId, so a user
 * can only ever see their own data (data-isolation requirement).
 */
export async function getUserStats(userId: string) {
  const since = new Date(Date.now() - 400 * 24 * 60 * 60 * 1000);

  const [enrollments, completed, savedPlaylists, bookmarkedNotes, recentDays, enrolledLessonTotal] = await Promise.all([
    db.userEnrollment.count({ where: { userId } }),
    db.userProgress.count({ where: { userId, completionStatus: "COMPLETED" } }),
    db.userBookmark.count({ where: { userId, resourceType: "PLAYLIST" } }),
    db.userBookmark.count({ where: { userId, resourceType: "NOTE" } }),
    db.userProgress.findMany({
      where: { userId, completionStatus: "COMPLETED", completedAt: { gte: since } },
      select: { completedAt: true },
    }),
    db.lesson.count({
      where: { playlist: { learningPath: { enrollments: { some: { userId } } } } },
    }),
  ]);

  const streak = streakFrom(recentDays.flatMap((r) => (r.completedAt ? [r.completedAt] : [])));
  const progress = enrolledLessonTotal > 0 ? Math.round((completed / enrolledLessonTotal) * 100) : 0;

  return { enrollments, completed, savedPlaylists, bookmarkedNotes, streak, progress };
}

export async function getAdminStats() {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const [totalUsers, activeUsers, verifiedUsers, admins, learningPaths, notes, lessons, completions, quizzes, recent] = await Promise.all([
    db.user.count(),
    db.user.count({ where: { sessions: { some: { updatedAt: { gte: thirtyDaysAgo } } } } }),
    db.user.count({ where: { emailVerified: true } }),
    db.user.count({ where: { role: "ADMIN" } }),
    db.learningPath.count(),
    db.note.count(),
    db.lesson.count(),
    db.userProgress.count({ where: { completionStatus: "COMPLETED" } }),
    db.quizAttempt.count(),
    db.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        emailVerified: true,
        accountStatus: true,
        createdAt: true,
        accounts: { select: { providerId: true } },
      },
    }),
  ]);
  return { totalUsers, activeUsers, verifiedUsers, admins, learningPaths, notes, lessons, completions, quizzes, recent };
}
