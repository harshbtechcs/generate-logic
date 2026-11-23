"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { getSession } from "@/lib/session";
import { dailyQuestion } from "@/lib/daily";
import { grade } from "@/lib/quiz/engine";
import { istDayKey } from "@/lib/ist";
import { MISSION_IDS } from "@/lib/terminal/missions";

/*
 * Daily challenge, Command Playground and leaderboard settings.
 * The user id always comes from the session, never from the browser.
 */

const optionSchema = z.string().min(1).max(64);

export type DailyResult =
  | { ok: true; correct: boolean; correctOptionId: string; explanation: string }
  | { ok: false; error: string };

/** Answer today's challenge. One answer per user per India day; the question is decided on the server. */
export async function answerDaily(optionId: string | null): Promise<DailyResult> {
  const session = await getSession();
  if (!session) return { ok: false, error: "Please sign in to answer the daily challenge." };
  if (optionId !== null && !optionSchema.safeParse(optionId).success) return { ok: false, error: "Invalid answer." };

  const userId = session.user.id;
  const day = istDayKey();
  const existing = await db.dailyAnswer.findUnique({ where: { userId_day: { userId, day } } });
  if (existing) {
    const g = grade(existing.questionId, existing.selectedOption);
    return g ? { ok: true, correct: existing.isCorrect, correctOptionId: g.correctOptionId, explanation: g.explanation } : { ok: false, error: "Already answered." };
  }

  const q = dailyQuestion(day);
  const g = grade(q.id, optionId)!;
  try {
    await db.dailyAnswer.create({ data: { userId, day, questionId: q.id, selectedOption: optionId, isCorrect: g.correct } });
  } catch (e) {
    // Two clicks at the same moment: the first one wins.
    if (!(e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002")) throw e;
  }
  revalidatePath("/daily");
  revalidatePath("/dashboard");
  revalidatePath("/leaderboard");
  return { ok: true, correct: g.correct, correctOptionId: g.correctOptionId, explanation: g.explanation };
}

/** Save finished playground missions (signed-in users). Unknown ids are ignored. */
export async function completeMissions(ids: string[]): Promise<{ ok: boolean; saved: string[] }> {
  const session = await getSession();
  if (!session) return { ok: false, saved: [] };
  const valid = [...new Set(ids)].filter((id) => typeof id === "string" && MISSION_IDS.has(id)).slice(0, 100);
  if (!valid.length) return { ok: true, saved: [] };
  await db.terminalProgress.createMany({ data: valid.map((missionId) => ({ userId: session.user.id, missionId })), skipDuplicates: true });
  revalidatePath("/dashboard");
  revalidatePath("/roadmap");
  revalidatePath("/leaderboard");
  return { ok: true, saved: valid };
}

/** Show or hide yourself on the public leaderboard. */
export async function setLeaderboardVisibility(show: boolean): Promise<{ ok: boolean }> {
  const session = await getSession();
  if (!session || typeof show !== "boolean") return { ok: false };
  await db.user.update({ where: { id: session.user.id }, data: { showOnLeaderboard: show } });
  revalidatePath("/leaderboard");
  revalidatePath("/dashboard/settings");
  return { ok: true };
}
