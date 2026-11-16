"use client";

import { useState, useTransition } from "react";
import { RefreshCw } from "lucide-react";
import { syncYouTubeNow } from "@/app/actions/learning";

/** Admin: pull all YouTube playlists + lessons into the database now. */
export function SyncButton() {
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
            setMsg(res.ok ? { ok: true, text: `Synced ${res.synced} playlist${res.synced === 1 ? "" : "s"} from YouTube.` } : { ok: false, text: res.error });
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
