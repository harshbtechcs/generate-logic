"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CalendarCheck, Check, Flame, Loader2, Trophy, Users, X } from "lucide-react";
import { answerDaily } from "@/app/actions/engage";
import type { DailyState } from "@/lib/daily";
import { cn } from "@/lib/cn";

const levelStyle: Record<string, string> = {
  beginner: "text-green-200 border-green-400/40",
  intermediate: "text-cyan-200 border-cyan-400/40",
  advanced: "text-blue-200 border-blue-400/40",
};

const dayName = new Intl.DateTimeFormat("en-IN", { weekday: "short", timeZone: "UTC" });

/** Live "next challenge in 05:12:09" countdown to India midnight. */
function NextIn({ at }: { at: number }) {
  const [left, setLeft] = useState(() => Math.max(0, at - Date.now()));
  const router = useRouter();
  useEffect(() => {
    const t = setInterval(() => {
      const l = Math.max(0, at - Date.now());
      setLeft(l);
      if (l === 0) {
        clearInterval(t);
        router.refresh();
      }
    }, 1000);
    return () => clearInterval(t);
  }, [at, router]);
  const s = Math.floor(left / 1000);
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    <span className="font-mono text-brand-teal" suppressHydrationWarning>
      {pad(Math.floor(s / 3600))}:{pad(Math.floor((s % 3600) / 60))}:{pad(s % 60)}
    </span>
  );
}

export function DailyChallenge({ state, signedIn, nextAt }: { state: DailyState; signedIn: boolean; nextAt: number }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [picked, setPicked] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [local, setLocal] = useState<DailyState["answer"]>(null);
  const answer = state.answer ?? local;
  const q = state.question;

  function choose(optionId: string) {
    if (!signedIn || answer || pending) return;
    setPicked(optionId);
    setError(null);
    startTransition(async () => {
      const res = await answerDaily(optionId);
      if (!res.ok) {
        setError(res.error);
        setPicked(null);
        return;
      }
      setLocal({ optionId, correct: res.correct, correctOptionId: res.correctOptionId, explanation: res.explanation });
      router.refresh(); // pull in the new streak and today's stats
    });
  }

  const chosen = answer?.optionId ?? picked;

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-[22px] border border-slate-400/15 bg-white/[0.03] p-6 sm:p-8"
        aria-labelledby="daily-q"
      >
        <div className="mb-4 flex flex-wrap items-center gap-2 text-xs">
          <span className="rounded-full border border-amber-300/40 bg-amber-300/10 px-2.5 py-1 font-medium text-amber-100">
            {new Date(`${state.day}T00:00:00Z`).toLocaleDateString("en-IN", { day: "numeric", month: "long", timeZone: "UTC" })}
          </span>
          <span className="rounded-full border border-slate-400/30 px-2.5 py-1 font-medium">{state.toolName}</span>
          <span className={cn("rounded-full border px-2.5 py-1 font-medium capitalize", levelStyle[q.level])}>{q.level}</span>
        </div>
        <h2 id="daily-q" className="font-display text-[22px] font-semibold leading-snug sm:text-[26px]">
          {q.question}
        </h2>

        <div className="mt-6 flex flex-col gap-3">
          {q.options.map((o, i) => {
            const isPicked = chosen === o.id;
            const isRight = answer?.correctOptionId === o.id;
            return (
              <button
                key={o.id}
                type="button"
                onClick={() => choose(o.id)}
                disabled={!signedIn || !!answer || pending}
                aria-pressed={isPicked}
                className={cn(
                  "flex w-full items-start gap-3 rounded-xl border px-4 py-3.5 text-left text-[15px] transition-colors",
                  !answer && signedIn && "border-slate-400/25 hover:border-brand-teal/60 hover:bg-brand-teal/5",
                  !answer && !signedIn && "cursor-not-allowed border-slate-400/20 opacity-80",
                  !answer && isPicked && "border-brand-teal/70 bg-brand-teal/10",
                  answer && isRight && "border-green-400/70 bg-green-400/10 text-green-50",
                  answer && isPicked && !isRight && "border-red-400/70 bg-red-400/10 text-red-50",
                  answer && !isPicked && !isRight && "border-slate-400/15 opacity-60",
                )}
              >
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-current font-mono text-xs opacity-80">
                  {pending && isPicked ? (
                    <Loader2 size={14} className="animate-spin" aria-hidden="true" />
                  ) : answer && isRight ? (
                    <Check size={14} aria-hidden="true" />
                  ) : answer && isPicked ? (
                    <X size={14} aria-hidden="true" />
                  ) : (
                    i + 1
                  )}
                </span>
                <span>{o.text}</span>
              </button>
            );
          })}
        </div>

        {error && <p role="alert" className="mt-4 text-sm text-red-300">{error}</p>}

        {!signedIn && (
          <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-brand-teal/30 bg-brand-teal/[0.06] px-4 py-3 text-sm">
            <span>Sign in to answer, build your streak and climb the leaderboard.</span>
            <Link href="/sign-in?next=/daily" className="gl-btn rounded-lg bg-brand-teal px-4 py-2 font-semibold text-ink-900">
              Sign in
            </Link>
          </div>
        )}

        <AnimatePresence>
          {answer && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-6 flex flex-col gap-4">
              <div
                role="status"
                className={cn(
                  "rounded-xl border px-4 py-3 text-sm",
                  answer.correct ? "border-green-400/40 bg-green-400/10 text-green-100" : "border-red-400/40 bg-red-400/10 text-red-100",
                )}
              >
                <strong>{answer.correct ? "Correct! +30 XP. " : "Not quite — +10 XP for showing up. "}</strong>
                {answer.explanation}
              </div>
              <p className="text-sm text-text-muted">
                Next challenge in <NextIn at={nextAt} /> · come back tomorrow to keep your streak going.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.section>

      <aside className="flex flex-col gap-4">
        <div className="rounded-[18px] border border-amber-300/25 bg-amber-300/[0.05] p-5">
          <div className="flex items-center gap-3">
            <motion.span
              animate={state.streak > 0 ? { scale: [1, 1.15, 1] } : undefined}
              transition={{ duration: 1.6, repeat: Infinity }}
              className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-300/15 text-amber-300"
            >
              <Flame size={26} aria-hidden="true" />
            </motion.span>
            <div>
              <div className="font-display text-3xl font-bold leading-none">
                {signedIn ? state.streak : "–"} <span className="text-sm font-normal text-text-faint">day streak</span>
              </div>
              {signedIn && <div className="mt-1 text-xs text-text-faint">Best: {state.best} · Answered: {state.totalAnswered}</div>}
            </div>
          </div>
          {signedIn && (
            <ol className="mt-5 grid grid-cols-7 gap-1.5" aria-label="Last 7 days">
              {state.lastWeek.map((d) => (
                <li key={d.day} className="flex flex-col items-center gap-1.5">
                  <span
                    title={`${d.day}: ${d.status}`}
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-lg border text-[11px]",
                      d.status === "correct" && "border-green-400/60 bg-green-400/15 text-green-200",
                      d.status === "wrong" && "border-amber-300/50 bg-amber-300/10 text-amber-200",
                      d.status === "missed" && "border-slate-400/15 text-text-faint",
                      d.status === "today" && "border-dashed border-brand-teal/60 text-brand-teal",
                    )}
                  >
                    {d.status === "correct" ? <Check size={14} aria-hidden="true" /> : d.status === "wrong" ? "•" : d.status === "today" ? "?" : ""}
                  </span>
                  <span className="text-[10px] text-text-faint">{dayName.format(new Date(`${d.day}T00:00:00Z`))}</span>
                </li>
              ))}
            </ol>
          )}
        </div>

        <div className="rounded-[18px] border border-slate-400/15 p-5 text-sm">
          <div className="mb-3 flex items-center gap-2 font-semibold">
            <Users size={16} className="text-brand-teal" aria-hidden="true" /> Today
          </div>
          {answer ? (
            <p className="text-text-muted">
              <span className="font-mono text-text">{state.stats.answered}</span> learner{state.stats.answered === 1 ? "" : "s"} answered ·{" "}
              <span className="font-mono text-green-300">{state.stats.correctPercent}%</span> got it right
            </p>
          ) : (
            <p className="text-text-muted">
              <span className="font-mono text-text">{state.stats.answered}</span> learner{state.stats.answered === 1 ? " has" : "s have"} answered so far. Answer to see how
              everyone did.
            </p>
          )}
        </div>

        <div className="rounded-[18px] border border-slate-400/15 p-5 text-sm text-text-muted">
          <div className="mb-2 flex items-center gap-2 font-semibold text-text">
            <CalendarCheck size={16} className="text-brand-teal" aria-hidden="true" /> How it works
          </div>
          One question a day, the same for everyone. It changes at midnight (India time). You get one try: right answer +30 XP, wrong answer +10
          XP.
          <Link href="/leaderboard" className="mt-3 flex items-center gap-2 text-brand-teal hover:underline">
            <Trophy size={15} aria-hidden="true" /> See the leaderboard
          </Link>
        </div>
      </aside>
    </div>
  );
}
