"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Check, Clock, Loader2, RotateCcw, Timer, Trophy, X } from "lucide-react";
import { checkAnswer, startQuiz, submitQuiz, type SubmitResult } from "@/app/actions/quiz";
import type { Grade, PublicQuestion } from "@/lib/quiz/engine";
import { useSession } from "@/lib/auth-client";
import { cn } from "@/lib/cn";

type Answer = { optionId: string | null; grade: Grade; timedOut?: boolean };

const QUESTION_SECONDS = 10;
type Phase = "intro" | "playing" | "done";

const levelStyle: Record<string, string> = {
  beginner: "text-green-200 border-green-400/40",
  intermediate: "text-cyan-200 border-cyan-400/40",
  advanced: "text-blue-200 border-blue-400/40",
};

function message(percent: number) {
  if (percent >= 90) return { title: "DevOps pro!", note: "Outstanding — you really know this." };
  if (percent >= 70) return { title: "Solid work!", note: "Strong basics. Review the misses and go again." };
  if (percent >= 50) return { title: "Getting there", note: "Good start. Watch the playlist and retry with new questions." };
  return { title: "Keep practising", note: "Every attempt gives you new questions — you will improve fast." };
}

function formatTime(sec: number) {
  return `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, "0")}`;
}

/** Circular 10-second countdown shown beside each question. */
function Countdown({ seconds, frozen }: { seconds: number; frozen: boolean }) {
  const r = 20;
  const c = 2 * Math.PI * r;
  const color = frozen ? "#64748B" : seconds <= 3 ? "#F87171" : seconds <= 5 ? "#FBBF24" : "#5EEAD4";
  return (
    <div
      role="timer"
      aria-label={`${seconds} seconds left`}
      className={cn("relative h-14 w-14 shrink-0", !frozen && seconds <= 3 && seconds > 0 && "animate-pulse")}
    >
      <svg viewBox="0 0 48 48" className="h-full w-full -rotate-90" aria-hidden="true">
        <circle cx="24" cy="24" r={r} fill="none" stroke="rgba(148,163,184,0.15)" strokeWidth="4" />
        <circle
          cx="24"
          cy="24"
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - seconds / QUESTION_SECONDS)}
          style={{ transition: "stroke-dashoffset 0.25s linear, stroke 0.3s" }}
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center font-mono text-lg font-semibold" style={{ color }}>
        {seconds}
      </span>
    </div>
  );
}

export function QuizRunner({ tool, toolName, learnHref }: { tool: string; toolName: string; learnHref: string | null }) {
  const { data: session } = useSession();
  const signedIn = !!session;

  const [phase, setPhase] = useState<Phase>("intro");
  const [questions, setQuestions] = useState<PublicQuestion[]>([]);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, Answer>>({});
  const [result, setResult] = useState<SubmitResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [loading, startLoading] = useTransition();
  const [checking, setChecking] = useState(false);
  // Countdown belongs to one question id, so a finished timer can never leak into the next question.
  const [timer, setTimer] = useState<{ qid: string; left: number } | null>(null);
  const startedAt = useRef(0);
  // Set once the current question is answered or has timed out, so the two can't both happen.
  const lockRef = useRef(false);

  // Timer while playing
  useEffect(() => {
    if (phase !== "playing") return;
    const t = setInterval(() => setElapsed(Math.floor((Date.now() - startedAt.current) / 1000)), 1000);
    return () => clearInterval(t);
  }, [phase]);

  const begin = useCallback(() => {
    setError(null);
    startLoading(async () => {
      const res = await startQuiz(tool);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setQuestions(res.questions);
      setAnswers({});
      setIndex(0);
      setTimer(null);
      setResult(null);
      setElapsed(0);
      startedAt.current = Date.now();
      setPhase("playing");
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }, [tool]);

  const q = questions[index];
  const current = q ? answers[q.id] : undefined;
  const isLast = index === questions.length - 1;

  const choose = useCallback(
    async (optionId: string) => {
      if (!q || answers[q.id] || lockRef.current) return;
      lockRef.current = true;
      setChecking(true);
      const g = await checkAnswer(q.id, optionId);
      setChecking(false);
      if (!g) {
        lockRef.current = false;
        setError("Could not check that answer. Please try again.");
        return;
      }
      setAnswers((a) => ({ ...a, [q.id]: { optionId, grade: g } }));
    },
    [q, answers],
  );

  // Time ran out: count it as unanswered and reveal the right answer.
  const timeUp = useCallback(async () => {
    if (!q || answers[q.id] || lockRef.current) return;
    lockRef.current = true;
    setChecking(true);
    const g = await checkAnswer(q.id, null);
    setChecking(false);
    if (g) setAnswers((a) => ({ ...a, [q.id]: { optionId: null, grade: g, timedOut: true } }));
  }, [q, answers]);

  // 10-second countdown: starts when a question appears (after Start / Next)
  // and stops as soon as it is answered.
  const qid = q?.id;
  const answered = !!current;
  useEffect(() => {
    if (phase !== "playing" || !qid || answered) return;
    lockRef.current = false;
    const deadline = Date.now() + QUESTION_SECONDS * 1000;
    setTimer({ qid, left: QUESTION_SECONDS });
    const t = setInterval(() => {
      const left = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
      setTimer({ qid, left });
      if (left === 0) clearInterval(t);
    }, 200);
    return () => clearInterval(t);
  }, [phase, qid, answered]);

  // Seconds left for the question on screen (full time until its own timer starts).
  const timeLeft = timer && timer.qid === qid ? timer.left : QUESTION_SECONDS;

  useEffect(() => {
    if (phase === "playing" && timer && timer.qid === qid && timer.left === 0 && !current) void timeUp();
  }, [phase, timer, qid, current, timeUp]);

  const finish = useCallback(() => {
    const duration = Math.max(0, Math.floor((Date.now() - startedAt.current) / 1000));
    startLoading(async () => {
      const res = await submitQuiz({
        tool,
        durationSec: duration,
        answers: questions.map((x) => ({ questionId: x.id, optionId: answers[x.id]?.optionId ?? null })),
      });
      setElapsed(duration);
      setResult(res);
      setPhase("done");
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }, [tool, questions, answers]);

  const next = useCallback(() => {
    if (!current) return;
    if (isLast) finish();
    else setIndex((i) => i + 1);
  }, [current, isLast, finish]);

  // Keyboard: 1–4 to answer, Enter for next
  useEffect(() => {
    if (phase !== "playing" || !q) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      const n = Number(e.key);
      if (n >= 1 && n <= q.options.length && !current && timeLeft > 0) void choose(q.options[n - 1]!.id);
      if (e.key === "Enter" && current) next();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, q, current, choose, next, timeLeft]);

  /* ───────────── intro ───────────── */
  if (phase === "intro") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto max-w-2xl rounded-[24px] border border-slate-400/15 bg-ink-800/60 p-8 text-center sm:p-10"
      >
        <span className="kicker">PRACTICE QUIZ</span>
        <h1 className="mt-3 font-display text-[34px] font-bold leading-tight sm:text-[42px]">{toolName}</h1>
        <ul className="mx-auto mt-6 flex max-w-md flex-col gap-2 text-left text-[15px] text-text-muted">
          <li className="flex gap-2"><Check size={18} className="mt-0.5 shrink-0 text-brand-green" aria-hidden="true" /> 10 questions, from beginner to advanced</li>
          <li className="flex gap-2"><Timer size={18} className="mt-0.5 shrink-0 text-amber-300" aria-hidden="true" /> 10 seconds per question — when time runs out, it counts as wrong</li>
          <li className="flex gap-2"><Check size={18} className="mt-0.5 shrink-0 text-brand-green" aria-hidden="true" /> Instant answer with a short explanation</li>
          <li className="flex gap-2"><Check size={18} className="mt-0.5 shrink-0 text-brand-green" aria-hidden="true" /> New questions every time — ones you have not seen come first</li>
        </ul>
        {!signedIn && (
          <p className="mt-6 text-sm text-text-faint">
            <Link href={`/sign-in?next=${encodeURIComponent(`/quiz/${tool}`)}`} className="text-brand-teal hover:underline">
              Sign in
            </Link>{" "}
            to save your score to your dashboard.
          </p>
        )}
        {error && <p role="alert" className="mt-4 text-sm text-red-300">{error}</p>}
        <button
          type="button"
          onClick={begin}
          disabled={loading}
          className="gl-btn gl-glow mt-8 inline-flex items-center gap-2 rounded-xl bg-brand-teal px-8 py-4 font-semibold text-ink-900 disabled:opacity-70"
        >
          {loading ? <Loader2 size={18} className="animate-spin" aria-hidden="true" /> : null}
          Start quiz
        </button>
      </motion.div>
    );
  }

  /* ───────────── results ───────────── */
  if (phase === "done") {
    const score = result?.ok ? result.score : questions.filter((x) => answers[x.id]?.grade.correct).length;
    const total = result?.ok ? result.total : questions.length;
    const percent = total ? Math.round((score / total) * 100) : 0;
    const msg = message(percent);
    const circumference = 2 * Math.PI * 52;

    return (
      <div className="mx-auto max-w-3xl">
        <motion.section
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-[24px] border border-slate-400/15 bg-ink-800/60 p-8 text-center sm:p-10"
        >
          <div className="relative mx-auto h-36 w-36">
            <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90" aria-hidden="true">
              <circle cx="60" cy="60" r="52" fill="none" stroke="rgba(148,163,184,0.15)" strokeWidth="10" />
              <motion.circle
                cx="60"
                cy="60"
                r="52"
                fill="none"
                stroke="url(#quizGrad)"
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset: circumference * (1 - percent / 100) }}
                transition={{ duration: 1.2, ease: [0.2, 0.7, 0.2, 1] }}
              />
              <defs>
                <linearGradient id="quizGrad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#4ADE80" />
                  <stop offset="100%" stopColor="#60A5FA" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-display text-4xl font-bold">{score}/{total}</span>
              <span className="font-mono text-sm text-text-faint">{percent}%</span>
            </div>
          </div>
          <h1 className="mt-5 font-display text-3xl font-bold">{msg.title}</h1>
          <p className="mt-2 text-text-muted">{msg.note}</p>
          <p className="mt-3 inline-flex items-center gap-1.5 font-mono text-sm text-text-faint">
            <Clock size={14} aria-hidden="true" /> {formatTime(elapsed)}
          </p>

          {result?.ok && result.saved && (
            <p className="mt-4 inline-flex items-center gap-2 rounded-full border border-amber-300/40 bg-amber-300/10 px-4 py-1.5 text-sm text-amber-100">
              <Trophy size={15} aria-hidden="true" /> Saved to your dashboard{result.best !== null ? ` · best ${result.best}%` : ""}
            </p>
          )}
          {result?.ok && !result.saved && (
            <p className="mt-4 text-sm text-text-muted">
              <Link href={`/sign-in?next=${encodeURIComponent(`/quiz/${tool}`)}`} className="text-brand-teal hover:underline">
                Sign in
              </Link>{" "}
              to save scores and track your progress.
            </p>
          )}
          {result && !result.ok && <p role="alert" className="mt-4 text-sm text-red-300">{result.error}</p>}

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={begin}
              disabled={loading}
              className="gl-btn inline-flex items-center gap-2 rounded-xl bg-brand-teal px-6 py-3.5 font-semibold text-ink-900 disabled:opacity-70"
            >
              {loading ? <Loader2 size={18} className="animate-spin" aria-hidden="true" /> : <RotateCcw size={18} aria-hidden="true" />}
              New quiz, new questions
            </button>
            <Link href="/quiz" className="gl-btn rounded-xl border border-slate-400/30 px-6 py-3.5 font-medium">
              Choose another tool
            </Link>
            {learnHref && (
              <Link href={learnHref} className="gl-btn rounded-xl border border-slate-400/30 px-6 py-3.5 font-medium">
                Study {toolName}
              </Link>
            )}
          </div>
        </motion.section>

        <section className="mt-10">
          <h2 className="mb-4 font-display text-2xl font-semibold">Review your answers</h2>
          <ol className="flex flex-col gap-4">
            {questions.map((x, i) => {
              const a = answers[x.id];
              const chosen = x.options.find((o) => o.id === a?.optionId);
              const right = x.options.find((o) => o.id === a?.grade.correctOptionId);
              const ok = a?.grade.correct;
              return (
                <li key={x.id} className={cn("rounded-[18px] border p-5", ok ? "border-green-400/30 bg-green-400/[0.04]" : "border-red-400/30 bg-red-400/[0.04]")}>
                  <p className="font-medium">
                    <span className="mr-2 font-mono text-sm text-text-faint">{String(i + 1).padStart(2, "0")}</span>
                    {x.question}
                  </p>
                  <p className={cn("mt-2 text-sm", ok ? "text-green-200" : "text-red-200")}>
                    {ok ? <Check size={14} className="mr-1 inline" aria-hidden="true" /> : <X size={14} className="mr-1 inline" aria-hidden="true" />}
                    Your answer: {chosen?.text ?? (a?.timedOut ? "No answer (time ran out)" : "No answer")}
                  </p>
                  {!ok && right && <p className="mt-1 text-sm text-green-200">Correct: {right.text}</p>}
                  {a && <p className="mt-2 text-sm text-text-muted">{a.grade.explanation}</p>}
                </li>
              );
            })}
          </ol>
        </section>
      </div>
    );
  }

  /* ───────────── playing ───────────── */
  if (!q) return null;
  const progress = ((index + (current ? 1 : 0)) / questions.length) * 100;

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6 flex items-center justify-between gap-4 text-sm">
        <span className="font-mono text-text-faint">
          {toolName} · Question {index + 1} of {questions.length}
        </span>
        <span className="inline-flex items-center gap-1.5 font-mono text-text-faint">
          <Clock size={14} aria-hidden="true" /> {formatTime(elapsed)}
        </span>
      </div>
      <div className="mb-8 h-2 overflow-hidden rounded-full bg-white/[0.06]" role="progressbar" aria-valuenow={Math.round(progress)} aria-valuemin={0} aria-valuemax={100} aria-label="Quiz progress">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-brand-green via-brand-cyan to-brand-blue"
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.4 }}
        />
      </div>

      <AnimatePresence mode="wait">
        <motion.section
          key={q.id}
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -40 }}
          transition={{ duration: 0.3 }}
          className="rounded-[24px] border border-slate-400/15 bg-ink-800/60 p-6 sm:p-8"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <span className={cn("inline-block rounded-full border px-2.5 py-1 text-xs font-medium capitalize", levelStyle[q.level])}>{q.level}</span>
              <h1 className="mt-4 font-display text-[22px] font-semibold leading-snug sm:text-[26px]">{q.question}</h1>
            </div>
            <Countdown seconds={timeLeft} frozen={!!current} />
          </div>

          <div className="mt-6 flex flex-col gap-3" role="group" aria-label="Answer options">
            {q.options.map((o, i) => {
              const picked = current?.optionId === o.id;
              const isRight = current?.grade.correctOptionId === o.id;
              return (
                <button
                  key={o.id}
                  type="button"
                  onClick={() => void choose(o.id)}
                  disabled={!!current || checking || timeLeft === 0}
                  aria-pressed={picked}
                  className={cn(
                    "flex w-full items-start gap-3 rounded-xl border px-4 py-3.5 text-left text-[15px] transition-colors",
                    !current && "border-slate-400/25 hover:border-brand-teal/60 hover:bg-brand-teal/5",
                    current && isRight && "border-green-400/70 bg-green-400/10 text-green-50",
                    current && picked && !isRight && "border-red-400/70 bg-red-400/10 text-red-50",
                    current && !picked && !isRight && "border-slate-400/15 opacity-60",
                  )}
                >
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-current font-mono text-xs opacity-80">
                    {current && isRight ? <Check size={14} aria-hidden="true" /> : current && picked ? <X size={14} aria-hidden="true" /> : i + 1}
                  </span>
                  <span>{o.text}</span>
                </button>
              );
            })}
          </div>

          {error && <p role="alert" className="mt-4 text-sm text-red-300">{error}</p>}

          <AnimatePresence>
            {current && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-6">
                <div
                  role="status"
                  className={cn(
                    "rounded-xl border px-4 py-3 text-sm",
                    current.grade.correct ? "border-green-400/40 bg-green-400/10 text-green-100" : "border-red-400/40 bg-red-400/10 text-red-100",
                  )}
                >
                  <strong>{current.timedOut ? "Time's up! " : current.grade.correct ? "Correct! " : "Not quite. "}</strong>
                  {current.grade.explanation}
                </div>
                <button
                  type="button"
                  onClick={next}
                  disabled={loading}
                  className="gl-btn mt-5 inline-flex items-center gap-2 rounded-xl bg-brand-teal px-6 py-3.5 font-semibold text-ink-900 disabled:opacity-70"
                >
                  {loading ? <Loader2 size={18} className="animate-spin" aria-hidden="true" /> : null}
                  {isLast ? "See my score" : "Next question"} <ArrowRight size={18} aria-hidden="true" />
                </button>
                <span className="ml-3 hidden text-xs text-text-faint sm:inline">or press Enter</span>
              </motion.div>
            )}
          </AnimatePresence>
          {!current && <p className="mt-5 hidden text-xs text-text-faint sm:block">Tip: press 1–{q.options.length} to answer</p>}
        </motion.section>
      </AnimatePresence>
    </div>
  );
}
