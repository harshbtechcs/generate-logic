import Image from "next/image";
import Link from "next/link";
import { Play } from "lucide-react";
import type { CourseProgress } from "@/lib/learning";

/** A playlist the user has started or saved, with a progress bar and "resume" link. */
export function CourseCard({ course }: { course: CourseProgress }) {
  const href = `/playlists/${course.youtubePlaylistId}?lesson=${course.nextLesson}`;
  const finished = course.total > 0 && course.completed === course.total;
  return (
    <article className="gl-card flex h-full flex-col overflow-hidden rounded-[18px] border border-slate-400/15 bg-white/[0.03]">
      <Link href={href} className="group relative block aspect-video overflow-hidden bg-ink-800">
        {course.thumbnail ? (
          <Image src={course.thumbnail} alt="" fill sizes="(max-width: 768px) 100vw, 360px" className="object-cover transition-transform duration-500 group-hover:scale-105" />
        ) : (
          <div className="grid-bg h-full w-full" />
        )}
        <span className="absolute inset-0 flex items-center justify-center bg-ink-900/40 opacity-0 transition-opacity group-hover:opacity-100">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-teal text-ink-900">
            <Play size={20} fill="currentColor" aria-hidden="true" />
          </span>
        </span>
      </Link>
      <div className="flex flex-1 flex-col gap-3 p-5">
        <h3 className="line-clamp-2 font-display text-lg font-semibold">{course.title}</h3>
        <div>
          <div className="mb-1.5 flex justify-between text-xs text-text-faint">
            <span>
              {course.completed} / {course.total} lessons
            </span>
            <span className="font-mono text-brand-teal">{course.percent}%</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
            <div
              className="h-full rounded-full bg-gradient-to-r from-brand-green via-brand-cyan to-brand-blue"
              style={{ width: `${course.percent}%` }}
            />
          </div>
        </div>
        <Link
          href={href}
          className="gl-btn mt-auto inline-flex items-center justify-center gap-2 rounded-[10px] border border-slate-400/30 px-4 py-2.5 text-sm font-medium"
        >
          <Play size={15} fill="currentColor" aria-hidden="true" />
          {finished ? "Watch again" : course.completed > 0 ? `Continue · lesson ${course.nextLesson}` : "Start learning"}
        </Link>
      </div>
    </article>
  );
}
