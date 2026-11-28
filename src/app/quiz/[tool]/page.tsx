import { ThemedBackdrop } from "@/components/motion/AnimatedHeader";
import { themeForTech } from "@/lib/themes";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getQuizTool, getQuizTools } from "@/lib/quiz/tools";
import { QuizRunner } from "@/components/quiz/QuizRunner";

type Props = { params: Promise<{ tool: string }> };

export function generateStaticParams() {
  return getQuizTools().map((t) => ({ tool: t.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tool } = await params;
  const t = getQuizTool(tool);
  if (!t) return { title: "Quiz not found" };
  return {
    title: `${t.name} quiz`,
    description: `Test your ${t.name} knowledge with 10 questions, from beginner to advanced, with an explanation for every answer.`,
  };
}

export default async function QuizToolPage({ params }: Props) {
  const { tool } = await params;
  const t = getQuizTool(tool);
  if (!t) notFound();

  return (
    <div className="relative isolate mx-auto max-w-site px-5 pb-28 pt-10 sm:px-8">
      <ThemedBackdrop theme={t.slug === "mix" ? "violet" : themeForTech(t.slug)} />
      <Link href="/quiz" className="mb-8 inline-flex items-center gap-2 text-sm text-text-muted hover:text-brand-teal">
        <ArrowLeft size={16} aria-hidden="true" /> All quizzes
      </Link>
      <QuizRunner tool={t.slug} toolName={t.name} learnHref={t.slug === "mix" ? null : `/learn/${t.slug}`} />
    </div>
  );
}
