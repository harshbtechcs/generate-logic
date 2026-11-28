import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Brain, Check, ListVideo, MapPin, SquareTerminal } from "lucide-react";
import { getSession } from "@/lib/session";
import { getRoadmap, type Checkpoint } from "@/lib/roadmap";
import { PageHeader } from "@/components/ui/PageHeader";
import { Reveal } from "@/components/ui/Reveal";
import { TechBadge } from "@/components/ui/TechBadge";
import { cn } from "@/lib/cn";

export const metadata: Metadata = {
  title: "DevOps Roadmap",
  description: "The step-by-step DevOps roadmap: Linux, Git, Networking, Docker, Kubernetes, CI/CD, Ansible, Terraform and AWS — with your progress tracked.",
};
export const dynamic = "force-dynamic";

const icons: Record<Checkpoint["key"], typeof Brain> = { lessons: ListVideo, quiz: Brain, terminal: SquareTerminal };

function Ring({ percent }: { percent: number }) {
  const r = 52;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative h-32 w-32 shrink-0">
      <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90" aria-hidden="true">
        <defs>
          <linearGradient id="rm-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#4ADE80" />
            <stop offset="50%" stopColor="#22D3EE" />
            <stop offset="100%" stopColor="#60A5FA" />
          </linearGradient>
        </defs>
        <circle cx="60" cy="60" r={r} fill="none" stroke="rgba(148,163,184,0.15)" strokeWidth="10" />
        <circle cx="60" cy="60" r={r} fill="none" stroke="url(#rm-grad)" strokeWidth="10" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - percent / 100)} />
      </svg>
      <span className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display text-3xl font-bold">{percent}%</span>
        <span className="text-[11px] text-text-faint">complete</span>
      </span>
    </div>
  );
}

export default async function RoadmapPage() {
  const session = await getSession();
  const signedIn = !!session;
  const data = await getRoadmap(session?.user.id ?? null);
  let n = 0;

  return (
    <>
      <PageHeader
        kicker="DEVOPS ROADMAP" word="ROADMAP"
        title="Your path to DevOps"
        intro="Learn in this order. Each step turns green as you watch its lessons, pass its quiz and finish its terminal missions."
      />
      <section className="mx-auto max-w-site px-5 pb-28 sm:px-8">
        <Reveal className="mb-12 flex flex-wrap items-center gap-8 rounded-[22px] border border-slate-400/15 bg-white/[0.03] p-6 sm:p-8">
          {signedIn ? (
            <>
              <Ring percent={data.overall} />
              <div className="flex min-w-0 flex-1 flex-col gap-2">
                <span className="kicker">YOUR PROGRESS</span>
                <p className="text-lg">
                  <strong className="font-display text-2xl">{data.doneSteps}</strong> of {data.totalSteps} steps complete
                </p>
                {data.next ? (
                  <p className="text-text-muted">
                    Next up: <strong className="text-text">{data.next.tech.name}</strong> — {data.next.why}
                  </p>
                ) : (
                  <p className="text-green-200">You&apos;ve finished the whole roadmap. Amazing work! 🎉</p>
                )}
              </div>
              {data.next && (
                <a href={`#step-${data.next.tech.slug}`} className="gl-btn inline-flex items-center gap-2 rounded-xl bg-brand-teal px-5 py-3 font-semibold text-ink-900">
                  Continue <ArrowRight size={18} aria-hidden="true" />
                </a>
              )}
            </>
          ) : (
            <>
              <MapPin size={34} className="text-brand-teal" aria-hidden="true" />
              <p className="min-w-0 flex-1 text-text-muted">
                <strong className="text-text">Sign in to track your progress.</strong> Every lesson, quiz and terminal mission you finish fills in the roadmap.
              </p>
              <Link href="/sign-in?next=/roadmap" className="gl-btn rounded-xl bg-brand-teal px-5 py-3 font-semibold text-ink-900">
                Sign in
              </Link>
            </>
          )}
        </Reveal>

        <ol className="flex flex-col gap-14">
          {data.stages.map((stage, si) => (
            <li key={stage.stage}>
              <Reveal variant="left" className="mb-6 flex items-baseline gap-4">
                <span className="font-mono text-sm text-brand-teal">{String(si + 1).padStart(2, "0")}</span>
                <h2 className="font-display text-2xl font-semibold sm:text-3xl">{stage.stage}</h2>
                <span className="hidden text-text-faint sm:inline">{stage.blurb}</span>
              </Reveal>
              <ol className="relative ml-4 flex flex-col gap-5 border-l border-slate-400/15 pl-8 sm:ml-6 sm:pl-10">
                {stage.steps.map((step, i) => {
                  n++;
                  const isNext = signedIn && data.next?.tech.slug === step.tech.slug;
                  return (
                    <Reveal as="li" key={step.tech.slug} delay={i * 0.06} className="relative scroll-mt-28" >
                      <span
                        id={`step-${step.tech.slug}`}
                        className={cn(
                          "absolute -left-[49px] top-6 flex h-8 w-8 items-center justify-center rounded-full border-2 bg-ink-900 font-mono text-xs sm:-left-[57px]",
                          step.status === "done" && signedIn ? "border-brand-green bg-brand-green text-ink-900" : isNext ? "border-brand-teal text-brand-teal shadow-[0_0_20px_rgba(34,211,238,0.6)]" : step.status === "progress" && signedIn ? "border-brand-cyan text-brand-cyan" : "border-slate-500 text-text-faint",
                        )}
                        aria-hidden="true"
                      >
                        {step.status === "done" && signedIn ? <Check size={16} /> : n}
                      </span>
                      <article
                        className={cn(
                          "gl-card rounded-[20px] border p-5 sm:p-6",
                          isNext ? "border-brand-teal/50 bg-brand-teal/[0.05]" : step.status === "done" && signedIn ? "border-green-400/30 bg-green-400/[0.04]" : "border-slate-400/15 bg-white/[0.03]",
                        )}
                      >
                        <div className="flex flex-wrap items-center gap-4">
                          <TechBadge tech={step.tech} size={52} />
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="font-display text-xl font-semibold">{step.tech.name}</h3>
                              {step.optional && <span className="rounded-full border border-slate-400/30 px-2 py-0.5 text-[11px] text-text-faint">Optional</span>}
                              {isNext && <span className="rounded-full bg-brand-teal px-2 py-0.5 text-[11px] font-semibold text-ink-900">Next up</span>}
                              {step.status === "done" && signedIn && <span className="rounded-full bg-green-400/20 px-2 py-0.5 text-[11px] font-semibold text-green-100">Completed</span>}
                            </div>
                            <p className="mt-1 text-sm text-text-muted">{step.why}</p>
                          </div>
                          {signedIn && <span className="font-mono text-lg font-semibold text-brand-teal">{step.percent}%</span>}
                        </div>
                        {signedIn && (
                          <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                            <div className="h-full rounded-full bg-gradient-to-r from-brand-green via-brand-cyan to-brand-blue" style={{ width: `${step.percent}%` }} />
                          </div>
                        )}
                        <ul className="mt-4 grid gap-2 sm:grid-cols-3">
                          {step.checkpoints.map((c) => {
                            const Icon = icons[c.key];
                            const done = signedIn && c.fraction >= 1;
                            return (
                              <li key={c.key}>
                                <Link
                                  href={c.href}
                                  className={cn(
                                    "flex h-full items-start gap-2.5 rounded-xl border px-3 py-2.5 text-sm transition-colors hover:border-brand-teal/50",
                                    done ? "border-green-400/40 bg-green-400/[0.06]" : "border-slate-400/15",
                                  )}
                                >
                                  {done ? <Check size={16} className="mt-0.5 shrink-0 text-green-300" aria-hidden="true" /> : <Icon size={16} className="mt-0.5 shrink-0 text-brand-teal" aria-hidden="true" />}
                                  <span className="flex flex-col">
                                    <span>{c.label}</span>
                                    {signedIn && <span className="font-mono text-xs text-text-faint">{c.detail}</span>}
                                  </span>
                                </Link>
                              </li>
                            );
                          })}
                        </ul>
                      </article>
                    </Reveal>
                  );
                })}
              </ol>
            </li>
          ))}
        </ol>
      </section>
    </>
  );
}
