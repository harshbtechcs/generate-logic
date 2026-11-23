"use client";

import { useState, useTransition } from "react";
import { Trophy } from "lucide-react";
import { setLeaderboardVisibility } from "@/app/actions/engage";

export function LeaderboardSection({ visible, publicName }: { visible: boolean; publicName: string }) {
  const [on, setOn] = useState(visible);
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);

  function toggle() {
    const next = !on;
    setOn(next);
    setMsg(null);
    start(async () => {
      const res = await setLeaderboardVisibility(next);
      if (!res.ok) {
        setOn(!next);
        setMsg("Couldn't save that. Please try again.");
      } else setMsg(next ? "You're on the leaderboard." : "You're hidden from the leaderboard.");
    });
  }

  return (
    <section className="rounded-[20px] border border-slate-400/15 bg-white/[0.03] p-6 sm:p-8">
      <div className="flex items-start justify-between gap-6">
        <div className="flex items-start gap-3">
          <Trophy size={22} className="mt-0.5 text-brand-teal" />
          <div>
            <h2 className="font-display text-xl font-semibold">Leaderboard</h2>
            <p className="mt-1 text-sm text-text-muted">
              Show me on the public leaderboard as <strong className="text-text">{publicName}</strong>. Your email is never shown. You still see your own rank when hidden.
            </p>
          </div>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={on}
          aria-label="Show me on the leaderboard"
          onClick={toggle}
          disabled={pending}
          className={`relative h-7 w-12 shrink-0 rounded-full border transition-colors ${on ? "border-brand-teal bg-brand-teal/80" : "border-slate-400/40 bg-white/[0.06]"}`}
        >
          <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${on ? "left-[22px]" : "left-0.5"}`} />
        </button>
      </div>
      {msg && (
        <p role="status" className="mt-4 text-sm text-text-muted">
          {msg}
        </p>
      )}
    </section>
  );
}
