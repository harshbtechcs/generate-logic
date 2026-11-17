"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { RefreshCw } from "lucide-react";
import { syncYouTubeNow } from "@/app/actions/learning";

/** Admin: pull all YouTube playlists + lessons into the database now. */
export function SyncButton() {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  return (
    <div className="flex flex-wrap items-center gap-3">
      <button
        type="button"
        disabled={pending}
        onClick={() =>
          start(async () => {
            const res = await syncYouTubeNow();
            if (!res.ok) {
              setMsg({ ok: false, text: res.error });
              return;
            }
            const parts = [`Found ${res.found} public playlist${res.found === 1 ? "" : "s"}, synced ${res.synced} with public videos.`];
            if (res.found > res.synced + res.failed.length) parts.push("Playlists whose videos are not public yet were skipped.");
            if (res.failed.length) parts.push(`Failed: ${res.failed.join(", ")}.`);
            setMsg({ ok: res.failed.length === 0, text: parts.join(" ") });
            router.refresh();
          })
        }
        className="gl-btn inline-flex items-center gap-2 rounded-xl border border-brand-teal/40 bg-brand-teal/10 px-5 py-3 text-sm font-medium text-teal-100 disabled:opacity-60"
      >
        <RefreshCw size={17} className={pending ? "animate-spin" : ""} aria-hidden="true" />
        {pending ? "Syncing…" : "Sync YouTube now"}
      </button>
      {msg && (
        <span role="status" className={msg.ok ? "text-sm text-green-300" : "text-sm text-red-300"}>
          {msg.text}
        </span>
      )}
    </div>
  );
}
