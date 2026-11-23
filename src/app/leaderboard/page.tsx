import type { Metadata } from "next";
import Link from "next/link";
import { Brain, CalendarCheck, Crown, EyeOff, ListVideo, Medal, SquareTerminal, Trophy } from "lucide-react";
import { getSession } from "@/lib/session";
import { getLeaderboard, XP, type Range } from "@/lib/leaderboard";
import { PageHeader } from "@/components/ui/PageHeader";
import { Reveal } from "@/components/ui/Reveal";
import { cn } from "@/lib/cn";
import { LEVEL_TONES, levelFor } from "@/lib/levels";
import { LevelChip } from "@/components/progress/Badges";

export const metadata: Metadata = {
  title: "Leaderboard",
  description: "Top Generate Logic learners this week and of all time — earn XP from quizzes, the daily challenge, lessons and terminal missions.",
};
export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

const podium = ["from-amber-300/30 border-amber-300/50 text-amber-100", "from-slate-300/25 border-slate-300/40 text-slate-100", "from-orange-400/25 border-orange-400/40 text-orange-100"];

function Bar({ label, value, total, icon: Icon, tone }: { label: string; value: number; total: number; icon: typeof Brain; tone: string }) {
  const pct = total ? Math.round((value / total) * 100) : 0;
  return (
    <li>
      <div className="mb-1 flex items-center justify-between text-sm">
        <span className="flex items-center gap-2 text-text-muted">
          <Icon size={15} className={tone} aria-hidden="true" /> {label}
        </span>
        <span className="font-mono">{value} XP</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
        <div className="h-full rounded-full bg-gradient-to-r from-brand-green via-brand-cyan to-brand-blue" style={{ width: `${pct}%` }} />
      </div>
    </li>
  );
}

export default async function LeaderboardPage({ searchParams }: Props) {
  const sp = await searchParams;
  const range: Range = sp.range === "all" ? "all" : "week";
  const session = await getSession();
  const { top, me, learners } = await getLeaderboard(range, session?.user.id ?? null);

  return (
    <>
      <PageHeader kicker="LEADERBOARD" title="Top learners" intro="Earn XP by practising. The weekly board resets every Monday (India time) — everyone gets a fresh chance." />
      <section className="mx-auto grid max-w-site gap-6 px-5 pb-28 sm:px-8 lg:grid-cols-[1fr_340px]">
        <div className="min-w-0">
          <div role="tablist" aria-label="Period" className="mb-6 inline-flex rounded-xl border border-slate-400/20 p-1">
            {(["week", "all"] as const).map((r) => (
              <Link
                key={r}
                role="tab"
                aria-selected={range === r}
                href={r === "week" ? "/leaderboard" : "/leaderboard?range=all"}
                className={cn("rounded-lg px-4 py-2 text-sm font-medium", range === r ? "bg-brand-teal text-ink-900" : "text-text-muted hover:text-text")}
              >
                {r === "week" ? "This week" : "All time"}
              </Link>
            ))}
          </div>

          {top.length === 0 ? (
            <Reveal className="rounded-[20px] border border-dashed border-slate-400/30 p-10 text-center text-text-muted">
              No XP yet {range === "week" ? "this week" : ""} — be the first! Answer the{" "}
              <Link href="/daily" className="text-brand-teal hover:underline">
                daily challenge
              </Link>{" "}
              or take a{" "}
              <Link href="/quiz" className="text-brand-teal hover:underline">
                quiz
              </Link>
              .
            </Reveal>
          ) : (
            <>
              <div className="mb-6 grid gap-3 sm:grid-cols-3">
                {top.slice(0, 3).map((e, i) => (
                  <Reveal
                    key={e.id}
                    delay={i * 0.08}
                    className={cn(
                      "flex flex-col items-center gap-2 rounded-[20px] border bg-gradient-to-b to-transparent p-5 text-center",
                      podium[e.rank - 1] ?? podium[2],
                      e.id === session?.user.id && "ring-2 ring-brand-teal/60",
                    )}
                  >
                    {e.rank === 1 ? <Crown size={26} aria-hidden="true" /> : <Medal size={24} aria-hidden="true" />}
                    <span className="flex h-14 w-14 items-center justify-center rounded-full border border-current bg-ink-900/60 font-display text-lg font-bold">{e.initials}</span>
                    <span className="font-semibold text-text">{e.name}</span>
                    {(() => {
                      const lv = levelFor(e.allTime);
                      return <LevelChip level={lv.level} name={lv.name} tone={LEVEL_TONES[lv.level - 1]!} />;
                    })()}
                    <span className="font-mono text-sm">
                      #{e.rank} · {e.total} XP
                    </span>
                  </Reveal>
                ))}
              </div>
              <Reveal as="div" className="overflow-hidden rounded-[18px] border border-slate-400/15">
                <table className="w-full text-sm">
                  <thead className="bg-white/[0.03] text-left text-xs uppercase tracking-[0.08em] text-text-faint">
                    <tr>
                      <th scope="col" className="px-4 py-3">Rank</th>
                      <th scope="col" className="px-4 py-3">Learner</th>
                      <th scope="col" className="hidden px-4 py-3 text-right md:table-cell">Quiz</th>
                      <th scope="col" className="hidden px-4 py-3 text-right md:table-cell">Daily</th>
                      <th scope="col" className="hidden px-4 py-3 text-right md:table-cell">Lessons</th>
                      <th scope="col" className="hidden px-4 py-3 text-right md:table-cell">Terminal</th>
                      <th scope="col" className="px-4 py-3 text-right">XP</th>
                    </tr>
                  </thead>
                  <tbody>
                    {top.map((e) => {
                      const isMe = e.id === session?.user.id;
                      return (
                        <tr key={e.id} className={cn("border-t border-slate-400/10", isMe && "bg-brand-teal/[0.08]")}>
                          <td className="px-4 py-3 font-mono text-text-faint">#{e.rank}</td>
                          <td className="px-4 py-3">
                            <span className="flex items-center gap-3">
                              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-slate-400/30 text-xs font-semibold">{e.initials}</span>
                              <span className="font-medium">
                                {e.name}
                                {isMe && <span className="ml-2 rounded-full bg-brand-teal/20 px-2 py-0.5 text-[11px] text-teal-100">You</span>}
                                <span className="ml-2 hidden sm:inline">
                                  {(() => {
                                    const lv = levelFor(e.allTime);
                                    return <LevelChip level={lv.level} name={lv.name} tone={LEVEL_TONES[lv.level - 1]!} />;
                                  })()}
                                </span>
                              </span>
                            </span>
                          </td>
                          <td className="hidden px-4 py-3 text-right font-mono text-text-muted md:table-cell">{e.quiz}</td>
                          <td className="hidden px-4 py-3 text-right font-mono text-text-muted md:table-cell">{e.daily}</td>
                          <td className="hidden px-4 py-3 text-right font-mono text-text-muted md:table-cell">{e.lessons}</td>
                          <td className="hidden px-4 py-3 text-right font-mono text-text-muted md:table-cell">{e.terminal}</td>
                          <td className="px-4 py-3 text-right font-mono font-semibold text-brand-teal">{e.total}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </Reveal>
              <p className="mt-3 text-xs text-text-faint">
                Showing the top {top.length} of {learners} learner{learners === 1 ? "" : "s"}. Only first names and last initials are shown.
              </p>
            </>
          )}
        </div>

        <aside className="flex flex-col gap-4">
          {me ? (
            <Reveal className="rounded-[20px] border border-brand-teal/30 bg-brand-teal/[0.05] p-6">
              <span className="kicker">YOUR PROGRESS</span>
              <div className="mt-3 flex items-end justify-between gap-3">
                <div>
                  <div className="font-display text-4xl font-bold leading-none">{me.total}</div>
                  <div className="mt-1 text-sm text-text-faint">XP {range === "week" ? "this week" : "all time"}</div>
                </div>
                <div className="text-right">
                  <div className="font-display text-3xl font-bold leading-none text-amber-300">{me.rank ? `#${me.rank}` : "–"}</div>
                  <div className="mt-1 text-sm text-text-faint">{me.rank ? `of ${me.ofTotal}` : "not ranked yet"}</div>
                </div>
              </div>
              {(() => {
                const lv = levelFor(me.allTime);
                return (
                  <div className="mt-5 rounded-xl border border-slate-400/15 bg-ink-900/40 p-3">
                    <div className="mb-1.5 flex items-center justify-between text-sm">
                      <LevelChip level={lv.level} name={lv.name} tone={LEVEL_TONES[lv.level - 1]!} />
                      <span className="font-mono text-xs text-text-faint">{lv.next ? `${me.allTime}/${lv.next} XP` : "Max level"}</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                      <div className="h-full rounded-full bg-gradient-to-r from-amber-300 to-orange-400" style={{ width: `${lv.progress}%` }} />
                    </div>
                    {lv.nextName && <p className="mt-1.5 text-xs text-text-faint">{lv.next! - me.allTime} XP to {lv.nextName}</p>}
                  </div>
                );
              })()}
              {me.toNext !== null && me.rank !== 1 && (
                <p className="mt-4 rounded-lg bg-white/[0.04] px-3 py-2 text-sm">
                  <strong className="text-brand-teal">{me.toNext} XP</strong> more to move up a place.
                </p>
              )}
              {me.rank === 1 && <p className="mt-4 rounded-lg bg-amber-300/10 px-3 py-2 text-sm text-amber-100">You&apos;re number one — keep it up! 👑</p>}
              {!me.visible && (
                <p className="mt-4 flex items-start gap-2 text-xs text-text-faint">
                  <EyeOff size={14} className="mt-0.5 shrink-0" aria-hidden="true" /> You&apos;re hidden from the public board. Change it in{" "}
                  <Link href="/dashboard/settings" className="text-brand-teal hover:underline">
                    settings
                  </Link>
                  .
                </p>
              )}
              <ul className="mt-5 flex flex-col gap-3">
                <Bar label="Quiz" value={me.quiz} total={me.total} icon={Brain} tone="text-brand-teal" />
                <Bar label="Daily challenge" value={me.daily} total={me.total} icon={CalendarCheck} tone="text-amber-300" />
                <Bar label="Lessons" value={me.lessons} total={me.total} icon={ListVideo} tone="text-blue-300" />
                <Bar label="Terminal" value={me.terminal} total={me.total} icon={SquareTerminal} tone="text-brand-green" />
              </ul>
            </Reveal>
          ) : (
            <Reveal className="rounded-[20px] border border-brand-teal/30 bg-brand-teal/[0.05] p-6 text-sm">
              <Trophy size={24} className="mb-3 text-amber-300" aria-hidden="true" />
              <p className="mb-4 text-text-muted">Sign in to earn XP, see your rank and track your progress.</p>
              <Link href="/sign-in?next=/leaderboard" className="gl-btn inline-block rounded-lg bg-brand-teal px-4 py-2 font-semibold text-ink-900">
                Sign in
              </Link>
            </Reveal>
          )}

          <Reveal delay={0.05} className="rounded-[18px] border border-slate-400/15 p-5 text-sm">
            <h2 className="mb-3 font-semibold">How to earn XP</h2>
            <ul className="flex flex-col gap-2 text-text-muted">
              <li className="flex justify-between gap-3"><Link href="/daily" className="hover:text-brand-teal">Daily challenge (right / wrong)</Link><span className="font-mono">+{XP.dailyCorrect} / +{XP.dailyTried}</span></li>
              <li className="flex justify-between gap-3"><Link href="/quiz" className="hover:text-brand-teal">Each new quiz question you get right</Link><span className="font-mono">+{XP.quizQuestion}</span></li>
              <li className="flex justify-between gap-3"><Link href="/playlists" className="hover:text-brand-teal">Each lesson you complete</Link><span className="font-mono">+{XP.lesson}</span></li>
              <li className="flex justify-between gap-3"><Link href="/terminal" className="hover:text-brand-teal">Each terminal mission</Link><span className="font-mono">+{XP.mission}</span></li>
            </ul>
            <p className="mt-3 text-xs text-text-faint">Quiz XP counts each question once per period, so learning new topics beats repeating the same quiz.</p>
          </Reveal>
        </aside>
      </section>
    </>
  );
}
