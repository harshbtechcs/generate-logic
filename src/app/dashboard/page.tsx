import type { Metadata } from "next";
import Link from "next/link";
import { BookMarked, BookOpenCheck, Flame, GraduationCap, ListVideo, PieChart, Shield } from "lucide-react";
import { requireUser, isAdmin } from "@/lib/session";
import { getUserStats } from "@/lib/stats";
import { StatCard } from "@/components/dashboard/StatCard";
import { Reveal } from "@/components/ui/Reveal";
import { Alert } from "@/components/auth/FormBits";

export const metadata: Metadata = { title: "My dashboard" };
// Personal data: never cache this page.
export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function DashboardPage({ searchParams }: Props) {
  const user = await requireUser("/dashboard");
  const stats = await getUserStats(user.id);
  const sp = await searchParams;
  const firstName = user.name.split(" ")[0];

  return (
    <div className="mx-auto max-w-site px-5 pb-28 pt-12 sm:px-8">
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
        {isAdmin(user) && (
          <Link href="/admin" className="gl-btn inline-flex items-center gap-2 rounded-xl border border-amber-300/40 bg-amber-300/10 px-5 py-3 font-medium text-amber-100">
            <Shield size={18} aria-hidden="true" /> Admin dashboard
          </Link>
        )}
      </Reveal>

      <section aria-label="Your statistics" className="mb-14 grid grid-cols-[repeat(auto-fill,minmax(190px,1fr))] gap-4">
        <StatCard icon={GraduationCap} label="Enrolled learning paths" value={stats.enrollments} />
        <StatCard icon={BookOpenCheck} label="Completed lessons" value={stats.completed} delay={0.05} tone="text-brand-green" />
        <StatCard icon={ListVideo} label="Saved playlists" value={stats.savedPlaylists} delay={0.1} tone="text-blue-300" />
        <StatCard icon={BookMarked} label="Bookmarked notes" value={stats.bookmarkedNotes} delay={0.15} />
        <StatCard icon={Flame} label="Learning streak" value={stats.streak} suffix={stats.streak === 1 ? "day" : "days"} delay={0.2} tone="text-amber-300" />
        <StatCard icon={PieChart} label="Total progress" value={stats.progress} suffix="%" delay={0.25} tone="text-brand-green" />
      </section>

      <Reveal className="flex flex-wrap items-center justify-between gap-6 rounded-[22px] border border-dashed border-slate-400/30 p-8">
        <div className="flex max-w-xl flex-col gap-2">
          <h2 className="font-display text-2xl font-semibold">Start your first learning path</h2>
          <p className="text-text-muted">
            Pick a technology, watch the playlist and mark lessons complete — your progress, streak and bookmarks will
            show up here.
          </p>
        </div>
        <Link href="/#paths" className="gl-btn gl-glow rounded-xl bg-brand-teal px-6 py-3.5 font-semibold text-ink-900">
          Explore learning paths
        </Link>
      </Reveal>
    </div>
  );
}
