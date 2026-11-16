"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useTransition } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Bookmark, BookmarkCheck, Check, ChevronLeft, ChevronRight, Loader2, Play, Trophy } from "lucide-react";
import { setLessonComplete, setPlaylistSaved } from "@/app/actions/learning";
import type { SyncedLesson } from "@/lib/sync";
import { cn } from "@/lib/cn";

type Props = {
  youtubePlaylistId: string;
  playlistDbId: string;
  title: string;
  category: string;
  lessons: SyncedLesson[];
  initialCompleted: string[];
  initialSaved: boolean;
  signedIn: boolean;
  startIndex: number;
};

/**
 * Embedded YouTube player + lesson list with progress tracking.
 * Uses youtube-nocookie.com so YouTube does not set tracking cookies until play.
 */
export function PlaylistPlayer({
  youtubePlaylistId,
  playlistDbId,
  title,
  category,
  lessons,
  initialCompleted,
  initialSaved,
  signedIn,
  startIndex,
}: Props) {
  const [current, setCurrent] = useState(startIndex);
  const [completed, setCompleted] = useState(() => new Set(initialCompleted));
  const [saved, setSaved] = useState(initialSaved);
  const [error, setError] = useState<string | null>(null);
  const [pendingLesson, startLesson] = useTransition();
  const [pendingSave, startSave] = useTransition();

  const lesson = lessons[current];
  const total = lessons.length;
  const doneCount = lessons.filter((l) => completed.has(l.id)).length;
  const percent = total ? Math.round((doneCount / total) * 100) : 0;
  const isDone = lesson ? completed.has(lesson.id) : false;
  const allDone = total > 0 && doneCount === total;

  const src = lesson
    ? `https://www.youtube-nocookie.com/embed/${lesson.videoId}?list=${youtubePlaylistId}&index=${current + 1}&rel=0&modestbranding=1`
    : `https://www.youtube-nocookie.com/embed/videoseries?list=${youtubePlaylistId}&rel=0&modestbranding=1`;

  function go(i: number) {
    if (i >= 0 && i < total) {
      setCurrent(i);
      setError(null);
      // keep the URL shareable / resumable
      window.history.replaceState(null, "", `?lesson=${i + 1}`);
    }
  }

  function toggleComplete() {
    if (!lesson) return;
    const next = !isDone;
    // optimistic update, rolled back if the server says no
    setCompleted((s) => {
      const n = new Set(s);
      if (next) n.add(lesson.id);
      else n.delete(lesson.id);
      return n;
    });
    setError(null);
    startLesson(async () => {
      const res = await setLessonComplete(lesson.id, next);
      if (!res.ok) {
        setError(res.error);
        setCompleted((s) => {
          const n = new Set(s);
          if (next) n.delete(lesson.id);
          else n.add(lesson.id);
          return n;
        });
      } else if (next && current < total - 1) {
        go(current + 1); // move on to the next lesson
      }
    });
  }

  function toggleSave() {
    const next = !saved;
    setSaved(next);
    startSave(async () => {
      const res = await setPlaylistSaved(playlistDbId, next);
      if (!res.ok) {
        setSaved(!next);
        setError(res.error);
      }
    });
  }

  return (
    <div>
      {/* header */}
      <div className="mb-8 flex flex-wrap items-end justify-between gap-5">
        <div className="flex min-w-0 flex-col gap-2">
          <span className="kicker">{category.toUpperCase()}</span>
          <h1 className="font-display text-[32px] font-bold leading-tight sm:text-[42px]">{title}</h1>
          <p className="font-mono text-sm text-text-faint">{total} lessons</p>
        </div>
        {signedIn ? (
          <button
            type="button"
            onClick={toggleSave}
            disabled={pendingSave}
            aria-pressed={saved}
            className={cn(
              "gl-btn inline-flex items-center gap-2 rounded-xl border px-5 py-3 text-sm font-medium",
              saved ? "border-brand-teal/50 bg-brand-teal/10 text-teal-100" : "border-slate-400/30",
            )}
          >
            {saved ? <BookmarkCheck size={18} aria-hidden="true" /> : <Bookmark size={18} aria-hidden="true" />}
            {saved ? "Saved to My Playlists" : "Save playlist"}
          </button>
        ) : null}
      </div>

      {/* progress bar */}
      {signedIn && total > 0 && (
        <div className="mb-6">
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="text-text-muted">
              {doneCount} of {total} lessons completed
            </span>
            <span className="font-mono text-brand-teal">{percent}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-white/[0.06]" role="progressbar" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100} aria-label="Playlist progress">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-brand-green via-brand-cyan to-brand-blue"
              initial={false}
              animate={{ width: `${percent}%` }}
              transition={{ duration: 0.6, ease: [0.2, 0.7, 0.2, 1] }}
            />
          </div>
        </div>
      )}

      <AnimatePresence>
        {signedIn && allDone && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mb-6 flex items-center gap-3 rounded-xl border border-amber-300/40 bg-amber-300/10 px-4 py-3 text-amber-100"
          >
            <Trophy size={20} aria-hidden="true" /> You completed this playlist. Great work!
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-wrap gap-6">
        {/* player */}
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
              title={lesson?.title ?? "Playlist player"}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
              className="absolute inset-0 h-full w-full"
            />
          </motion.div>

          {lesson && (
            <div className="mt-5 flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <span className="font-mono text-xs text-text-faint">
                  Lesson {current + 1} of {total}
                </span>
                <h2 className="font-display text-2xl font-semibold">{lesson.title}</h2>
              </div>

              {error && (
                <p role="alert" className="text-sm text-red-300">
                  {error}
                </p>
              )}

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => go(current - 1)}
                  disabled={current === 0}
                  className="gl-btn inline-flex items-center gap-1.5 rounded-xl border border-slate-400/30 px-4 py-3 text-sm disabled:opacity-40"
                >
                  <ChevronLeft size={18} aria-hidden="true" /> Previous
                </button>

                {signedIn ? (
                  <button
                    type="button"
                    onClick={toggleComplete}
                    disabled={pendingLesson}
                    aria-pressed={isDone}
                    className={cn(
                      "gl-btn inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold",
                      isDone ? "border border-green-400/50 bg-green-400/15 text-green-100" : "bg-brand-teal text-ink-900",
                    )}
                  >
                    {pendingLesson ? <Loader2 size={18} className="animate-spin" aria-hidden="true" /> : <Check size={18} aria-hidden="true" />}
                    {isDone ? "Completed" : "Mark as complete"}
                  </button>
                ) : (
                  <Link
                    href={`/sign-in?next=${encodeURIComponent(`/playlists/${youtubePlaylistId}?lesson=${current + 1}`)}`}
                    className="gl-btn inline-flex items-center gap-2 rounded-xl bg-brand-teal px-5 py-3 text-sm font-semibold text-ink-900"
                  >
                    Sign in to track progress
                  </Link>
                )}

                <button
                  type="button"
                  onClick={() => go(current + 1)}
                  disabled={current >= total - 1}
                  className="gl-btn inline-flex items-center gap-1.5 rounded-xl border border-slate-400/30 px-4 py-3 text-sm disabled:opacity-40"
                >
                  Next <ChevronRight size={18} aria-hidden="true" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* lesson list */}
        {total > 0 && (
          <aside className="min-w-0 flex-[1_1_320px]">
            <div className="overflow-hidden rounded-2xl border border-slate-400/15 bg-white/[0.03]">
              <div className="border-b border-slate-400/15 px-4 py-3 font-mono text-[13px] text-text-faint">
                Lessons · {current + 1} / {total}
              </div>
              <ol className="max-h-[560px] overflow-y-auto">
                {lessons.map((v, i) => {
                  const done = completed.has(v.id);
                  return (
                    <li key={v.id}>
                      <button
                        type="button"
                        onClick={() => go(i)}
                        aria-current={i === current ? "true" : undefined}
                        className={cn(
                          "flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-white/[0.04]",
                          i === current && "bg-brand-teal/10",
                        )}
                      >
                        <span
                          className={cn(
                            "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border font-mono text-[11px]",
                            done ? "border-green-400/60 bg-green-400/20 text-green-200" : "border-slate-500/50 text-slate-400",
                          )}
                          aria-label={done ? "Completed" : undefined}
                        >
                          {done ? <Check size={13} aria-hidden="true" /> : i + 1}
                        </span>
                        <span className="relative aspect-video w-24 shrink-0 overflow-hidden rounded-md bg-ink-800">
                          {v.thumbnail && <Image src={v.thumbnail} alt="" fill sizes="96px" className="object-cover" />}
                          {i === current && (
                            <span className="absolute inset-0 flex items-center justify-center bg-ink-900/60">
                              <Play size={16} fill="currentColor" className="text-brand-teal" aria-hidden="true" />
                            </span>
                          )}
                        </span>
                        <span className={cn("line-clamp-2 text-sm", i === current ? "text-text" : "text-text-muted", done && "text-text-faint")}>
                          {v.title}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ol>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
