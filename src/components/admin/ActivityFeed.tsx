import Link from "next/link";
import { Brain, CalendarCheck, CheckCircle2, LogIn, PlayCircle, SquareTerminal, UserPlus } from "lucide-react";
import { EVENT_LABELS, type ActivityEvent, type EventKind } from "@/lib/admin-activity";
import { cn } from "@/lib/cn";

const ICONS: Record<EventKind, { icon: typeof Brain; cls: string }> = {
  signup: { icon: UserPlus, cls: "text-amber-300" },
  signin: { icon: LogIn, cls: "text-slate-300" },
  quiz: { icon: Brain, cls: "text-brand-teal" },
  daily: { icon: CalendarCheck, cls: "text-amber-300" },
  mission: { icon: SquareTerminal, cls: "text-brand-green" },
  lesson: { icon: CheckCircle2, cls: "text-brand-green" },
  opened: { icon: PlayCircle, cls: "text-blue-300" },
};

const dayFmt = new Intl.DateTimeFormat("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Kolkata" });
const timeFmt = new Intl.DateTimeFormat("en-IN", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Kolkata" });

/** Admin timeline grouped by India date. */
export function ActivityFeed({ events, showUser = true }: { events: ActivityEvent[]; showUser?: boolean }) {
  if (!events.length) return <p className="rounded-[18px] border border-slate-400/15 p-6 text-text-muted">No activity yet.</p>;
  const groups = new Map<string, ActivityEvent[]>();
  for (const e of events) {
    const k = dayFmt.format(e.at);
    groups.set(k, [...(groups.get(k) ?? []), e]);
  }
  return (
    <div className="flex flex-col gap-6">
      {[...groups.entries()].map(([day, list]) => (
        <section key={day}>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-text-faint">{day}</h3>
          <ul className="overflow-hidden rounded-[16px] border border-slate-400/15">
            {list.map((e) => {
              const { icon: Icon, cls } = ICONS[e.kind];
              return (
                <li key={e.id} className="flex items-start gap-3 border-b border-slate-400/10 px-4 py-3 last:border-b-0">
                  <Icon size={17} className={cn("mt-0.5 shrink-0", cls)} aria-hidden="true" />
                  <div className="min-w-0 flex-1 text-sm">
                    <div className="flex flex-wrap items-baseline gap-x-2">
                      {showUser && (
                        <Link href={`/admin/users/${e.user.id}`} className="font-medium hover:text-brand-teal hover:underline">
                          {e.user.name}
                        </Link>
                      )}
                      <span className="text-xs text-text-faint">{EVENT_LABELS[e.kind]}</span>
                    </div>
                    <div className={cn(e.tone === "good" && "text-green-200", e.tone === "bad" && "text-red-200", (!e.tone || e.tone === "neutral") && "text-text")}>
                      {e.href ? (
                        <Link href={e.href} className="hover:underline">
                          {e.title}
                        </Link>
                      ) : (
                        e.title
                      )}
                    </div>
                    {e.detail && <div className="truncate text-xs text-text-faint">{e.detail}</div>}
                    {showUser && <div className="text-xs text-text-faint">{e.user.email}</div>}
                  </div>
                  <time dateTime={e.at.toISOString()} className="shrink-0 font-mono text-xs text-text-faint">
                    {timeFmt.format(e.at)}
                  </time>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}
