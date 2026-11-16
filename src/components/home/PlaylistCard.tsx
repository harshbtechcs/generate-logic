import Image from "next/image";
import Link from "next/link";
import { Play } from "lucide-react";
import type { Playlist } from "@/lib/youtube";
import { toneStyles } from "@/lib/data";

export function PlaylistCard({ playlist }: { playlist: Playlist }) {
  const tone = playlist.technology ? toneStyles[playlist.technology.tone] : toneStyles.cyan;
  return (
    <article className="gl-card flex h-full flex-col overflow-hidden rounded-[18px] border border-slate-400/15 bg-white/[0.03]">
      <Link href={`/playlists/${playlist.id}`} className="group relative block aspect-video overflow-hidden border-b border-slate-400/10 bg-ink-800">
        {playlist.thumbnail ? (
          <Image
            src={playlist.thumbnail}
            alt=""
            fill
            sizes="(max-width: 768px) 100vw, 400px"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="grid-bg h-full w-full" />
        )}
        <span className="absolute bottom-3 right-3 rounded-lg bg-ink-900/85 px-2.5 py-1 font-mono text-xs text-text-muted">
          {playlist.videoCount} videos
        </span>
        <span className="absolute inset-0 flex items-center justify-center bg-ink-900/40 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-teal text-ink-900">
            <Play size={22} fill="currentColor" aria-hidden="true" />
          </span>
        </span>
      </Link>
      <div className="flex flex-1 flex-col gap-2.5 p-5">
        <span className={`text-xs font-semibold uppercase tracking-[0.12em] ${tone.text}`}>
          {playlist.technology?.name ?? "Cloud & DevOps"}
        </span>
        <h3 className="font-display text-xl font-semibold">{playlist.title}</h3>
        {playlist.description && (
          <p className="line-clamp-3 text-sm leading-relaxed text-text-faint">{playlist.description}</p>
        )}
        <Link
          href={`/playlists/${playlist.id}`}
          className="gl-btn mt-auto inline-flex items-center gap-2 self-start rounded-[10px] border border-slate-400/30 px-4 py-[11px] text-sm font-medium"
        >
          <Play size={16} fill="currentColor" aria-hidden="true" /> Watch playlist
        </Link>
      </div>
    </article>
  );
}

/** Placeholder card shown while the channel has no public playlists yet. */
export function PlaylistPlaceholder({ name, short, toneKey }: { name: string; short: string; toneKey: keyof typeof toneStyles }) {
  const tone = toneStyles[toneKey];
  return (
    <article className="gl-card flex h-full flex-col overflow-hidden rounded-[18px] border border-dashed border-slate-400/25 bg-white/[0.02]">
      <div className="grid-bg relative flex aspect-video items-center justify-center border-b border-slate-400/10 bg-ink-800">
        <span className={`font-display text-[40px] font-bold opacity-85 ${tone.text}`}>{short}</span>
      </div>
      <div className="flex flex-col gap-2.5 p-5">
        <span className={`text-xs font-semibold uppercase tracking-[0.12em] ${tone.text}`}>{name}</span>
        <h3 className="font-display text-xl font-semibold">{name} playlist — coming soon</h3>
        <p className="text-sm leading-relaxed text-text-faint">
          It will appear here automatically as soon as it is published on YouTube.
        </p>
      </div>
    </article>
  );
}
