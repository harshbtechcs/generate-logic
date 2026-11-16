import type { Metadata } from "next";
import { Activity, BadgeCheck, FileText, GraduationCap, ListVideo, Shield, Users } from "lucide-react";
import { requireAdmin } from "@/lib/session";
import { getAdminStats } from "@/lib/stats";
import { getChannelPlaylists } from "@/lib/youtube";
import { StatCard } from "@/components/dashboard/StatCard";
import { Reveal } from "@/components/ui/Reveal";

export const metadata: Metadata = { title: "Admin dashboard", robots: { index: false } };
export const dynamic = "force-dynamic";

const dateFmt = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric" });

export default async function AdminPage() {
  await requireAdmin();
  const [stats, playlists] = await Promise.all([getAdminStats(), getChannelPlaylists()]);

  return (
    <div className="mx-auto max-w-site px-5 pb-28 pt-12 sm:px-8">
      <Reveal className="mb-10 flex flex-col gap-2">
        <span className="inline-flex items-center gap-2 font-mono text-[13px] tracking-[0.16em] text-amber-300">
          <Shield size={15} aria-hidden="true" /> ADMIN
        </span>
        <h1 className="font-display text-[36px] font-bold leading-tight sm:text-[46px]">Platform overview</h1>
        <p className="text-text-muted">Live numbers from the database. User management, content and blog tools arrive in Phase 7.</p>
      </Reveal>

      <section aria-label="Platform statistics" className="mb-14 grid grid-cols-[repeat(auto-fill,minmax(190px,1fr))] gap-4">
        <StatCard icon={Users} label="Registered users" value={stats.totalUsers} />
        <StatCard icon={Activity} label="Active (30 days)" value={stats.activeUsers} delay={0.05} tone="text-brand-green" />
        <StatCard icon={BadgeCheck} label="Verified emails" value={stats.verifiedUsers} delay={0.1} tone="text-blue-300" />
        <StatCard icon={ListVideo} label="YouTube playlists" value={playlists.length} delay={0.15} />
        <StatCard icon={GraduationCap} label="Learning paths" value={stats.learningPaths} delay={0.2} tone="text-brand-green" />
        <StatCard icon={FileText} label="Uploaded notes" value={stats.notes} delay={0.25} tone="text-amber-300" />
      </section>

      <Reveal>
        <h2 className="mb-4 font-display text-2xl font-semibold">Recent registrations</h2>
        <div className="overflow-x-auto rounded-[18px] border border-slate-400/15">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="bg-white/[0.03] text-xs uppercase tracking-[0.1em] text-text-faint">
              <tr>
                <th scope="col" className="px-4 py-3 font-medium">Name</th>
                <th scope="col" className="px-4 py-3 font-medium">Email</th>
                <th scope="col" className="px-4 py-3 font-medium">Sign-in</th>
                <th scope="col" className="px-4 py-3 font-medium">Role</th>
                <th scope="col" className="px-4 py-3 font-medium">Status</th>
                <th scope="col" className="px-4 py-3 font-medium">Joined</th>
              </tr>
            </thead>
            <tbody>
              {stats.recent.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-text-muted">No users yet.</td>
                </tr>
              )}
              {stats.recent.map((u) => {
                const providers = [...new Set(u.accounts.map((a) => (a.providerId === "credential" ? "Email" : "Google")))];
                return (
                  <tr key={u.id} className="border-t border-slate-400/10">
                    <td className="px-4 py-3 font-medium">{u.fullName}</td>
                    <td className="px-4 py-3 text-text-muted">{u.email}</td>
                    <td className="px-4 py-3 text-text-muted">{providers.join(", ") || "—"}</td>
                    <td className="px-4 py-3">
                      <span className={u.role === "ADMIN" ? "text-amber-200" : "text-text-muted"}>{u.role === "ADMIN" ? "Admin" : "Student"}</span>
                    </td>
                    <td className="px-4 py-3">
                      {u.accountStatus === "DISABLED" ? (
                        <span className="text-red-300">Disabled</span>
                      ) : u.emailVerified ? (
                        <span className="text-green-300">Verified</span>
                      ) : (
                        <span className="text-amber-200">Unverified</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-text-muted">{dateFmt.format(u.createdAt)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Reveal>
    </div>
  );
}
