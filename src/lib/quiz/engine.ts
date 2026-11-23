import "server-only";
import { createHash, randomInt } from "node:crypto";
import { QUESTION_BY_ID, questionsForTool, type Level, type Question } from "./bank";

export const QUIZ_LENGTH = 10;
// Easy → hard progression for a 10-question quiz.
const LEVEL_QUOTA: Record<Level, number> = { beginner: 4, intermediate: 4, advanced: 2 };
const LEVEL_ORDER: Record<Level, number> = { beginner: 0, intermediate: 1, advanced: 2 };

/** What the browser gets: no correct answer, options shuffled with opaque ids. */
export type PublicQuestion = {
  id: string;
  tool: string;
  level: Level;
  question: string;
  options: { id: string; text: string }[];
};

/**
 * Opaque, stable option id. Derived from a server secret so the browser can't
 * work out which option is the correct one (bank index 0) from its id.
 */
function optionId(questionId: string, index: number) {
  const secret = process.env.AUTH_SECRET ?? "generate-logic-quiz";
  return createHash("sha256").update(`${secret}:${questionId}:${index}`).digest("hex").slice(0, 12);
}

function shuffle<T>(items: T[]): T[] {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = randomInt(i + 1);
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

export function toPublic(q: Question): PublicQuestion {
  return {
    id: q.id,
    tool: q.tool,
    level: q.level,
    question: q.question,
    options: shuffle(q.options.map((text, i) => ({ id: optionId(q.id, i), text }))),
  };
}

export type Grade = { correct: boolean; correctOptionId: string; explanation: string };

export function grade(questionId: string, selectedOptionId: string | null): Grade | null {
  const q = QUESTION_BY_ID.get(questionId);
  if (!q) return null;
  const correctOptionId = optionId(q.id, 0);
  return { correct: selectedOptionId === correctOptionId, correctOptionId, explanation: q.explanation };
}

/** What we know about a user's past answers: question id → was the latest answer correct? */
export type History = Map<string, boolean>;

/**
 * Picks 10 questions so every attempt feels new:
 *   1. questions this user has never seen,
 *   2. then ones they got wrong last time,
 *   3. then the rest — random within each group,
 * while keeping a beginner → advanced mix, ordered easy to hard.
 */
export function pickQuestions(tool: string, history: History = new Map()): Question[] {
  const pool = questionsForTool(tool);
  const priority = (q: Question) => (!history.has(q.id) ? 0 : history.get(q.id) === false ? 1 : 2);
  const ranked = shuffle(pool).sort((a, b) => priority(a) - priority(b));

  const picked: Question[] = [];
  const used = new Set<string>();
  const perLevel: Record<Level, number> = { beginner: 0, intermediate: 0, advanced: 0 };

  // For the mixed quiz, avoid stacking too many questions from one tool.
  const perTool = new Map<string, number>();
  const toolCap = tool === "mix" ? 2 : Infinity;

  for (const q of ranked) {
    if (picked.length === QUIZ_LENGTH) break;
    if (perLevel[q.level] >= LEVEL_QUOTA[q.level]) continue;
    if ((perTool.get(q.tool) ?? 0) >= toolCap) continue;
    picked.push(q);
    used.add(q.id);
    perLevel[q.level]++;
    perTool.set(q.tool, (perTool.get(q.tool) ?? 0) + 1);
  }
  // Top up if a level ran short.
  for (const q of ranked) {
    if (picked.length === QUIZ_LENGTH) break;
    if (!used.has(q.id)) {
      picked.push(q);
      used.add(q.id);
    }
  }
  return picked.sort((a, b) => LEVEL_ORDER[a.level] - LEVEL_ORDER[b.level]);
}

export function scoreMessage(percent: number) {
  if (percent >= 90) return { title: "DevOps pro!", note: "Outstanding — you really know this." };
  if (percent >= 70) return { title: "Solid work!", note: "Strong basics. Review the misses and go again." };
  if (percent >= 50) return { title: "Getting there", note: "Good start. Watch the playlist and retry with new questions." };
  return { title: "Keep practising", note: "Every attempt gives you new questions — you'll improve fast." };
}
