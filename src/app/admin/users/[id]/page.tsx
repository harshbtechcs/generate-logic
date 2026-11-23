import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Check, CheckCircle2, X } from "lucide-react";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/session";
import { getActivityFeed } from "@/lib/admin-activity";
import { getLeaderboard } from "@/lib/leaderboard";
import { getDailyStreak } from "@/lib/daily";
import { QUESTION_BY_ID } from "@/lib/quiz/bank";
import { optionText } from "@/lib/quiz/engine";
import { techBySlug } from "@/lib/data";
import { TRACKS } from "@/lib/terminal/missions";
import { ActivityFeed } from "@/components/admin/ActivityFeed";
import { cn } from "@/lib/cn";
import { ResetPlaylistButton, RestrictButton, UndoLessonButton } from "@/components/admin/AdminButtons";

export const metadata: Metadata = { title: "User · Admin", robots: { index: false } };
export const dynamic = "force-dynamic";

const dateFmt = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric" });
const dateTimeFmt = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

type Props = { params: Promise<{ id: string }> };

export default async function AdminUserPage({ params }: Props) {
  const admin = await requireAdmin();
  const { id } = await params;

  const user = await db.user.findUnique({
    where: { id },
    select: {
      id: true,
      fullName: true,
      email: true,
      role: true,
      emailVerified: true,
      accountStatus: true,
      createdAt: true,
      accounts: { select: { providerId: true } },
      sessions: { select: { updatedAt: true }, orderBy: { updatedAt: "desc" }, take: 1 },
    },
  });
  if (!user) notFound();

  // Completed lessons grouped by playlist
  const progress = await db.userProgress.findMany({
    where: { userId: user.id, completionStatus: "COMPLETED" },
    orderBy: { completedAt: "desc" },
    select: {
      completedAt: true,
      lesson: {
        select: {
          id: true,
          title: true,
          sequenceNumber: true,
          playlist: { select: { id: true, title: true, _count: { select: { lessons: true } } } },
        },
      },
    },
  });
  const byPlaylist = new Map<string, { title: string; total: number; lessons: typeof progress }>();
  for (const p of progress) {
    const pl = p.lesson.playlist;
    const entry = byPlaylist.get(pl.id) ?? { title: pl.title, total: pl._count.lessons, lessons: [] };
    entry.lessons.push(p);
    byPlaylist.set(pl.id, entry);
  }

  const [attempts, dailyAnswers, missionRows, weekBoard, allBoard, streak, feed] = await Promise.all([
    db.quizAttempt.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 50,
      select: { id: true, tool: true, score: true, total: true, durationSec: true, createdAt: true, answers: { select: { id: true, questionId: true, selectedOption: true, isCorrect: true } } },
    }),
    db.dailyAnswer.findMany({ where: { userId: user.id }, orderBy: { day: "desc" }, take: 60 }),
    db.terminalProgress.findMany({ where: { userId: user.id }, select: { missionId: true, completedAt: true } }),
    getLeaderboard("week", user.id, 0),
    getLeaderboard("all", user.id, 0),
    getDailyStreak(user.id),
    getActivityFeed({ userId: user.id, limit: 60 }),
  ]);
  const quizCount = await db.quizAttempt.count({ where: { userId: user.id } });
  const avgQuiz = attempts.length ? Math.round((attempts.reduce((a, x) => a + (x.total ? x.score / x.total : 0), 0) / attempts.length) * 100) : 0;
  const missionAt = new Map(missionRows.map((m) => [m.missionId, m.completedAt]));
  const toolName = (slug: string) => (slug === "mix" ? "DevOps Mix" : techBySlug[slug]?.name ?? slug);

  const providers = [...new Set(user.accounts.map((a) => (a.providerId === "credential" ? "Email" : a.providerId === "google" ? "Google" : a.providerId)))];
  const isSelf = user.id === admin.id;
  const restricted = user.accountStatus === "DISABLED";

  return (
    <div className="mx-auto max-w-4xl px-5 pb-28 pt-10 sm:px-8">
      <Link href="/admin/users" className="mb-6 inline-flex items-center gap-2 text-sm text-text-muted hover:text-brand-teal">
        <ArrowLeft size={16} aria-hidden="true" /> All users
      </Link>

      <section className="mb-8 rounded-[20px] border border-slate-400/15 bg-white/[0.03] p-6 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="font-display text-[30px] font-bold leading-tight">{user.fullName}</h1>
            <p className="text-text-muted">{user.email}</p>
          </div>
          <span
            className={
              restricted
                ? "rounded-full border border-red-400/50 bg-red-400/10 px-3 py-1 text-sm text-red-200"
                : "rounded-full border border-green-400/40 bg-green-400/10 px-3 py-1 text-sm text-green-200"
            }
          >
            {restricted ? "Restricted" : "Active"}
          </span>
        </div>

        <dl className="mt-6 grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-4 text-sm">
          <div>
            <dt className="text-text-faint">Role</dt>
            <dd>{user.role === "ADMIN" ? "Admin" : "Student"}</dd>
          </div>
          <div>
            <dt className="text-text-faint">Sign-in</dt>
            <dd>{providers.join(", ") || "—"}</dd>
          </div>
          <div>
            <dt className="text-text-faint">Email verified</dt>
            <dd>{user.emailVerified ? "Yes" : "No"}</dd>
          </div>
          <div>
            <dt className="text-text-faint">Joined</dt>
            <dd>{dateFmt.format(user.createdAt)}</dd>
          </div>
          <div>
            <dt className="text-text-faint">Last active</dt>
            <dd>{user.sessions[0] ? dateTimeFmt.format(user.sessions[0].updatedAt) : "—"}</dd>
          </div>
          <div>
            <dt className="text-text-faint">Lessons completed</dt>
            <dd>{progress.length}</dd>
          </div>
          <div>
            <dt className="text-text-faint">Quizzes taken</dt>
            <dd>
              {quizCount}
              {attempts.length > 0 && <span className="text-text-faint"> · avg {avgQuiz}%</span>}
            </dd>
          </div>
          <div>
            <dt className="text-text-faint">Daily streak</dt>
            <dd>
              {streak.streak} days <span className="text-text-faint">· best {streak.best}</span>
            </dd>
          </div>
          <div>
            <dt className="text-text-faint">Terminal missions</dt>
            <dd>{missionRows.length}</dd>
          </div>
          <div>
            <dt className="text-text-faint">XP this week</dt>
            <dd>
              {weekBoard.me?.total ?? 0}
              {weekBoard.me?.rank && <span className="text-text-faint"> · #{weekBoard.me.rank}</span>}
            </dd>
          </div>
          <div>
            <dt className="text-text-faint">XP all time</dt>
            <dd>
              {allBoard.me?.total ?? 0}
              {allBoard.me?.rank && <span className="text-text-faint"> · #{allBoard.me.rank}</span>}
            </dd>
          </div>
          <div>
            <dt className="text-text-faint">On leaderboard</dt>
            <dd>{allBoard.me?.visible === false ? "Hidden" : "Visible"}</dd>
          </div>
        </dl>

        {!isSelf && user.role !== "ADMIN" && (
          <div className="mt-6 border-t border-slate-400/10 pt-6">
            <p className="mb-3 text-sm text-text-muted">
              {restricted
                ? "This account can't sign in. Restoring access lets them sign in again."
                : "Restricting signs this person out on every device and blocks future sign-ins (email and Google)."}
            </p>
            <RestrictButton userId={user.id} disabled={restricted} />
          </div>
        )}
      </section>

      <section className="mb-10">
        <h2 className="mb-4 font-display text-2xl font-semibold">Quiz attempts</h2>
        {attempts.length === 0 ? (
          <p className="rounded-[18px] border border-slate-400/15 p-6 text-text-muted">No quizzes taken.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {attempts.map((a) => {
              const pct = a.total ? Math.round((a.score / a.total) * 100) : 0;
              return (
                <details key={a.id} id={`attempt-${a.id}`} className="group scroll-mt-24 overflow-hidden rounded-[16px] border border-slate-400/15">
                  <summary className="flex cursor-pointer list-none flex-wrap items-center gap-3 bg-white/[0.03] px-5 py-3 hover:bg-white/[0.05]">
                    <span className="font-medium">{toolName(a.tool)}</span>
                    <span className={cn("font-mono text-sm", pct >= 70 ? "text-green-300" : pct >= 50 ? "text-amber-200" : "text-red-300")}>
                      {a.score}/{a.total} ({pct}%)
                    </span>
                    <span className="font-mono text-xs text-text-faint">
                      {Math.floor(a.durationSec / 60)}m {a.durationSec % 60}s
                    </span>
                    <span className="ml-auto font-mono text-xs text-text-faint">{dateTimeFmt.format(a.createdAt)}</span>
                    <span className="text-xs text-brand-teal group-open:hidden">Show answers ▾</span>
                    <span className="hidden text-xs text-brand-teal group-open:inline">Hide ▴</span>
                  </summary>
                  <ol className="divide-y divide-slate-400/10">
                    {a.answers.map((ans, i) => {
                      const q = QUESTION_BY_ID.get(ans.questionId);
                      const picked = optionText(ans.questionId, ans.selectedOption);
                      return (
                        <li key={ans.id} className="flex gap-3 px-5 py-3 text-sm">
                          {ans.isCorrect ? <Check size={16} className="mt-0.5 shrink-0 text-green-300" aria-label="Correct" /> : <X size={16} className="mt-0.5 shrink-0 text-red-300" aria-label="Wrong" />}
                          <div className="min-w-0">
                            <div>
                              <span className="font-mono text-xs text-text-faint">{i + 1}. </span>
                              {q?.question ?? ans.questionId}
                            </div>
                            <div className={cn("text-xs", ans.isCorrect ? "text-green-200" : "text-red-200")}>Answered: {picked ?? (ans.selectedOption ? "unknown option" : "no answer (time ran out)")}</div>
                            {!ans.isCorrect && q && <div className="text-xs text-text-faint">Correct: {q.options[0]}</div>}
                          </div>
                        </li>
                      );
                    })}
                  </ol>
                </details>
              );
            })}
            {quizCount > attempts.length && <p className="text-xs text-text-faint">Showing the latest {attempts.length} of {quizCount} quizzes.</p>}
          </div>
        )}
      </section>

      <section className="mb-10 grid gap-6 md:grid-cols-2">
        <div>
          <h2 className="mb-4 font-display text-2xl font-semibold">Daily challenge</h2>
          {dailyAnswers.length === 0 ? (
            <p className="rounded-[18px] border border-slate-400/15 p-6 text-text-muted">No daily answers.</p>
          ) : (
            <ul className="overflow-hidden rounded-[16px] border border-slate-400/15">
              {dailyAnswers.map((d) => {
                const q = QUESTION_BY_ID.get(d.questionId);
                const picked = optionText(d.questionId, d.selectedOption);
                return (
                  <li key={d.id} className="flex gap-3 border-b border-slate-400/10 px-4 py-3 text-sm last:border-b-0">
                    {d.isCorrect ? <Check size={16} className="mt-0.5 shrink-0 text-green-300" aria-label="Correct" /> : <X size={16} className="mt-0.5 shrink-0 text-red-300" aria-label="Wrong" />}
                    <div className="min-w-0">
                      <div className="font-mono text-xs text-text-faint">{d.day}</div>
                      <div>{q?.question ?? d.questionId}</div>
                      <div className={cn("text-xs", d.isCorrect ? "text-green-200" : "text-red-200")}>Answered: {picked ?? "no answer"}</div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
        <div>
          <h2 className="mb-4 font-display text-2xl font-semibold">Terminal missions</h2>
          <div className="flex flex-col gap-3">
            {TRACKS.map((t) => {
              const n = t.missions.filter((m) => missionAt.has(m.id)).length;
              return (
                <div key={t.tool} className="rounded-[16px] border border-slate-400/15 px-4 py-3">
                  <div className="mb-2 flex justify-between text-sm">
                    <span className="font-medium">{t.name}</span>
                    <span className="font-mono text-text-faint">
                      {n}/{t.missions.length}
                    </span>
                  </div>
                  <ul className="flex flex-wrap gap-1.5">
                    {t.missions.map((m) => {
                      const at = missionAt.get(m.id);
                      return (
                        <li
                          key={m.id}
                          title={at ? `${m.title} — ${dateTimeFmt.format(at)}` : m.title}
                          className={cn("rounded-md border px-2 py-0.5 text-[11px]", at ? "border-green-400/40 bg-green-400/10 text-green-100" : "border-slate-400/15 text-text-faint")}
                        >
                          {m.title}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="mb-10">
        <h2 className="mb-4 font-display text-2xl font-semibold">Learning progress</h2>
        {byPlaylist.size === 0 ? (
          <p className="rounded-[18px] border border-slate-400/15 p-6 text-text-muted">No lessons marked complete.</p>
        ) : (
          <div className="flex flex-col gap-5">
            {[...byPlaylist.entries()].map(([playlistId, pl]) => (
              <div key={playlistId} className="overflow-hidden rounded-[18px] border border-slate-400/15">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-400/10 bg-white/[0.03] px-5 py-3">
                  <div>
                    <h3 className="font-medium">{pl.title}</h3>
                    <p className="text-xs text-text-faint">
                      {pl.lessons.length} of {pl.total} lessons completed
                    </p>
                  </div>
                  <ResetPlaylistButton userId={user.id} playlistId={playlistId} />
                </div>
                <ul>
                  {pl.lessons.map((p) => (
                    <li key={p.lesson.id} className="flex flex-wrap items-center gap-3 border-b border-slate-400/10 px-5 py-3 last:border-b-0">
                      <CheckCircle2 size={16} className="shrink-0 text-brand-green" aria-hidden="true" />
                      <span className="min-w-0 flex-1 text-sm">
                        <span className="font-mono text-xs text-text-faint">{String(p.lesson.sequenceNumber).padStart(2, "0")} · </span>
                        {p.lesson.title}
                      </span>
                      {p.completedAt && <span className="font-mono text-xs text-text-faint">{dateTimeFmt.format(p.completedAt)}</span>}
                      <UndoLessonButton userId={user.id} lessonId={p.lesson.id} />
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </section>
      <section className="mt-10">
        <h2 className="mb-4 font-display text-2xl font-semibold">Activity timeline</h2>
        <ActivityFeed events={feed} showUser={false} />
      </section>
    </div>
  );
}
