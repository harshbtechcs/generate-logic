import { ThemedBackdrop } from "@/components/motion/AnimatedHeader";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookMarked, BookOpenCheck, Brain, CalendarCheck, CheckCircle2, Flame, GraduationCap, ListVideo, Map as MapIcon, PieChart, PlayCircle, Settings, Shield, SquareTerminal, Target, Trophy } from "lucide-react";
import { requireUser, isAdmin } from "@/lib/session";
import { getUserStats } from "@/lib/stats";
import { getRecentActivity, getUserCourses } from "@/lib/learning";
import { getUserQuizSummary } from "@/lib/quiz/stats";
import { getLeaderboard } from "@/lib/leaderboard";
import { getDailyStreak } from "@/lib/daily";
import { getRoadmap } from "@/lib/roadmap";
import { TRACKS } from "@/lib/terminal/missions";
import { db } from "@/lib/db";
import { THEMES, type ThemeName } from "@/lib/themes";
import { getAchievements } from "@/lib/achievements";
import { LEVEL_TONES, levelFor } from "@/lib/levels";
import { Badges, LevelChip } from "@/components/progress/Badges";
import { CourseCard } from "@/components/dashboard/CourseCard";
import { StatCard } from "@/components/dashboard/StatCard";
import { Reveal } from "@/components/ui/Reveal";
import { Alert } from "@/components/auth/FormBits";

export const metadata: Metadata = { title: "My dashboard" };
// Personal data: never cache this page.
export const dynamic = "force-dynamic";

const timeAgo = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function DashboardPage({ searchParams }: Props) {
  const user = await requireUser("/dashboard");
  const [stats, courses, activity, quiz, board, daily, roadmap, missionsDone] = await Promise.all([
    getUserStats(user.id),
    getUserCourses(user.id),
    getRecentActivity(user.id),
    getUserQuizSummary(user.id),
    getLeaderboard("week", user.id, 3),
    getDailyStreak(user.id),
    getRoadmap(user.id),
    db.terminalProgress.count({ where: { userId: user.id } }),
  ]);
  const badges = await getAchievements(user.id);
  const earned = badges.filter((b) => b.earned).length;
  const totalMissions = TRACKS.reduce((n, t) => n + t.missions.length, 0);
  const me = board.me;
  const lv = levelFor(me?.allTime ?? 0);
  const sp = await searchParams;
  const firstName = user.name.split(" ")[0];

  return (
    <div className="relative isolate mx-auto max-w-site px-5 pb-28 pt-12 sm:px-8">
      <ThemedBackdrop theme={"teal"} />
      {sp.welcome && (
        <div className="mb-8">
          <Alert kind="success">Your account is ready. Welcome to Generate Logic!</Alert>
        </div>
      )}

      <Reveal className="mb-10 flex flex-wrap items-end justify-between gap-6">
        <div className="flex flex-col gap-2">
          <span className="kicker">MY DASHBOARD</span>
          <h1 className="font-display text-[36px] font-bold leading-tight sm:text-[46px]">
            Welcome back, <span className="text-shine">{firstName}!</span>
          </h1>
          <p className="text-lg text-text-muted">Continue your Cloud &amp; DevOps learning journey.</p>
        </div>
        <div className="flex flex-wrap gap-3">
        <Link href="/dashboard/settings" className="gl-btn inline-flex items-center gap-2 rounded-xl border border-slate-400/30 px-5 py-3 font-medium">
          <Settings size={18} aria-hidden="true" /> Settings
        </Link>
        {isAdmin(user) && (
          <Link href="/admin" className="gl-btn inline-flex items-center gap-2 rounded-xl border border-amber-300/40 bg-amber-300/10 px-5 py-3 font-medium text-amber-100">
            <Shield size={18} aria-hidden="true" /> Admin dashboard
          </Link>
        )}
        </div>
      </Reveal>

      <Reveal className="mb-5 flex flex-wrap items-center gap-4 rounded-[18px] border border-amber-300/25 bg-gradient-to-r from-amber-300/[0.08] to-transparent px-5 py-4">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 border-amber-300/70 font-display text-lg font-bold text-amber-100">{lv.level}</span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-display text-lg font-semibold">{lv.name}</span>
            <LevelChip level={lv.level} name={`${me?.allTime ?? 0} XP`} tone={LEVEL_TONES[lv.level - 1]!} />
          </div>
          <div className="mt-2 h-1.5 max-w-md overflow-hidden rounded-full bg-white/[0.08]">
            <div className="h-full rounded-full bg-gradient-to-r from-amber-300 to-orange-400" style={{ width: `${lv.progress}%` }} />
          </div>
          <p className="mt-1 text-xs text-text-faint">{lv.nextName ? `${lv.next! - (me?.allTime ?? 0)} XP to Level ${lv.level + 1} · ${lv.nextName}` : "Highest level reached 👑"}</p>
        </div>
        <a href="#badges" className="text-sm text-amber-200 hover:underline">
          {earned}/{badges.length} badges →
        </a>
      </Reveal>

      <section aria-label="Your progress" className="mb-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <ProgressTile
          href="/daily"
          icon={daily.doneToday ? Flame : CalendarCheck}
          theme="amber"
          title="Daily challenge"
          big={`${daily.streak}`}
          unit="day streak"
          note={daily.doneToday ? "Done for today ✓ — come back tomorrow" : "Today's question is waiting →"}
          highlight={!daily.doneToday}
        />
        <ProgressTile
          href="/leaderboard"
          icon={Trophy}
          theme="orange"
          title="This week"
          big={`${me?.total ?? 0}`}
          unit="XP"
          note={me?.rank ? `Rank #${me.rank} of ${me.ofTotal}${me.toNext ? ` · ${me.toNext} XP to move up` : ""}` : "Earn XP to get ranked"}
        />
        <ProgressTile
          href="/roadmap"
          icon={MapIcon}
          theme="blue"
          title="DevOps roadmap"
          big={`${roadmap.overall}`}
          unit="% complete"
          note={roadmap.next ? `Next up: ${roadmap.next.tech.name}` : "Roadmap complete 🎉"}
          bar={roadmap.overall}
        />
        <ProgressTile
          href="/terminal"
          icon={SquareTerminal}
          theme="green"
          title="Terminal missions"
          big={`${missionsDone}`}
          unit={`/ ${totalMissions}`}
          note={missionsDone >= totalMissions ? "All missions done 🎉" : "Practise real commands →"}
          bar={Math.round((missionsDone / totalMissions) * 100)}
        />
      </section>

      <section aria-label="Your statistics" className="mb-14 grid grid-cols-[repeat(auto-fill,minmax(190px,1fr))] gap-4">
        <StatCard icon={GraduationCap} label="Enrolled learning paths" value={stats.enrollments} />
        <StatCard icon={BookOpenCheck} label="Completed lessons" value={stats.completed} delay={0.05} tone="text-brand-green" />
        <StatCard icon={ListVideo} label="Saved playlists" value={stats.savedPlaylists} delay={0.1} tone="text-blue-300" />
        <StatCard icon={BookMarked} label="Bookmarked notes" value={stats.bookmarkedNotes} delay={0.15} />
        <StatCard icon={Flame} label="Learning streak" value={stats.streak} suffix={stats.streak === 1 ? "day" : "days"} delay={0.2} tone="text-amber-300" />
        <StatCard icon={PieChart} label="Total progress" value={stats.progress} suffix="%" delay={0.25} tone="text-brand-green" />
      </section>

      {courses.inProgress.length > 0 && (
        <section className="mb-14">
          <Reveal as="h2" variant="blur" className="mb-5 font-display text-2xl font-semibold">
            Continue learning
          </Reveal>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-5">
            {courses.inProgress.map((c, i) => (
              <Reveal key={c.playlistId} delay={(i % 3) * 0.08}>
                <CourseCard course={c} />
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {courses.saved.length > 0 && (
        <section className="mb-14">
          <Reveal as="h2" variant="blur" className="mb-5 font-display text-2xl font-semibold">
            My playlists
          </Reveal>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-5">
            {courses.saved.map((c, i) => (
              <Reveal key={c.playlistId} delay={(i % 3) * 0.08}>
                <CourseCard course={c} />
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {courses.finished.length > 0 && (
        <section className="mb-14">
          <Reveal as="h2" variant="blur" className="mb-5 font-display text-2xl font-semibold">
            Completed 🎉
          </Reveal>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-5">
            {courses.finished.map((c, i) => (
              <Reveal key={c.playlistId} delay={(i % 3) * 0.08}>
                <CourseCard course={c} />
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {courses.inProgress.length === 0 && courses.saved.length === 0 && courses.finished.length === 0 && (
        <Reveal className="mb-14 flex flex-wrap items-center justify-between gap-6 rounded-[22px] border border-dashed border-slate-400/30 p-8">
          <div className="flex max-w-xl flex-col gap-2">
            <h2 className="font-display text-2xl font-semibold">Start your first learning path</h2>
            <p className="text-text-muted">
              Open a playlist, watch a lesson and press <strong className="text-text">Mark as complete</strong> — your
              progress, streak and saved playlists will show up here.
            </p>
          </div>
          <Link href="/playlists" className="gl-btn gl-glow rounded-xl bg-brand-teal px-6 py-3.5 font-semibold text-ink-900">
            Browse playlists
          </Link>
        </Reveal>
      )}

      <section className="mb-14">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <Reveal as="h2" variant="blur" className="font-display text-2xl font-semibold">
            Quiz practice
          </Reveal>
          <Link href="/quiz" className="gl-btn inline-flex items-center gap-2 rounded-xl border border-brand-teal/40 bg-brand-teal/10 px-5 py-2.5 text-sm font-medium text-teal-100">
            <Brain size={16} aria-hidden="true" /> Take a quiz
          </Link>
        </div>
        {quiz.taken === 0 ? (
          <Reveal className="rounded-[18px] border border-dashed border-slate-400/30 p-6 text-text-muted">
            No quizzes yet. Pick a tool and answer 10 questions — your scores will show up here.
          </Reveal>
        ) : (
          <>
            <div className="mb-6 grid grid-cols-[repeat(auto-fill,minmax(190px,1fr))] gap-4">
              <StatCard icon={Brain} label="Quizzes taken" value={quiz.taken} />
              <StatCard icon={Target} label="Average score" value={quiz.avg} suffix="%" delay={0.05} tone="text-blue-300" />
              <StatCard
                icon={Trophy}
                label={quiz.strongest ? `Strongest: ${quiz.strongest.name}` : "Strongest tool"}
                value={quiz.strongest ? quiz.strongest.bestPercent : 0}
                suffix="%"
                delay={0.1}
                tone="text-amber-300"
              />
            </div>
            <div className="grid gap-5 md:grid-cols-2">
              <Reveal className="rounded-[18px] border border-slate-400/15 p-5">
                <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.1em] text-text-faint">Best score by tool</h3>
                <ul className="flex flex-col gap-3">
                  {quiz.bests.map((b) => (
                    <li key={b.tool}>
                      <div className="mb-1 flex justify-between text-sm">
                        <Link href={`/quiz/${b.tool}`} className="hover:text-brand-teal">
                          {b.name}
                        </Link>
                        <span className="font-mono text-text-faint">
                          {b.bestPercent}% · {b.attempts} {b.attempts === 1 ? "try" : "tries"}
                        </span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                        <div className="h-full rounded-full bg-gradient-to-r from-brand-green via-brand-cyan to-brand-blue" style={{ width: `${b.bestPercent}%` }} />
                      </div>
                    </li>
                  ))}
                </ul>
              </Reveal>
              <Reveal delay={0.05} className="rounded-[18px] border border-slate-400/15 p-5">
                <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.1em] text-text-faint">Recent quizzes</h3>
                <ul className="flex flex-col divide-y divide-slate-400/10">
                  {quiz.recent.map((r) => (
                    <li key={r.id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                      <span>{r.name}</span>
                      <span className="flex items-center gap-3">
                        <span className={r.percent >= 70 ? "font-mono text-green-300" : r.percent >= 50 ? "font-mono text-amber-200" : "font-mono text-red-300"}>
                          {r.score}/{r.total}
                        </span>
                        <time dateTime={r.createdAt.toISOString()} className="font-mono text-xs text-text-faint">
                          {timeAgo.format(r.createdAt)}
                        </time>
                      </span>
                    </li>
                  ))}
                </ul>
              </Reveal>
            </div>
          </>
        )}
      </section>

      <section id="badges" className="mb-14 scroll-mt-24">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <Reveal as="h2" variant="blur" className="font-display text-2xl font-semibold">
            Badges
          </Reveal>
          <span className="font-mono text-sm text-text-faint">
            {earned}/{badges.length} earned
          </span>
        </div>
        <Badges badges={badges} />
      </section>

      <section>
        <Reveal as="h2" variant="blur" className="mb-5 font-display text-2xl font-semibold">
          Recent activity
        </Reveal>
        {activity.length === 0 ? (
          <Reveal className="rounded-[18px] border border-slate-400/15 p-6 text-text-muted">Nothing yet — your learning history will appear here.</Reveal>
        ) : (
          <Reveal as="div" className="overflow-hidden rounded-[18px] border border-slate-400/15">
            <ul>
              {activity.map((a) => (
                <li key={a.id} className="flex items-center gap-4 border-b border-slate-400/10 px-5 py-3.5 last:border-b-0">
                  {a.type === "Completed" ? (
                    <CheckCircle2 size={18} className="shrink-0 text-brand-green" aria-hidden="true" />
                  ) : (
                    <PlayCircle size={18} className="shrink-0 text-brand-cyan" aria-hidden="true" />
                  )}
                  <span className="min-w-0 flex-1 text-sm">
                    <span className="text-text-faint">{a.type} · </span>
                    {a.href ? (
                      <Link href={a.href} className="hover:text-brand-teal">
                        {a.label}
                      </Link>
                    ) : (
                      a.label
                    )}
                  </span>
                  <time dateTime={a.at.toISOString()} className="shrink-0 font-mono text-xs text-text-faint">
                    {timeAgo.format(a.at)}
                  </time>
                </li>
              ))}
            </ul>
          </Reveal>
        )}
      </section>
    </div>
  );
}

function ProgressTile({
  href,
  icon: Icon,
  theme,
  title,
  big,
  unit,
  note,
  bar,
  highlight,
}: {
  href: string;
  icon: typeof Flame;
  theme: ThemeName;
  title: string;
  big: string;
  unit: string;
  note: string;
  bar?: number;
  highlight?: boolean;
}) {
  const t = THEMES[theme];
  return (
    <Reveal>
      <Link
        href={href}
        className={`gl-card group relative flex h-full flex-col gap-3 overflow-hidden rounded-[22px] p-5 text-white ring-1 ring-white/10 shadow-[0_24px_50px_-28px_rgba(0,0,0,0.9)] ${highlight ? "ring-2 ring-amber-200/70" : ""}`}
        style={{ background: `linear-gradient(155deg, ${t.bg[1]} 0%, ${t.bg[0]} 90%)` }}
      >
        <span aria-hidden="true" className="pointer-events-none absolute -bottom-5 -right-1 select-none font-display text-[88px] font-black leading-none text-white/[0.1]">
          {big}
        </span>
        <span className="relative flex items-center justify-between">
          <span className="flex items-center gap-2 text-sm font-semibold">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/15" style={{ color: t.accent[0] }}>
              <Icon size={17} className="gl-ico" aria-hidden="true" />
            </span>
            {title}
          </span>
          <ArrowRight size={16} className="opacity-70 transition-transform group-hover:translate-x-1" aria-hidden="true" />
        </span>
        <span className="relative flex items-baseline gap-1.5">
          <span className="font-display text-[40px] font-black leading-none">{big}</span>
          <span className="text-sm text-white/70">{unit}</span>
        </span>
        {bar !== undefined && (
          <span className="relative block h-1.5 overflow-hidden rounded-full bg-black/25">
            <span className="block h-full rounded-full" style={{ width: `${bar}%`, background: t.accent[0] }} />
          </span>
        )}
        <span className="relative text-sm text-white/80">{note}</span>
      </Link>
    </Reveal>
  );
}
