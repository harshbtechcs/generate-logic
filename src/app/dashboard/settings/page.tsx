import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { ProfileSection, PasswordSection, SessionsSection, DeleteAccountSection } from "@/components/settings/SettingsSections";

export const metadata: Metadata = { title: "Account settings", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const user = await requireUser("/dashboard/settings");
  const accounts = await db.account.findMany({ where: { userId: user.id }, select: { providerId: true } });
  const hasPassword = accounts.some((a) => a.providerId === "credential");
  const hasGoogle = accounts.some((a) => a.providerId === "google");

  return (
    <div className="mx-auto max-w-3xl px-5 pb-28 pt-10 sm:px-8">
      <Link href="/dashboard" className="mb-6 inline-flex items-center gap-2 text-sm text-text-muted hover:text-brand-teal">
        <ArrowLeft size={16} aria-hidden="true" /> Back to dashboard
      </Link>
      <div className="mb-10 flex flex-col gap-2">
        <span className="kicker">ACCOUNT</span>
        <h1 className="font-display text-[36px] font-bold leading-tight sm:text-[44px]">Settings</h1>
      </div>

      <div className="flex flex-col gap-6">
        <ProfileSection name={user.name} email={user.email} image={user.image ?? null} hasGoogle={hasGoogle} />
        <PasswordSection hasPassword={hasPassword} />
        <SessionsSection />
        <DeleteAccountSection hasPassword={hasPassword} email={user.email} />
      </div>
    </div>
  );
}
