"use client";

import Image from "next/image";
import { useState } from "react";
import { motion } from "framer-motion";
import { Play } from "lucide-react";
import type { PlaylistVideo } from "@/lib/youtube";
import { cn } from "@/lib/cn";

/**
 * Embedded YouTube player with the lesson list beside it.
 * Uses youtube-nocookie.com so YouTube does not set tracking cookies until play.
 * (Phase 6 will add "mark as complete" per lesson for signed-in users.)
 */
export function PlaylistPlayer({ playlistId, videos }: { playlistId: string; videos: PlaylistVideo[] }) {
  const [current, setCurrent] = useState(0);
  const video = videos[current];
  const src = video
    ? `https://www.youtube-nocookie.com/embed/${video.id}?list=${playlistId}&index=${current + 1}&rel=0&modestbranding=1`
    : `https://www.youtube-nocookie.com/embed/videoseries?list=${playlistId}&rel=0&modestbranding=1`;

  return (
    <div className="flex flex-wrap gap-6">
      <div className="min-w-0 flex-[2_1_560px]">
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="relative aspect-video overflow-hidden rounded-2xl border border-slate-400/20 bg-black shadow-[0_20px_60px_rgba(0,0,0,0.5)]"
        >
          <iframe
            key={src}
            src={src}
            title={video?.title ?? "Playlist player"}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
            className="absolute inset-0 h-full w-full"
          />
        </motion.div>
        {video && <h2 className="mt-5 font-display text-2xl font-semibold">{video.title}</h2>}
      </div>

      {videos.length > 0 && (
        <aside className="min-w-0 flex-[1_1_320px]">
          <div className="overflow-hidden rounded-2xl border border-slate-400/15 bg-white/[0.03]">
            <div className="border-b border-slate-400/15 px-4 py-3 font-mono text-[13px] text-text-faint">
              Lessons · {current + 1} / {videos.length}
            </div>
            <ol className="max-h-[560px] overflow-y-auto">
              {videos.map((v, i) => (
                <li key={v.id}>
                  <button
                    type="button"
                    onClick={() => setCurrent(i)}
                    aria-current={i === current ? "true" : undefined}
                    className={cn(
                      "flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-white/[0.04]",
                      i === current && "bg-brand-teal/10",
                    )}
                  >
                    <span className="w-6 shrink-0 font-mono text-xs text-slate-500">{String(i + 1).padStart(2, "0")}</span>
                    <span className="relative aspect-video w-24 shrink-0 overflow-hidden rounded-md bg-ink-800">
                      {v.thumbnail && <Image src={v.thumbnail} alt="" fill sizes="96px" className="object-cover" />}
                      {i === current && (
                        <span className="absolute inset-0 flex items-center justify-center bg-ink-900/60">
                          <Play size={16} fill="currentColor" className="text-brand-teal" aria-hidden="true" />
                        </span>
                      )}
                    </span>
                    <span className={cn("line-clamp-2 text-sm", i === current ? "text-text" : "text-text-muted")}>
                      {v.title}
                    </span>
                  </button>
                </li>
              ))}
            </ol>
          </div>
        </aside>
      )}
    </div>
  );
}
