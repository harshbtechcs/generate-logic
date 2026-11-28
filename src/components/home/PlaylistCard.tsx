import Image from "next/image";
import Link from "next/link";
import { Play } from "lucide-react";
import type { Playlist } from "@/lib/youtube";
import { toneStyles } from "@/lib/data";
import { THEMES, themeForTech } from "@/lib/themes";

export function PlaylistCard({ playlist }: { playlist: Playlist }) {
  const t = THEMES[playlist.technology ? themeForTech(playlist.technology.slug) : "red"];
  return (
    <article
      className="gl-card group/card relative flex h-full flex-col overflow-hidden rounded-[24px] ring-1 ring-white/10 shadow-[0_28px_60px_-30px_rgba(0,0,0,0.85)]"
      style={{ background: `linear-gradient(165deg, ${t.bg[1]} 0%, ${t.bg[0]} 55%, #0a0f1f 100%)` }}
    >
      <span aria-hidden="true" className="pointer-events-none absolute -bottom-6 -right-2 select-none font-display text-[110px] font-black leading-none tracking-tighter text-white/[0.08]">
        {(playlist.technology?.short ?? "GL").toUpperCase()}
      </span>
      <Link href={`/playlists/${playlist.id}`} className="group relative m-3 mb-0 block aspect-video overflow-hidden rounded-[18px] bg-black/30">
        {playlist.thumbnail ? (
          <Image
            src={playlist.thumbnail}
            alt=""
            fill
            sizes="(max-width: 768px) 100vw, 400px"
            className="object-cover transition-transform duration-700 group-hover:scale-110 group-hover:rotate-1"
          />
        ) : (
          <div className="grid-bg h-full w-full" />
        )}
        <span className="absolute bottom-3 right-3 rounded-full bg-black/60 px-3 py-1 font-mono text-xs text-white backdrop-blur">{playlist.videoCount} videos</span>
        <span className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <span className="flex h-16 w-16 scale-75 items-center justify-center rounded-full text-ink-900 shadow-2xl transition-transform duration-300 group-hover:scale-100" style={{ background: t.accent[0] }}>
            <Play size={24} fill="currentColor" aria-hidden="true" />
          </span>
        </span>
      </Link>
      <div className="relative flex flex-1 flex-col gap-2.5 p-6">
        <span className="w-fit rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.12em]" style={{ background: `${t.accent[1]}33`, color: t.accent[0] }}>
          {playlist.technology?.name ?? "Cloud & DevOps"}
        </span>
        <h3 className="font-display text-[22px] font-bold leading-snug text-white">{playlist.title}</h3>
        {playlist.description && <p className="line-clamp-3 text-sm leading-relaxed text-white/65">{playlist.description}</p>}
        <Link
          href={`/playlists/${playlist.id}`}
          className="gl-btn mt-auto inline-flex items-center gap-2 self-start rounded-xl bg-white px-4 py-[11px] text-sm font-semibold text-ink-900"
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
