import "server-only";
import { db } from "@/lib/db";
import { QUESTION_BY_ID } from "@/lib/quiz/bank";
import { techBySlug } from "@/lib/data";
import { TRACKS } from "@/lib/terminal/missions";

/*
 * Admin-only activity feed: everything learners do, newest first.
 * Only call this from pages protected by requireAdmin().
 */

export type EventKind = "signup" | "signin" | "quiz" | "daily" | "mission" | "lesson" | "opened";

export type ActivityEvent = {
  id: string;
  kind: EventKind;
  at: Date;
  user: { id: string; name: string; email: string };
  title: string;
  detail?: string;
  tone?: "good" | "bad" | "neutral";
  href?: string;
};

export const EVENT_LABELS: Record<EventKind, string> = {
  signup: "Signed up",
  signin: "Signed in",
  quiz: "Quiz",
  daily: "Daily challenge",
  mission: "Terminal mission",
  lesson: "Lesson completed",
  opened: "Opened playlist",
};

const MISSION_TITLE = new Map(TRACKS.flatMap((t) => t.missions.map((m) => [m.id, `${t.name}: ${m.title}`] as const)));
const toolName = (slug: string) => (slug === "mix" ? "DevOps Mix" : techBySlug[slug]?.name ?? slug);

function device(ua: string | null) {
  if (!ua) return undefined;
  const os = /Android/i.test(ua) ? "Android" : /iPhone|iPad/i.test(ua) ? "iOS" : /Windows/i.test(ua) ? "Windows" : /Mac OS/i.test(ua) ? "macOS" : /Linux/i.test(ua) ? "Linux" : "Other";
  const browser = /Edg\//.test(ua) ? "Edge" : /Chrome\//.test(ua) ? "Chrome" : /Firefox\//.test(ua) ? "Firefox" : /Safari\//.test(ua) ? "Safari" : "Browser";
  return `${browser} on ${os}`;
}

const userSel = { select: { id: true, fullName: true, email: true } } as const;
const u = (x: { id: string; fullName: string; email: string }) => ({ id: x.id, name: x.fullName, email: x.email });

export async function getActivityFeed(opts: { userId?: string; kinds?: EventKind[]; before?: Date; limit?: number } = {}): Promise<ActivityEvent[]> {
  const limit = Math.min(opts.limit ?? 100, 300);
  const want = (k: EventKind) => !opts.kinds?.length || opts.kinds.includes(k);
  const at = opts.before ? { lt: opts.before } : undefined;
  const byUser = opts.userId ? { userId: opts.userId } : {};

  const [users, sessions, quizzes, daily, missions, lessons, opened] = await Promise.all([
    want("signup") ? db.user.findMany({ where: { ...(opts.userId ? { id: opts.userId } : {}), createdAt: at }, orderBy: { createdAt: "desc" }, take: limit, select: { id: true, fullName: true, email: true, createdAt: true, accounts: { select: { providerId: true } } } }) : [],
    want("signin") ? db.session.findMany({ where: { ...byUser, createdAt: at }, orderBy: { createdAt: "desc" }, take: limit, select: { id: true, createdAt: true, ipAddress: true, userAgent: true, user: userSel } }) : [],
    want("quiz") ? db.quizAttempt.findMany({ where: { ...byUser, createdAt: at }, orderBy: { createdAt: "desc" }, take: limit, select: { id: true, tool: true, score: true, total: true, durationSec: true, createdAt: true, user: userSel } }) : [],
    want("daily") ? db.dailyAnswer.findMany({ where: { ...byUser, createdAt: at }, orderBy: { createdAt: "desc" }, take: limit, select: { id: true, day: true, questionId: true, isCorrect: true, selectedOption: true, createdAt: true, user: userSel } }) : [],
    want("mission") ? db.terminalProgress.findMany({ where: { ...byUser, completedAt: at }, orderBy: { completedAt: "desc" }, take: limit, select: { id: true, missionId: true, completedAt: true, user: userSel } }) : [],
    want("lesson") ? db.userProgress.findMany({ where: { ...byUser, completionStatus: "COMPLETED", completedAt: at ?? { not: null } }, orderBy: { completedAt: "desc" }, take: limit, select: { id: true, completedAt: true, user: userSel, lesson: { select: { title: true, sequenceNumber: true, playlist: { select: { title: true, youtubePlaylistId: true } } } } } }) : [],
    want("opened") ? db.userActivity.findMany({ where: { ...byUser, activityType: "OPENED_PLAYLIST", createdAt: at }, orderBy: { createdAt: "desc" }, take: limit, select: { id: true, resourceId: true, createdAt: true, user: userSel } }) : [],
  ]);

  const playlistTitles = opened.length
    ? new Map((await db.playlist.findMany({ where: { id: { in: [...new Set(opened.map((o) => o.resourceId))] } }, select: { id: true, title: true, youtubePlaylistId: true } })).map((p) => [p.id, p]))
    : new Map<string, { title: string; youtubePlaylistId: string }>();

  const events: ActivityEvent[] = [
    ...users.map((x): ActivityEvent => ({
      id: `su-${x.id}`,
      kind: "signup",
      at: x.createdAt,
      user: u(x),
      title: "Created an account",
      detail: [...new Set(x.accounts.map((a) => (a.providerId === "credential" ? "email" : a.providerId)))].join(", ") || undefined,
    })),
    ...sessions.map((x): ActivityEvent => ({ id: `si-${x.id}`, kind: "signin", at: x.createdAt, user: u(x.user), title: "Signed in", detail: [device(x.userAgent), x.ipAddress].filter(Boolean).join(" · ") || undefined })),
    ...quizzes.map((x): ActivityEvent => {
      const pct = x.total ? Math.round((x.score / x.total) * 100) : 0;
      return {
        id: `qz-${x.id}`,
        kind: "quiz",
        at: x.createdAt,
        user: u(x.user),
        title: `${toolName(x.tool)} quiz — ${x.score}/${x.total} (${pct}%)`,
        detail: `${Math.floor(x.durationSec / 60)}m ${x.durationSec % 60}s`,
        tone: pct >= 70 ? "good" : pct < 50 ? "bad" : "neutral",
        href: `/admin/users/${x.user.id}#attempt-${x.id}`,
      };
    }),
    ...daily.map((x): ActivityEvent => ({
      id: `dc-${x.id}`,
      kind: "daily",
      at: x.createdAt,
      user: u(x.user),
      title: `${x.isCorrect ? "Answered correctly" : x.selectedOption ? "Answered wrong" : "No answer"} — ${x.day}`,
      detail: QUESTION_BY_ID.get(x.questionId)?.question,
      tone: x.isCorrect ? "good" : "bad",
    })),
    ...missions.map((x): ActivityEvent => ({ id: `tm-${x.id}`, kind: "mission", at: x.completedAt, user: u(x.user), title: MISSION_TITLE.get(x.missionId) ?? x.missionId, tone: "good" })),
    ...lessons.map((x): ActivityEvent => ({
      id: `ls-${x.id}`,
      kind: "lesson",
      at: x.completedAt!,
      user: u(x.user),
      title: `${String(x.lesson.sequenceNumber).padStart(2, "0")} · ${x.lesson.title}`,
      detail: x.lesson.playlist.title,
      tone: "good",
    })),
    ...opened.map((x): ActivityEvent => ({ id: `op-${x.id}`, kind: "opened", at: x.createdAt, user: u(x.user), title: playlistTitles.get(x.resourceId)?.title ?? "A playlist" })),
  ];

  return events.sort((a, b) => b.at.getTime() - a.at.getTime()).slice(0, limit);
}
