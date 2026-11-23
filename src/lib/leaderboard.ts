import "server-only";
import { db } from "@/lib/db";
import { istWeekStart } from "@/lib/ist";

/**
 * How XP is earned. Quiz XP counts each question only the first time it is answered
 * correctly in the period, so retaking the same quiz again and again doesn't farm points.
 */
export const XP = { quizQuestion: 5, lesson: 20, dailyCorrect: 30, dailyTried: 10, mission: 15 } as const;

export type Range = "week" | "all";

export type XpBreakdown = { quiz: number; lessons: number; daily: number; terminal: number };
type Row = XpBreakdown & { id: string; name: string; visible: boolean; total: number };

export type LeaderEntry = { rank: number; id: string; name: string; initials: string; total: number; allTime: number } & XpBreakdown;
export type MyStanding = { rank: number | null; total: number; allTime: number; visible: boolean; ofTotal: number; toNext: number | null } & XpBreakdown;

/** "Harsh Yadav" → "Harsh Y." — the leaderboard never shows full names or emails. */
export function publicName(fullName: string) {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "Learner";
  const first = parts[0]!.slice(0, 20);
  return parts.length > 1 ? `${first} ${parts[parts.length - 1]![0]!.toUpperCase()}.` : first;
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .map((p) => p[0] ?? "")
    .join("")
    .replace(".", "")
    .slice(0, 2)
    .toUpperCase();
}

export function rangeStart(range: Range) {
  return range === "week" ? istWeekStart() : new Date(0);
}

async function xpRows(since: Date): Promise<Row[]> {
  const rows = await db.$queryRaw<
    { id: string; full_name: string; show_on_leaderboard: boolean; quiz: number; lessons: number; daily: number; terminal: number }[]
  >`
    WITH q AS (
      SELECT a.user_id, COUNT(DISTINCT ans.question_id)::int * ${XP.quizQuestion}::int AS xp
      FROM quiz_answers ans JOIN quiz_attempts a ON a.id = ans.attempt_id
      WHERE ans.is_correct AND a.created_at >= ${since}::timestamp
      GROUP BY a.user_id
    ), l AS (
      SELECT user_id, COUNT(*)::int * ${XP.lesson}::int AS xp
      FROM user_progress
      WHERE completion_status = 'COMPLETED' AND completed_at >= ${since}::timestamp
      GROUP BY user_id
    ), d AS (
      SELECT user_id, SUM(CASE WHEN is_correct THEN ${XP.dailyCorrect}::int ELSE ${XP.dailyTried}::int END)::int AS xp
      FROM daily_answers
      WHERE created_at >= ${since}::timestamp
      GROUP BY user_id
    ), t AS (
      SELECT user_id, COUNT(*)::int * ${XP.mission}::int AS xp
      FROM terminal_progress
      WHERE completed_at >= ${since}::timestamp
      GROUP BY user_id
    )
    SELECT u.id, u.full_name, u.show_on_leaderboard,
           COALESCE(q.xp, 0)::int AS quiz, COALESCE(l.xp, 0)::int AS lessons,
           COALESCE(d.xp, 0)::int AS daily, COALESCE(t.xp, 0)::int AS terminal
    FROM users u
    LEFT JOIN q ON q.user_id = u.id
    LEFT JOIN l ON l.user_id = u.id
    LEFT JOIN d ON d.user_id = u.id
    LEFT JOIN t ON t.user_id = u.id
    WHERE u.account_status = 'ACTIVE'
      AND (q.xp IS NOT NULL OR l.xp IS NOT NULL OR d.xp IS NOT NULL OR t.xp IS NOT NULL)
  `;
  return rows.map((r) => {
    const b = { quiz: Number(r.quiz), lessons: Number(r.lessons), daily: Number(r.daily), terminal: Number(r.terminal) };
    return { id: r.id, name: publicName(r.full_name), visible: r.show_on_leaderboard, ...b, total: b.quiz + b.lessons + b.daily + b.terminal };
  });
}

/** Top learners for the period, plus where the signed-in user stands (even if they're not in the top list). */
export async function getLeaderboard(range: Range, userId: string | null, limit = 20) {
  const [periodRows, allRows] = await Promise.all([xpRows(rangeStart(range)), range === "all" ? Promise.resolve(null) : xpRows(new Date(0))]);
  const rows = periodRows.filter((r) => r.total > 0);
  // All-time XP decides each learner's level, even on the weekly board.
  const allTime = new Map((allRows ?? periodRows).map((r) => [r.id, r.total]));
  const visible = rows.filter((r) => r.visible).sort((a, b) => b.total - a.total || a.name.localeCompare(b.name));

  // Standard competition ranking: equal XP → equal rank.
  const ranked: LeaderEntry[] = [];
  visible.forEach((r, i) => {
    const prev = ranked[i - 1];
    const rank = prev && prev.total === r.total ? prev.rank : i + 1;
    ranked.push({ rank, id: r.id, name: r.name, initials: initials(r.name), total: r.total, allTime: allTime.get(r.id) ?? r.total, quiz: r.quiz, lessons: r.lessons, daily: r.daily, terminal: r.terminal });
  });

  let me: MyStanding | null = null;
  if (userId) {
    const mine = rows.find((r) => r.id === userId);
    const total = mine?.total ?? 0;
    const above = visible.filter((r) => r.id !== userId && r.total > total);
    const rank = total > 0 ? above.length + 1 : null;
    const next = above.length ? Math.min(...above.map((r) => r.total)) : null;
    me = {
      rank,
      total,
      allTime: allTime.get(userId) ?? total,
      visible: mine?.visible ?? true,
      ofTotal: visible.length + (mine && !mine.visible ? 1 : 0),
      toNext: next === null ? null : next - total,
      quiz: mine?.quiz ?? 0,
      lessons: mine?.lessons ?? 0,
      daily: mine?.daily ?? 0,
      terminal: mine?.terminal ?? 0,
    };
  }
  return { top: ranked.slice(0, limit), me, learners: visible.length };
}
