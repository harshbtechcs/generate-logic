import "server-only";
import { db } from "@/lib/db";
import { TRACKS } from "@/lib/terminal/missions";
import { getDailyStreak } from "@/lib/daily";

export type BadgeIcon = "brain" | "star" | "compass" | "flame" | "calendar" | "crown" | "terminal" | "medal" | "rocket" | "book" | "zap";

export type Badge = {
  id: string;
  name: string;
  description: string;
  icon: BadgeIcon;
  tone: string; // tailwind colour classes when earned
  earned: boolean;
  current: number;
  target: number;
};

/** Badges a learner can earn, with progress towards each. Computed from their own rows only. */
export async function getAchievements(userId: string): Promise<Badge[]> {
  const [attempts, streak, missions, lessons, dailyCorrect] = await Promise.all([
    db.quizAttempt.findMany({ where: { userId }, select: { tool: true, score: true, total: true } }),
    getDailyStreak(userId),
    db.terminalProgress.findMany({ where: { userId }, select: { missionId: true } }),
    db.userProgress.count({ where: { userId, completionStatus: "COMPLETED" } }),
    db.dailyAnswer.count({ where: { userId, isCorrect: true } }),
  ]);

  const perfect = attempts.some((a) => a.total >= 10 && a.score === a.total);
  const goodTools = new Set(attempts.filter((a) => a.tool !== "mix" && a.total && a.score / a.total >= 0.7).map((a) => a.tool)).size;
  const done = new Set(missions.map((m) => m.missionId));
  const tracksDone = TRACKS.filter((t) => t.missions.every((m) => done.has(m.id))).length;

  const b = (id: string, name: string, description: string, icon: BadgeIcon, tone: string, current: number, target: number): Badge => ({
    id,
    name,
    description,
    icon,
    tone,
    current: Math.min(current, target),
    target,
    earned: current >= target,
  });

  return [
    b("first-quiz", "First Quiz", "Finish your first quiz", "brain", "text-brand-teal border-brand-teal/50 bg-brand-teal/10", attempts.length, 1),
    b("perfect-10", "Perfect 10", "Score 10/10 in a quiz", "star", "text-amber-200 border-amber-300/50 bg-amber-300/10", perfect ? 1 : 0, 1),
    b("all-rounder", "All-Rounder", "Score 70%+ in 5 different tools", "compass", "text-cyan-200 border-cyan-400/50 bg-cyan-400/10", goodTools, 5),
    b("streak-3", "On Fire", "Answer the daily challenge 3 days in a row", "flame", "text-orange-200 border-orange-400/50 bg-orange-400/10", streak.best, 3),
    b("streak-7", "Week Warrior", "Keep a 7-day daily streak", "calendar", "text-orange-100 border-orange-400/60 bg-orange-400/15", streak.best, 7),
    b("streak-30", "Unstoppable", "Keep a 30-day daily streak", "crown", "text-amber-100 border-amber-300/60 bg-amber-300/15", streak.best, 30),
    b("sharp", "Sharp Mind", "Get 10 daily challenges right", "zap", "text-yellow-100 border-yellow-300/50 bg-yellow-300/10", dailyCorrect, 10),
    b("hello-terminal", "Hello Terminal", "Finish your first terminal mission", "terminal", "text-green-200 border-green-400/50 bg-green-400/10", done.size, 1),
    b("track-champ", "Track Champion", "Finish every mission in one terminal track", "medal", "text-green-100 border-green-400/60 bg-green-400/15", tracksDone, 1),
    b("command-master", "Command Master", "Finish all terminal tracks", "rocket", "text-emerald-100 border-emerald-400/60 bg-emerald-400/15", tracksDone, TRACKS.length),
    b("binge", "Binge Learner", "Complete 10 lessons", "book", "text-blue-200 border-blue-400/50 bg-blue-400/10", lessons, 10),
  ];
}
