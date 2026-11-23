import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Search } from "lucide-react";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/session";

export const metadata: Metadata = { title: "Users · Admin", robots: { index: false } };
export const dynamic = "force-dynamic";

const dateFmt = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric" });
const PAGE_SIZE = 50;

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function AdminUsersPage({ searchParams }: Props) {
  await requireAdmin();
  const sp = await searchParams;
  const q = (typeof sp.q === "string" ? sp.q : "").trim().slice(0, 100);
  const status = sp.status === "restricted" ? "DISABLED" : undefined;

  const where = {
    ...(q
      ? {
          OR: [
            { email: { contains: q, mode: "insensitive" as const } },
            { fullName: { contains: q, mode: "insensitive" as const } },
          ],
        }
      : {}),
    ...(status ? { accountStatus: status as "DISABLED" } : {}),
  };

  const [users, total] = await Promise.all([
    db.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: PAGE_SIZE,
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        emailVerified: true,
        accountStatus: true,
        createdAt: true,
        _count: { select: { progress: { where: { completionStatus: "COMPLETED" } }, quizAttempts: true, dailyAnswers: true, terminalProgress: true } },
        sessions: { select: { updatedAt: true }, orderBy: { updatedAt: "desc" }, take: 1 },
      },
    }),
    db.user.count({ where }),
  ]);

  return (
    <div className="mx-auto max-w-site px-5 pb-28 pt-10 sm:px-8">
      <Link href="/admin" className="mb-6 inline-flex items-center gap-2 text-sm text-text-muted hover:text-brand-teal">
        <ArrowLeft size={16} aria-hidden="true" /> Admin overview
      </Link>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="font-mono text-[13px] tracking-[0.16em] text-amber-300">ADMIN</span>
          <h1 className="mt-1 font-display text-[34px] font-bold">Users</h1>
          <p className="text-text-muted">
            {total} {total === 1 ? "user" : "users"}
            {q ? ` matching "${q}"` : ""}
            {status ? " (restricted)" : ""}
          </p>
        </div>
        <form className="flex flex-wrap gap-2" role="search">
          <label htmlFor="q" className="sr-only">
            Search by name or email
          </label>
          <div className="relative">
            <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" aria-hidden="true" />
            <input
              id="q"
              name="q"
              defaultValue={q}
              placeholder="Name or email"
              className="h-11 w-64 rounded-xl border border-slate-400/25 bg-ink-900/70 pl-9 pr-3 text-sm outline-none focus:border-brand-teal"
            />
          </div>
          <select
            name="status"
            defaultValue={status ? "restricted" : ""}
            aria-label="Filter by status"
            className="h-11 rounded-xl border border-slate-400/25 bg-ink-900/70 px-3 text-sm"
          >
            <option value="">All users</option>
            <option value="restricted">Restricted only</option>
          </select>
          <button type="submit" className="h-11 rounded-xl bg-brand-teal px-5 text-sm font-semibold text-ink-900">
            Search
          </button>
        </form>
      </div>

      <div className="overflow-x-auto rounded-[18px] border border-slate-400/15">
        <table className="w-full min-w-[1040px] text-left text-sm">
          <thead className="bg-white/[0.03] text-xs uppercase tracking-[0.1em] text-text-faint">
            <tr>
              <th scope="col" className="px-4 py-3 font-medium">Name</th>
              <th scope="col" className="px-4 py-3 font-medium">Email</th>
              <th scope="col" className="px-4 py-3 font-medium">Role</th>
              <th scope="col" className="px-4 py-3 font-medium">Status</th>
              <th scope="col" className="px-4 py-3 font-medium">Lessons</th>
              <th scope="col" className="px-4 py-3 font-medium">Quizzes</th>
              <th scope="col" className="px-4 py-3 font-medium">Daily</th>
              <th scope="col" className="px-4 py-3 font-medium">Missions</th>
              <th scope="col" className="px-4 py-3 font-medium">Last active</th>
              <th scope="col" className="px-4 py-3 font-medium">Joined</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 && (
              <tr>
                <td colSpan={10} className="px-4 py-8 text-center text-text-muted">
                  No users found.
                </td>
              </tr>
            )}
            {users.map((u) => (
              <tr key={u.id} className="border-t border-slate-400/10 hover:bg-white/[0.02]">
                <td className="px-4 py-3 font-medium">
                  <Link href={`/admin/users/${u.id}`} className="hover:text-brand-teal hover:underline">
                    {u.fullName}
                  </Link>
                </td>
                <td className="px-4 py-3 text-text-muted">{u.email}</td>
                <td className="px-4 py-3">{u.role === "ADMIN" ? <span className="text-amber-200">Admin</span> : "Student"}</td>
                <td className="px-4 py-3">
                  {u.accountStatus === "DISABLED" ? (
                    <span className="text-red-300">Restricted</span>
                  ) : u.emailVerified ? (
                    <span className="text-green-300">Active</span>
                  ) : (
                    <span className="text-amber-200">Unverified</span>
                  )}
                </td>
                <td className="px-4 py-3 font-mono">{u._count.progress}</td>
                <td className="px-4 py-3 font-mono">{u._count.quizAttempts}</td>
                <td className="px-4 py-3 font-mono">{u._count.dailyAnswers}</td>
                <td className="px-4 py-3 font-mono">{u._count.terminalProgress}</td>
                <td className="px-4 py-3 text-text-muted">{u.sessions[0] ? dateFmt.format(u.sessions[0].updatedAt) : "—"}</td>
                <td className="px-4 py-3 text-text-muted">{dateFmt.format(u.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {total > PAGE_SIZE && <p className="mt-4 text-sm text-text-faint">Showing the newest {PAGE_SIZE}. Search to find others.</p>}
    </div>
  );
}
