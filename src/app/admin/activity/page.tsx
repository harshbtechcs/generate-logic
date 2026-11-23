import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requireAdmin } from "@/lib/session";
import { EVENT_LABELS, getActivityFeed, type EventKind } from "@/lib/admin-activity";
import { ActivityFeed } from "@/components/admin/ActivityFeed";
import { cn } from "@/lib/cn";

export const metadata: Metadata = { title: "Activity · Admin", robots: { index: false } };
export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };
const KINDS = Object.keys(EVENT_LABELS) as EventKind[];
const PAGE = 100;

export default async function AdminActivityPage({ searchParams }: Props) {
  await requireAdmin();
  const sp = await searchParams;
  const kind = KINDS.find((k) => k === sp.type);
  const beforeRaw = typeof sp.before === "string" ? Date.parse(sp.before) : NaN;
  const before = Number.isFinite(beforeRaw) ? new Date(beforeRaw) : undefined;
  const events = await getActivityFeed({ kinds: kind ? [kind] : undefined, before, limit: PAGE });
  const qs = (extra: Record<string, string | undefined>) => {
    const p = new URLSearchParams();
    for (const [k, v] of Object.entries({ type: kind, ...extra })) if (v) p.set(k, v);
    const s = p.toString();
    return s ? `/admin/activity?${s}` : "/admin/activity";
  };

  return (
    <div className="mx-auto max-w-4xl px-5 pb-28 pt-10 sm:px-8">
      <Link href="/admin" className="mb-6 inline-flex items-center gap-2 text-sm text-text-muted hover:text-brand-teal">
        <ArrowLeft size={16} aria-hidden="true" /> Admin overview
      </Link>
      <span className="font-mono text-[13px] tracking-[0.16em] text-amber-300">ADMIN</span>
      <h1 className="mb-2 mt-1 font-display text-[34px] font-bold">All activity</h1>
      <p className="mb-6 text-text-muted">Everything learners do on the site, newest first (India time).</p>

      <nav aria-label="Filter" className="mb-8 flex flex-wrap gap-2">
        {[undefined, ...KINDS].map((k) => (
          <Link
            key={k ?? "all"}
            href={k ? `/admin/activity?type=${k}` : "/admin/activity"}
            className={cn("rounded-full border px-3.5 py-1.5 text-sm", k === kind ? "border-brand-teal bg-brand-teal/15 text-teal-50" : "border-slate-400/20 text-text-muted hover:text-text")}
          >
            {k ? EVENT_LABELS[k] : "Everything"}
          </Link>
        ))}
      </nav>

      <ActivityFeed events={events} />

      <div className="mt-8 flex gap-3">
        {before && (
          <Link href={qs({})} className="rounded-xl border border-slate-400/25 px-4 py-2 text-sm hover:border-brand-teal/50">
            ← Newest
          </Link>
        )}
        {events.length === PAGE && (
          <Link href={qs({ before: events[events.length - 1]!.at.toISOString() })} className="rounded-xl border border-slate-400/25 px-4 py-2 text-sm hover:border-brand-teal/50">
            Older →
          </Link>
        )}
      </div>
    </div>
  );
}
