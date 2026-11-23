import "server-only";
import { db } from "@/lib/db";
import { QUESTIONS, QUESTION_BY_ID, type Question } from "@/lib/quiz/bank";
import { grade, toPublicStable, type PublicQuestion } from "@/lib/quiz/engine";
import { techBySlug } from "@/lib/data";
import { istDayKey, previousDayKey, streakFromDays } from "@/lib/ist";

const EPOCH = Date.parse("2026-01-01T00:00:00Z");
const STEPS = [97, 89, 83, 79, 73];

/**
 * Everyone gets the same question on the same India date. Walking the bank with a
 * step that shares no factor with its size means no repeats until the whole bank
 * has been used once.
 */
export function dailyQuestion(day: string): Question {
  const n = QUESTIONS.length;
  const dayNumber = Math.round((Date.parse(`${day}T00:00:00Z`) - EPOCH) / 86_400_000);
  const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
  const step = STEPS.find((s) => gcd(s, n) === 1) ?? 1;
  const index = (((dayNumber * step + 11) % n) + n) % n;
  return QUESTIONS[index]!;
}

export type DayStatus = { day: string; status: "correct" | "wrong" | "missed" | "today" };

export type DailyState = {
  day: string;
  question: PublicQuestion;
  toolName: string;
  answer: { optionId: string | null; correct: boolean; correctOptionId: string; explanation: string } | null;
  stats: { answered: number; correctPercent: number };
  streak: number;
  best: number;
  totalAnswered: number;
  lastWeek: DayStatus[];
};

/** Today's challenge plus (for a signed-in user) their answer, streak and last 7 days. */
export async function getDailyState(userId: string | null): Promise<DailyState> {
  const day = istDayKey();
  const mine = userId ? await db.dailyAnswer.findUnique({ where: { userId_day: { userId, day } } }) : null;
  // If the user already answered, keep showing the exact question they answered.
  const q = (mine && QUESTION_BY_ID.get(mine.questionId)) || dailyQuestion(day);

  const [answered, correct, history] = await Promise.all([
    db.dailyAnswer.count({ where: { day } }),
    db.dailyAnswer.count({ where: { day, isCorrect: true } }),
    userId
      ? db.dailyAnswer.findMany({ where: { userId }, select: { day: true, isCorrect: true }, orderBy: { day: "desc" }, take: 400 })
      : Promise.resolve([]),
  ]);

  const byDay = new Map(history.map((h) => [h.day, h.isCorrect]));
  const lastWeek: DayStatus[] = [];
  let d = day;
  for (let i = 0; i < 7; i++) {
    const v = byDay.get(d);
    lastWeek.unshift({ day: d, status: v === undefined ? (i === 0 ? "today" : "missed") : v ? "correct" : "wrong" });
    d = previousDayKey(d);
  }

  let answer: DailyState["answer"] = null;
  if (mine) {
    const g = grade(q.id, mine.selectedOption);
    if (g) answer = { optionId: mine.selectedOption, correct: mine.isCorrect, correctOptionId: g.correctOptionId, explanation: g.explanation };
  }

  return {
    day,
    question: toPublicStable(q),
    toolName: techBySlug[q.tool]?.name ?? q.tool,
    answer,
    stats: { answered, correctPercent: answered ? Math.round((correct / answered) * 100) : 0 },
    streak: streakFromDays(byDay.keys(), day),
    best: bestStreak([...byDay.keys()]),
    totalAnswered: history.length,
    lastWeek,
  };
}

/** Longest run of consecutive days, any time. */
function bestStreak(days: string[]) {
  const set = new Set(days);
  let best = 0;
  for (const day of set) {
    if (set.has(previousDayKey(day))) continue; // not the start of a run
    let len = 0;
    let cur = day;
    while (set.has(cur)) {
      len++;
      cur = new Date(Date.parse(`${cur}T00:00:00Z`) + 86_400_000).toISOString().slice(0, 10);
    }
    best = Math.max(best, len);
  }
  return best;
}

/** Just the streak numbers (for the dashboard). */
export async function getDailyStreak(userId: string) {
  const rows = await db.dailyAnswer.findMany({ where: { userId }, select: { day: true }, orderBy: { day: "desc" }, take: 400 });
  const today = istDayKey();
  const days = rows.map((r) => r.day);
  return { streak: streakFromDays(days, today), doneToday: days[0] === today, best: bestStreak(days) };
}
