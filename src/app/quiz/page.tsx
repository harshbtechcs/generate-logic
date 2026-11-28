import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Shuffle } from "lucide-react";
import { getSession, isAdmin } from "@/lib/session";
import { getQuizTools } from "@/lib/quiz/tools";
import { toneStyles } from "@/lib/data";
import { PageHeader } from "@/components/ui/PageHeader";
import { Reveal } from "@/components/ui/Reveal";
import { cn } from "@/lib/cn";

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
        <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-4">
          {tools.map((t, i) => {
            const tone = toneStyles[t.tone];
            const isMix = t.slug === "mix";
            return (
              <Reveal key={t.slug} delay={(i % 4) * 0.06}>
                <Link
                  href={`/quiz/${t.slug}`}
                  className={cn(
                    "gl-card flex h-full flex-col gap-4 rounded-2xl border p-5",
                    isMix ? "border-brand-teal/40 bg-brand-teal/[0.06]" : "border-slate-400/15 bg-white/[0.03]",
                  )}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={cn(
                        "gl-ico flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border font-mono text-sm",
                        tone.text,
                        tone.bg,
                        tone.border,
                      )}
                    >
                      {isMix ? <Shuffle size={20} aria-hidden="true" /> : t.short}
                    </span>
                    <span className="flex min-w-0 flex-col">
                      <span className="font-semibold">{t.name}</span>
                      <span className="text-[13px] text-text-faint">{t.tag}</span>
                    </span>
                  </div>
                  <div className="mt-auto flex items-center justify-between text-sm">
                    <span className="text-text-faint">{admin ? `${t.questionCount} questions in bank` : "10 questions · 10s each"}</span>
                    <ArrowRight size={16} className="text-brand-teal" aria-hidden="true" />
                  </div>
                </Link>
              </Reveal>
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
