import "server-only";
import { db } from "@/lib/db";
import { getQuizTools } from "./tools";

export type ToolBest = { tool: string; name: string; bestPercent: number; attempts: number };

/** Best score and attempt count per quiz tool for one user (only their own rows). */
export async function getUserQuizBests(userId: string): Promise<Map<string, ToolBest>> {
  const rows = await db.quizAttempt.findMany({
    where: { userId },
    select: { tool: true, score: true, total: true },
  });
  const names = new Map(getQuizTools().map((t) => [t.slug, t.name]));
  const out = new Map<string, ToolBest>();
  for (const r of rows) {
    const pct = r.total ? Math.round((r.score / r.total) * 100) : 0;
    const cur = out.get(r.tool);
    if (cur) {
      cur.attempts++;
      cur.bestPercent = Math.max(cur.bestPercent, pct);
    } else {
      out.set(r.tool, { tool: r.tool, name: names.get(r.tool) ?? r.tool, bestPercent: pct, attempts: 1 });
    }
  }
  return out;
}

export async function getUserQuizSummary(userId: string) {
  const [attempts, recent, bests] = await Promise.all([
    db.quizAttempt.findMany({ where: { userId }, select: { score: true, total: true } }),
    db.quizAttempt.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, tool: true, score: true, total: true, durationSec: true, createdAt: true },
    }),
    getUserQuizBests(userId),
  ]);
  const taken = attempts.length;
  const avg = taken ? Math.round(attempts.reduce((s, a) => s + (a.total ? a.score / a.total : 0), 0) / taken * 100) : 0;
  const bestList = [...bests.values()].sort((a, b) => b.bestPercent - a.bestPercent || b.attempts - a.attempts);
  const names = new Map(getQuizTools().map((t) => [t.slug, t.name]));
  return {
    taken,
    avg,
    strongest: bestList[0] ?? null,
    bests: bestList,
    recent: recent.map((r) => ({ ...r, name: names.get(r.tool) ?? r.tool, percent: r.total ? Math.round((r.score / r.total) * 100) : 0 })),
  };
}
