"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { getSession } from "@/lib/session";
import { QUESTION_BY_ID } from "@/lib/quiz/bank";
import { grade, pickQuestions, QUIZ_LENGTH, toPublic, type Grade, type History, type PublicQuestion } from "@/lib/quiz/engine";
import { getQuizTool } from "@/lib/quiz/tools";

/*
 * Quiz actions. Correct answers never leave the server until the user answers,
 * and the final score is recomputed here — the browser's own count is ignored.
 */

export async function startQuiz(tool: string): Promise<{ ok: true; questions: PublicQuestion[] } | { ok: false; error: string }> {
  if (!getQuizTool(tool)) return { ok: false, error: "Unknown quiz." };

  let history: History = new Map();
  const session = await getSession();
  if (session) {
    // Latest answer per question for this user → unseen first, then previous mistakes.
    const past = await db.quizAnswer.findMany({
      where: { attempt: { userId: session.user.id } },
      orderBy: { attempt: { createdAt: "desc" } },
      select: { questionId: true, isCorrect: true },
      take: 2000,
    });
    history = new Map();
    for (const a of past) if (!history.has(a.questionId)) history.set(a.questionId, a.isCorrect);
  }

  const questions = pickQuestions(tool, history).map(toPublic);
  return { ok: true, questions };
}

const idSchema = z.string().min(1).max(64);

/** Check one answer right after the user picks it (for instant feedback). */
export async function checkAnswer(questionId: string, optionId: string | null): Promise<Grade | null> {
  if (!idSchema.safeParse(questionId).success) return null;
  if (optionId !== null && !idSchema.safeParse(optionId).success) return null;
  return grade(questionId, optionId);
}

const submitSchema = z.object({
  tool: z.string().min(1).max(32),
  durationSec: z.number().int().min(0).max(24 * 60 * 60),
  answers: z
    .array(z.object({ questionId: idSchema, optionId: idSchema.nullable() }))
    .min(1)
    .max(QUIZ_LENGTH),
});

export type SubmitResult =
  | { ok: true; score: number; total: number; saved: boolean; best: number | null }
  | { ok: false; error: string };

/** Grade the whole quiz on the server and, for signed-in users, save it. */
export async function submitQuiz(input: z.infer<typeof submitSchema>): Promise<SubmitResult> {
  const parsed = submitSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Invalid quiz submission." };
  const { tool, durationSec, answers } = parsed.data;
  if (!getQuizTool(tool)) return { ok: false, error: "Unknown quiz." };

  // Each question once, and it must belong to this quiz.
  const seen = new Set<string>();
  const graded: { questionId: string; optionId: string | null; isCorrect: boolean }[] = [];
  for (const a of answers) {
    const q = QUESTION_BY_ID.get(a.questionId);
    if (!q || seen.has(a.questionId) || (tool !== "mix" && q.tool !== tool)) {
      return { ok: false, error: "Invalid quiz submission." };
    }
    seen.add(a.questionId);
    graded.push({ questionId: a.questionId, optionId: a.optionId, isCorrect: grade(a.questionId, a.optionId)?.correct ?? false });
  }
  const score = graded.filter((g) => g.isCorrect).length;
  const total = graded.length;

  const session = await getSession();
  if (!session) return { ok: true, score, total, saved: false, best: null };

  const userId = session.user.id;
  await db.quizAttempt.create({
    data: {
      userId,
      tool,
      score,
      total,
      durationSec,
      answers: { create: graded.map((g) => ({ questionId: g.questionId, selectedOption: g.optionId, isCorrect: g.isCorrect })) },
    },
  });
  const bestRow = await db.quizAttempt.findFirst({
    where: { userId, tool },
    orderBy: [{ score: "desc" }, { createdAt: "asc" }],
    select: { score: true, total: true },
  });
  revalidatePath("/dashboard");
  revalidatePath("/quiz");
  return { ok: true, score, total, saved: true, best: bestRow ? Math.round((bestRow.score / bestRow.total) * 100) : null };
}
