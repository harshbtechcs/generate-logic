import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/session";
import { ResetPlaylistButton, RestrictButton, UndoLessonButton } from "@/components/admin/AdminButtons";

export const metadata: Metadata = { title: "User · Admin", robots: { index: false } };
export const dynamic = "force-dynamic";

const dateFmt = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric" });
const dateTimeFmt = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

type Props = { params: Promise<{ id: string }> };

export default async function AdminUserPage({ params }: Props) {
  const admin = await requireAdmin();
  const { id } = await params;

  const user = await db.user.findUnique({
    where: { id },
    select: {
      id: true,
      fullName: true,
      email: true,
      role: true,
      emailVerified: true,
      accountStatus: true,
      createdAt: true,
      accounts: { select: { providerId: true } },
      sessions: { select: { updatedAt: true }, orderBy: { updatedAt: "desc" }, take: 1 },
    },
  });
  if (!user) notFound();

  // Completed lessons grouped by playlist
  const progress = await db.userProgress.findMany({
    where: { userId: user.id, completionStatus: "COMPLETED" },
    orderBy: { completedAt: "desc" },
    select: {
      completedAt: true,
      lesson: {
        select: {
          id: true,
          title: true,
          sequenceNumber: true,
          playlist: { select: { id: true, title: true, _count: { select: { lessons: true } } } },
        },
      },
    },
  });
  const byPlaylist = new Map<string, { title: string; total: number; lessons: typeof progress }>();
  for (const p of progress) {
    const pl = p.lesson.playlist;
    const entry = byPlaylist.get(pl.id) ?? { title: pl.title, total: pl._count.lessons, lessons: [] };
    entry.lessons.push(p);
    byPlaylist.set(pl.id, entry);
  }

  const providers = [...new Set(user.accounts.map((a) => (a.providerId === "credential" ? "Email" : a.providerId === "google" ? "Google" : a.providerId)))];
  const isSelf = user.id === admin.id;
  const restricted = user.accountStatus === "DISABLED";

  return (
    <div className="mx-auto max-w-4xl px-5 pb-28 pt-10 sm:px-8">
      <Link href="/admin/users" className="mb-6 inline-flex items-center gap-2 text-sm text-text-muted hover:text-brand-teal">
        <ArrowLeft size={16} aria-hidden="true" /> All users
      </Link>

      <section className="mb-8 rounded-[20px] border border-slate-400/15 bg-white/[0.03] p-6 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="font-display text-[30px] font-bold leading-tight">{user.fullName}</h1>
            <p className="text-text-muted">{user.email}</p>
          </div>
          <span
            className={
              restricted
                ? "rounded-full border border-red-400/50 bg-red-400/10 px-3 py-1 text-sm text-red-200"
                : "rounded-full border border-green-400/40 bg-green-400/10 px-3 py-1 text-sm text-green-200"
            }
          >
            {restricted ? "Restricted" : "Active"}
          </span>
        </div>

        <dl className="mt-6 grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-4 text-sm">
          <div>
            <dt className="text-text-faint">Role</dt>
            <dd>{user.role === "ADMIN" ? "Admin" : "Student"}</dd>
          </div>
          <div>
            <dt className="text-text-faint">Sign-in</dt>
            <dd>{providers.join(", ") || "—"}</dd>
          </div>
          <div>
            <dt className="text-text-faint">Email verified</dt>
            <dd>{user.emailVerified ? "Yes" : "No"}</dd>
          </div>
          <div>
            <dt className="text-text-faint">Joined</dt>
            <dd>{dateFmt.format(user.createdAt)}</dd>
          </div>
          <div>
            <dt className="text-text-faint">Last active</dt>
            <dd>{user.sessions[0] ? dateTimeFmt.format(user.sessions[0].updatedAt) : "—"}</dd>
          </div>
          <div>
            <dt className="text-text-faint">Lessons completed</dt>
            <dd>{progress.length}</dd>
          </div>
        </dl>

        {!isSelf && user.role !== "ADMIN" && (
          <div className="mt-6 border-t border-slate-400/10 pt-6">
            <p className="mb-3 text-sm text-text-muted">
              {restricted
                ? "This account can't sign in. Restoring access lets them sign in again."
                : "Restricting signs this person out on every device and blocks future sign-ins (email and Google)."}
            </p>
            <RestrictButton userId={user.id} disabled={restricted} />
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-4 font-display text-2xl font-semibold">Learning progress</h2>
        {byPlaylist.size === 0 ? (
          <p className="rounded-[18px] border border-slate-400/15 p-6 text-text-muted">No lessons marked complete.</p>
        ) : (
          <div className="flex flex-col gap-5">
            {[...byPlaylist.entries()].map(([playlistId, pl]) => (
              <div key={playlistId} className="overflow-hidden rounded-[18px] border border-slate-400/15">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-400/10 bg-white/[0.03] px-5 py-3">
                  <div>
                    <h3 className="font-medium">{pl.title}</h3>
                    <p className="text-xs text-text-faint">
                      {pl.lessons.length} of {pl.total} lessons completed
                    </p>
                  </div>
                  <ResetPlaylistButton userId={user.id} playlistId={playlistId} />
                </div>
                <ul>
                  {pl.lessons.map((p) => (
                    <li key={p.lesson.id} className="flex flex-wrap items-center gap-3 border-b border-slate-400/10 px-5 py-3 last:border-b-0">
                      <CheckCircle2 size={16} className="shrink-0 text-brand-green" aria-hidden="true" />
                      <span className="min-w-0 flex-1 text-sm">
                        <span className="font-mono text-xs text-text-faint">{String(p.lesson.sequenceNumber).padStart(2, "0")} · </span>
                        {p.lesson.title}
                      </span>
                      {p.completedAt && <span className="font-mono text-xs text-text-faint">{dateTimeFmt.format(p.completedAt)}</span>}
                      <UndoLessonButton userId={user.id} lessonId={p.lesson.id} />
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
