import "server-only";
import { technologies, type Tone } from "@/lib/data";
import { questionsForTool } from "./bank";

export type QuizTool = { slug: string; name: string; short: string; tag: string; tone: Tone; questionCount: number };

/** Every technology that has questions, plus the mixed quiz. */
export function getQuizTools(): QuizTool[] {
  const tools: QuizTool[] = technologies
    .map((t) => ({ slug: t.slug, name: t.name, short: t.short, tag: t.tag, tone: t.tone, questionCount: questionsForTool(t.slug).length }))
    .filter((t) => t.questionCount > 0);
  return [
    { slug: "mix", name: "DevOps Mix", short: "Mix", tag: "Questions from every tool", tone: "green", questionCount: questionsForTool("mix").length },
    ...tools,
  ];
}

export function getQuizTool(slug: string): QuizTool | undefined {
  return getQuizTools().find((t) => t.slug === slug);
}

