import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getSession, isAdmin } from "@/lib/session";
import { getQuizTools } from "@/lib/quiz/tools";
import { ColorCard } from "@/components/motion/ColorCard";
import { themeForTech } from "@/lib/themes";
import { PageHeader } from "@/components/ui/PageHeader";

export const metadata: Metadata = {
  title: "DevOps Quizzes",
  description: "Practice Docker, Kubernetes, Terraform, AWS, Linux, Git and CI/CD with 10-question quizzes — new questions every time.",
};
// Admin sees question-bank sizes.
export const dynamic = "force-dynamic";

export default async function QuizPage() {
  const tools = getQuizTools();
  const session = await getSession();
  // Only the admin sees how many questions each bank holds.
  const admin = session ? isAdmin(session.user) : false;

  return (
    <>
      <PageHeader
        kicker="PRACTICE" theme="violet" word="QUIZ"
        title="DevOps quizzes"
        intro="Pick a tool and answer 10 questions, from beginner to advanced. Every attempt brings new questions, and you see the explanation right after each answer."
      />
      <section className="mx-auto max-w-site px-5 pb-28 sm:px-8">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {tools.map((t, i) => {
            const isMix = t.slug === "mix";
            const theme = isMix ? "violet" : themeForTech(t.slug);
            return (
              <ColorCard key={t.slug} theme={theme} href={`/quiz/${t.slug}`} word={isMix ? "MIX" : t.short.toUpperCase()} icon={isMix ? "sparkles" : "brain"} index={i} className="min-h-[200px]">
                <span className="w-fit rounded-full bg-black/25 px-3 py-1 font-mono text-[11px] tracking-[0.18em]">{isMix ? "ALL TOOLS" : t.tag.toUpperCase()}</span>
                <span className="mt-auto font-display text-[26px] font-bold leading-tight">{t.name}</span>
                <span className="mt-1 flex items-center justify-between text-sm text-white/80">
                  {admin ? `${t.questionCount} questions in bank` : "10 questions · 10s each"}
                  <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" aria-hidden="true" />
                </span>
              </ColorCard>
            );
          })}
        </div>
        {!session && (
          <p className="mt-8 text-center text-sm text-text-muted">
            <Link href="/sign-in?next=/quiz" className="text-brand-teal hover:underline">
              Sign in
            </Link>{" "}
            to save your scores to your dashboard.
          </p>
        )}
      </section>
    </>
  );
}
